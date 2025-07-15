// Password Authentication Manager
class AuthManager {
    constructor() {
        this.sessionLength = 24 * 60 * 60 * 1000; // 24 hours
        this.authData = {};
        this.init();
    }

    async init() {
        this.bindAuthEvents();
        await this.loadAuthData();
        await this.migrateFromLocalStorage();
        // Add a small delay to ensure auth data is loaded
        setTimeout(() => {
            this.checkAuthStatus();
        }, 100);
    }

    async loadAuthData() {
        try {
            if (window.electronAPI) {
                this.authData = await window.electronAPI.loadAuth();
            }
        } catch (error) {
            console.error('Error loading auth data:', error);
            this.authData = {};
        }
    }

    async saveAuthData() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.saveAuth(this.authData);
            }
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    }

    async migrateFromLocalStorage() {
        // Check if we need to migrate from localStorage
        const oldPassword = localStorage.getItem('imageSequenceNotepadPassword');
        const oldAuth = localStorage.getItem('imageSequenceNotepadAuth');
        const oldNotes = localStorage.getItem('imageSequenceNotes');
        const oldCharacters = localStorage.getItem('imageSequenceCharacters');

        if (oldPassword || oldAuth || oldNotes || oldCharacters) {
            console.log('Migrating data from localStorage to file system...');
            
            const migrationData = {
                auth: {},
                notes: {},
                characters: {}
            };

            // Migrate auth data
            if (oldPassword) {
                migrationData.auth.passwordHash = oldPassword;
            }
            if (oldAuth) {
                try {
                    const authToken = JSON.parse(oldAuth);
                    migrationData.auth.authToken = authToken;
                } catch (e) {
                    console.error('Error parsing old auth token:', e);
                }
            }

            // Migrate notes
            if (oldNotes) {
                try {
                    migrationData.notes = JSON.parse(oldNotes);
                } catch (e) {
                    console.error('Error parsing old notes:', e);
                }
            }

            // Migrate characters
            if (oldCharacters) {
                try {
                    migrationData.characters = JSON.parse(oldCharacters);
                } catch (e) {
                    console.error('Error parsing old characters:', e);
                }
            }

            // Perform migration
            if (window.electronAPI) {
                const migrated = await window.electronAPI.migrateLocalStorage(migrationData);
                if (migrated) {
                    // Clear localStorage after successful migration
                    localStorage.removeItem('imageSequenceNotepadPassword');
                    localStorage.removeItem('imageSequenceNotepadAuth');
                    localStorage.removeItem('imageSequenceNotes');
                    localStorage.removeItem('imageSequenceCharacters');
                    
                    // Reload auth data
                    await this.loadAuthData();
                    
                    console.log('Migration completed successfully!');
                    this.showMigrationNotification();
                }
            }
        }
    }

    showMigrationNotification() {
        const notification = document.createElement('div');
        notification.className = 'migration-notification';
        notification.innerHTML = `
            <div class="migration-content">
                <h3>✅ Data Migration Complete</h3>
                <p>Your notes and settings have been migrated to persistent storage.</p>
                <p>Your data will now be preserved across app updates!</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    bindAuthEvents() {
        // Setup password
        document.getElementById('setup-password-btn').addEventListener('click', () => {
            this.setupPassword();
        });

        // Login
        document.getElementById('login-btn').addEventListener('click', () => {
            this.login();
        });

        // Enter key for password fields
        document.getElementById('login-password-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        document.getElementById('setup-password-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('setup-password-confirm').focus();
        });

        document.getElementById('setup-password-confirm').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setupPassword();
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('change-password-btn').addEventListener('click', () => {
            this.changePassword();
        });

        // Modal close on outside click
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.closeSettings();
            }
        });
    }

    // Simple hash function (for demo - in production use proper crypto)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'salt_string_for_notepad');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    checkAuthStatus() {
        const passwordHash = this.authData.passwordHash;
        const authToken = this.authData.authToken;
        
        if (!passwordHash) {
            // No password set, show setup
            this.showPasswordSetup();
        } else if (this.isValidAuthToken(authToken)) {
            // Valid session, show app
            this.showApp();
        } else {
            // Need to login
            this.showLogin();
        }
    }

    isValidAuthToken(token) {
        if (!token) {
            return false;
        }
        
        try {
            // Token is already an object in the new system
            const tokenObj = typeof token === 'string' ? JSON.parse(token) : token;
            const timeDiff = Date.now() - tokenObj.timestamp;
            const isValid = timeDiff < this.sessionLength;
            
            return isValid;
        } catch (error) {
            console.error('Auth token validation error:', error);
            return false;
        }
    }

    showPasswordSetup() {
        document.getElementById('setup-password').style.display = 'block';
        document.getElementById('enter-password').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    showLogin() {
        document.getElementById('setup-password').style.display = 'none';
        document.getElementById('enter-password').style.display = 'block';
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('login-error').style.display = 'none';
    }

    showApp() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        // Initialize the main app
        if (!window.noteApp) {
            window.noteApp = new NoteApp();
        }
    }

    async setupPassword() {
        const password = document.getElementById('setup-password-input').value;
        const confirmPassword = document.getElementById('setup-password-confirm').value;

        if (!password || password.length < 4) {
            alert('Password must be at least 4 characters long');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const hashedPassword = await this.hashPassword(password);
        this.authData.passwordHash = hashedPassword;
        
        // Set auth token
        this.authData.authToken = { timestamp: Date.now() };
        
        await this.saveAuthData();

        this.showApp();
    }

    async login() {
        const password = document.getElementById('login-password-input').value;
        const storedPassword = this.authData.passwordHash;

        if (!password) return;

        const hashedPassword = await this.hashPassword(password);
        
        if (hashedPassword === storedPassword) {
            // Set auth token
            this.authData.authToken = { timestamp: Date.now() };
            await this.saveAuthData();
            this.showApp();
        } else {
            document.getElementById('login-error').style.display = 'block';
            document.getElementById('login-password-input').value = '';
        }
    }

    openSettings() {
        document.getElementById('settings-modal').style.display = 'flex';
        // Clear previous inputs
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-new-password').value = '';
        document.getElementById('password-change-message').style.display = 'none';
    }

    closeSettings() {
        document.getElementById('settings-modal').style.display = 'none';
    }

    async changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        const messageEl = document.getElementById('password-change-message');

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            this.showMessage(messageEl, 'Please fill all fields', 'error');
            return;
        }

        if (newPassword.length < 4) {
            this.showMessage(messageEl, 'New password must be at least 4 characters long', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            this.showMessage(messageEl, 'New passwords do not match', 'error');
            return;
        }

        // Verify current password
        const storedPassword = this.authData.passwordHash;
        const hashedCurrentPassword = await this.hashPassword(currentPassword);

        if (hashedCurrentPassword !== storedPassword) {
            this.showMessage(messageEl, 'Current password is incorrect', 'error');
            return;
        }

        // Set new password
        const hashedNewPassword = await this.hashPassword(newPassword);
        this.authData.passwordHash = hashedNewPassword;
        await this.saveAuthData();
        
        this.showMessage(messageEl, 'Password changed successfully!', 'success');
        
        // Clear form after success
        setTimeout(() => {
            this.closeSettings();
        }, 1500);
    }

    showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }
}

// Character Note Taking App
class NoteApp {
    constructor() {
        this.currentNote = null;
        this.currentCharacter = 'all'; // Start with "All notes" selected
        this.notes = {};
        this.characters = {};
        this.autoSaveTimeout = null;
        this.init();
    }

    async init() {
        this.notes = await this.loadNotes();
        this.characters = await this.loadCharacters();
        this.migrateGeneralToAll();
        this.bindEvents();
        this.renderCharacterTabs();
        this.renderNotesList();
        this.showEmptyState();
    }

    migrateGeneralToAll() {
        // Migrate old "general" character to "all" character
        if (this.characters['general'] && !this.characters['all']) {
            this.characters['all'] = {
                ...this.characters['general'],
                id: 'all',
                name: 'All notes'
            };
            delete this.characters['general'];
            this.saveCharacters();
        }

        // Migrate notes from "general" to "all"
        let migratedNotes = false;
        Object.keys(this.notes).forEach(noteId => {
            if (this.notes[noteId].characterId === 'general') {
                this.notes[noteId].characterId = 'all';
                migratedNotes = true;
            }
        });

        if (migratedNotes) {
            this.saveNotes();
        }

        // Ensure "All notes" character exists
        this.ensureGeneralCharacter();
    }

    bindEvents() {
        // New note button
        document.getElementById('new-note-btn').addEventListener('click', () => {
            this.createNewNote();
        });

        // Delete note button
        document.getElementById('delete-note-btn').addEventListener('click', () => {
            this.deleteCurrentNote();
        });

        // Priority toggle button
        document.getElementById('priority-toggle-btn').addEventListener('click', () => {
            this.toggleNotePriority();
        });

        // Sequential toggle button
        document.getElementById('sequence-toggle-btn').addEventListener('click', () => {
            this.toggleSequentialMode();
        });

        // Auto-save on input - faster response
        document.getElementById('note-text').addEventListener('input', () => {
            this.autoSave();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.createNewNote();
            }
        });

        // Character management
        document.getElementById('add-character-btn').addEventListener('click', () => {
            this.openCharacterModal();
        });

        document.getElementById('close-character-modal').addEventListener('click', () => {
            this.closeCharacterModal();
        });

        document.getElementById('create-character-btn').addEventListener('click', () => {
            this.createCharacter();
        });

        // Character modal close on outside click
        document.getElementById('character-modal').addEventListener('click', (e) => {
            if (e.target.id === 'character-modal') {
                this.closeCharacterModal();
            }
        });

        // Character name input enter key
        document.getElementById('character-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createCharacter();
        });

        // All Characters functionality is now handled by the "All notes" character tab

        // Drag and drop for files
        this.setupDragAndDrop();
        
        // Drag and drop for character tabs
        this.setupCharacterTabDragAndDrop();

        // Handle paste for images
        document.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('drop-zone');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });
    }

    setupNoteDragAndDrop() {
        // Add drag listeners to all note items
        document.querySelectorAll('.note-item').forEach(noteItem => {
            noteItem.addEventListener('dragstart', (e) => {
                const noteId = e.target.dataset.noteId;
                e.dataTransfer.setData('text/plain', noteId);
                e.dataTransfer.setData('application/note-id', noteId);
                e.target.classList.add('dragging');
            });

            noteItem.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
    }

    setupCharacterTabDragAndDrop() {
        // Add drop listeners to character tabs
        document.querySelectorAll('.character-tab').forEach(tab => {
            const characterId = tab.dataset.character;
            if (!characterId) return;

            tab.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                tab.classList.add('drag-over');
            });

            tab.addEventListener('dragleave', (e) => {
                // Only remove drag-over if we're actually leaving the tab
                if (!tab.contains(e.relatedTarget)) {
                    tab.classList.remove('drag-over');
                }
            });

            tab.addEventListener('drop', (e) => {
                e.preventDefault();
                tab.classList.remove('drag-over');
                
                const noteId = e.dataTransfer.getData('application/note-id') || e.dataTransfer.getData('text/plain');
                if (noteId) {
                    this.moveNoteToCharacter(noteId, characterId);
                }
            });
        });
    }

    moveNoteToCharacter(noteId, characterId) {
        const note = this.notes[noteId];
        if (!note) return;

        // Update note's character
        note.characterId = characterId;
        note.updatedAt = new Date().toISOString();

        // Save changes
        this.saveNotes();

        // Update UI
        this.renderNotesList();

        // Show notification
        const character = this.characters[characterId];
        const characterName = character ? character.name : 'Unknown';
        this.showMoveNotification(`Note moved to ${characterName}!`);
    }

    showMoveNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    handleFiles(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.addImageToNote(file);
            }
        });
    }

    handlePaste(e) {
        const items = e.clipboardData.items;
        let hasImages = false;
        let hasText = false;
        const images = [];

        // First pass: collect images and check for text
        for (let item of items) {
            if (item.type.startsWith('image/')) {
                hasImages = true;
                const file = item.getAsFile();
                images.push(file);
            } else if (item.type === 'text/plain' || item.type === 'text/html') {
                hasText = true;
            }
        }

        // Handle images if found
        if (hasImages) {
            e.preventDefault();
            
            // Ensure we have a note to paste into
            if (!this.currentNote) {
                this.createNewNote();
            }

            // Add all images
            images.forEach(file => {
                this.addImageToNote(file);
            });

            // Handle text content immediately after images
            if (hasText) {
                // Use setTimeout to allow images to be processed first
                setTimeout(() => {
                    this.processPasteText(items);
                }, 50);
                this.showPasteNotification('📋 Pasted images and text!');
            } else {
                this.showPasteNotification('🖼️ Pasted images!');
            }
        } else if (hasText && e.target.tagName !== 'TEXTAREA') {
            // If only text and not already in textarea, prevent and handle specially
            e.preventDefault();
            if (!this.currentNote) {
                this.createNewNote();
            }
            this.processPasteText(items);
            this.showPasteNotification('📋 Pasted text!');
        }
    }

    processPasteText(items) {
        // Process text items in priority order: plain text first, then HTML
        let textProcessed = false;
        
        // First try plain text
        for (let item of items) {
            if (item.type === 'text/plain' && !textProcessed) {
                textProcessed = true;
                item.getAsString(text => {
                    const cleanText = text.trim();
                    if (cleanText && this.currentNote) {
                        this.handleMixedPasteText(cleanText);
                    }
                });
                return; // Exit early after processing plain text
            }
        }
        
        // If no plain text found, try HTML
        if (!textProcessed) {
            for (let item of items) {
                if (item.type === 'text/html') {
                    textProcessed = true;
                    item.getAsString(html => {
                        const textFromHtml = this.extractTextFromHtml(html);
                        if (textFromHtml && this.currentNote) {
                            this.handleMixedPasteText(textFromHtml);
                        }
                    });
                    return; // Exit early after processing HTML
                }
            }
        }
    }

    handleMixedPasteText(text) {
        if (this.currentNote.isSequential) {
            // In sequential mode, add text to the first step or current step
            const firstStep = this.currentNote.sequenceSteps[0];
            if (firstStep) {
                const currentPrompt = firstStep.prompt.trim();
                if (currentPrompt === '') {
                    firstStep.prompt = text;
                } else {
                    firstStep.prompt = currentPrompt + '\n\n' + text;
                }
                this.currentNote.updatedAt = new Date().toISOString();
                this.autoSaveSequence();
                this.renderSequentialEditor();
            }
        } else {
            // Standard mode - use textarea
            const textarea = document.getElementById('note-text');
            if (textarea) {
                const currentText = textarea.value.trim();
                
                if (currentText === '') {
                    // If textarea is empty, just set the text
                    textarea.value = text;
                } else {
                    // If there's existing text, append with a line break
                    textarea.value = currentText + '\n\n' + text;
                }
                
                // Trigger auto-save
                this.autoSave();
                
                // Focus textarea and move cursor to end
                textarea.focus();
                textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }
        }
    }

    extractTextFromHtml(html) {
        // Create a temporary div to parse HTML and extract text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Remove script and style elements
        const scripts = tempDiv.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());
        
        // Get text content and clean it up
        let text = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clean up whitespace - replace multiple spaces/newlines with single spaces
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    showPasteNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        // Add animation keyframes if not already added
        if (!document.getElementById('paste-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'paste-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    addImageToNote(file) {
        if (!this.currentNote) {
            this.createNewNote();
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: file.name,
                data: e.target.result, // Store full quality base64
                size: file.size,
                type: file.type,
                addedAt: new Date().toISOString()
            };

            if (this.currentNote.isSequential) {
                // In sequential mode, add to first step
                const firstStep = this.currentNote.sequenceSteps[0];
                if (firstStep) {
                    if (!firstStep.images) firstStep.images = [];
                    firstStep.images.push(imageData);
                    this.currentNote.updatedAt = new Date().toISOString();
                    this.autoSaveSequence();
                    this.renderSequentialEditor();
                }
            } else {
                // Standard mode
                if (!this.currentNote.images) {
                    this.currentNote.images = [];
                }
                
                this.currentNote.images.push(imageData);
                this.renderImages();
                this.hideDropMessage();
                this.autoSave();
            }
        };
        
        // Read as data URL to maintain full quality
        reader.readAsDataURL(file);
    }

    renderImages() {
        const container = document.getElementById('images-container');
        if (!this.currentNote || !this.currentNote.images) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.currentNote.images.map(image => `
            <div class="image-item" data-image-id="${image.id}">
                <img src="${image.data}" alt="${image.name}" title="${image.name}">
                <button class="image-remove" onclick="noteApp.removeImage('${image.id}')" title="Remove image">×</button>
            </div>
        `).join('');
    }

    removeImage(imageId) {
        if (!this.currentNote || !this.currentNote.images) return;
        
        this.currentNote.images = this.currentNote.images.filter(img => img.id !== imageId);
        this.renderImages();
        
        if (this.currentNote.images.length === 0) {
            this.showDropMessage();
        }
        
        this.autoSave();
    }

    generateTitleFromText(text) {
        if (!text || text.trim() === '') {
            return 'Untitled Note';
        }
        
        // Get first 4-6 words, remove extra whitespace and newlines
        const cleanText = text.trim().replace(/\s+/g, ' ');
        const words = cleanText.split(' ').slice(0, 5);
        const title = words.join(' ');
        
        // Truncate if too long
        return title.length > 50 ? title.substring(0, 47) + '...' : title;
    }

    createNewNote() {
        // Ensure there's always a default character available
        this.ensureGeneralCharacter();
        
        // If "all" is selected, use the all notes character
        let characterId = this.currentCharacter;
        if (characterId === 'all') {
            characterId = 'all';
        }

        const note = {
            id: 'note_' + Date.now(),
            title: 'Untitled Note',
            text: '',
            images: [],
            characterId: characterId,
            isPriority: false,
            sequenceSteps: [{ id: 'step_1', prompt: '', images: [] }],
            isSequential: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes[note.id] = note;
        this.currentNote = note;
        this.saveNotes();
        this.renderNotesList();
        this.showNoteEditor();
        this.loadNoteInEditor(note);

        // Focus on textarea
        setTimeout(() => {
            document.getElementById('note-text').focus();
        }, 100);
    }

    ensureGeneralCharacter() {
        // Create a default "All notes" character if it doesn't exist
        if (!this.characters['all']) {
            this.characters['all'] = {
                id: 'all',
                name: 'All notes',
                emoji: '📝',
                createdAt: new Date().toISOString()
            };
            this.saveCharacters();
            this.renderCharacterTabs();
        }
    }

    loadNoteInEditor(note) {
        this.updatePriorityButton();
        this.updateSequenceButton();
        
        if (note.isSequential) {
            this.renderSequentialEditor();
        } else {
            this.renderStandardEditor();
        }
    }

    renderStandardEditor() {
        const noteContent = document.getElementById('note-content');
        
        // Make sure we have the standard editor structure
        if (!document.getElementById('note-text')) {
            noteContent.innerHTML = `
                <div class="drop-zone" id="drop-zone">
                    <div class="drop-message" id="drop-message">
                        <h2>📷 Drop images here</h2>
                        <p>Drag and drop images, then paste or type your prompts below</p>
                    </div>
                    
                    <div class="images-container" id="images-container">
                        <!-- Images will appear here -->
                    </div>
                    
                    <textarea 
                        id="note-text" 
                        placeholder="Paste or type your prompts and notes here..."
                        class="note-textarea"
                    ></textarea>
                </div>
            `;
        }
        
        document.getElementById('note-text').value = this.currentNote.text || '';
        this.renderImages();
        
        if (this.currentNote.images && this.currentNote.images.length > 0) {
            this.hideDropMessage();
        } else {
            this.showDropMessage();
        }
    }

    renderSequentialEditor() {
        const noteContent = document.getElementById('note-content');
        
        if (!this.currentNote.sequenceSteps || this.currentNote.sequenceSteps.length === 0) {
            this.currentNote.sequenceSteps = [{ id: 'step_1', prompt: '', images: [] }];
        }
        
        // Initialize currentStepIndex if not set
        if (this.currentStepIndex == null) {
            this.currentStepIndex = 0;
        }
        
        // Ensure currentStepIndex is within bounds
        if (this.currentStepIndex >= this.currentNote.sequenceSteps.length) {
            this.currentStepIndex = this.currentNote.sequenceSteps.length - 1;
        }
        
        const currentStep = this.currentNote.sequenceSteps[this.currentStepIndex];
        
        noteContent.innerHTML = `
            <div class="sequence-editor">
                <div class="sequence-header">
                    <div class="sequence-navigation">
                        <button class="sequence-nav-btn" id="nav-left" ${this.currentStepIndex === 0 ? 'disabled' : ''}>‹</button>
                        <div class="sequence-counter">
                            <span>Step <span id="current-step">${this.currentStepIndex + 1}</span> of <span id="total-steps">${this.currentNote.sequenceSteps.length}</span></span>
                        </div>
                        <button class="sequence-nav-btn" id="nav-right" ${this.currentStepIndex === this.currentNote.sequenceSteps.length - 1 ? 'disabled' : ''}>›</button>
                    </div>
                    <div class="sequence-actions">
                        <button id="add-step-btn" class="btn-add-step">+ Add Step</button>
                        <button class="btn-fullsize-step" onclick="noteApp.toggleFullsizeStep('${currentStep.id}')">⛶</button>
                        ${this.currentNote.sequenceSteps.length > 1 ? `<button class="btn-remove-step" onclick="noteApp.removeSequenceStep('${currentStep.id}')">×</button>` : ''}
                    </div>
                </div>
                <div class="drop-zone" id="drop-zone">
                    <div class="drop-message" id="drop-message" style="${(currentStep.images && currentStep.images.length > 0) ? 'display: none;' : ''}">
                        <h2>📷 Drop images here</h2>
                        <p>Drag and drop images for step ${this.currentStepIndex + 1}</p>
                    </div>
                    
                    <div class="images-container" id="images-container">
                        ${(currentStep.images || []).map(img => `
                            <div class="image-item">
                                <img src="${img.data}" alt="${img.name}" title="${img.name}">
                                <button class="image-remove" onclick="noteApp.removeSequenceImage('${currentStep.id}', '${img.id}')">×</button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <textarea 
                        id="note-text" 
                        placeholder="Enter prompt for step ${this.currentStepIndex + 1}..."
                        class="note-textarea"
                        oninput="noteApp.updateSequenceStep('${currentStep.id}', this.value)"
                    >${currentStep.prompt || ''}</textarea>
                </div>
            </div>
        `;
        
        // Set up drag and drop for the current step
        this.setupSequenceDragDrop();
        
        // Add event listener for add step button
        document.getElementById('add-step-btn').addEventListener('click', () => {
            this.addSequenceStep();
        });
        
        // Add event listeners for navigation buttons
        this.setupSequenceNavigation();
    }

    setupSequenceNavigation() {
        const navLeft = document.getElementById('nav-left');
        const navRight = document.getElementById('nav-right');
        
        if (navLeft && navRight) {
            navLeft.addEventListener('click', () => {
                this.navigateToStep(this.currentStepIndex - 1);
            });
            
            navRight.addEventListener('click', () => {
                this.navigateToStep(this.currentStepIndex + 1);
            });
            
            // Add keyboard navigation
            this.setupSequenceKeyboardNavigation();
        }
    }

    setupSequenceKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle if sequential editor is active and not in fullsize mode
            if (!this.currentNote || !this.currentNote.isSequential) return;
            const dropZone = document.getElementById('drop-zone');
            if (dropZone && dropZone.classList.contains('fullsize')) return;
            
            // Handle arrow keys when not focused on a textarea
            if (e.target.tagName !== 'TEXTAREA') {
                if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.navigateToStep(this.currentStepIndex - 1);
                } else if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.navigateToStep(this.currentStepIndex + 1);
                }
            }
        });
    }

    navigateToStep(stepIndex) {
        if (!this.currentNote || !this.currentNote.isSequential) return;
        
        if (stepIndex < 0 || stepIndex >= this.currentNote.sequenceSteps.length) return;
        
        this.currentStepIndex = stepIndex;
        this.renderSequentialEditor();
    }

    setupSequenceDragDrop() {
        const dropZone = document.getElementById('drop-zone');
        if (!dropZone) return;
        
        dropZone.ondrop = (event) => {
            event.preventDefault();
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                const currentStep = this.currentNote.sequenceSteps[this.currentStepIndex];
                this.handleSequenceImageDrop(event, currentStep.id);
            }
        };
        
        dropZone.ondragover = (event) => {
            event.preventDefault();
        };
        
        dropZone.ondragenter = (event) => {
            event.preventDefault();
        };
    }



    toggleFullsizeStep(stepId) {
        const dropZone = document.getElementById('drop-zone');
        if (!dropZone) return;
        
        const isFullsize = dropZone.classList.contains('fullsize');
        
        if (isFullsize) {
            // Exit fullsize mode
            dropZone.classList.remove('fullsize');
            const closeButton = dropZone.querySelector('.btn-close-fullsize');
            if (closeButton) {
                closeButton.remove();
            }
            
            // Re-enable body scroll
            document.body.style.overflow = '';
        } else {
            // Enter fullsize mode
            dropZone.classList.add('fullsize');
            
            // Add close button
            const closeButton = document.createElement('button');
            closeButton.className = 'btn-close-fullsize';
            closeButton.innerHTML = '×';
            closeButton.onclick = () => this.toggleFullsizeStep(stepId);
            dropZone.appendChild(closeButton);
            
            // Disable body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus on the textarea
            const textarea = document.getElementById('note-text');
            if (textarea) {
                setTimeout(() => {
                    textarea.focus();
                }, 100);
            }
        }
        
        // Handle ESC key to close fullsize mode
        this.handleFullsizeEscape(stepId);
    }

    handleFullsizeEscape(stepId) {
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                const dropZone = document.getElementById('drop-zone');
                if (dropZone && dropZone.classList.contains('fullsize')) {
                    this.toggleFullsizeStep(stepId);
                }
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
    }

    toggleNotePriority() {
        if (!this.currentNote) return;
        
        this.currentNote.isPriority = !this.currentNote.isPriority;
        this.currentNote.updatedAt = new Date().toISOString();
        
        this.saveNotes();
        this.updatePriorityButton();
        this.renderNotesList();
        
        const message = this.currentNote.isPriority ? 'Note marked as priority!' : 'Priority removed from note!';
        this.showPriorityNotification(message);
    }

    updatePriorityButton() {
        const button = document.getElementById('priority-toggle-btn');
        if (!this.currentNote) return;
        
        if (this.currentNote.isPriority) {
            button.textContent = '⭐ Priority';
            button.classList.add('active');
        } else {
            button.textContent = '☆ Priority';
            button.classList.remove('active');
        }
    }

    showPriorityNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffc107;
            color: #000;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    toggleSequentialMode() {
        if (!this.currentNote) return;
        
        this.currentNote.isSequential = !this.currentNote.isSequential;
        
        if (this.currentNote.isSequential) {
            // Convert standard note to sequential
            if (!this.currentNote.sequenceSteps || this.currentNote.sequenceSteps.length === 0) {
                // Get current text from textarea instead of stored property
                const currentText = document.getElementById('note-text')?.value || this.currentNote.text || '';
                
                // Update the stored text property to keep it in sync
                this.currentNote.text = currentText;
                
                this.currentNote.sequenceSteps = [{
                    id: 'step_1',
                    prompt: currentText,
                    images: this.currentNote.images || []
                }];
            }
            
            // Start at step 1 (index 0) to show the original content
            this.currentStepIndex = 0;
            
            // Automatically add step 2 but stay on step 1
            this.currentNote.updatedAt = new Date().toISOString();
            this.saveNotes();
            this.updateSequenceButton();
            this.loadNoteInEditor(this.currentNote);
            
            // Add step 2 after a short delay to ensure the sequential editor is rendered
            setTimeout(() => {
                this.addSequenceStepWithoutNavigation();
            }, 100);
        } else {
            // Convert sequential note to standard
            if (this.currentNote.sequenceSteps && this.currentNote.sequenceSteps.length > 0) {
                // Combine all prompts into one text
                const combinedText = this.currentNote.sequenceSteps
                    .map((step, index) => `Step ${index + 1}: ${step.prompt || ''}`)
                    .join('\n\n');
                
                this.currentNote.text = combinedText;
                
                // Combine all images
                const combinedImages = [];
                this.currentNote.sequenceSteps.forEach(step => {
                    if (step.images) {
                        combinedImages.push(...step.images);
                    }
                });
                this.currentNote.images = combinedImages;
            }
            
            this.currentNote.updatedAt = new Date().toISOString();
            this.saveNotes();
            this.updateSequenceButton();
            this.loadNoteInEditor(this.currentNote);
        }
        
        const message = this.currentNote.isSequential ? 'Sequential mode enabled!' : 'Sequential mode disabled!';
        this.showSequenceNotification(message);
    }

    updateSequenceButton() {
        const button = document.getElementById('sequence-toggle-btn');
        if (!this.currentNote) return;
        
        if (this.currentNote.isSequential) {
            button.textContent = '📝 Sequential';
            button.classList.add('active');
        } else {
            button.textContent = '📝 Sequential';
            button.classList.remove('active');
        }
    }

    addSequenceStep() {
        if (!this.currentNote || !this.currentNote.isSequential) return;
        
        const stepId = 'step_' + Date.now();
        const newStep = {
            id: stepId,
            prompt: '',
            images: []
        };
        
        this.currentNote.sequenceSteps.push(newStep);
        this.currentNote.updatedAt = new Date().toISOString();
        this.saveNotes();
        
        // Navigate to the new step
        this.currentStepIndex = this.currentNote.sequenceSteps.length - 1;
        this.renderSequentialEditor();
        
        // Focus on the textarea after rendering
        setTimeout(() => {
            const textarea = document.getElementById('note-text');
            if (textarea) {
                textarea.focus();
            }
        }, 100);
    }

    addSequenceStepWithoutNavigation() {
        if (!this.currentNote || !this.currentNote.isSequential) return;
        
        const stepId = 'step_' + Date.now();
        const newStep = {
            id: stepId,
            prompt: '',
            images: []
        };
        
        this.currentNote.sequenceSteps.push(newStep);
        this.currentNote.updatedAt = new Date().toISOString();
        this.saveNotes();
        
        // Re-render to update the step counter, but don't navigate
        this.renderSequentialEditor();
    }

    removeSequenceStep(stepId) {
        if (!this.currentNote || !this.currentNote.isSequential) return;
        
        // Check if step is in fullsize mode and exit it
        const stepElement = document.querySelector(`[data-step-id="${stepId}"]`);
        if (stepElement && stepElement.classList.contains('fullsize')) {
            this.toggleFullsizeStep(stepId);
        }
        
        // Find the index of the step being removed
        const stepIndex = this.currentNote.sequenceSteps.findIndex(step => step.id === stepId);
        
        this.currentNote.sequenceSteps = this.currentNote.sequenceSteps.filter(step => step.id !== stepId);
        
        // Adjust currentStepIndex if necessary
        if (stepIndex <= this.currentStepIndex && this.currentStepIndex > 0) {
            this.currentStepIndex--;
        }
        
        // Ensure currentStepIndex is within bounds
        if (this.currentStepIndex >= this.currentNote.sequenceSteps.length) {
            this.currentStepIndex = this.currentNote.sequenceSteps.length - 1;
        }
        
        this.currentNote.updatedAt = new Date().toISOString();
        this.saveNotes();
        this.renderSequentialEditor();
    }

    updateSequenceStep(stepId, prompt) {
        if (!this.currentNote || !this.currentNote.isSequential) return;
        
        const step = this.currentNote.sequenceSteps.find(s => s.id === stepId);
        if (step) {
            step.prompt = prompt;
            
            // Update note title based on first step
            if (stepId === this.currentNote.sequenceSteps[0].id) {
                this.currentNote.title = this.generateTitleFromText(prompt);
            }
            
            this.currentNote.updatedAt = new Date().toISOString();
            this.autoSaveSequence();
        }
    }

    autoSaveSequence() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.saveNotes();
            this.renderNotesList();
        }, 300);
    }

    handleSequenceImageDrop(event, stepId) {
        event.preventDefault();
        
        const files = Array.from(event.dataTransfer.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.addImageToSequenceStep(file, stepId);
            }
        });
    }

    addImageToSequenceStep(file, stepId) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: file.name,
                data: e.target.result,
                size: file.size,
                type: file.type,
                addedAt: new Date().toISOString()
            };

            const step = this.currentNote.sequenceSteps.find(s => s.id === stepId);
            if (step) {
                if (!step.images) step.images = [];
                step.images.push(imageData);
                
                this.currentNote.updatedAt = new Date().toISOString();
                this.saveNotes();
                this.renderSequentialEditor();
            }
        };
        
        reader.readAsDataURL(file);
    }

    removeSequenceImage(stepId, imageId) {
        const step = this.currentNote.sequenceSteps.find(s => s.id === stepId);
        if (step && step.images) {
            step.images = step.images.filter(img => img.id !== imageId);
            this.currentNote.updatedAt = new Date().toISOString();
            this.saveNotes();
            this.renderSequentialEditor();
        }
    }

    showSequenceNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #17a2b8;
            color: #fff;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    autoSave() {
        if (!this.currentNote) return;

        // Clear existing timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        // Auto-save after 300ms of no typing (faster response)
        this.autoSaveTimeout = setTimeout(() => {
            const text = document.getElementById('note-text').value || '';
            
            // Update note data
            this.currentNote.text = text;
            this.currentNote.title = this.generateTitleFromText(text);
            this.currentNote.updatedAt = new Date().toISOString();

            // Save to localStorage
            this.saveNotes();
            
            // Update the notes list to show new title
            this.renderNotesList();
        }, 300);
    }

    deleteCurrentNote() {
        if (!this.currentNote) return;

        if (confirm('Are you sure you want to delete this note?')) {
            // Delete the note from the notes object
            delete this.notes[this.currentNote.id];
            this.saveNotes();
            this.renderNotesList();
            this.currentNote = null;
            this.showEmptyState();
        }
    }

    selectNote(noteId) {
        const note = this.notes[noteId];
        if (note) {
            this.currentNote = note;
            // Reset step index when switching to a different note
            this.currentStepIndex = 0;
            this.showNoteEditor();
            this.loadNoteInEditor(note);
            this.setActiveNoteInList(noteId);
        }
    }

    setActiveNoteInList(noteId) {
        // Remove active class from all notes
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected note
        const activeItem = document.querySelector(`[data-note-id="${noteId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    renderNotesList() {
        const container = document.getElementById('notes-list');
        const filteredNotes = this.getNotesForCurrentCharacter();
        
        // Update sidebar header to show character context
        const sidebarHeader = document.querySelector('.sidebar-header h1');
        if (this.currentCharacter === 'all') {
            sidebarHeader.textContent = '📝 All Notes';
        } else {
            const character = this.characters[this.currentCharacter];
            const emoji = character ? character.emoji || '👤' : '👤';
            const name = character ? character.name : 'Unknown';
            sidebarHeader.textContent = `${emoji} ${name}`;
        }
        
        if (filteredNotes.length === 0) {
            if (this.currentCharacter === 'all') {
                container.innerHTML = '<div class="no-notes">No notes yet. Create your first note!</div>';
            } else {
                const character = this.characters[this.currentCharacter];
                const characterName = character ? character.name : 'this character';
                container.innerHTML = `<div class="no-notes">No notes for ${characterName} yet. Create their first note!</div>`;
            }
            return;
        }

        // Sort notes by priority first, then by update time (most recent first)
        const sortedNotes = filteredNotes.sort((a, b) => {
            // Priority notes first
            if (a.isPriority && !b.isPriority) return -1;
            if (!a.isPriority && b.isPriority) return 1;
            
            // Then by update time (most recent first)
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        container.innerHTML = sortedNotes.map(note => {
            const preview = note.text.length > 60 ? note.text.substring(0, 60) + '...' : note.text || 'No content';
            const date = new Date(note.updatedAt).toLocaleDateString();
            const imageCount = note.images ? note.images.length : 0;
            
            return `
                <div class="note-item ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''} ${note.isPriority ? 'priority' : ''}" 
                     data-note-id="${note.id}" 
                     draggable="true"
                     onclick="noteApp.selectNote('${note.id}')">
                    <div class="note-item-title">
                        ${note.isPriority ? '<span class="priority-indicator">⭐</span>' : ''}
                        ${note.title}
                    </div>
                    <div class="note-item-preview">${preview}</div>
                    <div class="note-item-meta">
                        <span class="note-item-date">${date}</span>
                        ${imageCount > 0 ? `<span class="note-item-images">📷 ${imageCount}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Add drag and drop listeners to notes
        this.setupNoteDragAndDrop();
    }

    showNoteEditor() {
        document.getElementById('note-editor').classList.remove('hidden');
        document.getElementById('empty-state').classList.add('hidden');
    }

    showEmptyState() {
        document.getElementById('note-editor').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('hidden');
    }

    showDropMessage() {
        document.getElementById('drop-message').classList.remove('hidden');
    }

    hideDropMessage() {
        document.getElementById('drop-message').classList.add('hidden');
    }

    async loadNotes() {
        try {
            let notes = {};
            
            if (window.electronAPI) {
                notes = await window.electronAPI.loadNotes();
            } else {
                // Fallback to localStorage for development
                const stored = localStorage.getItem('imageSequenceNotes');
                notes = stored ? JSON.parse(stored) : {};
            }
            
            // Handle migration from array to object format
            if (Array.isArray(notes)) {
                const migratedNotes = {};
                notes.forEach(note => {
                    // Assign old notes to "all" or create a default character
                    if (!note.characterId) {
                        note.characterId = 'legacy'; // Will be handled by migration
                    }
                    migratedNotes[note.id] = note;
                });
                return migratedNotes;
            }
            
            return notes;
        } catch (error) {
            console.error('Error loading notes:', error);
            return {};
        }
    }

    async saveNotes() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.saveNotes(this.notes);
            } else {
                // Fallback to localStorage for development
                localStorage.setItem('imageSequenceNotes', JSON.stringify(this.notes));
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            // Handle storage quota exceeded
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please delete some old notes or images.');
            }
        }
    }

    // Character Management Methods
    async loadCharacters() {
        try {
            if (window.electronAPI) {
                return await window.electronAPI.loadCharacters();
            } else {
                // Fallback to localStorage for development
                const stored = localStorage.getItem('imageSequenceCharacters');
                return stored ? JSON.parse(stored) : {};
            }
        } catch (error) {
            console.error('Error loading characters:', error);
            return {};
        }
    }

    async saveCharacters() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.saveCharacters(this.characters);
            } else {
                // Fallback to localStorage for development
                localStorage.setItem('imageSequenceCharacters', JSON.stringify(this.characters));
            }
        } catch (error) {
            console.error('Error saving characters:', error);
        }
    }

    renderCharacterTabs() {
        const tabsContainer = document.getElementById('character-tabs');
        
        // Clear existing tabs
        tabsContainer.innerHTML = '';

        // Add character tabs
        Object.keys(this.characters).forEach(characterId => {
            const character = this.characters[characterId];
            const tab = document.createElement('div');
            tab.className = 'character-tab';
            tab.dataset.character = characterId;
            
            const emoji = character.emoji || '👤';
            tab.innerHTML = `
                <span class="character-emoji">${emoji}</span>
                <span class="character-name">${character.name}</span>
                ${characterId !== 'all' ? `<span class="delete-character" data-character="${characterId}">×</span>` : ''}
            `;

            // Add click listener for character selection
            tab.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-character')) {
                    this.deleteCharacter(characterId);
                } else {
                    this.selectCharacter(characterId);
                }
            });

            tabsContainer.appendChild(tab);
        });

        // Update active tab
        this.updateActiveCharacterTab();
        
        // Re-setup drag and drop for character tabs
        this.setupCharacterTabDragAndDrop();
    }

    updateActiveCharacterTab() {
        // Remove active class from all tabs
        document.querySelectorAll('.character-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Add active class to current character tab
        const activeTab = document.querySelector(`[data-character="${this.currentCharacter}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    selectCharacter(characterId) {
        this.currentCharacter = characterId;
        this.updateActiveCharacterTab();
        this.renderNotesList();
        
        // Show empty state if no notes for this character
        const filteredNotes = this.getNotesForCurrentCharacter();
        if (filteredNotes.length === 0) {
            this.showEmptyState();
        }
    }

    getNotesForCurrentCharacter() {
        if (this.currentCharacter === 'all') {
            // Show all notes regardless of character
            return Object.values(this.notes);
        }
        
        return Object.values(this.notes).filter(note => 
            note.characterId === this.currentCharacter
        );
    }

    openCharacterModal() {
        document.getElementById('character-modal').style.display = 'flex';
        document.getElementById('character-name-input').value = '';
        document.getElementById('character-emoji-input').value = '';
        document.getElementById('character-creation-message').style.display = 'none';
        document.getElementById('character-name-input').focus();
    }

    closeCharacterModal() {
        document.getElementById('character-modal').style.display = 'none';
    }

    createCharacter() {
        const nameInput = document.getElementById('character-name-input');
        const emojiInput = document.getElementById('character-emoji-input');
        const messageEl = document.getElementById('character-creation-message');
        
        const name = nameInput.value.trim();
        const emoji = emojiInput.value.trim() || '👤';

        if (!name) {
            this.showCharacterMessage(messageEl, 'Please enter a character name', 'error');
            return;
        }

        if (name.length > 30) {
            this.showCharacterMessage(messageEl, 'Character name too long (max 30 characters)', 'error');
            return;
        }

        // Check if character name already exists
        const existingCharacter = Object.values(this.characters).find(char => 
            char.name.toLowerCase() === name.toLowerCase()
        );

        if (existingCharacter) {
            this.showCharacterMessage(messageEl, 'Character name already exists', 'error');
            return;
        }

        // Create new character
        const characterId = 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.characters[characterId] = {
            id: characterId,
            name: name,
            emoji: emoji,
            createdAt: Date.now()
        };

        this.saveCharacters();
        this.renderCharacterTabs();
        this.selectCharacter(characterId);
        
        this.showCharacterMessage(messageEl, 'Character created successfully!', 'success');
        
        setTimeout(() => {
            this.closeCharacterModal();
        }, 1000);
    }

    deleteCharacter(characterId) {
        const character = this.characters[characterId];
        if (!character) return;

        // Prevent deleting the "All notes" character
        if (characterId === 'all') {
            alert('Cannot delete the "All notes" character.');
            return;
        }

        const confirmDelete = confirm(`Delete character "${character.name}" and all their notes?`);
        if (!confirmDelete) return;

        // Delete all notes for this character
        Object.keys(this.notes).forEach(noteId => {
            if (this.notes[noteId].characterId === characterId) {
                delete this.notes[noteId];
            }
        });

        // Delete the character
        delete this.characters[characterId];

        // If this was the active character, switch to "All notes"
        if (this.currentCharacter === characterId) {
            this.selectCharacter('all');
        }

        this.saveCharacters();
        this.saveNotes();
        this.renderCharacterTabs();
        this.renderNotesList();
    }

    showCharacterMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    const authManager = new AuthManager();
    // Auth manager will handle initialization automatically
}); 