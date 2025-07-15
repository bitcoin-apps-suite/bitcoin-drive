const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const net = require('net');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;
let server;
let SERVER_PORT; // Will be dynamically assigned

// Enable live reload for development
const isDev = process.argv.includes('--dev');

// Data storage path
const DATA_DIR = path.join(app.getPath('userData'), 'CharacterNotepadData');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const CHARACTERS_FILE = path.join(DATA_DIR, 'characters.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');

// Ensure data directory exists
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// File storage functions
function readDataFile(filePath, defaultValue = {}) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return defaultValue;
    }
}

function writeDataFile(filePath, data) {
    try {
        ensureDataDir();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// IPC handlers for data storage
function setupIpcHandlers() {
    ipcMain.handle('load-notes', () => {
        return readDataFile(NOTES_FILE, {});
    });

    ipcMain.handle('save-notes', (event, notes) => {
        return writeDataFile(NOTES_FILE, notes);
    });

    ipcMain.handle('load-characters', () => {
        return readDataFile(CHARACTERS_FILE, {});
    });

    ipcMain.handle('save-characters', (event, characters) => {
        return writeDataFile(CHARACTERS_FILE, characters);
    });

    ipcMain.handle('load-auth', () => {
        return readDataFile(AUTH_FILE, {});
    });

    ipcMain.handle('save-auth', (event, auth) => {
        return writeDataFile(AUTH_FILE, auth);
    });

    ipcMain.handle('migrate-localStorage', (event, data) => {
        // Migrate data from localStorage to file system
        let migrated = false;
        
        if (data.notes && Object.keys(data.notes).length > 0) {
            writeDataFile(NOTES_FILE, data.notes);
            migrated = true;
        }
        
        if (data.characters && Object.keys(data.characters).length > 0) {
            writeDataFile(CHARACTERS_FILE, data.characters);
            migrated = true;
        }
        
        if (data.auth && Object.keys(data.auth).length > 0) {
            writeDataFile(AUTH_FILE, data.auth);
            migrated = true;
        }
        
        return migrated;
    });

    ipcMain.handle('get-data-path', () => {
        return DATA_DIR;
    });
}

function findAvailablePort(startPort = 3001) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        
        server.listen(startPort, (err) => {
            if (err) {
                // Port is in use, try next one
                server.close();
                findAvailablePort(startPort + 1).then(resolve).catch(reject);
                return;
            }
            
            const port = server.address().port;
            server.close(() => {
                resolve(port);
            });
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, try next one
                findAvailablePort(startPort + 1).then(resolve).catch(reject);
            } else {
                reject(err);
            }
        });
    });
}

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png'), // Add app icon
        titleBarStyle: 'default',
        show: false // Don't show until ready
    });

    // Load the app
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Focus on window
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Open external links in default browser
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Prevent navigation away from the app
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== `http://localhost:${SERVER_PORT}`) {
            event.preventDefault();
        }
    });
}

async function startServer() {
    try {
        // Find an available port
        SERVER_PORT = await findAvailablePort(3001);
        console.log(`Using port: ${SERVER_PORT}`);
        
        return new Promise((resolve, reject) => {
            // Create Express app directly within Electron process
            const expressApp = express();
            
            // Serve static files from public directory
            expressApp.use(express.static(path.join(__dirname, 'public')));

            // Route all requests to index.html for single page app
            expressApp.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, 'public', 'index.html'));
            });

            // Start server on the available port
            server = expressApp.listen(SERVER_PORT, (err) => {
                if (err) {
                    console.error('Failed to start server:', err);
                    reject(err);
                    return;
                }
                
                console.log(`Character Notepad running on http://localhost:${SERVER_PORT}`);
                console.log('Ready to create notes with images and prompts!');
                resolve();
            });

            server.on('error', (err) => {
                console.error('Server error:', err);
                reject(err);
            });
        });
    } catch (error) {
        throw new Error(`Failed to find available port: ${error.message}`);
    }
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Entry',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (typeof toggleAddEntry === 'function') {
                                toggleAddEntry();
                            }
                        `);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Image Sequence Notepad',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About',
                            message: 'Image Sequence Notepad',
                            detail: 'A secure, password-protected desktop app for storing images and prompts.\\nVersion 1.0.0'
                        });
                    }
                }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });

        // Window menu
        template[4].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
    try {
        // Setup IPC handlers for data persistence
        setupIpcHandlers();
        
        // Ensure data directory exists
        ensureDataDir();
        
        // Start the server first
        console.log('Starting server...');
        await startServer();
        console.log(`Server started on port ${SERVER_PORT}`);
        
        // Create the window
        createWindow();
        createMenu();
        
        console.log('Character Notepad started successfully!');
        console.log(`Data stored in: ${DATA_DIR}`);
    } catch (error) {
        console.error('Failed to start application:', error);
        dialog.showErrorBox('Startup Error', `Failed to start the application server: ${error.message}\n\nPlease try again.`);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    // Close the server when quitting
    if (server) {
        console.log('Closing server...');
        server.close(() => {
            console.log('Server closed');
        });
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
}); 