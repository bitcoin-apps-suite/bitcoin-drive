// BSV Upload Module - Real blockchain storage implementation
// This shows how to actually upload files to BSV blockchain

class BSVUploader {
    constructor(handCashAccount) {
        this.account = handCashAccount;
    }

    // Upload small files using OP_RETURN (up to 100KB after OP_RETURN limit increase)
    async uploadSmallFile(file, metadata) {
        const fileBuffer = await this.fileToBuffer(file);
        
        // Create B:// protocol upload (for files)
        // B:// format: [OP_RETURN, "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut", fileContent, mediaType, encoding, filename]
        const payment = {
            to: [{
                script: this.buildBProtocolScript(fileBuffer, file.type, file.name),
                currencyCode: 'BSV'
            }],
            description: `Upload ${file.name} to Bitcoin Drive`
        };

        try {
            const result = await this.account.wallet.pay(payment);
            return {
                txid: result.transactionId,
                url: `https://bico.media/${result.transactionId}`
            };
        } catch (error) {
            console.error('BSV upload failed:', error);
            throw error;
        }
    }

    // Upload large files using BCAT protocol (chunked uploads)
    async uploadLargeFile(file, metadata) {
        const CHUNK_SIZE = 90000; // ~90KB chunks for safety
        const fileBuffer = await this.fileToBuffer(file);
        const chunks = this.splitIntoChunks(fileBuffer, CHUNK_SIZE);
        
        const chunkTxIds = [];
        
        // Upload each chunk
        for (let i = 0; i < chunks.length; i++) {
            const payment = {
                to: [{
                    script: this.buildBCatChunkScript(chunks[i]),
                    currencyCode: 'BSV'
                }],
                description: `Upload chunk ${i + 1}/${chunks.length} of ${file.name}`
            };
            
            const result = await this.account.wallet.pay(payment);
            chunkTxIds.push(result.transactionId);
        }
        
        // Create BCAT manifest linking all chunks
        const manifestPayment = {
            to: [{
                script: this.buildBCatManifestScript(chunkTxIds, file.type, file.name),
                currencyCode: 'BSV'
            }],
            description: `Create BCAT manifest for ${file.name}`
        };
        
        const manifestResult = await this.account.wallet.pay(manifestPayment);
        
        return {
            txid: manifestResult.transactionId,
            chunks: chunkTxIds,
            url: `https://bico.media/${manifestResult.transactionId}`
        };
    }

    // Create .nft container with metadata
    async createNFTContainer(file, metadata) {
        // First upload the file
        const fileUpload = file.size > 90000 ? 
            await this.uploadLargeFile(file, metadata) : 
            await this.uploadSmallFile(file, metadata);
        
        // Create NFT metadata following .nft specification
        const nftData = {
            name: metadata.name || file.name,
            description: metadata.description || `NFT of ${file.name}`,
            image: `b://${fileUpload.txid}`,
            attributes: [
                { trait_type: 'File Type', value: file.type },
                { trait_type: 'File Size', value: file.size },
                { trait_type: 'Created', value: new Date().toISOString() },
                { trait_type: 'Creator', value: metadata.creator }
            ],
            properties: {
                files: [{
                    uri: `b://${fileUpload.txid}`,
                    type: file.type
                }]
            }
        };

        // Upload NFT metadata using MAP protocol
        const mapPayment = {
            to: [{
                script: this.buildMAPScript({
                    app: 'bitcoin-drive',
                    type: 'nft',
                    data: JSON.stringify(nftData)
                }),
                currencyCode: 'BSV'
            }],
            description: `Create NFT for ${file.name}`
        };

        const nftResult = await this.account.wallet.pay(mapPayment);
        
        return {
            nftTxId: nftResult.transactionId,
            fileTxId: fileUpload.txid,
            url: `https://whatsonchain.com/tx/${nftResult.transactionId}`
        };
    }

    // Build B:// protocol script
    buildBProtocolScript(data, mediaType, filename) {
        // B:// protocol: OP_RETURN 19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut [data] [media-type] [encoding] [filename]
        const chunks = [
            '0x6a', // OP_RETURN
            '0x31394878696756345179427633744870515663554551797131707a5a56646f417574', // B:// prefix
            Buffer.from(data).toString('hex'),
            Buffer.from(mediaType).toString('hex'),
            Buffer.from('binary').toString('hex'),
            Buffer.from(filename).toString('hex')
        ];
        
        return chunks.join('');
    }

    // Build BCAT chunk script
    buildBCatChunkScript(chunkData) {
        // BCAT chunk: OP_RETURN 15DHFxWZJT58f9nhyGnsRBqrgwK4W6h4Up [data]
        const chunks = [
            '0x6a', // OP_RETURN
            '0x313544484678575a4a5435386639616879476e7352427172677757344b57366834557', // BCAT prefix
            Buffer.from(chunkData).toString('hex')
        ];
        
        return chunks.join('');
    }

    // Build BCAT manifest script
    buildBCatManifestScript(txIds, mediaType, filename) {
        // BCAT manifest links chunks together
        const manifest = {
            info: 'BCAT',
            mediaType: mediaType,
            filename: filename,
            chunks: txIds
        };
        
        const chunks = [
            '0x6a', // OP_RETURN
            '0x313544484678575a4a5435386639616879476e7352427172677757344b57366834557', // BCAT prefix
            Buffer.from(JSON.stringify(manifest)).toString('hex')
        ];
        
        return chunks.join('');
    }

    // Build MAP protocol script for metadata
    buildMAPScript(data) {
        // MAP protocol for key-value data
        const chunks = [
            '0x6a', // OP_RETURN
            '0x3150755161374b36324d694b43747373534c4b79316b683536575755374d74555235', // MAP prefix
            '0x534554', // SET command
        ];
        
        // Add key-value pairs
        Object.entries(data).forEach(([key, value]) => {
            chunks.push(Buffer.from(key).toString('hex'));
            chunks.push(Buffer.from(value).toString('hex'));
        });
        
        return chunks.join('');
    }

    // Helper functions
    async fileToBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(new Uint8Array(e.target.result));
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    splitIntoChunks(buffer, chunkSize) {
        const chunks = [];
        for (let i = 0; i < buffer.length; i += chunkSize) {
            chunks.push(buffer.slice(i, i + chunkSize));
        }
        return chunks;
    }

    // Calculate transaction fee (satoshis)
    calculateFee(dataSize) {
        // BSV typically ~0.5 sat/byte
        const feeRate = 0.5;
        const txOverhead = 200; // Approximate tx overhead in bytes
        return Math.ceil((dataSize + txOverhead) * feeRate);
    }

    // Get estimated cost in USD
    async getEstimatedCost(fileSize) {
        // Get current BSV price (you'd fetch this from an API)
        const bsvPriceUSD = 50; // Example price
        const satoshis = this.calculateFee(fileSize);
        const bsvAmount = satoshis / 100000000;
        return bsvAmount * bsvPriceUSD;
    }
}

// Integration with HandCash
class HandCashBSVDrive {
    constructor() {
        this.handCashConnect = null;
        this.account = null;
        this.uploader = null;
    }

    async initialize(authToken) {
        const { HandCashConnect } = await import('@handcash/handcash-connect');
        
        this.handCashConnect = new HandCashConnect({
            appId: process.env.HANDCASH_APP_ID,
            appSecret: process.env.HANDCASH_APP_SECRET
        });
        
        this.account = this.handCashConnect.getAccountFromAuthToken(authToken);
        this.uploader = new BSVUploader(this.account);
    }

    async uploadFile(file, options = {}) {
        const {
            createNFT = false,
            metadata = {},
            onProgress = () => {}
        } = options;

        try {
            // Check user's BSV balance first
            const profile = await this.account.profile.getCurrentProfile();
            const balance = await this.account.wallet.getSpendableBalance();
            
            if (balance.spendableSatoshis < 1000) {
                throw new Error('Insufficient BSV balance for upload');
            }

            onProgress({ status: 'preparing', message: 'Preparing file for upload...' });

            let result;
            
            if (createNFT) {
                onProgress({ status: 'uploading', message: 'Creating NFT container...' });
                result = await this.uploader.createNFTContainer(file, {
                    ...metadata,
                    creator: profile.handle
                });
            } else if (file.size > 90000) {
                onProgress({ status: 'uploading', message: 'Uploading large file in chunks...' });
                result = await this.uploader.uploadLargeFile(file, metadata);
            } else {
                onProgress({ status: 'uploading', message: 'Uploading file to blockchain...' });
                result = await this.uploader.uploadSmallFile(file, metadata);
            }

            onProgress({ status: 'complete', message: 'Upload complete!', result });
            
            return result;
        } catch (error) {
            onProgress({ status: 'error', message: error.message });
            throw error;
        }
    }

    async listFiles() {
        // Query blockchain for user's uploaded files
        // This would use a BSV indexer service like WhatsOnChain or custom indexer
        // For now, return mock data
        return [];
    }
}

// Export for use in drive-app.js
export { HandCashBSVDrive, BSVUploader };