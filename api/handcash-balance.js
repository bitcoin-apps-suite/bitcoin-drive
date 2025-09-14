import { HandCashConnect } from '@handcash/handcash-connect';

const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const account = handCashConnect.getAccountFromAuthToken(authToken);
    
    // Get real balance from HandCash
    const balance = await account.wallet.getSpendableBalance();
    
    // Get current BSV price (you'd normally fetch this from an API)
    const BSV_PRICE_USD = 50; // Approximate price
    
    // Calculate USD value
    const bsvAmount = balance.spendableSatoshis / 100000000;
    const usdValue = bsvAmount * BSV_PRICE_USD;
    
    res.status(200).json({
      satoshis: balance.spendableSatoshis,
      bsv: bsvAmount,
      usd: usdValue,
      formatted: {
        satoshis: balance.spendableSatoshis.toLocaleString(),
        bsv: `${bsvAmount.toFixed(8)} BSV`,
        usd: `$${usdValue.toFixed(2)} USD`
      }
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    
    // If balance fetch fails, return zero balance
    res.status(200).json({
      satoshis: 0,
      bsv: 0,
      usd: 0,
      formatted: {
        satoshis: '0',
        bsv: '0 BSV',
        usd: '$0.00 USD'
      },
      error: 'Unable to fetch balance. Check HandCash connection.'
    });
  }
}