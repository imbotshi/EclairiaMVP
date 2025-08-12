<template>
  <div class="voice-map-simple">
    <!-- Carte Mapbox -->
    <div id="simple-map" class="map-container"></div>
    
    <!-- Interface utilisateur -->
    <div class="ui-overlay">
      <!-- Header avec localisation -->
      <div class="header">
        <div class="location-info">
          <div class="location-icon">📍</div>
          <div class="location-text">
            <div class="current-location">{{ currentLocation }}</div>
            <div class="location-status">{{ locationStatus }}</div>
          </div>
        </div>
        <button 
          class="locate-btn" 
          @click="locateUser"
          :class="{ loading: isLocating }"
        >
          🎯
        </button>
      </div>

      <!-- Panneau de contrôle -->
      <div class="control-panel">
        <div class="panel-header">
          <h3>Voice Notes</h3>
          <span class="count">{{ voiceNotes.length }} trouvées</span>
        </div>
        
        <!-- Filtres -->
        <div class="filters">
          <button 
            v-for="filter in filters" 
            :key="filter.type"
            @click="toggleFilter(filter.type)"
            class="filter-btn"
            :class="{ active: activeFilters.includes(filter.type) }"
          >
            {{ filter.icon }} {{ filter.label }}
          </button>
        </div>

        <!-- Contrôles -->
        <div class="controls">
          <button @click="toggleHeatmap" class="control-btn" :class="{ active: heatmapEnabled }">
            🔥 Heatmap
          </button>
          <button @click="toggleClusters" class="control-btn" :class="{ active: clustersEnabled }">
            🎯 Clusters
          </button>
          <button @click="changeMapStyle" class="control-btn">
            🗺️ Style
          </button>
        </div>
      </div>

      <!-- Message de statut -->
      <div class="status-message" :class="{ show: showStatus }">
        {{ statusMessage }}
      </div>
    </div>

    <!-- Popup pour voice note -->
    <div v-if="selectedVoiceNote" class="popup-overlay" @click="closePopup">
      <div class="popup" @click.stop>
        <div class="popup-header">
          <div class="voice-icon" :style="{ backgroundColor: selectedVoiceNote.color }">
            {{ selectedVoiceNote.icon }}
          </div>
          <div class="voice-info">
            <h4>{{ selectedVoiceNote.title }}</h4>
            <p>{{ selectedVoiceNote.location }}</p>
            <span class="distance">{{ selectedVoiceNote.distance }}m</span>
          </div>
          <button @click="closePopup" class="close-btn">✕</button>
        </div>
        <div class="popup-actions">
          <button @click="playVoiceNote" class="play-btn">
            {{ isPlaying ? '⏸️ Pause' : '▶️ Écouter' }}
          </button>
          <button @click="shareVoiceNote" class="share-btn">
            📤 Partager
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_CONFIG, getTimeBasedStyle, calculateDistance } from '../config/mapbox.js'

// Configuration Mapbox
mapboxgl.accessToken = MAPBOX_CONFIG.accessToken

// État de la carte
const map = ref(null)
const currentLocation = ref('Localisation...')
const locationStatus = ref('En attente')
const isLocating = ref(false)

// État des voice notes
const voiceNotes = ref([])
const selectedVoiceNote = ref(null)
const isPlaying = ref(false)

// État des contrôles
const heatmapEnabled = ref(false)
const clustersEnabled = ref(false)
const activeFilters = ref(['HISTORIQUE', 'CULTUREL', 'CULTE', 'RENCONTRE', 'VIE'])

// État des messages
const statusMessage = ref('')
const showStatus = ref(false)

// Filtres disponibles
const filters = [
  { type: 'HISTORIQUE', label: 'Historique', icon: '🏛️' },
  { type: 'CULTUREL', label: 'Culturel', icon: '🎭' },
  { type: 'CULTE', label: 'Culte', icon: '⛪' },
  { type: 'RENCONTRE', label: 'Rencontre', icon: '🤝' },
  { type: 'VIE', label: 'Vie', icon: '🏠' }
]

// Types de voice notes
const voiceTypes = [
  { id: 'HISTORIQUE', label: 'Lieux historiques', color: '#8B5CF6', icon: '🏛️' },
  { id: 'CULTUREL', label: 'Points culturels', color: '#F59E0B', icon: '🎭' },
  { id: 'CULTE', label: 'Lieux de culte', color: '#10B981', icon: '⛪' },
  { id: 'RENCONTRE', label: 'Lieux de rencontre', color: '#EF4444', icon: '🤝' },
  { id: 'VIE', label: 'Lieux de vie', color: '#06B6D4', icon: '🏠' }
]

// Position utilisateur
const userPosition = ref(null)

// Méthodes
const showStatusMessage = (message, duration = 3000) => {
  statusMessage.value = message
  showStatus.value = true
  setTimeout(() => {
    showStatus.value = false
  }, duration)
}

const locateUser = async () => {
  isLocating.value = true
  showStatusMessage('Localisation en cours...')

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
    userPosition.value = [latitude, longitude]
    
    if (map.value) {
      map.value.flyTo({
        center: [longitude, latitude],
        zoom: 16,
        duration: MAPBOX_CONFIG.animation.duration
      })
    }
    
    currentLocation.value = 'Votre position'
    locationStatus.value = 'Localisé'
    showStatusMessage('Position trouvée !')

    generateVoiceNotes(latitude, longitude)
  } catch (error) {
    console.error('Erreur de géolocalisation:', error)
    
    // Fallback : utiliser Douala comme position par défaut
    const fallbackLat = 3.8480
    const fallbackLon = 11.5021
    userPosition.value = [fallbackLat, fallbackLon]
    
    if (map.value) {
      map.value.flyTo({
        center: [fallbackLon, fallbackLat],
        zoom: 14,
        duration: MAPBOX_CONFIG.animation.duration
      })
    }
    
    currentLocation.value = 'Douala (position par défaut)'
    locationStatus.value = 'Position par défaut'
    showStatusMessage('Utilisation de la position par défaut')
    
    generateVoiceNotes(fallbackLat, fallbackLon)
  } finally {
    isLocating.value = false
  }
}

const generateVoiceNotes = (lat, lon) => {
  const notes = []
  const types = voiceTypes.filter(type => activeFilters.value.includes(type.id))
  
  // Générer des voice notes même sans backend
  const count = Math.floor(Math.random() * 6) + 3
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const position = generateRandomPosition(lat, lon, 100 + Math.random() * 400)
    
    const distance = userPosition.value ? 
      calculateDistance(userPosition.value[0], userPosition.value[1], position[0], position[1]) * 1000 : 0
    
    notes.push({
      id: `voice-${Date.now()}-${i}`,
      title: `Voice Note ${i + 1}`,
      location: `Point d'intérêt ${i + 1}`,
      type: type.id,
      color: type.color,
      icon: type.icon,
      position: [position[1], position[0]], // [lng, lat]
      distance: Math.round(distance)
    })
  }
  
  voiceNotes.value = notes
  addMarkersToMap(notes)
  showStatusMessage(`${notes.length} voice notes générées !`)
}

const generateRandomPosition = (lat, lon, meters) => {
  const r = meters / 111320
  const u = Math.random()
  const v = Math.random()
  const w = r * Math.sqrt(u)
  const t = 2 * Math.PI * v
  const dx = w * Math.cos(t)
  const dy = w * Math.sin(t)
  return [lat + dy, lon + dx]
}

const addMarkersToMap = (notes) => {
  if (!map.value) return
  
  // Nettoyer les marqueurs existants
  const existingMarkers = document.querySelectorAll('.voice-marker')
  existingMarkers.forEach(marker => marker.remove())
  
  notes.forEach(note => {
    const markerElement = document.createElement('div')
    markerElement.className = 'voice-marker'
    markerElement.innerHTML = `
      <div class="marker" style="background-color: ${note.color}">
        ${note.icon}
      </div>
    `
    
    markerElement.addEventListener('click', () => {
      selectedVoiceNote.value = note
    })
    
    new mapboxgl.Marker(markerElement)
      .setLngLat(note.position)
      .addTo(map.value)
  })
}

const toggleFilter = (type) => {
  const index = activeFilters.value.indexOf(type)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(type)
  }
  
  if (userPosition.value) {
    generateVoiceNotes(userPosition.value[0], userPosition.value[1])
  }
}

const toggleHeatmap = () => {
  heatmapEnabled.value = !heatmapEnabled.value
  showStatusMessage(heatmapEnabled.value ? 'Heatmap activée' : 'Heatmap désactivée')
  
  if (heatmapEnabled.value) {
    createHeatmap()
  } else {
    removeHeatmap()
  }
}

const toggleClusters = () => {
  clustersEnabled.value = !clustersEnabled.value
  showStatusMessage(clustersEnabled.value ? 'Clusters activés' : 'Clusters désactivés')
  
  if (clustersEnabled.value) {
    createClusters()
  } else {
    removeClusters()
  }
}

const createHeatmap = () => {
  if (!map.value || !map.value.isStyleLoaded()) return
  
  const heatmapData = voiceNotes.value.map(note => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: note.position
    },
    properties: {
      value: 1
    }
  }))
  
  map.value.addSource('heatmap', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: heatmapData
    }
  })
  
  map.value.addLayer({
    id: 'heatmap',
    type: 'heatmap',
    source: 'heatmap',
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': 1,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 0, 255, 0)',
        0.5, 'rgba(255, 255, 0, 0.5)',
        1, 'rgba(255, 0, 0, 0.8)'
      ],
      'heatmap-radius': 20,
      'heatmap-opacity': 0.8
    }
  })
}

const removeHeatmap = () => {
  if (!map.value) return
  
  if (map.value.getLayer('heatmap')) {
    map.value.removeLayer('heatmap')
  }
  if (map.value.getSource('heatmap')) {
    map.value.removeSource('heatmap')
  }
}

const createClusters = () => {
  if (!map.value || !map.value.isStyleLoaded()) return
  
  const clusterData = voiceNotes.value.map(note => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: note.position
    },
    properties: {
      cluster: true,
      point_count: 1
    }
  }))
  
  map.value.addSource('clusters', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: clusterData
    },
    cluster: true,
    clusterRadius: 50
  })
  
  map.value.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'clusters',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#51bbd6',
      'circle-radius': 20
    }
  })
  
  map.value.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'clusters',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  })
}

const removeClusters = () => {
  if (!map.value) return
  
  if (map.value.getLayer('cluster-count')) {
    map.value.removeLayer('cluster-count')
  }
  if (map.value.getLayer('clusters')) {
    map.value.removeLayer('clusters')
  }
  if (map.value.getSource('clusters')) {
    map.value.removeSource('clusters')
  }
}

const changeMapStyle = () => {
  if (!map.value) return
  
  const styles = Object.values(MAPBOX_CONFIG.styles)
  const currentStyle = map.value.getStyle().sprite
  const currentIndex = styles.findIndex(style => style.includes(currentStyle.split('/').pop()))
  const nextIndex = (currentIndex + 1) % styles.length
  
  map.value.setStyle(styles[nextIndex])
  showStatusMessage('Style de carte changé')
}

const playVoiceNote = () => {
  if (!selectedVoiceNote.value) return
  
  isPlaying.value = !isPlaying.value
  showStatusMessage(isPlaying.value ? 'Lecture en cours...' : 'Lecture en pause')
}

const shareVoiceNote = () => {
  showStatusMessage('Voice note partagée !')
}

const closePopup = () => {
  selectedVoiceNote.value = null
  isPlaying.value = false
}

// Lifecycle
onMounted(() => {
  // Initialiser la carte
  map.value = new mapboxgl.Map({
    container: 'simple-map',
    style: getTimeBasedStyle(),
    center: MAPBOX_CONFIG.default.center,
    zoom: MAPBOX_CONFIG.default.zoom,
    minZoom: MAPBOX_CONFIG.zoom.min,
    maxZoom: MAPBOX_CONFIG.zoom.max
  })

  map.value.addControl(new mapboxgl.NavigationControl(), 'top-right')
  
  map.value.on('load', () => {
    showStatusMessage('Carte chargée !')
    // Initialiser automatiquement avec position par défaut
    setTimeout(() => {
      const fallbackLat = 3.8480
      const fallbackLon = 11.5021
      userPosition.value = [fallbackLat, fallbackLon]
      currentLocation.value = 'Douala'
      locationStatus.value = 'Position par défaut'
      generateVoiceNotes(fallbackLat, fallbackLon)
    }, 1000)
  })
  
  map.value.on('error', (e) => {
    console.error('Erreur de carte:', e)
    showStatusMessage('Erreur de chargement de la carte')
  })
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
.voice-map-simple {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #09174C;
}

.map-container {
  width: 100%;
  height: 100%;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

/* Header */
.header {
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
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.location-icon {
  font-size: 20px;
}

.location-text {
  color: white;
}

.current-location {
  font-weight: 600;
  font-size: 14px;
}

.location-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.locate-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.locate-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.locate-btn.loading {
  animation: pulse 1s infinite;
}

/* Panneau de contrôle */
.control-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  pointer-events: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.count {
  color: rgba(255, 255, 255, 0.7);
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
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.filter-btn.active {
  background: #FF4775;
  color: white;
  border-color: #FF4775;
}

/* Contrôles */
.controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.control-btn.active {
  background: #06B6D4;
  color: white;
  border-color: #06B6D4;
}

/* Message de statut */
.status-message {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: auto;
}

.status-message.show {
  opacity: 1;
}

/* Popup */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.popup {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  max-width: 400px;
  width: 90%;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.voice-icon {
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
  color: white;
}

.voice-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.voice-info p {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.distance {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
}

.popup-actions {
  display: flex;
  gap: 12px;
}

.play-btn, .share-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn {
  background: #FF4775;
  color: white;
}

.play-btn:hover {
  background: #F10F47;
}

.share-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.share-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Marqueurs */
:deep(.voice-marker) {
  background: transparent;
  border: none;
  cursor: pointer;
}

:deep(.marker) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

:deep(.voice-marker:hover .marker) {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* Animations */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Responsive */
@media (max-width: 768px) {
  .header {
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
  
  .controls {
    gap: 6px;
  }
  
  .control-btn {
    padding: 8px 10px;
    font-size: 11px;
  }
}
</style> 