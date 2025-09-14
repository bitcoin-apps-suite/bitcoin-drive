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
    const profile = await account.profile.getCurrentProfile();
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('HandCash profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}