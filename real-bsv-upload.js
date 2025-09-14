const { HandCashConnect } = require('@handcash/handcash-connect');
const bsv = require('bsv');

class RealBSVUploader {
    constructor() {
        this.handCashConnect = new HandCashConnect({
            appId: process.env.HANDCASH_APP_ID,
            appSecret: process.env.HANDCASH_APP_SECRET
        });
    }

    /**
     * Upload file to BSV blockchain using HandCash
     * This creates real transactions on the BSV network
     */
    async uploadToBSV(authToken, fileData, options) {
        try {
            // Get HandCash account from auth token
            const account = this.handCashConnect.getAccountFromAuthToken(authToken);
            const profile = await account.profile.getCurrentProfile();
            
            console.log(`Starting real BSV upload for ${profile.handle}`);
            
            // Check wallet balance
            const balance = await account.wallet.getSpendableBalance();
            console.log(`Wallet balance: ${balance.spendableSatoshis} satoshis`);
            
            if (balance.spendableSatoshis < 10000) {
                throw new Error(`Insufficient balance. You have ${balance.spendableSatoshis} satoshis. Need at least 10000.`);
            }

            // Convert file data
            const fileBuffer = Buffer.from(fileData.data, 'base64');
            const fileSize = fileBuffer.length;
            
            console.log(`File: ${fileData.name}, Size: ${fileSize} bytes`);

            let uploadResult;
            
            // Choose upload method based on file size
            if (fileSize < 100000) { // Less than 100KB - use B:// protocol
                uploadResult = await this.uploadViaBProtocol(account, {
                    buffer: fileBuffer,
                    name: fileData.name,
                    type: fileData.type
                });
            } else { // Large files - use BCAT protocol
                uploadResult = await this.uploadViaBCAT(account, {
                    buffer: fileBuffer,
                    name: fileData.name,
                    type: fileData.type
                });
            }

            // Create NFT if requested
            if (options.createNFT) {
                await this.createNFT(account, profile, uploadResult, options.nftOptions);
            }

            // Set up paywall if requested
            if (options.publishType === 'paywall') {
                await this.setupPaywall(account, uploadResult.txId, options.paywallOptions);
            }

            return uploadResult;

        } catch (error) {
            console.error('Real BSV upload error:', error);
            throw error;
        }
    }

    /**
     * Upload using B:// protocol for small files
     * B:// protocol format: OP_RETURN | B_PREFIX | DATA | MEDIA_TYPE | ENCODING | FILENAME
     */
    async uploadViaBProtocol(account, fileData) {
        const { buffer, name, type } = fileData;
        
        // Build B:// protocol data
        const B_PREFIX = '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut';
        
        // Create the data payload
        const dataPayload = {
            data: buffer.toString('base64'),
            mediaType: type,
            encoding: 'base64',
            filename: name
        };

        // Create payment request for HandCash
        const payment = {
            payments: [{
                to: 'bitcoinfile@moneybutton.com', // B:// protocol address
                currencyCode: 'BSV',
                sendAmount: 0.00001 // Minimum dust amount
            }],
            attachment: {
                format: 'json',
                value: {
                    protocol: 'B',
                    data: dataPayload
                }
            },
            description: `Upload ${name} to BSV via B:// protocol`
        };

        try {
            console.log('Sending B:// protocol transaction...');
            const result = await account.wallet.pay(payment);
            
            console.log(`Success! Transaction ID: ${result.transactionId}`);
            
            return {
                txId: result.transactionId,
                protocol: 'B://',
                url: `https://bico.media/${result.transactionId}`,
                viewUrl: `https://whatsonchain.com/tx/${result.transactionId}`,
                cost: result.totalAmount
            };
        } catch (error) {
            console.error('B:// upload failed:', error);
            throw new Error(`Failed to upload via B:// protocol: ${error.message}`);
        }
    }

    /**
     * Upload large files using BCAT protocol (chunked upload)
     */
    async uploadViaBCAT(account, fileData) {
        const { buffer, name, type } = fileData;
        const CHUNK_SIZE = 90000; // 90KB chunks
        
        // Split file into chunks
        const chunks = [];
        for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
            chunks.push(buffer.slice(i, i + CHUNK_SIZE));
        }

        console.log(`Splitting file into ${chunks.length} chunks...`);
        
        const chunkTxIds = [];
        
        // Upload each chunk
        for (let i = 0; i < chunks.length; i++) {
            console.log(`Uploading chunk ${i + 1}/${chunks.length}...`);
            
            const chunkPayment = {
                payments: [{
                    to: 'bcat@moneybutton.com', // BCAT protocol address
                    currencyCode: 'BSV',
                    sendAmount: 0.00001
                }],
                attachment: {
                    format: 'binary',
                    value: chunks[i].toString('base64')
                },
                description: `BCAT chunk ${i + 1}/${chunks.length} for ${name}`
            };
            
            const result = await account.wallet.pay(chunkPayment);
            chunkTxIds.push(result.transactionId);
        }

        // Create BCAT manifest linking all chunks
        const manifest = {
            info: 'BCAT',
            chunks: chunkTxIds,
            filename: name,
            mediaType: type,
            size: buffer.length
        };

        const manifestPayment = {
            payments: [{
                to: 'bcat@moneybutton.com',
                currencyCode: 'BSV',
                sendAmount: 0.00001
            }],
            attachment: {
                format: 'json',
                value: manifest
            },
            description: `BCAT manifest for ${name}`
        };

        const manifestResult = await account.wallet.pay(manifestPayment);
        
        console.log(`BCAT upload complete! Manifest TX: ${manifestResult.transactionId}`);
        
        return {
            txId: manifestResult.transactionId,
            protocol: 'BCAT://',
            chunks: chunkTxIds,
            url: `https://bico.media/${manifestResult.transactionId}`,
            viewUrl: `https://whatsonchain.com/tx/${manifestResult.transactionId}`,
            cost: manifestResult.totalAmount * (chunks.length + 1)
        };
    }

    /**
     * Create NFT metadata on-chain
     */
    async createNFT(account, profile, uploadResult, nftOptions) {
        const nftData = {
            name: nftOptions.name,
            description: nftOptions.description,
            image: uploadResult.url,
            creator: profile.handle,
            royalty: nftOptions.royaltyPercent,
            maxSupply: nftOptions.maxSupply,
            protocol: '.nft',
            timestamp: new Date().toISOString()
        };

        const nftPayment = {
            payments: [{
                to: 'nft@relayx.com', // NFT protocol address
                currencyCode: 'BSV',
                sendAmount: 0.00005 // NFT creation fee
            }],
            attachment: {
                format: 'json',
                value: nftData
            },
            description: `Create NFT for ${nftOptions.name}`
        };

        const result = await account.wallet.pay(nftPayment);
        
        console.log(`NFT created! TX: ${result.transactionId}`);
        
        return {
            txId: result.transactionId,
            url: `https://whatsonchain.com/tx/${result.transactionId}`
        };
    }

    /**
     * Set up paywall for monetization
     */
    async setupPaywall(account, fileTxId, paywallOptions) {
        const paywallData = {
            fileTxId: fileTxId,
            price: paywallOptions.accessPrice,
            currency: 'USD',
            seller: account.profile.publicProfile.paymail,
            created: new Date().toISOString()
        };

        const paywallPayment = {
            payments: [{
                to: '$bitcoin.drive', // Bitcoin Drive paywall service
                currencyCode: 'BSV',
                sendAmount: 0.00001
            }],
            attachment: {
                format: 'json',
                value: paywallData
            },
            description: `Set up paywall for file ${fileTxId}`
        };

        const result = await account.wallet.pay(paywallPayment);
        
        console.log(`Paywall created! TX: ${result.transactionId}`);
        
        return result;
    }

    /**
     * Pay service fee to bitcoin.drive
     */
    async payServiceFee(account, amount) {
        const payment = {
            payments: [{
                to: '$bitcoin.drive', // Bitcoin Drive service paymail
                currencyCode: 'BSV',
                sendAmount: amount
            }],
            description: 'Bitcoin Drive service fee (2%)'
        };

        return await account.wallet.pay(payment);
    }
}

module.exports = RealBSVUploader;