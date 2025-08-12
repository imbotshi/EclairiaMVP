# 🎵 Eclairia - Application Audio Moderne

Une application audio révolutionnaire combinant cartographie vocale, podcasts et expérience utilisateur moderne inspirée des meilleures applications de 2025.

## ✨ Fonctionnalités Principales

### 🗺️ Onglet Voice - Cartographie Vocale Avancée
- **Carte interactive** avec design sombre moderne
- **Géolocalisation en temps réel** avec Leaflet et OpenStreetMap
- **Interface glassmorphism** avec contrôles intuitifs
- **Marqueurs vocaux** positionnés géographiquement
- **Panneau de contrôle** avec boutons de localisation et zoom
- **Design responsive** adapté à tous les écrans

### 🎧 Onglet Podcast - Expérience Spotify-like
- **Design minimaliste** avec hiérarchie claire
- **Carrousel horizontal** pour les catégories
- **Scroll fluide** sans effet parallax
- **Mini-player** intégré avec contrôles avancés
- **Mode conduite** pour une expérience sécurisée
- **Détection de gestes** (swipe, shake)

### 🎨 Design System Eclairia
- **Palette de couleurs** cohérente et moderne
- **Typographie** optimisée (ABC Whyte, Figtree)
- **Animations fluides** et naturelles
- **Glassmorphism** pour un effet premium
- **Responsive design** mobile-first

## 🚀 Technologies Utilisées

### Frontend
- **Vue.js 3** - Framework moderne et réactif
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **Leaflet.js** - Cartographie interactive
- **OpenStreetMap** - Tiles de carte gratuits

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Supabase** - Base de données et authentification

### Outils de Développement
- **Git** - Version control
- **GitHub** - Repository et collaboration
- **Vercel** - Déploiement et hosting

## 📱 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/imbotshi/EclairiaMVP.git
cd EclairiaMVP
```

2. **Installer les dépendances**
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

3. **Configuration des variables d'environnement**
```bash
# Dans le dossier frontend
cp env.example .env
# Éditer .env avec vos clés API
```

4. **Démarrer les serveurs**
```bash
# Terminal 1 - Backend (port 3001)
npm run dev

# Terminal 2 - Frontend (port 3002)
cd frontend
npm run dev
```

5. **Accéder à l'application**
- Frontend: http://localhost:3002
- Backend: http://localhost:3001

## 🌐 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Le déploiement se fait automatiquement à chaque push
3. Configuration incluse dans `vercel.json`

### Autres Plateformes
- **Netlify** - Compatible avec la configuration Vite
- **GitHub Pages** - Déploiement statique
- **AWS S3 + CloudFront** - Solution enterprise

## 🎯 Architecture du Projet

```
Eclairia/
├── frontend/                 # Application Vue.js
│   ├── src/
│   │   ├── components/      # Composants Vue
│   │   ├── composables/     # Logique réutilisable
│   │   ├── services/        # Services API
│   │   ├── utils/           # Utilitaires
│   │   └── config/          # Configuration
│   ├── public/              # Assets statiques
│   └── package.json
├── server.js                # Serveur Express
├── vercel.json             # Configuration Vercel
└── README.md
```

## 🔧 Composants Clés

### VoiceMapOpenStreet.vue
- Carte interactive avec Leaflet
- Géolocalisation en temps réel
- Interface glassmorphism
- Contrôles de navigation

### PodcastTab.vue
- Design minimaliste Spotify-like
- Carrousel horizontal fluide
- Mini-player intégré
- Détection de gestes

### Home.vue
- Navigation entre onglets
- Gestion de l'état global
- Intégration des composants

## 🎨 Design System

### Couleurs
- `eclairia-dark`: #0F0F0F
- `eclairia-blue`: #3B82F6
- `eclairia-pink`: #EC4899
- `eclairia-purple`: #8B5CF6
- `eclairia-green`: #10B981

### Typographie
- **ABC Whyte** - Titres et headings
- **Figtree** - Corps de texte et UI

### Animations
- Transitions CSS fluides
- Hover effects subtils
- Micro-interactions
- Responsive breakpoints

## 📱 Responsive Design

- **Mobile First** - Optimisé pour mobile
- **Tablet** - Adaptation pour écrans moyens
- **Desktop** - Expérience complète
- **Touch-friendly** - Gestes tactiles optimisés

## 🔒 Sécurité

- Validation des entrées utilisateur
- Protection CSRF
- Headers de sécurité
- Variables d'environnement sécurisées

## 🧪 Tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 📊 Performance

- **Lazy loading** des composants
- **Code splitting** automatique
- **Optimisation des images**
- **Cache intelligent**
- **Bundle analysis** intégré

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Changelog

### v1.0.0 (2025-01-XX)
- ✨ Implémentation complète des onglets Voice et Podcast
- 🗺️ Cartographie vocale avec Leaflet et OpenStreetMap
- 🎧 Interface podcast design Spotify-like
- 🎨 Design system Eclairia complet
- 📱 Interface responsive mobile-first
- 🚀 Configuration Vercel pour déploiement

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Leaflet.js** - Cartographie interactive
- **Vue.js** - Framework frontend
- **Tailwind CSS** - Framework CSS
- **OpenStreetMap** - Données cartographiques
- **Vercel** - Plateforme de déploiement

## 📞 Support

- **Issues GitHub**: [Signaler un bug](https://github.com/imbotshi/EclairiaMVP/issues)
- **Discussions**: [Forum communautaire](https://github.com/imbotshi/EclairiaMVP/discussions)
- **Email**: [Contact support](mailto:support@eclairia.com)

---

**Développé avec ❤️ par l'équipe Eclairia**

*Révolutionnez votre expérience audio avec la cartographie vocale moderne* 