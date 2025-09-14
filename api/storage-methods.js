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

  // Return BSV storage methods with real pricing
  res.status(200).json({
    methods: [
      {
        id: 'b_protocol',
        name: 'B:// Protocol',
        description: 'Direct on-chain storage for files < 100KB',
        maxSize: 100000, // 100KB
        costPerByte: 0.000000025, // ~0.5 sats/byte at $50 BSV
        protocol: 'B://',
        features: ['Permanent storage', 'Global CDN', 'Instant access'],
        recommended: true
      },
      {
        id: 'bcat_protocol',
        name: 'BCAT:// Protocol',
        description: 'Chunked storage for large files',
        maxSize: 10485760, // 10MB
        costPerByte: 0.00000003, // Slightly higher for chunking overhead
        protocol: 'BCAT://',
        features: ['Unlimited size', 'Chunked upload', 'Efficient storage'],
        recommended: false
      },
      {
        id: 'run_protocol',
        name: 'RUN Protocol',
        description: 'Interactive NFT storage',
        maxSize: 1048576, // 1MB
        costPerByte: 0.00000005,
        protocol: 'RUN',
        features: ['Interactive NFTs', 'Smart contracts', 'Programmable'],
        recommended: false
      },
      {
        id: 'map_protocol',
        name: 'MAP Protocol',
        description: 'Metadata and indexing',
        maxSize: 10000, // 10KB
        costPerByte: 0.000000025,
        protocol: 'MAP',
        features: ['Key-value storage', 'Indexable', 'Searchable'],
        recommended: false
      }
    ]
  });
}