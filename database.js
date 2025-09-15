const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'bitcoin-drive.db'));

// Initialize database tables
function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                google_id TEXT UNIQUE,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                picture TEXT,
                handcash_handle TEXT,
                handcash_auth_token TEXT,
                google_refresh_token TEXT,
                google_access_token TEXT,
                token_expiry DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) console.error('Error creating users table:', err);
            });

            // User sessions table
            db.run(`CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                session_token TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) console.error('Error creating sessions table:', err);
            });

            // Google Drive sync mapping
            db.run(`CREATE TABLE IF NOT EXISTS drive_sync (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                google_file_id TEXT NOT NULL,
                google_file_name TEXT,
                bsv_tx_id TEXT,
                file_hash TEXT,
                encrypted BOOLEAN DEFAULT 1,
                last_synced DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(user_id, google_file_id)
            )`, (err) => {
                if (err) console.error('Error creating drive_sync table:', err);
            });

            // User preferences
            db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT PRIMARY KEY,
                auto_backup_drive BOOLEAN DEFAULT 0,
                auto_backup_gmail BOOLEAN DEFAULT 0,
                auto_backup_calendar BOOLEAN DEFAULT 0,
                encrypt_by_default BOOLEAN DEFAULT 1,
                sync_frequency TEXT DEFAULT 'daily',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) console.error('Error creating user_preferences table:', err);
            });

            resolve();
        });
    });
}

// Database helper functions
const dbHelpers = {
    // Create or update user from Google OAuth
    async upsertGoogleUser(profile, tokens) {
        const userId = crypto.randomBytes(16).toString('hex');
        
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE google_id = ?', [profile.id], (err, existingUser) => {
                if (err) return reject(err);
                
                if (existingUser) {
                    // Update existing user
                    db.run(`UPDATE users SET 
                        email = ?, 
                        name = ?, 
                        picture = ?,
                        google_access_token = ?,
                        google_refresh_token = ?,
                        token_expiry = ?,
                        updated_at = CURRENT_TIMESTAMP
                        WHERE google_id = ?`,
                        [
                            profile.emails[0].value,
                            profile.displayName,
                            profile.photos[0]?.value,
                            tokens.access_token,
                            tokens.refresh_token || existingUser.google_refresh_token,
                            new Date(Date.now() + tokens.expires_in * 1000),
                            profile.id
                        ],
                        function(err) {
                            if (err) return reject(err);
                            resolve(existingUser);
                        }
                    );
                } else {
                    // Create new user
                    db.run(`INSERT INTO users (
                        id, google_id, email, name, picture, 
                        google_access_token, google_refresh_token, token_expiry
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            userId,
                            profile.id,
                            profile.emails[0].value,
                            profile.displayName,
                            profile.photos[0]?.value,
                            tokens.access_token,
                            tokens.refresh_token,
                            new Date(Date.now() + tokens.expires_in * 1000)
                        ],
                        function(err) {
                            if (err) return reject(err);
                            
                            // Create default preferences
                            db.run('INSERT INTO user_preferences (user_id) VALUES (?)', [userId]);
                            
                            resolve({
                                id: userId,
                                google_id: profile.id,
                                email: profile.emails[0].value,
                                name: profile.displayName,
                                picture: profile.photos[0]?.value
                            });
                        }
                    );
                }
            });
        });
    },

    // Link HandCash to user account
    async linkHandCash(userId, handcashHandle, authToken) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE users SET 
                handcash_handle = ?, 
                handcash_auth_token = ?,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [handcashHandle, authToken, userId],
                function(err) {
                    if (err) return reject(err);
                    resolve({ success: true });
                }
            );
        });
    },

    // Get user by ID
    async getUserById(userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
                if (err) return reject(err);
                resolve(user);
            });
        });
    },

    // Get user by email
    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
                if (err) return reject(err);
                resolve(user);
            });
        });
    },

    // Create session
    async createSession(userId) {
        const sessionId = crypto.randomBytes(16).toString('hex');
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO sessions (id, user_id, session_token, expires_at) 
                    VALUES (?, ?, ?, ?)`,
                [sessionId, userId, sessionToken, expiresAt],
                function(err) {
                    if (err) return reject(err);
                    resolve({ sessionId, sessionToken });
                }
            );
        });
    },

    // Verify session
    async verifySession(sessionToken) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT s.*, u.* FROM sessions s 
                    JOIN users u ON s.user_id = u.id 
                    WHERE s.session_token = ? AND s.expires_at > datetime('now')`,
                [sessionToken],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    },

    // Save Drive sync mapping
    async saveDriveSync(userId, googleFileId, googleFileName, bsvTxId, fileHash) {
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO drive_sync 
                    (user_id, google_file_id, google_file_name, bsv_tx_id, file_hash, last_synced)
                    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, googleFileId, googleFileName, bsvTxId, fileHash],
                function(err) {
                    if (err) return reject(err);
                    resolve({ success: true });
                }
            );
        });
    },

    // Get user's Drive sync mappings
    async getUserDriveSyncs(userId) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM drive_sync WHERE user_id = ? ORDER BY last_synced DESC',
                [userId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });
    }
};

module.exports = {
    db,
    initDatabase,
    ...dbHelpers
};