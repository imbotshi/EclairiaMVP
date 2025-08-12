# Eclairia - Plateforme audio interactive

Plateforme audio interactive avec radio intégrée, enregistrement vocal et interface 3D.

## 🚀 Technologies

- **Frontend**: Vue 3 + Vite + Tailwind CSS + Three.js + Wavesurfer.js
- **Backend**: Node.js + Express (proxy audio et API stations)
- **Base de données**: Supabase
- **Déploiement**: Vercel (frontend statique)

## 📦 Installation

```bash
# Installer les dépendances backend
npm install

# Installer les dépendances frontend
cd frontend
npm install
```

## 🛠️ Développement

### Option 1: Backend + Frontend séparés (recommandé)
```bash
# Terminal 1 - Backend (port 3001)
npm run dev:server

# Terminal 2 - Frontend (port 3000)
npm run dev:client
```

### Option 2: Backend seulement
```bash
npm run dev
```

## 🌐 URLs de développement

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
  - `/proxy?url=...` - Proxy audio
  - `/api/stations` - Liste des stations radio
  - `/health` - Health check

## 🚀 Déploiement

Le projet est configuré pour un déploiement statique sur Vercel :

```bash
# Build de production
npm run build

# Preview locale
cd frontend
npm run preview
```

## 📁 Structure

```
├── server.js              # API backend (proxy + stations)
├── package.json           # Dépendances backend
├── frontend/              # Application Vue/Vite
│   ├── src/
│   │   ├── components/    # Composants Vue
│   │   ├── services/      # Services API
│   │   ├── composables/   # Composables Vue
│   │   └── router/        # Configuration router
│   ├── public/
│   │   └── api/           # Données statiques (stations.json)
│   └── package.json       # Dépendances frontend
└── vercel.json           # Configuration déploiement Vercel
```

## 🔧 Configuration

### Variables d'environnement (frontend)

Créer un fichier `.env` dans `frontend/` :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

## 🎵 Fonctionnalités

- **Radio en ligne** : Écoute de stations radio via proxy
- **Enregistrement vocal** : Capture audio avec interface dédiée
- **Sphère 3D** : Interface interactive avec Three.js
- **Lecteur audio** : Contrôles de lecture avancés
- **Onboarding** : Guide utilisateur intégré

## 🐛 Dépannage

### Problèmes de ports
- Vérifier que les ports 3000 et 3001 sont libres
- Modifier les ports dans `frontend/vite.config.js` et `server.js` si nécessaire

### Problèmes de proxy audio
- Vérifier l'allowlist dans `server.js`
- Contrôler les logs du serveur pour les erreurs de connexion

### Build échoue
- Vérifier que toutes les dépendances sont installées
- Nettoyer `node_modules` et réinstaller si nécessaire 