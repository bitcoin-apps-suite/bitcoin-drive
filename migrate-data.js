const fs = require('fs');
const path = require('path');

// Paths
const exportedDataPath = '/Volumes/Extreme SSD/Projects/image-sequence-notepad/Volumes/Extreme';
const newAppDataPath = path.join(process.env.HOME, 'Library', 'Application Support', 'character-notepad', 'CharacterNotepadData');

console.log('🔄 Starting data migration...');
console.log('Reading exported data from:', exportedDataPath);
console.log('Target location:', newAppDataPath);

try {
    // Read the exported data
    const exportedData = JSON.parse(fs.readFileSync(exportedDataPath, 'utf8'));
    
    console.log('Exported data structure:');
    console.log('- Notes count:', exportedData.notes ? Object.keys(exportedData.notes).length : 0);
    console.log('- Characters count:', exportedData.characters ? Object.keys(exportedData.characters).length : 0);
    
    // Ensure the target directory exists
    if (!fs.existsSync(newAppDataPath)) {
        fs.mkdirSync(newAppDataPath, { recursive: true });
        console.log('Created target directory');
    }
    
    let notes = {};
    let characters = {};
    
    // Copy notes if they exist
    if (exportedData.notes) {
        const notesPath = path.join(newAppDataPath, 'notes.json');
        
        // Check if notes.json already exists
        let existingNotes = {};
        if (fs.existsSync(notesPath)) {
            existingNotes = JSON.parse(fs.readFileSync(notesPath, 'utf8'));
            console.log('Found existing notes:', Object.keys(existingNotes).length);
        }
        
        // Merge the notes (exported data takes precedence)
        notes = { ...existingNotes, ...exportedData.notes };
        
        fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
        console.log('✅ Copied', Object.keys(exportedData.notes).length, 'notes to notes.json');
        console.log('Total notes after merge:', Object.keys(notes).length);
    }
    
    // Copy characters if they exist
    if (exportedData.characters) {
        const charactersPath = path.join(newAppDataPath, 'characters.json');
        
        // Check if characters.json already exists
        let existingCharacters = {};
        if (fs.existsSync(charactersPath)) {
            existingCharacters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));
            console.log('Found existing characters:', Object.keys(existingCharacters).length);
        }
        
        // Merge the characters (exported data takes precedence)
        characters = { ...existingCharacters, ...exportedData.characters };
        
        fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));
        console.log('✅ Copied', Object.keys(exportedData.characters).length, 'characters to characters.json');
        console.log('Total characters after merge:', Object.keys(characters).length);
    }

    // Create migration HTML file
    const migrationHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Data Migration</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        button { padding: 10px 20px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>📦 Data Migration Tool</h1>
    <p>This tool will migrate your data from the Electron app to browser localStorage.</p>
    <p><strong>Found:</strong> ${Object.keys(notes).length} notes, ${Object.keys(characters).length} characters</p>

    <button onclick="migrateData()">🚀 Start Migration</button>
    <div id="status"></div>

    <script>
        const notesData = ${JSON.stringify(notes)};
        const charactersData = ${JSON.stringify(characters)};

        function migrateData() {
            const status = document.getElementById('status');

            try {
                // Store data in localStorage
                if (Object.keys(notesData).length > 0) {
                    localStorage.setItem('imageSequenceNotes', JSON.stringify(notesData));
                    status.innerHTML += '<p class="success">✅ Notes migrated successfully!</p>';
                }

                if (Object.keys(charactersData).length > 0) {
                    localStorage.setItem('imageSequenceCharacters', JSON.stringify(charactersData));
                    status.innerHTML += '<p class="success">✅ Characters migrated successfully!</p>';
                }

                status.innerHTML += '<p class="success"><strong>🎉 Migration complete! You can now close this window and refresh your app.</strong></p>';

            } catch (error) {
                status.innerHTML = '<p class="error">❌ Migration failed: ' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>`;

    // Write the migration HTML file
    const migrationFile = path.join(__dirname, 'public', 'migration.html');
    fs.writeFileSync(migrationFile, migrationHtml);

    console.log('✅ Migration file created:', migrationFile);
    console.log('📝 Instructions:');
    console.log('1. Open http://localhost:3001/migration.html in your browser');
    console.log('2. Click "Start Migration" button');
    console.log('3. Close the migration page and refresh your app');
    
    console.log('\n🎉 Data migration completed successfully!');
    console.log('Your old notes and characters have been copied to the new app location.');

} catch (error) {
    console.error('❌ Migration script error:', error);
    process.exit(1);
}
