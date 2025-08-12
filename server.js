// server.js - Serveur API pour Eclairia (copié de radio-test)
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all routes (frontend runs on a different port)
app.use(cors());

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Whitelist des domaines radio de confiance (copié de radio-test)
const ALLOWLIST = [
  'rfifm64k.ice.infomaniak.ch',
  'african1paris.ice.infomaniak.ch',
  'dreamsiteradiocp4.com',
  'stream.live.vc.bbcmedia.co.uk',
  'scdn.nrjaudio.fm',
  'radio-trace.ice.infomaniak.ch',
  'www.soundhelix.com',
  'rmc.bfmtv.com',
  'radio.garden',
  'stream.zeno.fm'
];

function isAllowed(urlString){
  try{
    const u = new URL(urlString);
    return ALLOWLIST.includes(u.hostname);
  }catch(e){ 
    console.log('❌ URL invalide:', urlString);
    return false; 
  }
}

// Proxy endpoint avec logs détaillés (copié de radio-test)
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url param');
  
  console.log('🎵 Tentative de connexion:', targetUrl);
  
  if (!isAllowed(targetUrl)) {
    console.log('🚫 Domaine non autorisé:', targetUrl);
    return res.status(403).send('Domain not allowed');
  }

  try{
    const response = await fetch(targetUrl, { 
      method: 'GET',
      headers: {
        'User-Agent': 'Eclairia-Radio-Player/1.0'
      }
    });
    
    if (!response.ok) {
      console.log('❌ Erreur flux:', response.status, response.statusText);
      return res.status(response.status).send(`Error fetching: ${response.statusText}`);
    }

    // Pass through important headers
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    console.log('✅ Flux connecté:', contentType);
    
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Content-Type', contentType);

    // Pipe the response body directly
    response.body.pipe(res);

  }catch(err){
    console.error('💥 Erreur proxy:', err.message);
    res.status(500).send('Error fetching stream');
  }
});

// API endpoint for stations (copié de radio-test)
app.get('/api/stations', async (req, res) => {
  try {
    const stationsPath = path.join(__dirname, 'frontend/public/api/stations.json');
    const stationsData = fs.readFileSync(stationsPath, 'utf8');
    const stations = JSON.parse(stationsData);
    
    console.log(`📡 API /api/stations: ${stations.length} stations servies`);
    res.json(stations);
  } catch (error) {
    console.error('❌ Erreur lecture stations:', error);
    res.status(500).json({ error: 'Failed to load stations' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    ok: true, 
    timestamp: Date.now(),
    service: 'Eclairia Radio API',
    version: '1.0.0'
  });
});

// Fallback pour SPA (Vue Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎵 Serveur Eclairia: http://localhost:${PORT}`);
  console.log('🔧 Proxy endpoint: /proxy?url=...');
  console.log('📡 API stations: /api/stations');
  console.log('💚 Health check: /health');
});
