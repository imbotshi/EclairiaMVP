export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  const { url } = req.query
  
  if (!url) {
    return res.status(400).json({ 
      error: 'URL parameter required',
      example: '/api/proxy?url=https://example.com'
    })
  }
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: url
      })
    }
    
    const buffer = await response.arrayBuffer()
    
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream')
    res.setHeader('Content-Length', buffer.byteLength)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ 
      error: 'Proxy error',
      message: error.message,
      url: url
    })
  }
} 