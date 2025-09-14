class BitcoinDrive {
    constructor() {
        // Use relative URL for production, localhost for development
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:4003/api' 
            : '/api';
        this.authToken = null;
        this.currentUser = null;
        this.files = [];
        this.selectedFiles = [];
        this.currentView = 'all';
        this.viewType = 'grid';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTaskbarMenus();
        this.checkAuth();
        this.loadStorageMethods();
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
                    case 'docs':
                        document.getElementById('docsModal').style.display = 'flex';
                        toggleMenu('bitcoinMenu');
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
                    case 'bap-summary':
                        window.open('/bap_executive_summary.pdf', '_blank');
                        break;
                    case 'stats':
                        const totalFiles = this.files.length;
                        const totalSize = this.files.reduce((sum, f) => sum + f.size, 0);
                        const nftCount = this.files.filter(f => f.nft).length;
                        alert(`Storage Statistics:\n\nFiles: ${totalFiles}\nTotal Size: ${this.formatFileSize(totalSize)}\nNFTs Created: ${nftCount}`);
                        break;
                    case 'signout':
                        this.logout();
                        toggleMenu('driveMenu');
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
                    case 'bap-docs':
                        window.location.href = '/bap';
                        break;
                    case 'nft-spec':
                        document.getElementById('docsModal').style.display = 'flex';
                        toggleMenu('developerMenu');
                        // Scroll to NFT section
                        setTimeout(() => {
                            const nftSection = document.querySelector('#docsModal h3:first-of-type');
                            if (nftSection) nftSection.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                        break;
                    case 'github':
                        window.open('https://github.com/b0ase/bitcoin-drive', '_blank');
                        break;
                    case 'handcash-docs':
                        window.open('https://docs.handcash.dev', '_blank');
                        break;
                    case 'bsv-docs':
                        window.open('https://wiki.bitcoinsv.io', '_blank');
                        break;
                    case 'whatsonchain':
                        window.open('https://whatsonchain.com', '_blank');
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
        document.getElementById('connectBtn').addEventListener('click', () => this.connectHandCash());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('uploadBtn').addEventListener('click', () => this.showUploadModal());
        
        // User profile dropdown
        const userProfileBtn = document.getElementById('userProfileBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (userDropdown) {
                userDropdown.style.display = 'none';
            }
        });
        
        // Settings button (placeholder)
        const profileSettingsBtn = document.getElementById('profileSettingsBtn');
        if (profileSettingsBtn) {
            profileSettingsBtn.addEventListener('click', () => {
                this.showToast('Settings coming soon!', 'info');
                userDropdown.style.display = 'none';
            });
        }
        
        // Mobile sidebar toggle
        const sidebarToggle = document.getElementById('mobileSidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                sidebarOverlay.classList.toggle('active');
            });
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }
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

    async connectHandCash() {
        const isDemoMode = confirm('Use demo mode? (Click Cancel to connect with real HandCash)');
        
        if (isDemoMode) {
            this.authToken = 'demo-token';
            localStorage.setItem('authToken', this.authToken);
            await this.fetchUserProfile();
            this.showToast('Connected in demo mode', 'success');
        } else {
            // Use the configured HandCash App ID from .env
            const appId = '68c697fb5287127557e47739';
            const redirectUrl = window.location.origin + '/auth/handcash/callback';
            const authUrl = `https://app.handcash.io/#/authorizeApp?appId=${appId}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
            window.location.href = authUrl;
        }
    }

    logout() {
        // Clear auth token and user data
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        
        // Reset UI
        document.getElementById('connectBtn').style.display = 'block';
        document.getElementById('userProfile').style.display = 'none';
        document.getElementById('userHandle').textContent = '';
        
        // Clear files
        this.files = [];
        this.renderFiles();
        
        this.showToast('Logged out successfully', 'success');
    }

    async checkAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        const authToken = urlParams.get('authToken');
        
        if (authToken) {
            this.authToken = authToken;
            localStorage.setItem('authToken', authToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            this.authToken = localStorage.getItem('authToken');
        }
        
        if (this.authToken) {
            await this.fetchUserProfile();
            await this.loadFiles();
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
                this.currentUser = data.publicProfile || data;
                this.updateUserUI();
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    }

    updateUserUI() {
        const connectBtn = document.getElementById('connectBtn');
        const userProfile = document.getElementById('userProfile');
        const userHandle = document.getElementById('userHandle');
        
        if (this.currentUser) {
            // Hide connect button, show user profile with logout
            connectBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            userHandle.textContent = `$${this.currentUser.handle || 'user'}`;
        } else {
            // Show connect button, hide user profile
            connectBtn.style.display = 'block';
            userProfile.style.display = 'none';
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
        if (!this.authToken) {
            this.showToast('Please connect your HandCash wallet first', 'error');
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
            const formData = new FormData();
            formData.append('file', file);
            formData.append('storageMethod', storageMethod);
            formData.append('encrypt', encrypt);
            
            try {
                const response = await fetch(`${this.apiUrl}/files/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    },
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.showToast(`Uploaded ${file.name} successfully`, 'success');
                } else {
                    this.showToast(`Failed to upload ${file.name}`, 'error');
                }
            } catch (error) {
                console.error('Upload error:', error);
                this.showToast(`Error uploading ${file.name}`, 'error');
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
            'recent': 'Recent Files',
            'nfts': 'NFT Collection',
            'shared': 'Shared Files'
        };
        
        document.getElementById('viewTitle').textContent = titles[view];
        this.displayFiles();
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