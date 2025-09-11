const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

// Path to the Electron app data directory
const electronDataDir = path.join(require('os').homedir(), 'Library', 'Application Support', 'character-notepad', 'CharacterNotepadData');

// Middleware
app.use(express.json());

// API routes must come before static middleware
app.get('/api/migrate-data', (req, res) => {
    try {
        console.log('Migration request received');

        // Check if data directory exists
        if (!fs.existsSync(electronDataDir)) {
            console.log('Data directory not found:', electronDataDir);
            return res.status(404).json({ error: 'Data directory not found' });
        }

        const notesFile = path.join(electronDataDir, 'notes.json');
        const charactersFile = path.join(electronDataDir, 'characters.json');

        let notes = {};
        let characters = {};

        // Try to read notes
        if (fs.existsSync(notesFile)) {
            try {
                const notesData = fs.readFileSync(notesFile, 'utf8');
                notes = JSON.parse(notesData);
                console.log(`Found ${Object.keys(notes).length} notes`);
            } catch (error) {
                console.error('Error reading notes file:', error);
            }
        }

        // Try to read characters
        if (fs.existsSync(charactersFile)) {
            try {
                const charactersData = fs.readFileSync(charactersFile, 'utf8');
                characters = JSON.parse(charactersData);
                console.log(`Found ${Object.keys(characters).length} characters`);
            } catch (error) {
                console.error('Error reading characters file:', error);
            }
        }

        res.json({
            notes: notes,
            characters: characters,
            message: `Data migration ready: ${Object.keys(notes).length} notes, ${Object.keys(characters).length} characters`
        });

    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: 'Migration failed', details: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(express.static('public'));

// Main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Migration server running on http://localhost:${port}`);
    console.log(`Data directory: ${electronDataDir}`);
});
