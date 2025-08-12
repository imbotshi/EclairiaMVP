<template>
  <div class="voice-map-container">
    <!-- Carte Leaflet -->
    <div id="voice-map" class="map-container"></div>
    
    <!-- Interface utilisateur moderne style Snapchat -->
    <div class="ui-overlay">
      <!-- Header avec géolocalisation -->
      <div class="map-header">
        <div class="location-info">
          <div class="location-icon">📍</div>
          <div class="location-text">
            <div class="current-location">{{ currentLocation }}</div>
            <div class="location-status">{{ locationStatus }}</div>
          </div>
        </div>
        <button class="locate-btn" @click="locateUser" :class="{ locating: isLocating }">
          <div class="locate-icon">🎯</div>
        </button>
      </div>

      <!-- Panneau de contrôle flottant -->
      <div class="control-panel">
        <div class="panel-header">
          <h3>Voice Notes</h3>
          <div class="voice-count">{{ activeVoiceNotes.length }} trouvées</div>
        </div>
        
        <!-- Filtres de type -->
        <div class="filters">
          <button 
            v-for="filter in voiceFilters" 
            :key="filter.type"
            @click="toggleFilter(filter.type)"
            class="filter-btn"
            :class="{ active: activeFilters.includes(filter.type) }"
          >
            <div class="filter-icon">{{ filter.icon }}</div>
            <span>{{ filter.label }}</span>
          </button>
        </div>

        <!-- Légende -->
        <div class="legend">
          <div class="legend-title">Types de lieux</div>
          <div class="legend-items">
            <div v-for="type in voiceTypes" :key="type.id" class="legend-item">
              <div class="legend-marker" :style="{ backgroundColor: type.color }"></div>
              <span>{{ type.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Indicateur de statut -->
      <div class="status-indicator" :class="statusType">
        <div class="status-icon">{{ statusIcon }}</div>
        <div class="status-text">{{ statusText }}</div>
      </div>
    </div>

    <!-- Popup de voice note -->
    <div v-if="selectedVoiceNote" class="voice-popup" @click="closePopup">
      <div class="popup-content" @click.stop>
        <div class="popup-header">
          <div class="voice-type-badge" :style="{ backgroundColor: selectedVoiceNote.color }">
            {{ selectedVoiceNote.icon }}
          </div>
          <div class="voice-info">
            <h4>{{ selectedVoiceNote.title }}</h4>
            <p>{{ selectedVoiceNote.location }}</p>
          </div>
          <button @click="closePopup" class="close-btn">✕</button>
        </div>
        <div class="popup-actions">
          <button @click="playVoiceNote" class="action-btn primary">
            ▶️ Écouter
          </button>
          <button @click="shareVoiceNote" class="action-btn secondary">📤 Partager</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// État de la carte
const map = ref(null)
const currentLocation = ref('Localisation...')
const locationStatus = ref('En cours de localisation')
const isLocating = ref(false)

// État des voice notes
const activeVoiceNotes = ref([])
const selectedVoiceNote = ref(null)

// Filtres et types
const activeFilters = ref(['HISTORIQUE', 'CULTUREL', 'CULTE', 'RENCONTRE', 'VIE'])
const voiceFilters = [
  { type: 'HISTORIQUE', label: 'Historique', icon: '🏛️' },
  { type: 'CULTUREL', label: 'Culturel', icon: '🎭' },
  { type: 'CULTE', label: 'Culte', icon: '⛪' },
  { type: 'RENCONTRE', label: 'Rencontre', icon: '🤝' },
  { type: 'VIE', label: 'Vie', icon: '🏠' }
]

const voiceTypes = [
  { id: 'HISTORIQUE', label: 'Lieux historiques', color: '#8B5CF6', icon: '🏛️' },
  { id: 'CULTUREL', label: 'Points culturels', color: '#F59E0B', icon: '🎭' },
  { id: 'CULTE', label: 'Lieux de culte', color: '#10B981', icon: '⛪' },
  { id: 'RENCONTRE', label: 'Lieux de rencontre', color: '#EF4444', icon: '🤝' },
  { id: 'VIE', label: 'Lieux de vie', color: '#06B6D4', icon: '🏠' }
]

// Statut
const statusType = ref('info')
const statusText = ref('Carte chargée')
const statusIcon = ref('🗺️')

// Méthodes de géolocalisation
const locateUser = async () => {
  isLocating.value = true
  statusText.value = 'Localisation en cours...'
  statusIcon.value = '🎯'
  statusType.value = 'loading'

  try {
    if (!navigator.geolocation) {
      throw new Error('Géolocalisation non supportée')
    }

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      })
    })

    const { latitude, longitude } = position.coords
    if (map.value) {
      map.value.setView([latitude, longitude], 16, { animate: true })
    }
    
    currentLocation.value = 'Votre position'
    locationStatus.value = 'Localisé'
    statusText.value = 'Position trouvée'
    statusIcon.value = '✅'
    statusType.value = 'success'

    // Générer des voice notes autour de la position
    generateVoiceNotesAround(latitude, longitude)
  } catch (error) {
    console.error('Erreur de géolocalisation:', error)
    statusText.value = 'Erreur de localisation'
    statusIcon.value = '❌'
    statusType.value = 'error'
  } finally {
    isLocating.value = false
  }
}

// Génération de voice notes
const generateVoiceNotesAround = (lat, lon) => {
  const voiceNotes = []
  const types = voiceTypes.filter(type => activeFilters.value.includes(type.id))
  
  // Générer 3-8 voice notes aléatoires
  const count = Math.floor(Math.random() * 6) + 3
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const position = jitterAround(lat, lon, 100 + Math.random() * 400)
    
    voiceNotes.push({
      id: `voice-${Date.now()}-${i}`,
      title: `Voice Note ${i + 1}`,
      location: `Point d'intérêt ${i + 1}`,
      type: type.id,
      color: type.color,
      icon: type.icon,
      position: position,
      audioUrl: `/audio/sample-${i + 1}.mp3`,
      duration: 30 + Math.floor(Math.random() * 120)
    })
  }
  
  activeVoiceNotes.value = voiceNotes
  addVoiceNotesToMap(voiceNotes)
}

// Utilitaire pour générer des positions aléatoires
const jitterAround = (lat, lon, meters) => {
  const r = meters / 111320 // Conversion mètres → degrés
  const u = Math.random()
  const v = Math.random()
  const w = r * Math.sqrt(u)
  const t = 2 * Math.PI * v
  const dx = w * Math.cos(t)
  const dy = w * Math.sin(t)
  return [lat + dy, lon + dx]
}

// Ajout des voice notes à la carte
const addVoiceNotesToMap = (voiceNotes) => {
  if (!map.value) return
  
  // Nettoyer les marqueurs existants
  map.value.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.value.removeLayer(layer)
    }
  })
  
  voiceNotes.forEach(note => {
    const marker = L.marker(note.position, {
      icon: createVoiceNoteIcon(note)
    })
    
    marker.on('click', () => {
      selectedVoiceNote.value = note
    })
    
    marker.addTo(map.value)
  })
}

// Création d'icônes personnalisées
const createVoiceNoteIcon = (note) => {
  return L.divIcon({
    className: 'voice-note-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pulse"></div>
        <div class="marker-icon" style="background-color: ${note.color}">
          ${note.icon}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

// Contrôles audio
const playVoiceNote = () => {
  if (!selectedVoiceNote.value) return
  console.log('Lecture de:', selectedVoiceNote.value.title)
  statusText.value = 'Lecture en cours...'
  statusIcon.value = '▶️'
  statusType.value = 'success'
}

// Filtres
const toggleFilter = (type) => {
  const index = activeFilters.value.indexOf(type)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(type)
  }
  
  // Régénérer les voice notes avec les nouveaux filtres
  if (map.value) {
    const center = map.value.getCenter()
    generateVoiceNotesAround(center.lat, center.lng)
  }
}

// Utilitaires
const closePopup = () => {
  selectedVoiceNote.value = null
}

const shareVoiceNote = () => {
  statusText.value = 'Voice note partagée'
  statusIcon.value = '📤'
  statusType.value = 'success'
}

// Lifecycle
onMounted(async () => {
  // Charger Leaflet dynamiquement
  if (typeof L === 'undefined') {
    await loadLeaflet()
  }
  
  // Initialiser la carte
  map.value = L.map('voice-map', {
    zoomControl: false,
    preferCanvas: true
  }).setView([3.8480, 11.5021], 14) // Douala par défaut

  // Ajouter les tuiles de carte
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)

  // Localiser l'utilisateur automatiquement
  setTimeout(locateUser, 1000)
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})

// Chargement dynamique de Leaflet
const loadLeaflet = () => {
  return new Promise((resolve) => {
    // CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = resolve
    document.head.appendChild(script)
  })
}
</script>

<style scoped>
/* Container principal */
.voice-map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #09174C 0%, #1a2b5c 50%, #2d4a8a 100%);
  overflow: hidden;
}

/* Carte */
.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Overlay UI */
.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

/* Header de la carte */
.map-header {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: auto;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.location-icon {
  font-size: 20px;
}

.location-text {
  color: #F1EDE1;
}

.current-location {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.location-status {
  font-size: 12px;
  color: rgba(241, 237, 225, 0.7);
}

.locate-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.locate-btn:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.15);
}

.locate-btn.locating {
  animation: pulse 1s infinite;
}

.locate-icon {
  font-size: 20px;
}

/* Panneau de contrôle */
.control-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  pointer-events: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  color: #F1EDE1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.voice-count {
  color: rgba(241, 237, 225, 0.7);
  font-size: 14px;
}

/* Filtres */
.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(241, 237, 225, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #F1EDE1;
}

.filter-btn.active {
  background: #FF4775;
  color: white;
  border-color: #FF4775;
}

.filter-icon {
  font-size: 14px;
}

/* Légende */
.legend {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.legend-title {
  color: rgba(241, 237, 225, 0.7);
  font-size: 12px;
  margin-bottom: 8px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #F1EDE1;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* Indicateur de statut */
.status-indicator {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #F1EDE1;
  font-size: 14px;
  pointer-events: auto;
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
  transition: all 0.3s ease;
}

.status-indicator.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.status-indicator.success {
  background: rgba(17, 197, 77, 0.2);
  border-color: rgba(17, 197, 77, 0.3);
}

.status-indicator.error {
  background: rgba(255, 71, 117, 0.2);
  border-color: rgba(255, 71, 117, 0.3);
}

.status-indicator.loading {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.3);
}

/* Popup de voice note */
.voice-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.popup-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.voice-type-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.voice-info {
  flex: 1;
}

.voice-info h4 {
  color: #F1EDE1;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.voice-info p {
  color: rgba(241, 237, 225, 0.7);
  font-size: 14px;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #F1EDE1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.popup-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #FF4775;
  color: white;
}

.action-btn.primary:hover {
  background: #F10F47;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #F1EDE1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Marqueurs de voice notes */
:deep(.voice-note-marker) {
  background: transparent;
  border: none;
}

:deep(.marker-container) {
  position: relative;
  width: 32px;
  height: 32px;
}

:deep(.marker-pulse) {
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 71, 117, 0.3);
  animation: pulse 2s infinite;
}

:deep(.marker-icon) {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .map-header {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .control-panel {
    bottom: 10px;
    left: 10px;
    right: 10px;
    padding: 16px;
  }
  
  .filters {
    gap: 6px;
  }
  
  .filter-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  .legend-items {
    gap: 8px;
  }
  
  .legend-item {
    font-size: 11px;
  }
}
</style> 