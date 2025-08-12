export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  const stations = [
    {
      id: 1,
      name: "Radio France",
      url: "https://stream.radiofrance.fr/fip/fip.m3u8",
      country: "France",
      genre: "Eclectique"
    },
    {
      id: 2,
      name: "Radio Nova",
      url: "https://novazz.ice.infomaniak.ch/novazz-128.mp3",
      country: "France",
      genre: "Alternative"
    },
    {
      id: 3,
      name: "FIP",
      url: "https://stream.radiofrance.fr/fip/fip.m3u8",
      country: "France",
      genre: "Jazz"
    },
    {
      id: 4,
      name: "Radio Meuh",
      url: "https://radiomeuh.ice.infomaniak.ch/radiomeuh-128.mp3",
      country: "France",
      genre: "Rock"
    },
    {
      id: 5,
      name: "TSF Jazz",
      url: "https://tsfjazz.ice.infomaniak.ch/tsfjazz-128.mp3",
      country: "France",
      genre: "Jazz"
    }
  ]
  
  res.status(200).json({
    stations,
    total: stations.length,
    timestamp: new Date().toISOString(),
    optimized: true
  })
} 