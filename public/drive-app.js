class BitcoinDrive {
    constructor() {
        // Use relative URL for production, localhost for development
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:4003/api' 
            : '/api';
        this.authToken = null;
        this.currentUser = null;
        this.googleToken = null;
        this.isGoogleUser = false;
        this.files = [];
        this.selectedFiles = [];
        this.currentView = 'documents';  // Default to documents view
        this.viewType = 'grid';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTaskbarMenus();
        this.setupDocumentEditor();
        this.checkAuth();
        this.loadStorageMethods();
        // Switch to documents view by default
        setTimeout(() => this.switchView('documents'), 100);
    }

    setupTaskbarMenus() {
        // Menu state management
        let currentOpenMenu = null;
        
        const toggleMenu = (menuId) => {
            const menu = document.getElementById(menuId);
            const allMenus = ['bitcoinMenu', 'driveMenu', 'developerMenu'];
            
            allMenus.forEach(id => {
                if (id !== menuId) {
                    document.getElementById(id).style.display = 'none';
                }
            });
            
            if (menu.style.display === 'none') {
                menu.style.display = 'block';
                currentOpenMenu = menuId;
            } else {
                menu.style.display = 'none';
                currentOpenMenu = null;
            }
        };
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.bitcoin-menu-container') && 
                !e.target.closest('.drive-menu-container') && 
                !e.target.closest('.developer-menu-container')) {
                ['bitcoinMenu', 'driveMenu', 'developerMenu'].forEach(id => {
                    document.getElementById(id).style.display = 'none';
                });
                currentOpenMenu = null;
            }
        });
        
        // Bitcoin menu button
        document.getElementById('bitcoinMenuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu('bitcoinMenu');
        });
        
        // Drive menu button
        document.getElementById('driveMenuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu('driveMenu');
        });
        
        // Developer menu button
        document.getElementById('developerMenuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu('developerMenu');
        });
        
        // Bitcoin menu items
        document.querySelectorAll('#bitcoinMenu .menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                switch(action) {
                    case 'twitter':
                        window.open('https://x.com/BitcoinDrive', '_blank');
                        break;
                    case 'about':
                        alert('Bitcoin Drive v1.0\nDecentralized file storage on BSV blockchain\n\nPowered by Bitcoin SV\n\n© 2025');
                        break;
                    case 'restart':
                        window.location.reload();
                        break;
                }
                toggleMenu('bitcoinMenu');
            });
        });
        
        // Drive menu items
        document.querySelectorAll('#driveMenu .menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                switch(action) {
                    case 'upload':
                        this.showUploadModal();
                        break;
                    case 'new-folder':
                        alert('Folder creation coming soon!');
                        break;
                    case 'tokenize':
                        if (this.files.length > 0) {
                            alert('Select files and tokenize them as NFTs');
                        } else {
                            alert('Upload files first to tokenize them');
                        }
                        break;
                    case 'share':
                        alert('Share your drive with others - coming soon!');
                        break;
                    case 'baps-summary':
                        window.open('/baps_executive_summary.pdf', '_blank');
                        break;
                    case 'stats':
                        const totalFiles = this.files.length;
                        const totalSize = this.files.reduce((sum, f) => sum + f.size, 0);
                        const nftCount = this.files.filter(f => f.nft).length;
                        alert(`Storage Statistics:\n\nFiles: ${totalFiles}\nTotal Size: ${this.formatFileSize(totalSize)}\nNFTs Created: ${nftCount}`);
                        break;
                }
                toggleMenu('driveMenu');
            });
        });
        
        // Developer menu items
        document.querySelectorAll('#developerMenu .menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                switch(action) {
                    case 'baps-docs':
                        window.open('/bitcoin-drive', '_blank');
                        break;
                    case 'nft-spec':
                        window.open('/nft_file_format_spec.md', '_blank');
                        break;
                    case 'github':
                        window.open('https://github.com/b0ase/bitcoin-drive', '_blank');
                        break;
                    case 'handcash-docs':
                        window.open('https://docs.handcash.io', '_blank');
                        break;
                    case 'debug':
                        console.log('Debug info:', {
                            user: this.currentUser,
                            isAuthenticated: this.authToken !== null,
                            files: this.files,
                            currentView: this.currentView
                        });
                        alert('Debug info logged to console');
                        break;
                }
                toggleMenu('developerMenu');
            });
        });
    }

    setupEventListeners() {
        document.getElementById('connectBtn').addEventListener('click', () => this.showSignInModal());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfileModal());
        document.getElementById('signOutBtn').addEventListener('click', () => this.signOut());
        document.getElementById('signInGoogleBtn').addEventListener('click', () => this.signInWithGoogle());
        document.getElementById('signInHandCashBtn').addEventListener('click', () => this.connectHandCash());
        document.getElementById('connectHandCashBtn').addEventListener('click', () => this.connectHandCashFromProfile());
        document.getElementById('closeSignInModal').addEventListener('click', () => this.hideSignInModal());
        document.getElementById('closeProfileModal').addEventListener('click', () => this.hideProfileModal());
        document.getElementById('uploadBtn').addEventListener('click', () => this.showUploadModal());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('confirmUpload').addEventListener('click', () => this.uploadFiles());
        document.getElementById('cancelUpload').addEventListener('click', () => this.hideUploadModal());
        document.getElementById('closeUploadModal').addEventListener('click', () => this.hideUploadModal());
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchFiles(e.target.value));
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(item.dataset.view);
            });
        });
        
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                this.switchViewType(toggle.dataset.viewType);
            });
        });
        
        this.setupDragAndDrop();
        
        document.getElementById('closeFileDetails').addEventListener('click', () => this.hideFileDetails());
        document.getElementById('downloadFile').addEventListener('click', () => this.downloadCurrentFile());
        document.getElementById('tokenizeFile').addEventListener('click', () => this.tokenizeCurrentFile());
        document.getElementById('deleteFile').addEventListener('click', () => this.deleteCurrentFile());
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            document.body.addEventListener(eventName, () => {
                dropZone.classList.add('active', 'drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, () => {
                dropZone.classList.remove('active', 'drag-over');
            });
        });
        
        document.body.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleDroppedFiles(files);
            }
        });
        
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
    }

    showSignInModal() {
        document.getElementById('signInModal').style.display = 'block';
    }
    
    hideSignInModal() {
        document.getElementById('signInModal').style.display = 'none';
    }
    
    showProfileModal() {
        document.getElementById('profileModal').style.display = 'block';
    }
    
    hideProfileModal() {
        document.getElementById('profileModal').style.display = 'none';
    }
    
    signInWithGoogle() {
        window.location.href = `${this.apiUrl}/auth/google`;
    }
    
    async signOut() {
        try {
            // Call logout endpoint if using Google auth
            if (this.googleToken) {
                await fetch(`${this.apiUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.googleToken}`
                    }
                });
            }
            
            // Clear all stored tokens and data
            localStorage.removeItem('googleToken');
            localStorage.removeItem('authToken');
            this.googleToken = null;
            this.authToken = null;
            this.currentUser = null;
            this.isGoogleUser = false;
            
            // Reset UI
            document.getElementById('connectBtn').style.display = 'block';
            document.getElementById('userMenu').style.display = 'none';
            
            // Hide modals
            this.hideProfileModal();
            this.hideSignInModal();
            
            // Clear files
            this.files = [];
            this.displayFiles();
            
            // Show toast
            this.showToast('Signed out successfully', 'success');
            
            // Redirect to landing or refresh
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Sign out error:', error);
            this.showToast('Error signing out', 'error');
        }
    }
    
    async connectHandCashFromProfile() {
        if (!this.googleToken) {
            this.showToast('Please sign in with Google first', 'error');
            return;
        }
        await this.connectHandCash();
    }
    
    async connectHandCash() {
        const isDemoMode = confirm('Use demo mode? (Click Cancel to connect with real HandCash)');
        
        if (isDemoMode) {
            this.authToken = 'demo-token';
            localStorage.setItem('authToken', this.authToken);
            await this.fetchUserProfile();
            this.showToast('Connected in demo mode', 'success');
        } else {
            const appId = prompt('Enter your HandCash App ID:') || 'demo-app-id';
            const redirectUrl = window.location.origin + '/drive.html';
            const authUrl = `https://app.handcash.io/#/authorizeApp?appId=${appId}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
            window.location.href = authUrl;
        }
    }

    async checkAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        const googleToken = urlParams.get('token');
        const authType = urlParams.get('auth');
        const handcashToken = urlParams.get('authToken');
        
        // Handle Google OAuth callback
        if (googleToken && authType === 'google') {
            this.googleToken = googleToken;
            localStorage.setItem('googleToken', googleToken);
            this.isGoogleUser = true;
            window.history.replaceState({}, document.title, window.location.pathname);
            await this.loadGoogleProfile();
        } 
        // Handle HandCash callback
        else if (handcashToken) {
            this.authToken = handcashToken;
            localStorage.setItem('authToken', handcashToken);
            window.history.replaceState({}, document.title, window.location.pathname);
            await this.fetchUserProfile();
        }
        // Check for stored tokens
        else {
            const storedGoogleToken = localStorage.getItem('googleToken');
            const storedHandCashToken = localStorage.getItem('authToken');
            
            if (storedGoogleToken) {
                this.googleToken = storedGoogleToken;
                this.isGoogleUser = true;
                await this.loadGoogleProfile();
            } else if (storedHandCashToken) {
                this.authToken = storedHandCashToken;
                await this.fetchUserProfile();
            }
        }
        
        if (this.authToken || this.googleToken) {
            await this.loadFiles();
        }
    }
    
    async loadGoogleProfile() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.googleToken}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this.updateUserUI(user);
                
                // Update profile modal
                document.getElementById('googleConnected').style.display = 'block';
                document.getElementById('googleNotConnected').style.display = 'none';
                document.getElementById('googleAvatar').src = user.picture || '';
                document.getElementById('googleName').textContent = user.name;
                document.getElementById('googleEmail').textContent = user.email;
                
                if (user.hasHandCash) {
                    document.getElementById('handcashConnected').style.display = 'block';
                    document.getElementById('handcashNotConnected').style.display = 'none';
                    document.getElementById('handcashHandle').textContent = user.handcashHandle;
                }
            } else {
                localStorage.removeItem('googleToken');
                this.googleToken = null;
            }
        } catch (error) {
            console.error('Failed to load Google profile:', error);
        }
    }
    
    updateUserUI(user) {
        const connectBtn = document.getElementById('connectBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (user) {
            connectBtn.style.display = 'none';
            userMenu.style.display = 'block';
            document.getElementById('userAvatar').src = user.picture || '';
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
        } else {
            connectBtn.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    async fetchUserProfile() {
        try {
            const response = await fetch(`${this.apiUrl}/handcash-profile`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const profile = data.publicProfile || data.user || data;
                
                // Convert HandCash profile to standard user format
                this.currentUser = {
                    name: profile.handle || profile.displayName || 'HandCash User',
                    email: `${profile.handle || 'user'}@handcash`,
                    picture: profile.avatarUrl || profile.photoURL || '',
                    hasHandCash: true,
                    hasGoogle: false,
                    handcashHandle: profile.handle
                };
                
                // Use the same updateUserUI function with user parameter
                this.updateUserUI(this.currentUser);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    }


    async loadStorageMethods() {
        try {
            const response = await fetch(`${this.apiUrl}/storage-methods`);
            if (response.ok) {
                const data = await response.json();
                this.storageMethods = data.methods;
            }
        } catch (error) {
            console.error('Failed to load storage methods:', error);
        }
    }

    showUploadModal() {
        if (!this.authToken && !this.googleToken) {
            this.showToast('Please sign in first', 'error');
            return;
        }
        
        document.getElementById('uploadModal').classList.add('active');
        document.getElementById('fileInput').click();
    }

    hideUploadModal() {
        document.getElementById('uploadModal').classList.remove('active');
        document.getElementById('uploadPreview').innerHTML = '';
        this.selectedFiles = [];
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.handleDroppedFiles(files);
    }

    handleDroppedFiles(fileList) {
        if (!this.authToken) {
            this.showToast('Please connect your HandCash wallet first', 'error');
            return;
        }
        
        this.selectedFiles = Array.from(fileList);
        this.showUploadPreview();
        document.getElementById('uploadModal').classList.add('active');
    }

    showUploadPreview() {
        const preview = document.getElementById('uploadPreview');
        preview.innerHTML = '';
        
        let totalSize = 0;
        
        this.selectedFiles.forEach(file => {
            totalSize += file.size;
            
            const fileItem = document.createElement('div');
            fileItem.className = 'upload-file-item';
            fileItem.innerHTML = `
                <div class="upload-file-icon">${this.getFileIcon(file.type)}</div>
                <div class="upload-file-info">
                    <div class="upload-file-name">${file.name}</div>
                    <div class="upload-file-size">${this.formatFileSize(file.size)}</div>
                </div>
            `;
            preview.appendChild(fileItem);
        });
        
        this.updateStorageCosts(totalSize);
    }

    updateStorageCosts(totalSize) {
        const fullCost = (totalSize * 0.000001).toFixed(6);
        const smartCost = (totalSize * 0.0000005).toFixed(6);
        const nftCost = Math.max(0.001, totalSize * 0.000002).toFixed(6);
        
        document.getElementById('fullStorageCost').textContent = `~$${fullCost}`;
        document.getElementById('smartStorageCost').textContent = `~$${smartCost}`;
        document.getElementById('nftStorageCost').textContent = `~$${nftCost}`;
    }

    async uploadFiles() {
        if (this.selectedFiles.length === 0) return;
        
        const storageMethod = document.querySelector('input[name="storageMethod"]:checked').value;
        const encrypt = document.getElementById('encryptFiles').checked;
        
        for (const file of this.selectedFiles) {
            try {
                // Read file as base64 for BSV upload
                const reader = new FileReader();
                const fileData = await new Promise((resolve, reject) => {
                    reader.onload = () => {
                        const base64 = reader.result.split(',')[1];
                        resolve({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: base64
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                
                // Use BSV upload endpoint
                const response = await fetch(`${this.apiUrl}/bsv/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        file: fileData,
                        options: {
                            storageMethod: storageMethod,
                            encrypt: encrypt,
                            createNFT: false,
                            publishType: 'public'
                        }
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const txUrl = data.isLocal ? 
                        'Local storage (BSV upload pending)' : 
                        `https://whatsonchain.com/tx/${data.txId}`;
                    this.showToast(`✅ Uploaded ${file.name} to BSV! TX: ${data.txId.substring(0, 8)}...`, 'success');
                    console.log('BSV Upload successful:', data);
                } else {
                    const error = await response.json();
                    this.showToast(`Failed to upload ${file.name}: ${error.error}`, 'error');
                }
            } catch (error) {
                console.error('Upload error:', error);
                this.showToast(`Error uploading ${file.name}: ${error.message}`, 'error');
            }
        }
        
        this.hideUploadModal();
        await this.loadFiles();
    }

    async loadFiles() {
        if (!this.authToken) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/files`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.files = data.files || [];
                this.displayFiles();
                this.updateStorageInfo();
            }
        } catch (error) {
            console.error('Failed to load files:', error);
        }
    }

    displayFiles() {
        const filesGrid = document.getElementById('filesGrid');
        const filesList = document.getElementById('filesList');
        const emptyState = document.getElementById('emptyState');
        
        filesGrid.innerHTML = '';
        filesList.innerHTML = '';
        
        const filteredFiles = this.filterFilesByView();
        
        if (filteredFiles.length === 0) {
            emptyState.classList.add('active');
            return;
        } else {
            emptyState.classList.remove('active');
        }
        
        filteredFiles.forEach(file => {
            if (this.viewType === 'grid') {
                filesGrid.appendChild(this.createFileCard(file));
            } else {
                filesList.appendChild(this.createFileRow(file));
            }
        });
    }

    filterFilesByView() {
        switch (this.currentView) {
            case 'recent':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return this.files.filter(f => new Date(f.uploadedAt) > oneWeekAgo);
            case 'nfts':
                return this.files.filter(f => f.nft);
            case 'shared':
                return this.files.filter(f => f.shared);
            default:
                return this.files;
        }
    }

    createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        
        const isImage = file.mimeType && file.mimeType.startsWith('image/');
        
        card.innerHTML = `
            ${file.nft ? '<div class="file-nft-badge">NFT</div>' : ''}
            ${isImage ? 
                `<img class="file-thumbnail" src="${this.apiUrl}/files/${file.id}/download" alt="${file.filename}">` :
                `<div class="file-icon">${this.getFileIcon(file.mimeType)}</div>`
            }
            <div class="file-name">${file.filename}</div>
            <div class="file-meta">${this.formatFileSize(file.size)} • ${this.formatDate(file.uploadedAt)}</div>
        `;
        
        card.addEventListener('click', () => this.showFileDetails(file));
        return card;
    }

    createFileRow(file) {
        const row = document.createElement('div');
        row.className = 'file-row';
        
        row.innerHTML = `
            <div class="file-row-icon">${this.getFileIcon(file.mimeType)}</div>
            <div class="file-row-details">
                <div class="file-row-name">${file.filename}</div>
                <div class="file-row-meta">${this.formatFileSize(file.size)} • ${this.formatDate(file.uploadedAt)}</div>
            </div>
            ${file.nft ? '<div class="file-nft-badge">NFT</div>' : ''}
        `;
        
        row.addEventListener('click', () => this.showFileDetails(file));
        return row;
    }

    showFileDetails(file) {
        this.currentFile = file;
        const modal = document.getElementById('fileDetailsModal');
        const preview = document.getElementById('filePreview');
        const info = document.getElementById('fileInfo');
        
        document.getElementById('fileDetailsName').textContent = file.filename;
        
        if (file.mimeType && file.mimeType.startsWith('image/')) {
            preview.innerHTML = `<img src="${this.apiUrl}/files/${file.id}/download" alt="${file.filename}">`;
        } else {
            preview.innerHTML = `<div style="padding: 60px; font-size: 64px; color: var(--primary-green);">${this.getFileIcon(file.mimeType)}</div>`;
        }
        
        info.innerHTML = `
            <div class="info-row">
                <span class="info-label">File Size</span>
                <span class="info-value">${this.formatFileSize(file.size)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type</span>
                <span class="info-value">${file.mimeType || 'Unknown'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Uploaded</span>
                <span class="info-value">${this.formatDate(file.uploadedAt)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Storage Method</span>
                <span class="info-value">${this.getStorageMethodName(file.storageMethod)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Transaction ID</span>
                <span class="info-value" style="font-family: monospace; font-size: 12px;">${file.txId || 'Pending'}</span>
            </div>
            ${file.nft ? `
                <div class="info-row">
                    <span class="info-label">NFT Token ID</span>
                    <span class="info-value" style="font-family: monospace; font-size: 12px;">${file.nft.tokenId}</span>
                </div>
            ` : ''}
        `;
        
        document.getElementById('tokenizeFile').style.display = file.nft ? 'none' : 'inline-block';
        
        modal.classList.add('active');
    }

    hideFileDetails() {
        document.getElementById('fileDetailsModal').classList.remove('active');
    }

    async downloadCurrentFile() {
        if (!this.currentFile) return;
        
        const link = document.createElement('a');
        link.href = `${this.apiUrl}/files/${this.currentFile.id}/download`;
        link.download = this.currentFile.filename;
        link.click();
        
        this.showToast('Download started', 'success');
    }

    async tokenizeCurrentFile() {
        if (!this.currentFile || this.currentFile.nft) return;
        
        const royalty = prompt('Enter royalty percentage (0-25):', '10');
        const maxSupply = prompt('Enter maximum supply:', '1');
        
        try {
            const response = await fetch(`${this.apiUrl}/files/${this.currentFile.id}/tokenize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    royaltyPercentage: parseInt(royalty) || 10,
                    maxSupply: parseInt(maxSupply) || 1
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showToast('File successfully tokenized as NFT!', 'success');
                this.hideFileDetails();
                await this.loadFiles();
            } else {
                this.showToast('Failed to tokenize file', 'error');
            }
        } catch (error) {
            console.error('Tokenization error:', error);
            this.showToast('Error tokenizing file', 'error');
        }
    }

    async deleteCurrentFile() {
        if (!this.currentFile) return;
        
        if (!confirm(`Are you sure you want to delete ${this.currentFile.filename}?`)) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/files/${this.currentFile.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (response.ok) {
                this.showToast('File deleted successfully', 'success');
                this.hideFileDetails();
                await this.loadFiles();
            } else {
                this.showToast('Failed to delete file', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Error deleting file', 'error');
        }
    }

    updateStorageInfo() {
        const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
        const storageBar = document.getElementById('storageBar');
        const storageText = document.getElementById('storageText');
        
        storageBar.style.width = Math.min((totalSize / (1024 * 1024 * 1024)) * 100, 100) + '%';
        storageText.textContent = `${this.formatFileSize(totalSize)} of ∞`;
    }

    switchView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
        
        const titles = {
            'all': 'All Files',
            'documents': 'Documents',
            'recent': 'Recent Files',
            'nfts': 'NFT Collection',
            'shared': 'Shared Files'
        };
        
        document.getElementById('viewTitle').textContent = titles[view];
        
        // Show/hide appropriate views
        const filesGrid = document.getElementById('filesGrid');
        const filesList = document.getElementById('filesList');
        const documentEditor = document.getElementById('documentEditor');
        const emptyState = document.getElementById('emptyState');
        const dropZone = document.querySelector('.drop-zone-wrapper');
        
        if (view === 'documents') {
            // Show document editor
            filesGrid.style.display = 'none';
            filesList.style.display = 'none';
            documentEditor.style.display = 'flex';
            emptyState.style.display = 'none';
            if (dropZone) dropZone.style.display = 'none';
        } else {
            // Show files view
            documentEditor.style.display = 'none';
            if (dropZone) dropZone.style.display = 'block';
            this.displayFiles();
        }
    }

    switchViewType(type) {
        this.viewType = type;
        
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.classList.toggle('active', toggle.dataset.viewType === type);
        });
        
        document.getElementById('filesGrid').style.display = type === 'grid' ? 'grid' : 'none';
        document.getElementById('filesList').style.display = type === 'list' ? 'block' : 'none';
        
        this.displayFiles();
    }

    searchFiles(query) {
        if (!query) {
            this.displayFiles();
            return;
        }
        
        const filtered = this.files.filter(file => 
            file.filename.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displayFilteredFiles(filtered);
    }

    displayFilteredFiles(files) {
        const filesGrid = document.getElementById('filesGrid');
        const filesList = document.getElementById('filesList');
        
        filesGrid.innerHTML = '';
        filesList.innerHTML = '';
        
        files.forEach(file => {
            if (this.viewType === 'grid') {
                filesGrid.appendChild(this.createFileCard(file));
            } else {
                filesList.appendChild(this.createFileRow(file));
            }
        });
    }

    getFileIcon(mimeType) {
        if (!mimeType) return '📄';
        
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📑';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
        if (mimeType.includes('text') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
        if (mimeType.includes('presentation')) return '📈';
        
        return '📄';
    }

    getStorageMethodName(method) {
        const names = {
            'op_return': 'Quick Save',
            'op_pushdata4': 'Full Storage',
            'multisig_p2sh': 'Smart Storage',
            'nft': 'NFT Mode'
        };
        return names[method] || method;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
        if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago';
        
        return date.toLocaleDateString();
    }
    
    setupDocumentEditor() {
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const underlineBtn = document.getElementById('underlineBtn');
        const newDocBtn = document.getElementById('newDocBtn');
        const saveDocBtn = document.getElementById('saveDocBtn');
        const editorContent = document.getElementById('editorContent');
        
        if (boldBtn) {
            boldBtn.addEventListener('click', () => {
                document.execCommand('bold', false, null);
            });
        }
        
        if (italicBtn) {
            italicBtn.addEventListener('click', () => {
                document.execCommand('italic', false, null);
            });
        }
        
        if (underlineBtn) {
            underlineBtn.addEventListener('click', () => {
                document.execCommand('underline', false, null);
            });
        }
        
        if (newDocBtn) {
            newDocBtn.addEventListener('click', () => {
                if (confirm('Create a new document? Any unsaved changes will be lost.')) {
                    document.getElementById('docTitle').value = '';
                    document.getElementById('editorContent').innerHTML = '';
                    this.updateWordCount();
                }
            });
        }
        
        if (saveDocBtn) {
            saveDocBtn.addEventListener('click', () => this.saveDocument());
        }
        
        if (editorContent) {
            editorContent.addEventListener('input', () => this.updateWordCount());
        }
    }
    
    updateWordCount() {
        const content = document.getElementById('editorContent').innerText || '';
        const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = content.length;
        
        document.getElementById('wordCount').textContent = `${words} words`;
        document.getElementById('charCount').textContent = `${chars} characters`;
    }
    
    async saveDocument() {
        const title = document.getElementById('docTitle').value || 'Untitled Document';
        const content = document.getElementById('editorContent').innerHTML;
        
        if (!content.trim()) {
            this.showToast('Document is empty', 'error');
            return;
        }
        
        if (!this.authToken) {
            this.showToast('Please connect your HandCash wallet first', 'error');
            return;
        }
        
        document.getElementById('saveStatus').textContent = 'Saving...';
        
        try {
            // Create HTML document
            const htmlDoc = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${content}
</body>
</html>`;
            
            // Convert to base64
            const base64 = btoa(unescape(encodeURIComponent(htmlDoc)));
            
            // Upload to BSV
            const response = await fetch(`${this.apiUrl}/bsv/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file: {
                        name: `${title}.html`,
                        type: 'text/html',
                        size: htmlDoc.length,
                        data: base64
                    },
                    options: {
                        storageMethod: 'b_protocol',
                        encrypt: true,
                        createNFT: false,
                        publishType: 'public'
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                document.getElementById('saveStatus').textContent = 'Saved to BSV!';
                this.showToast(`Document saved to BSV! TX: ${data.txId.substring(0, 8)}...`, 'success');
                setTimeout(() => {
                    document.getElementById('saveStatus').textContent = 'Ready';
                }, 3000);
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Save error:', error);
            document.getElementById('saveStatus').textContent = 'Save failed';
            this.showToast('Failed to save document', 'error');
            setTimeout(() => {
                document.getElementById('saveStatus').textContent = 'Ready';
            }, 3000);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="toast-message">${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BitcoinDrive();
});