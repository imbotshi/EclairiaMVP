<template>
  <div class="voice-map-3d">
    <!-- Carte Mapbox avec overlay 3D -->
    <div id="map-3d" class="map-container"></div>
    
    <!-- Canvas Three.js pour les marqueurs 3D -->
    <canvas id="three-canvas" class="three-overlay"></canvas>
    
    <!-- Interface glassmorphism moderne -->
    <div class="ui-overlay">
      <!-- Header avec géolocalisation -->
      <div class="glass-header">
        <div class="location-card">
          <div class="location-icon">📍</div>
          <div class="location-info">
            <div class="current-location">{{ currentLocation }}</div>
            <div class="location-status">{{ locationStatus }}</div>
          </div>
        </div>
        <button 
          class="locate-button" 
          @click="locateUser" 
          :class="{ locating: isLocating }"
        >
          <div class="locate-icon">🎯</div>
        </button>
      </div>

      <!-- Panneau de contrôle glassmorphism -->
      <div class="glass-panel">
        <div class="panel-header">
          <h3>Voice Notes 3D</h3>
          <div class="voice-count">{{ activeVoiceNotes.length }} trouvées</div>
        </div>
        
        <!-- Filtres modernes -->
        <div class="filters-grid">
          <button 
            v-for="filter in voiceFilters" 
            :key="filter.type"
            @click="toggleFilter(filter.type)"
            class="filter-chip"
            :class="{ active: activeFilters.includes(filter.type) }"
          >
            <div class="filter-icon">{{ filter.icon }}</div>
            <span>{{ filter.label }}</span>
          </button>
        </div>

        <!-- Contrôles audio -->
        <div class="audio-controls">
          <button @click="toggleSpatialAudio" class="audio-btn" :class="{ active: spatialAudioEnabled }">
            {{ spatialAudioEnabled ? '🔊' : '🔇' }} Audio Spatial
          </button>
          <button @click="toggleAutoZoom" class="audio-btn" :class="{ active: autoZoomEnabled }">
            {{ autoZoomEnabled ? '🎯' : '📍' }} Zoom Auto
          </button>
        </div>
      </div>

      <!-- Indicateur de statut moderne -->
      <div class="status-toast" :class="[statusType, { show: showStatus }]">
        <div class="status-icon">{{ statusIcon }}</div>
        <div class="status-text">{{ statusText }}</div>
      </div>
    </div>

    <!-- Popup moderne -->
    <div v-if="selectedVoiceNote" class="modern-popup" @click="closePopup">
      <div class="popup-card" @click.stop>
        <div class="popup-header">
          <div class="voice-badge" :style="{ backgroundColor: selectedVoiceNote.color }">
            {{ selectedVoiceNote.icon }}
          </div>
          <div class="voice-details">
            <h4>{{ selectedVoiceNote.title }}</h4>
            <p>{{ selectedVoiceNote.location }}</p>
            <div class="distance-info">
              <span>Distance: {{ selectedVoiceNote.distance }}m</span>
            </div>
          </div>
          <button @click="closePopup" class="close-button">✕</button>
        </div>
        <div class="popup-actions">
          <button @click="playVoiceNote" class="action-button primary">
            {{ isPlaying ? '⏸️ Pause' : '▶️ Écouter' }}
          </button>
          <button @click="shareVoiceNote" class="action-button secondary">
            📤 Partager
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import * as THREE from 'three'
import { MAPBOX_CONFIG, initMapbox, getTimeBasedStyle, calculateDistance } from '../config/mapbox.js'

// Configuration Mapbox
mapboxgl.accessToken = MAPBOX_CONFIG.accessToken

// État de la carte
const map = ref(null)
const currentLocation = ref('Localisation...')
const locationStatus = ref('En cours de localisation')
const isLocating = ref(false)

// État des voice notes
const activeVoiceNotes = ref([])
const selectedVoiceNote = ref(null)
const isPlaying = ref(false)

// État des fonctionnalités
const spatialAudioEnabled = ref(true)
const autoZoomEnabled = ref(true)

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
const statusText = ref('Carte 3D chargée')
const statusIcon = ref('🗺️')
const showStatus = ref(false)

// Three.js
const scene = ref(null)
const camera = ref(null)
const renderer = ref(null)
const markers = ref([])
const userPosition = ref(null)

// Audio spatial
const audioContext = ref(null)

// Méthodes de géolocalisation
const locateUser = async () => {
  isLocating.value = true
  showStatusMessage('Localisation en cours...', '🎯', 'loading')

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
      // Animation de vol vers la position utilisateur
      map.value.flyTo({
        center: [longitude, latitude],
        zoom: 16,
        duration: MAPBOX_CONFIG.animation.duration,
        curve: MAPBOX_CONFIG.animation.curve,
        easing: MAPBOX_CONFIG.animation.easing
      })
    }
    
    currentLocation.value = 'Votre position'
    locationStatus.value = 'Localisé'
    showStatusMessage('Position trouvée', '✅', 'success')

    // Générer des voice notes autour de la position
    generateVoiceNotesAround(latitude, longitude)
  } catch (error) {
    console.error('Erreur de géolocalisation:', error)
    showStatusMessage('Erreur de localisation', '❌', 'error')
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
    
    // Calculer la distance
    const distance = userPosition.value ? 
      calculateDistance(userPosition.value[0], userPosition.value[1], position[0], position[1]) * 1000 : 0
    
    voiceNotes.push({
      id: `voice-${Date.now()}-${i}`,
      title: `Voice Note ${i + 1}`,
      location: `Point d'intérêt ${i + 1}`,
      type: type.id,
      color: type.color,
      icon: type.icon,
      position: [position[1], position[0]], // Mapbox utilise [lng, lat]
      audioUrl: `/audio/sample-${i + 1}.mp3`,
      duration: 30 + Math.floor(Math.random() * 120),
      distance: Math.round(distance)
    })
  }
  
  activeVoiceNotes.value = voiceNotes
  addVoiceNotesToMap(voiceNotes)
  
  // Zoom automatique sur la plus proche si activé
  if (autoZoomEnabled.value && voiceNotes.length > 0) {
    const closest = voiceNotes.reduce((prev, curr) => 
      prev.distance < curr.distance ? prev : curr
    )
    setTimeout(() => zoomToVoiceNote(closest), 1000)
  }
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

// Initialisation Three.js
const initThreeJS = () => {
  const canvas = document.getElementById('three-canvas')
  const rect = canvas.getBoundingClientRect()
  
  // Scene
  scene.value = new THREE.Scene()
  
  // Camera
  camera.value = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000)
  camera.value.position.set(0, 0, 5)
  
  // Renderer
  renderer.value = new THREE.WebGLRenderer({ 
    canvas, 
    alpha: true, 
    antialias: true 
  })
  renderer.value.setSize(rect.width, rect.height)
  renderer.value.setClearColor(0x000000, 0)
  
  // Éclairage
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.value.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  scene.value.add(directionalLight)
  
  // Animation loop
  animate()
}

// Animation Three.js
const animate = () => {
  requestAnimationFrame(animate)
  
  // Animer les marqueurs
  markers.value.forEach(marker => {
    if (marker.mesh) {
      marker.mesh.rotation.y += 0.01
      marker.mesh.position.y = Math.sin(Date.now() * 0.003 + marker.id) * 0.1
    }
  })
  
  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value)
  }
}

// Ajout des voice notes à la carte avec marqueurs 3D
const addVoiceNotesToMap = (voiceNotes) => {
  if (!map.value || !scene.value) return
  
  // Nettoyer les marqueurs existants
  clearMarkers()
  
  voiceNotes.forEach(note => {
    // Créer le marqueur 3D
    create3DMarker(note)
    
    // Ajouter l'événement de clic sur la carte
    const markerElement = document.createElement('div')
    markerElement.className = 'voice-note-marker-3d'
    markerElement.innerHTML = `
      <div class="marker-container">
        <div class="marker-pulse"></div>
        <div class="marker-icon" style="background-color: ${note.color}">
          ${note.icon}
        </div>
      </div>
    `
    
    markerElement.addEventListener('click', () => {
      selectedVoiceNote.value = note
      if (spatialAudioEnabled.value) {
        playSpatialAudio(note)
      }
    })
    
    // Créer le marqueur Mapbox
    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat(note.position)
      .addTo(map.value)
  })
}

// Créer un marqueur 3D
const create3DMarker = (note) => {
  if (!scene.value) return
  
  // Géométrie du marqueur
  const geometry = new THREE.SphereGeometry(0.1, 16, 16)
  
  // Matériau avec couleur
  const material = new THREE.MeshPhongMaterial({ 
    color: note.color,
    transparent: true,
    opacity: 0.8,
    shininess: 100
  })
  
  // Mesh
  const mesh = new THREE.Mesh(geometry, material)
  
  // Positionner le marqueur
  const mapboxCoords = note.position
  const worldCoords = mapboxgl.MercatorCoordinate.fromLngLat(mapboxCoords)
  mesh.position.set(worldCoords.x, worldCoords.y, 0.1)
  
  // Ajouter au scene
  scene.value.add(mesh)
  
  // Stocker la référence
  markers.value.push({
    id: note.id,
    mesh,
    note
  })
}

// Nettoyer les marqueurs
const clearMarkers = () => {
  markers.value.forEach(marker => {
    if (marker.mesh && scene.value) {
      scene.value.remove(marker.mesh)
      marker.mesh.geometry.dispose()
      marker.mesh.material.dispose()
    }
  })
  markers.value = []
}

// Zoom vers une voice note
const zoomToVoiceNote = (voiceNote) => {
  if (!map.value) return
  
  map.value.flyTo({
    center: voiceNote.position,
    zoom: 18,
    duration: MAPBOX_CONFIG.animation.duration,
    curve: MAPBOX_CONFIG.animation.curve,
    easing: MAPBOX_CONFIG.animation.easing
  })
  
  showStatusMessage(`Zoom sur ${voiceNote.title}`, '🎯', 'success')
}

// Audio spatial
const initSpatialAudio = () => {
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
  }
}

const playSpatialAudio = (voiceNote) => {
  if (!spatialAudioEnabled.value || !audioContext.value) return
  
  // Créer un panner pour l'audio spatial
  const panner = audioContext.value.createPanner()
  panner.setDistanceModel('inverse')
  panner.setMaxDistance(1000)
  panner.setRefDistance(1)
  panner.setRolloffFactor(1)
  
  // Calculer la position relative
  if (userPosition.value) {
    const distance = voiceNote.distance
    const direction = calculateDirection(userPosition.value, [voiceNote.position[1], voiceNote.position[0]])
    
    panner.setPosition(direction.x, direction.y, direction.z)
  }
  
  // Simuler l'audio (remplacer par un vrai fichier audio)
  const oscillator = audioContext.value.createOscillator()
  const gainNode = audioContext.value.createGain()
  
  oscillator.frequency.setValueAtTime(440, audioContext.value.currentTime)
  oscillator.type = 'sine'
  
  gainNode.gain.setValueAtTime(0.1, audioContext.value.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 2)
  
  oscillator.connect(gainNode)
  gainNode.connect(panner)
  panner.connect(audioContext.value.destination)
  
  oscillator.start()
  oscillator.stop(audioContext.value.currentTime + 2)
  
  showStatusMessage(`Audio spatial: ${voiceNote.title}`, '🔊', 'success')
}

// Calculer la direction pour l'audio spatial
const calculateDirection = (userPos, voicePos) => {
  const dx = voicePos[1] - userPos[1]
  const dy = voicePos[0] - userPos[0]
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  return {
    x: dx / distance,
    y: dy / distance,
    z: 0
  }
}

// Contrôles audio
const playVoiceNote = () => {
  if (!selectedVoiceNote.value) return
  
  isPlaying.value = !isPlaying.value
  
  if (isPlaying.value) {
    if (spatialAudioEnabled.value) {
      playSpatialAudio(selectedVoiceNote.value)
    }
    showStatusMessage('Lecture en cours...', '▶️', 'success')
  } else {
    showStatusMessage('Lecture en pause', '⏸️', 'info')
  }
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
  if (map.value && userPosition.value) {
    generateVoiceNotesAround(userPosition.value[0], userPosition.value[1])
  }
}

// Contrôles des fonctionnalités
const toggleSpatialAudio = () => {
  spatialAudioEnabled.value = !spatialAudioEnabled.value
  if (spatialAudioEnabled.value) {
    initSpatialAudio()
    showStatusMessage('Audio spatial activé', '🔊', 'success')
  } else {
    showStatusMessage('Audio spatial désactivé', '🔇', 'info')
  }
}

const toggleAutoZoom = () => {
  autoZoomEnabled.value = !autoZoomEnabled.value
  showStatusMessage(
    autoZoomEnabled.value ? 'Zoom automatique activé' : 'Zoom automatique désactivé',
    autoZoomEnabled.value ? '🎯' : '📍',
    'info'
  )
}

// Utilitaires
const closePopup = () => {
  selectedVoiceNote.value = null
  isPlaying.value = false
}

const shareVoiceNote = () => {
  showStatusMessage('Voice note partagée', '📤', 'success')
}

// Gestion des messages de statut
const showStatusMessage = (text, icon, type) => {
  statusText.value = text
  statusIcon.value = icon
  statusType.value = type
  showStatus.value = true
  
  setTimeout(() => {
    showStatus.value = false
  }, 3000)
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  
  // Initialiser la carte Mapbox
  map.value = new mapboxgl.Map({
    container: 'map-3d',
    style: getTimeBasedStyle(),
    center: MAPBOX_CONFIG.default.center,
    zoom: MAPBOX_CONFIG.default.zoom,
    pitch: MAPBOX_CONFIG.default.pitch,
    bearing: MAPBOX_CONFIG.default.bearing,
    antialias: MAPBOX_CONFIG.default.antialias,
    minZoom: MAPBOX_CONFIG.zoom.min,
    maxZoom: MAPBOX_CONFIG.zoom.max
  })

  // Ajouter les contrôles de navigation
  map.value.addControl(new mapboxgl.NavigationControl(), 'top-right')
  
  // Attendre que la carte soit chargée
  map.value.on('load', () => {
    showStatusMessage('Carte 3D chargée', '🗺️', 'success')
    
    // Initialiser Three.js
    initThreeJS()
    
    // Initialiser l'audio spatial
    initSpatialAudio()
    
    // Localiser l'utilisateur automatiquement
    setTimeout(locateUser, 1000)
  })
  
  // Gérer les erreurs de chargement
  map.value.on('error', (e) => {
    console.error('Erreur de chargement de la carte:', e)
    showStatusMessage('Erreur de chargement', '❌', 'error')
  })
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
  
  // Nettoyer Three.js
  if (renderer.value) {
    renderer.value.dispose()
  }
  
  if (scene.value) {
    scene.value.clear()
  }
  
  // Fermer l'audio context
  if (audioContext.value) {
    audioContext.value.close()
  }
})
</script>

<style scoped>
/* Container principal */
.voice-map-3d {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #09174C 0%, #1a2b5c 50%, #2d4a8a 100%);
  overflow: hidden;
}

/* Carte Mapbox */
.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Canvas Three.js */
.three-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
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

/* Header glassmorphism */
.glass-header {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: auto;
}

.location-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.location-icon {
  font-size: 20px;
}

.location-info {
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

.locate-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.locate-button:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.locate-button.locating {
  animation: pulse 1s infinite;
}

.locate-icon {
  font-size: 20px;
}

/* Panneau glassmorphism */
.glass-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  pointer-events: auto;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
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

/* Filtres modernes */
.filters-grid {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-chip {
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #F1EDE1;
  transform: translateY(-1px);
}

.filter-chip.active {
  background: #FF4775;
  color: white;
  border-color: #FF4775;
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.3);
}

.filter-icon {
  font-size: 14px;
}

/* Contrôles audio */
.audio-controls {
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.audio-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(241, 237, 225, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.audio-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #F1EDE1;
  transform: translateY(-1px);
}

.audio-btn.active {
  background: #06B6D4;
  color: white;
  border-color: #06B6D4;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

/* Toast de statut moderne */
.status-toast {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #F1EDE1;
  font-size: 14px;
  pointer-events: auto;
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.status-toast.success {
  background: rgba(17, 197, 77, 0.2);
  border-color: rgba(17, 197, 77, 0.3);
}

.status-toast.error {
  background: rgba(255, 71, 117, 0.2);
  border-color: rgba(255, 71, 117, 0.3);
}

.status-toast.loading {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.3);
}

/* Popup moderne */
.modern-popup {
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

.popup-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s ease;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.voice-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.voice-details {
  flex: 1;
}

.voice-details h4 {
  color: #F1EDE1;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.voice-details p {
  color: rgba(241, 237, 225, 0.7);
  font-size: 14px;
  margin: 0 0 4px 0;
}

.distance-info {
  font-size: 12px;
  color: rgba(241, 237, 225, 0.6);
}

.close-button {
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

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.popup-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button.primary {
  background: #FF4775;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.3);
}

.action-button.primary:hover {
  background: #F10F47;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 71, 117, 0.4);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #F1EDE1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Marqueurs de voice notes 3D */
:deep(.voice-note-marker-3d) {
  background: transparent;
  border: none;
  cursor: pointer;
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
  transition: all 0.3s ease;
}

:deep(.voice-note-marker-3d:hover .marker-icon) {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
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
  .glass-header {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .glass-panel {
    bottom: 10px;
    left: 10px;
    right: 10px;
    padding: 16px;
  }
  
  .filters-grid {
    gap: 6px;
  }
  
  .filter-chip {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  .audio-controls {
    gap: 6px;
  }
  
  .audio-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}
</style> 