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
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchFiles(e.target.value);
            // Sync with mobile search
            const mobileSearch = document.getElementById('mobileSearchInput');
            if (mobileSearch) mobileSearch.value = e.target.value;
        });

        // Mobile search functionality
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                this.searchFiles(e.target.value);
                // Sync with desktop search
                document.getElementById('searchInput').value = e.target.value;
            });
        }
        
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
        try {
            // Get configuration from backend
            const response = await fetch(`${this.apiUrl}/auth/config`);
            const config = await response.json();
            
            if (!config.appId) {
                throw new Error('HandCash App ID not configured');
            }
            
            const redirectUrl = window.location.origin + '/auth/handcash/callback';
            const authUrl = `https://app.handcash.io/#/authorizeApp?appId=${config.appId}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
            
            this.showToast('Redirecting to HandCash...', 'success');
            
            // Small delay to show the toast
            setTimeout(() => {
                window.location.href = authUrl;
            }, 500);
        } catch (error) {
            console.error('Failed to get auth config:', error);
            this.showToast('Unable to connect to HandCash. Please try again.', 'error');
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
        this.loadUserBalance();
        this.setupUploadModalEventListeners();
    }

    updateStorageCosts(totalSize) {
        // BSV pricing: ~0.5 satoshis per byte, assuming $50 BSV
        const BSV_PRICE_USD = 50;
        const SATOSHIS_PER_BYTE = 0.5;
        const SATOSHIS_PER_BSV = 100000000;
        
        // Calculate base storage cost
        const baseSatoshis = totalSize * SATOSHIS_PER_BYTE;
        const baseUSD = (baseSatoshis / SATOSHIS_PER_BSV) * BSV_PRICE_USD;
        
        // B:// Protocol (recommended for < 100KB)
        const bProtocolCost = Math.max(0.001, baseUSD);
        
        // BCAT:// Protocol (chunked for large files)
        const bcatCost = Math.max(0.002, baseUSD * 1.2); // 20% overhead for chunking
        
        // Update display
        document.getElementById('bProtocolCost').textContent = `$${bProtocolCost.toFixed(4)}`;
        document.getElementById('bcatCost').textContent = `$${bcatCost.toFixed(4)}`;
        
        this.calculateTotalCost();
    }

    calculateTotalCost() {
        let storageCost = 0;
        let additionalCosts = 0;
        
        // Get selected storage method cost
        const selectedMethod = document.querySelector('input[name="storageMethod"]:checked')?.value;
        const bProtocolCost = parseFloat(document.getElementById('bProtocolCost').textContent.replace('$', ''));
        const bcatCost = parseFloat(document.getElementById('bcatCost').textContent.replace('$', ''));
        
        if (selectedMethod === 'b_protocol') {
            storageCost = bProtocolCost;
        } else if (selectedMethod === 'bcat_protocol') {
            storageCost = bcatCost;
        }
        
        // NFT container fee
        if (document.getElementById('createNFT').checked) {
            additionalCosts += 0.05;
        }
        
        // Updates capability fee
        if (document.getElementById('enableUpdates').checked) {
            additionalCosts += 0.02;
        }
        
        // Service fee (2% of storage cost)
        const serviceFee = storageCost * 0.02;
        
        // Total cost
        const totalCost = storageCost + additionalCosts + serviceFee;
        
        // Update display
        document.getElementById('storageFeeDisplay').textContent = `$${storageCost.toFixed(4)}`;
        document.getElementById('serviceFeeDisplay').textContent = `$${serviceFee.toFixed(4)}`;
        document.getElementById('totalCostDisplay').textContent = `$${totalCost.toFixed(4)}`;
        document.getElementById('uploadBtnCost').textContent = `($${totalCost.toFixed(3)})`;
        
        // Show/hide additional cost rows
        document.getElementById('nftFeeRow').style.display = 
            document.getElementById('createNFT').checked ? 'flex' : 'none';
        document.getElementById('updatesFeeRow').style.display = 
            document.getElementById('enableUpdates').checked ? 'flex' : 'none';
    }

    async loadUserBalance() {
        try {
            if (!this.authToken) return;
            
            document.getElementById('userBalance').textContent = 'Loading...';
            
            // Fetch REAL balance from HandCash
            const response = await fetch(`${this.apiUrl}/handcash-balance`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (response.ok) {
                const balance = await response.json();
                
                // Store balance for later checks
                this.userBalance = balance;
                
                // Display balance
                const balanceEl = document.getElementById('userBalance');
                if (balance.error) {
                    balanceEl.textContent = '0 BSV (Not connected)';
                    balanceEl.style.color = '#ff4444';
                } else if (balance.satoshis < 10000) {
                    // Less than minimum required
                    balanceEl.textContent = `${balance.formatted.bsv} (Insufficient)`;
                    balanceEl.style.color = '#ff9900';
                } else {
                    balanceEl.textContent = `${balance.formatted.bsv} (${balance.formatted.usd})`;
                    balanceEl.style.color = '#00d632';
                }
            } else {
                document.getElementById('userBalance').textContent = 'Balance unavailable';
            }
        } catch (error) {
            console.error('Failed to load balance:', error);
            document.getElementById('userBalance').textContent = 'Error loading balance';
        }
    }

    setupUploadModalEventListeners() {
        // NFT checkbox toggle
        const nftCheckbox = document.getElementById('createNFT');
        const nftOptions = document.getElementById('nftOptions');
        
        nftCheckbox.addEventListener('change', (e) => {
            nftOptions.style.display = e.target.checked ? 'block' : 'none';
            
            // Auto-fill NFT name if empty
            if (e.target.checked && this.selectedFiles.length > 0) {
                const nameInput = document.getElementById('nftName');
                if (!nameInput.value) {
                    nameInput.value = this.selectedFiles[0].name.replace(/\.[^/.]+$/, '');
                }
            }
            
            this.calculateTotalCost();
        });
        
        // Paywall toggle
        const paywallRadio = document.querySelector('input[value="paywall"]');
        const paywallOptions = document.getElementById('paywallOptions');
        
        document.querySelectorAll('input[name="publishType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                paywallOptions.style.display = 
                    e.target.value === 'paywall' ? 'block' : 'none';
            });
        });
        
        // Storage method change
        document.querySelectorAll('input[name="storageMethod"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.calculateTotalCost();
            });
        });
        
        // Other checkboxes
        document.getElementById('enableUpdates').addEventListener('change', () => {
            this.calculateTotalCost();
        });
        
        // Access price change updates revenue split
        const accessPriceInput = document.getElementById('accessPrice');
        if (accessPriceInput) {
            accessPriceInput.addEventListener('input', (e) => {
                const price = parseFloat(e.target.value) || 0;
                const userShare = price * 0.95;
                const driveShare = price * 0.05;
                
                document.getElementById('yourShare').textContent = `$${userShare.toFixed(2)} (95%)`;
            });
        }
    }

    async uploadFiles() {
        if (this.selectedFiles.length === 0) return;
        
        // Check balance first
        if (this.userBalance && this.userBalance.satoshis !== undefined) {
            // Calculate required satoshis (rough estimate)
            let totalSize = 0;
            this.selectedFiles.forEach(file => totalSize += file.size);
            const requiredSatoshis = Math.ceil(totalSize * 0.5); // 0.5 sats per byte
            
            if (this.userBalance.satoshis < requiredSatoshis) {
                const requiredBSV = (requiredSatoshis / 100000000).toFixed(8);
                const currentBSV = (this.userBalance.satoshis / 100000000).toFixed(8);
                
                this.showToast(
                    `❌ Insufficient balance! You have ${currentBSV} BSV but need ${requiredBSV} BSV. ` +
                    `Please top up your HandCash wallet or files will be stored locally.`,
                    'error'
                );
                
                // Ask user if they want to continue with local storage
                const continueLocal = confirm(
                    `Insufficient BSV balance!\n\n` +
                    `Required: ${requiredBSV} BSV\n` +
                    `Your balance: ${currentBSV} BSV\n\n` +
                    `Do you want to continue with LOCAL storage instead?\n` +
                    `(Files will be saved locally, not on blockchain)`
                );
                
                if (!continueLocal) {
                    return; // Cancel upload
                }
            }
        }
        
        // Collect all upload options
        const options = {
            storageMethod: document.querySelector('input[name="storageMethod"]:checked').value,
            encrypt: document.getElementById('encryptFiles').checked,
            createNFT: document.getElementById('createNFT').checked,
            enableUpdates: document.getElementById('enableUpdates').checked,
            publishType: document.querySelector('input[name="publishType"]:checked').value,
            nftOptions: {
                name: document.getElementById('nftName')?.value || '',
                description: document.getElementById('nftDescription')?.value || '',
                royaltyPercent: parseInt(document.getElementById('royaltyPercent')?.value || '10'),
                maxSupply: parseInt(document.getElementById('maxSupply')?.value || '1')
            },
            paywallOptions: {
                accessPrice: parseFloat(document.getElementById('accessPrice')?.value || '0')
            }
        };

        // Disable upload button and show progress
        const uploadBtn = document.getElementById('confirmUpload');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = 'Uploading to BSV...';

        try {
            for (const file of this.selectedFiles) {
                await this.uploadSingleFile(file, options);
            }
            
            this.showToast('All files uploaded successfully!', 'success');
            this.hideUploadModal();
            await this.loadFiles();
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showToast('Upload failed: ' + error.message, 'error');
        } finally {
            // Re-enable upload button
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `
                <span class="upload-btn-text">Upload to Blockchain</span>
                <span class="upload-btn-cost" id="uploadBtnCost"></span>
            `;
        }
    }

    async uploadSingleFile(file, options) {
        try {
            this.showToast(`Uploading ${file.name} to BSV blockchain...`, 'info');
            
            // Create upload payload
            const uploadData = {
                file: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: await this.fileToBase64(file)
                },
                options: options
            };

            const response = await fetch(`${this.apiUrl}/bsv/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showToast(`✅ ${file.name} uploaded to BSV! TX: ${result.txId}`, 'success');
                return result;
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }
            
        } catch (error) {
            console.error(`Upload error for ${file.name}:`, error);
            this.showToast(`❌ Failed to upload ${file.name}: ${error.message}`, 'error');
            throw error;
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data:mime/type;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
        });
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