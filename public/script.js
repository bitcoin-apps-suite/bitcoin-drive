// NoteApp class - Main application
class NoteApp {
    constructor() {
        this.notes = {};
        this.characters = {};
        this.currentNote = null;
        this.currentCharacter = 'all';
        this.currentStepIndex = 0;
        this.isFullscreen = false;
        this.draggedNote = null;
        this.autoSaveTimeout = null;
        this.init();
    }

    async init() {
        // Load data
        this.notes = await this.loadNotes();
        this.characters = await this.loadCharacters();
        
        // Log loaded data for debugging
        console.log('Loaded notes:', Object.keys(this.notes || {}).length, 'notes');
        console.log('Loaded characters:', Object.keys(this.characters || {}).length, 'characters');

        // Try to migrate from Electron storage if in dev mode and no localStorage data
        if (!window.electronAPI && (!this.notes || Object.keys(this.notes).length === 0)) {
            await this.tryMigrateFromElectronStorage();
        }

        // Migrate data structure if needed
        this.migrateDataStructure();

        // Migrate "General" character to "All notes" if needed
        this.migrateGeneralToAll();

        // Render UI
        this.renderCharacterTabs();
        this.renderNotesList();
        this.bindEvents();
        this.checkFullscreenOnLoad();

        // Set initial character
        this.setCurrentCharacter('all');

        // Only show empty state if there are truly no notes
        const hasNotes = this.notes && Object.keys(this.notes).length > 0;
        if (!hasNotes) {
            this.showEmptyState();
        } else {
            // Auto-select the first note if there are notes
            const firstNoteId = Object.keys(this.notes)[0];
            if (firstNoteId) {
                this.selectNote(firstNoteId);
            }
        }
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

        // Drag and drop for files
        this.setupDragAndDrop();
        
        // Drag and drop for character tabs
        this.setupCharacterTabDragAndDrop();

        // Handle paste for images
        document.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
        
        // Setup sidebar resize
        this.setupSidebarResize();
    }
    
    setupSidebarResize() {
        const sidebar = document.getElementById('sidebar');
        const resizeHandle = document.getElementById('sidebar-resize-handle');
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        
        // Get saved width from localStorage
        const savedWidth = localStorage.getItem('sidebarWidth');
        if (savedWidth) {
            sidebar.style.width = savedWidth + 'px';
        }
        
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = sidebar.offsetWidth;
            resizeHandle.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const newWidth = startWidth + (e.clientX - startX);
            
            // Respect min and max width
            if (newWidth >= 200 && newWidth <= 500) {
                sidebar.style.width = newWidth + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizeHandle.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Save the width to localStorage
                localStorage.setItem('sidebarWidth', sidebar.offsetWidth);
            }
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
            this.handleFiles(files, e);
        });
        
        // Also setup drag and drop directly on the note-text contenteditable div
        this.setupNoteTextDragAndDrop();
    }
    
    setupNoteTextDragAndDrop() {
        // This will be called when the note editor is rendered
        const noteTextDiv = document.getElementById('note-text');
        if (!noteTextDiv) return;
        
        // Remove any existing drag and drop handlers to prevent duplicates
        if (this.noteTextDropHandler) {
            noteTextDiv.removeEventListener('drop', this.noteTextDropHandler);
            noteTextDiv.removeEventListener('dragenter', this.noteTextDragEnterHandler);
            noteTextDiv.removeEventListener('dragover', this.noteTextDragOverHandler);
            noteTextDiv.removeEventListener('dragleave', this.noteTextDragLeaveHandler);
        }
        
        // Create handlers that we can reference later for removal
        this.noteTextDragEnterHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.types.includes('Files')) {
                noteTextDiv.classList.add('drag-over-text');
                e.dataTransfer.dropEffect = 'copy';
            }
        };
        
        this.noteTextDragOverHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.types.includes('Files')) {
                noteTextDiv.classList.add('drag-over-text');
                e.dataTransfer.dropEffect = 'copy';
            }
        };
        
        this.noteTextDragLeaveHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            noteTextDiv.classList.remove('drag-over-text');
        };
        
        // Handle drop directly on the note text
        this.noteTextDropHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                // Store cursor position before processing files
                const selection = window.getSelection();
                let range = null;
                
                // Try to get drop position
                if (document.caretRangeFromPoint) {
                    range = document.caretRangeFromPoint(e.clientX, e.clientY);
                } else if (selection.rangeCount > 0) {
                    range = selection.getRangeAt(0);
                } else {
                    // Create range at the end if no selection
                    range = document.createRange();
                    range.selectNodeContents(noteTextDiv);
                    range.collapse(false);
                }
                
                // Clear selection and set to drop point
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Process image files
                imageFiles.forEach(file => {
                    this.addImageToNote(file);
                });
                
                // Also handle any text that might be dragged with the images
                const text = e.dataTransfer.getData('text/plain');
                if (text && text.trim()) {
                    // Insert text after images
                    setTimeout(() => {
                        const textNode = document.createTextNode('\n' + text + '\n');
                        const currentSelection = window.getSelection();
                        if (currentSelection.rangeCount > 0) {
                            const currentRange = currentSelection.getRangeAt(0);
                            currentRange.insertNode(textNode);
                            currentRange.setStartAfter(textNode);
                            currentRange.collapse(true);
                            currentSelection.removeAllRanges();
                            currentSelection.addRange(currentRange);
                        }
                        this.currentNote.content = noteTextDiv.innerHTML;
                        this.autoSave();
                    }, 50);
                }
            }
        };
        
        // Add the event listeners
        noteTextDiv.addEventListener('dragenter', this.noteTextDragEnterHandler);
        noteTextDiv.addEventListener('dragover', this.noteTextDragOverHandler);
        noteTextDiv.addEventListener('dragleave', this.noteTextDragLeaveHandler);
        noteTextDiv.addEventListener('drop', this.noteTextDropHandler);
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

    handleFiles(files, dropEvent) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.addImageToNote(file, dropEvent);
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
            // Standard mode - insert text into content-editable div
            const noteTextDiv = document.getElementById('note-text');
            if (noteTextDiv) {
                // Insert text at cursor position or at the end
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                    range.setStartAfter(range.endContainer);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    // If no selection, append to end
                    const textNode = document.createTextNode(text);
                    noteTextDiv.appendChild(textNode);
                }
                
                // Update the note content and auto-save
                this.currentNote.content = noteTextDiv.innerHTML;
                this.autoSave();
                
                // Focus the div and move cursor to end
                noteTextDiv.focus();
                
                // Move cursor to end
                const range = document.createRange();
                range.selectNodeContents(noteTextDiv);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
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

    addImageToNote(file, dropEvent) {
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

            // All notes are sequential - add to current step
            if (this.currentNote.sequenceSteps && this.currentNote.sequenceSteps.length > 0) {
                const currentStep = this.currentNote.sequenceSteps[this.currentStepIndex || 0];
                if (currentStep) {
                    if (!currentStep.images) currentStep.images = [];
                    currentStep.images.push(imageData);
                    this.currentNote.updatedAt = new Date().toISOString();
                    this.autoSaveSequence();
                    this.renderSequentialEditor();
                }
            } else {
                // Standard mode - insert image inline
                const noteTextDiv = document.getElementById('note-text');
                if (noteTextDiv) {
                    // Create image wrapper with remove button
                    const imageWrapper = document.createElement('div');
                    imageWrapper.className = 'image-wrapper';
                    imageWrapper.innerHTML = `
                        <img src="${imageData.data}" alt="${imageData.name}" title="${imageData.name}" data-image-id="${imageData.id}">
                        <button class="image-remove" onclick="noteApp.removeInlineImage('${imageData.id}')" title="Remove image">×</button>
                    `;
                    
                    // Insert at cursor position or at the end
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.insertNode(imageWrapper);
                        range.setStartAfter(imageWrapper);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        noteTextDiv.appendChild(imageWrapper);
                    }
                    
                    // Update the note content
                    this.currentNote.content = noteTextDiv.innerHTML;
                    this.currentNote.updatedAt = new Date().toISOString();
                    this.hideDropMessage();
                    this.autoSave();
                }
            }
        };
        
        // Read as data URL to maintain full quality
        reader.readAsDataURL(file);
    }

    removeInlineImage(imageId) {
        const noteTextDiv = document.getElementById('note-text');
        if (!noteTextDiv) return;
        
        const imageWrapper = noteTextDiv.querySelector(`img[data-image-id="${imageId}"]`)?.closest('.image-wrapper');
        if (imageWrapper) {
            imageWrapper.remove();
            
            // Update the note content
            this.currentNote.content = noteTextDiv.innerHTML;
            this.currentNote.updatedAt = new Date().toISOString();
            
            // Show drop message if content is empty
            if (noteTextDiv.innerHTML.trim() === '') {
                this.showDropMessage();
            }
            
            this.autoSave();
        }
    }

    generateTitleFromText(text) {
        const words = text.trim().split(/\s+/);
        if (words.length === 0 || words[0] === '') {
            return 'Untitled Note';
        }
        
        // Take first 6 words to create title
        const title = words.slice(0, 6).join(' ');
        return title.length > 40 ? title.substring(0, 40) + '...' : title;
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
            content: '',
            characterId: characterId,
            isPriority: false,
            sequenceSteps: [{ id: 'step_1', prompt: '', images: [] }],
            isSequential: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes[note.id] = note;
        this.currentNote = note;
        
        // Clear any existing editor content first
        const existingNoteText = document.getElementById('note-text');
        if (existingNoteText) {
            existingNoteText.innerHTML = '';
        }
        
        this.saveNotes();
        this.renderNotesList();
        this.showNoteEditor();
        this.loadNoteInEditor(note);

        // Focus on content-editable div
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
                    
                    <div 
                        id="note-text" 
                        contenteditable="true"
                        class="note-editor-content"
                        data-placeholder="Paste or type your prompts and notes here..."
                    ></div>
                </div>
            `;
        }
        
        // Load the note content (HTML)
        const noteTextDiv = document.getElementById('note-text');
        noteTextDiv.innerHTML = this.currentNote.content || '';
        
        // Show/hide drop message based on content
        if (this.currentNote.content && this.currentNote.content.trim() !== '') {
            this.hideDropMessage();
        } else {
            this.showDropMessage();
        }
        
        // Set up auto-save on content changes
        noteTextDiv.addEventListener('input', () => {
            this.autoSave();
        });
        
        // Setup drag and drop for this specific note text div
        this.setupNoteTextDragAndDrop();
    }

    renderSequentialEditor() {
        const noteContent = document.getElementById('note-content');
        
        // Only initialize sequenceSteps if it doesn't exist at all - never reset if it exists but is empty
        if (!this.currentNote.sequenceSteps) {
            this.currentNote.sequenceSteps = [{ id: 'step_1', prompt: '', images: [] }];
        } else if (this.currentNote.sequenceSteps.length === 0) {
            // If array exists but is empty, add one step (but this shouldn't happen in normal usage)
            this.currentNote.sequenceSteps.push({ id: 'step_1', prompt: '', images: [] });
        }
        
        // Initialize currentStepIndex if not set or invalid
        if (this.currentStepIndex === null || this.currentStepIndex === undefined) {
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
                        ${currentStep.images ? currentStep.images.map(img => `
                            <div class="image-item">
                                <img src="${img.data}" alt="${img.name}" title="${img.name}">
                                <button class="image-remove" onclick="noteApp.removeSequenceImage('${currentStep.id}', '${img.id}')">×</button>
                            </div>
                        `).join('') : ''}
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
        
        console.log('🔄 NAVIGATE FROM STEP', this.currentStepIndex, 'TO STEP', stepIndex);
        console.log('🔄 BEFORE NAV - Step 0 images:', this.currentNote.sequenceSteps[0]?.images?.length || 0);
        
        // Save current step's data before navigating away
        this.saveCurrentSequenceStep();
        
        console.log('🔄 AFTER SAVE - Step 0 images:', this.currentNote.sequenceSteps[0]?.images?.length || 0);
        
        this.currentStepIndex = stepIndex;
        this.renderSequentialEditor();
        
        console.log('🔄 AFTER RENDER - Step 0 images:', this.currentNote.sequenceSteps[0]?.images?.length || 0);
    }
    
    saveCurrentSequenceStep() {
        if (!this.currentNote || !this.currentNote.isSequential) return;
        
        const textarea = document.getElementById('note-text');
        if (textarea && textarea.tagName === 'TEXTAREA') {
            const currentStep = this.currentNote.sequenceSteps[this.currentStepIndex];
            if (currentStep) {
                currentStep.prompt = textarea.value;
                this.currentNote.updatedAt = new Date().toISOString();
                this.saveNotes();
            }
        }
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
        
        // Also setup drag and drop on the textarea for sequential mode
        const textarea = document.getElementById('note-text');
        if (textarea && textarea.tagName === 'TEXTAREA') {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                textarea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });
            
            // Visual feedback
            ['dragenter', 'dragover'].forEach(eventName => {
                textarea.addEventListener(eventName, (e) => {
                    if (e.dataTransfer.types.includes('Files')) {
                        textarea.classList.add('drag-over-textarea');
                    }
                });
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                textarea.addEventListener(eventName, () => {
                    textarea.classList.remove('drag-over-textarea');
                });
            });
            
            // Handle drop on textarea
            textarea.addEventListener('drop', (e) => {
                const files = Array.from(e.dataTransfer.files);
                const imageFiles = files.filter(file => file.type.startsWith('image/'));
                
                if (imageFiles.length > 0) {
                    const currentStep = this.currentNote.sequenceSteps[this.currentStepIndex];
                    imageFiles.forEach(file => {
                        this.handleSequenceImageFile(file, currentStep.id);
                    });
                }
                
                // Handle text
                const text = e.dataTransfer.getData('text/plain');
                if (text && text.trim()) {
                    const cursorPos = textarea.selectionStart;
                    const textBefore = textarea.value.substring(0, cursorPos);
                    const textAfter = textarea.value.substring(cursorPos);
                    textarea.value = textBefore + text + textAfter;
                    textarea.setSelectionRange(cursorPos + text.length, cursorPos + text.length);
                    
                    // Trigger update
                    const currentStep = this.currentNote.sequenceSteps[this.currentStepIndex];
                    this.updateSequenceStep(currentStep.id, textarea.value);
                }
            });
        }
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
                // Get current content from content-editable div
                const noteTextDiv = document.getElementById('note-text');
                const currentContent = noteTextDiv ? noteTextDiv.innerHTML : this.currentNote.content || '';
                
                // Extract images from the HTML content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = currentContent;
                
                // Find all images and extract their data
                const images = [];
                const imgElements = tempDiv.querySelectorAll('img');
                imgElements.forEach((img, index) => {
                    if (img.src) {
                        // Create proper image object structure
                        images.push({
                            id: img.dataset.imageId || 'img_converted_' + Date.now() + '_' + index,
                            name: img.alt || 'Image',
                            data: img.src,
                            size: 0, // Size not available from HTML
                            type: 'image/jpeg', // Default type
                            addedAt: new Date().toISOString()
                        });
                    }
                });
                
                // Get text content (keeping line breaks)
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                
                // Update the stored content property to keep it in sync
                this.currentNote.content = currentContent;
                
                // Create the first step with both text and images preserved
                this.currentNote.sequenceSteps = [{
                    id: 'step_1',
                    prompt: textContent,
                    images: images
                }];
                
            }
            
            // Add step 2 immediately
            const step2Id = 'step_' + Date.now();
            this.currentNote.sequenceSteps.push({
                id: step2Id,
                prompt: '',
                images: []
            });
            
            // Start at step 2 (index 1) - the new blank step
            this.currentStepIndex = 1;
            
            this.currentNote.updatedAt = new Date().toISOString();
            this.saveNotes();
            this.updateSequenceButton();
            this.loadNoteInEditor(this.currentNote);
        } else {
            // Convert sequential note to standard
            if (this.currentNote.sequenceSteps && this.currentNote.sequenceSteps.length > 0) {
                // Build HTML content with both text and images from all steps
                let htmlContent = '';
                
                this.currentNote.sequenceSteps.forEach((step, index) => {
                    // Add step header if there are multiple steps
                    if (this.currentNote.sequenceSteps.length > 1) {
                        htmlContent += `<strong>Step ${index + 1}:</strong><br>`;
                    }
                    
                    // Add the prompt text
                    if (step.prompt) {
                        htmlContent += step.prompt.replace(/\n/g, '<br>') + '<br>';
                    }
                    
                    // Add all images from this step
                    if (step.images && step.images.length > 0) {
                        step.images.forEach(img => {
                            // Handle both image objects and plain strings
                            const imgSrc = typeof img === 'string' ? img : img.data;
                            const imgId = typeof img === 'object' && img.id ? img.id : 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                            htmlContent += `<div class="image-wrapper"><img src="${imgSrc}" alt="Image" data-image-id="${imgId}"></div>`;
                        });
                    }
                    
                    // Add spacing between steps
                    if (index < this.currentNote.sequenceSteps.length - 1) {
                        htmlContent += '<br><br>';
                    }
                });
                
                // Store the combined content
                this.currentNote.content = htmlContent;
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
        
        // Store current step index to preserve position
        const currentIndex = this.currentStepIndex;
        
        this.currentNote.sequenceSteps.push(newStep);
        this.currentNote.updatedAt = new Date().toISOString();
        this.saveNotes();
        
        // Restore the step index to stay on the same step
        this.currentStepIndex = currentIndex;
        
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
    
    handleSequenceImageFile(file, stepId) {
        if (file.type.startsWith('image/')) {
            this.addImageToSequenceStep(file, stepId);
        }
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
        // Don't save if there's no current note
        if (!this.currentNote) return;
        
        const noteTextDiv = document.getElementById('note-text');
        if (!noteTextDiv) return;
        
        // Don't save if the note editor is hidden (empty state)
        const noteEditor = document.getElementById('note-editor');
        if (noteEditor && noteEditor.classList.contains('hidden')) return;
        
        const content = noteTextDiv.innerHTML;
        
        // Update note data
        this.currentNote.content = content;
        this.currentNote.title = this.generateTitleFromContent(content);
        this.currentNote.updatedAt = new Date().toISOString();
        
        this.saveNotes();
        this.renderNotesList();
    }

    generateTitleFromContent(content) {
        // Extract plain text from HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        const words = text.trim().split(/\s+/);
        if (words.length === 0 || words[0] === '') {
            return 'Untitled Note';
        }
        
        // Take first 6 words to create title
        const title = words.slice(0, 6).join(' ');
        return title.length > 40 ? title.substring(0, 40) + '...' : title;
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
    
    deleteNoteFromSidebar(noteId) {
        const note = this.notes[noteId];
        if (!note) return;
        
        // Get note title for confirmation message
        const noteTitle = note.title || 'Untitled Note';
        
        if (confirm(`Are you sure you want to delete "${noteTitle}"?`)) {
            // Delete the note
            delete this.notes[noteId];
            this.saveNotes();
            this.renderNotesList();
            
            // If this was the current note, clear the editor
            if (this.currentNote && this.currentNote.id === noteId) {
                this.currentNote = null;
                this.showEmptyState();
            }
        }
        
        // Prevent event bubbling to avoid selecting the note
        event.stopPropagation();
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
        if (!this.notes) {
            container.innerHTML = '';
            return;
        }

        // Filter notes based on current character
        const filteredNotes = Object.values(this.notes).filter(note => {
            if (this.currentCharacter === 'all') {
                return true;
            }
            return note.characterId === this.currentCharacter;
        });

        // Sort notes: priority first, then by date
        const sortedNotes = filteredNotes.sort((a, b) => {
            // Priority notes first
            if (a.isPriority !== b.isPriority) {
                return a.isPriority ? -1 : 1;
            }
            // Then by date (newest first)
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        container.innerHTML = sortedNotes.map(note => {
            // Extract first image from note for thumbnail
            let thumbnailHtml = '';
            let firstImage = null;
            
            // ALWAYS use first step (step 0) as thumbnail - every note is sequential
            if (note.sequenceSteps && note.sequenceSteps.length > 0) {
                const firstStep = note.sequenceSteps[0];
                if (firstStep.images && firstStep.images.length > 0) {
                    firstImage = firstStep.images[0].data;
                }
            }
            
            if (firstImage) {
                thumbnailHtml = `<div class="note-thumbnail">
                    <img src="${firstImage}" alt="Note thumbnail">
                </div>`;
            }
            
            // Extract text for preview - handle both sequential and regular notes
            let textContent = '';
            if (note.isSequential && note.sequenceSteps && note.sequenceSteps.length > 0) {
                // For sequential notes, get text from all steps
                const allStepsText = note.sequenceSteps
                    .map((step, index) => step.prompt ? `Step ${index + 1}: ${step.prompt}` : '')
                    .filter(text => text)
                    .join(' ');
                textContent = allStepsText || 'No content';
            } else {
                // For regular notes, extract from HTML content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = note.content || '';
                textContent = tempDiv.textContent || tempDiv.innerText || '';
            }
            const preview = textContent.length > 60 ? textContent.substring(0, 60) + '...' : textContent || 'No content';
            
            const date = new Date(note.updatedAt).toLocaleDateString();
            
            // Count images - handle both sequential and regular notes
            let imageCount = 0;
            if (note.isSequential && note.sequenceSteps) {
                // Count images in all sequence steps
                note.sequenceSteps.forEach(step => {
                    if (step.images) {
                        imageCount += step.images.length;
                    }
                });
            } else {
                // Count images in HTML content
                imageCount = (note.content || '').split('<img').length - 1;
            }
            
            return `
                <div class="note-item ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''} ${note.isPriority ? 'priority' : ''} ${firstImage ? 'has-thumbnail' : ''}" 
                     data-note-id="${note.id}" 
                     draggable="true">
                    <div class="note-item-main" onclick="noteApp.selectNote('${note.id}')">
                        ${thumbnailHtml}
                        <div class="note-item-content">
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
                    </div>
                    <button class="note-item-delete" onclick="noteApp.deleteNoteFromSidebar('${note.id}')" title="Delete note">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
                        </svg>
                    </button>
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
        // Clear any editor content to prevent it from being saved to new notes
        const noteTextDiv = document.getElementById('note-text');
        if (noteTextDiv) {
            noteTextDiv.innerHTML = '';
        }
        
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
                        note.characterId = 'all';
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

    async tryMigrateFromElectronStorage() {
        try {
            // Try to load data from the Electron storage location
            const response = await fetch('/api/migrate-data', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Migration data received:', data);

                if (data.notes && Object.keys(data.notes).length > 0) {
                    this.notes = data.notes;
                    localStorage.setItem('imageSequenceNotes', JSON.stringify(this.notes));
                    console.log(`Migrated ${Object.keys(data.notes).length} notes from Electron storage`);
                }

                if (data.characters && Object.keys(data.characters).length > 0) {
                    this.characters = data.characters;
                    localStorage.setItem('imageSequenceCharacters', JSON.stringify(this.characters));
                    console.log(`Migrated ${Object.keys(data.characters).length} characters from Electron storage`);
                }

                // Show success message
                this.showMigrationSuccess();
            }
        } catch (error) {
            console.error('Failed to migrate data:', error);
        }
    }

    showMigrationSuccess() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <strong>✅ Data Migrated!</strong><br>
            Your notes have been loaded from the Electron app storage.
        `;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
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

    setCurrentCharacter(characterId) {
        this.currentCharacter = characterId;
        this.updateActiveCharacterTab();
        this.renderNotesList();
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

    migrateDataStructure() {
        // Migrate old data structure to new format
        const notes = this.notes;
        let needsSave = false;
        
        Object.values(notes).forEach(note => {
            // Migrate old text/images structure to new content structure
            if (note.text !== undefined && note.content === undefined) {
                note.content = note.text || '';
                delete note.text;
                needsSave = true;
            }
            
            // Remove old images array if it exists (images are now inline)
            if (note.images && Array.isArray(note.images)) {
                // Convert old separate images to inline content
                if (note.images.length > 0) {
                    const imageHtml = note.images.map(img => 
                        `<div class="image-wrapper">
                            <img src="${img.data}" alt="${img.name}" title="${img.name}" data-image-id="${img.id}">
                            <button class="image-remove" onclick="noteApp.removeInlineImage('${img.id}')" title="Remove image">×</button>
                        </div>`
                    ).join('');
                    
                    note.content = imageHtml + (note.content || '');
                }
                delete note.images;
                needsSave = true;
            }
        });
        
        if (needsSave) {
            this.saveNotes();
        }
    }

    checkFullscreenOnLoad() {
        // Check if any fullscreen elements need to be restored
        // This is a placeholder for future functionality
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.noteApp = new NoteApp();
}); 