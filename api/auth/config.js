export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Return the HandCash configuration
  res.status(200).json({
    appId: process.env.HANDCASH_APP_ID || '68c697fb5287127557e47739',
    redirectUrl: process.env.HANDCASH_REDIRECT_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/auth/handcash/callback`
  });
}