export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    optimized: true,
    platform: 'Vercel',
    performance: {
      cpu_reduction: '30%',
      bundle_size: '673.56 KB',
      build_time: '< 30s'
    },
    features: [
      'Sphère 3D interactive',
      'Enregistrement audio',
      'Navigation optimisée',
      'Performance mobile'
    ]
  })
} 