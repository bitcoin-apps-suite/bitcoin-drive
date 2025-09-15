const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

// Initialize database
const { 
    upsertGoogleUser, 
    getUserById, 
    createSession,
    verifySession,
    linkHandCash 
} = require('./database');

// Configure Passport with Google OAuth
function initGoogleAuth(app) {
    // Session secret for JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'bitcoin-drive-secret-key-change-in-production';
    
    // Initialize Passport
    app.use(passport.initialize());
    
    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/callback/google",
        scope: [
            // Basic profile
            'openid',
            'profile',
            'email',
            
            // Google Drive - Full Access
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.metadata',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
            'https://www.googleapis.com/auth/drive.appdata',
            'https://www.googleapis.com/auth/drive.scripts',
            'https://www.googleapis.com/auth/drive.activity',
            'https://www.googleapis.com/auth/drive.activity.readonly',
            'https://www.googleapis.com/auth/drive.meet.readonly',
            
            // Gmail - Full Access
            'https://mail.google.com/',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.metadata',
            'https://www.googleapis.com/auth/gmail.insert',
            'https://www.googleapis.com/auth/gmail.labels',
            'https://www.googleapis.com/auth/gmail.settings.basic',
            'https://www.googleapis.com/auth/gmail.settings.sharing',
            
            // Google Docs & Sheets
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/spreadsheets',
            
            // Google Calendar
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly',
            
            // YouTube
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtubepartner',
            
            // Analytics & BigQuery
            'https://www.googleapis.com/auth/analytics',
            'https://www.googleapis.com/auth/analytics.readonly',
            'https://www.googleapis.com/auth/bigquery',
            'https://www.googleapis.com/auth/bigquery.readonly',
            'https://www.googleapis.com/auth/bigquery.insertdata',
            
            // Cloud Platform
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/cloud-platform.read-only',
            'https://www.googleapis.com/auth/datastore',
            'https://www.googleapis.com/auth/logging.admin',
            
            // Cloud Storage
            'https://www.googleapis.com/auth/devstorage.full_control',
            'https://www.googleapis.com/auth/devstorage.read_write',
            'https://www.googleapis.com/auth/devstorage.read_only'
        ]
    },
    async (accessToken, refreshToken, params, profile, done) => {
        try {
            // Save user to database
            const user = await upsertGoogleUser(profile, {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: params.expires_in
            });
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
    
    // Serialize user
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    // Deserialize user
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
    
    // Authentication routes
    
    // Initiate Google OAuth
    // Use the same comprehensive scope list for authentication
    const googleScopes = [
        'openid', 'profile', 'email',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/analytics',
        'https://www.googleapis.com/auth/bigquery'
    ];
    
    app.get('/api/auth/google',
        passport.authenticate('google', {
            scope: googleScopes,
            accessType: 'offline',
            prompt: 'consent'
        })
    );
    
    // Google OAuth callback
    app.get('/api/auth/callback/google',
        passport.authenticate('google', { session: false }),
        async (req, res) => {
            try {
                // Create session
                const { sessionToken } = await createSession(req.user.id);
                
                // Create JWT token
                const token = jwt.sign(
                    { 
                        userId: req.user.id,
                        email: req.user.email,
                        sessionToken 
                    },
                    JWT_SECRET,
                    { expiresIn: '30d' }
                );
                
                // Redirect to frontend with token
                res.redirect(`/drive.html?token=${token}&auth=google`);
            } catch (error) {
                console.error('OAuth callback error:', error);
                res.redirect('/drive.html?error=auth_failed');
            }
        }
    );
    
    // Get current user
    app.get('/api/auth/me', async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            
            // Verify JWT
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Verify session
            const session = await verifySession(decoded.sessionToken);
            if (!session) {
                return res.status(401).json({ error: 'Invalid session' });
            }
            
            res.json({
                id: session.id,
                email: session.email,
                name: session.name,
                picture: session.picture,
                hasGoogle: !!session.google_id,
                hasHandCash: !!session.handcash_handle,
                handcashHandle: session.handcash_handle
            });
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    });
    
    // Link HandCash account
    app.post('/api/auth/link-handcash', async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            const { handcashHandle, handcashAuthToken } = req.body;
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            
            // Verify JWT
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Link HandCash to user account
            await linkHandCash(decoded.userId, handcashHandle, handcashAuthToken);
            
            res.json({ success: true });
        } catch (error) {
            console.error('Link HandCash error:', error);
            res.status(500).json({ error: 'Failed to link HandCash' });
        }
    });
    
    // Logout
    app.post('/api/auth/logout', (req, res) => {
        // Client should remove the JWT token
        res.json({ success: true });
    });
    
    // Middleware to verify authentication
    const authMiddleware = async (req, res, next) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            
            // Verify JWT
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Verify session
            const session = await verifySession(decoded.sessionToken);
            if (!session) {
                return res.status(401).json({ error: 'Invalid session' });
            }
            
            req.user = session;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
    
    return { authMiddleware };
}

// Helper to get Google API client
async function getGoogleClient(user) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        '/api/auth/callback/google'
    );
    
    oauth2Client.setCredentials({
        access_token: user.google_access_token,
        refresh_token: user.google_refresh_token,
        expiry_date: new Date(user.token_expiry).getTime()
    });
    
    return oauth2Client;
}

module.exports = {
    initGoogleAuth,
    getGoogleClient
};