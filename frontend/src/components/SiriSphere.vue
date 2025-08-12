<template>
  <div class="sphere-container" 
       @click="handleSphereClick"
       @touchstart="handleTouchStart"
       @touchend="handleTouchEnd">
    <canvas ref="canvas" class="sphere-canvas"></canvas>
    
    <!-- Élément audio caché contrôlé par la sphère -->
    <audio 
      ref="audioElement"
      @loadstart="handleLoadStart"
      @canplay="handleCanPlay"
      @play="handlePlay"
      @pause="handlePause"
      @error="handleAudioError"
      crossorigin="anonymous"
      style="display: none;">
    </audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { useRadio } from '../composables/useRadio.js'

const canvas = ref(null)
const audioElement = ref(null)

// Utiliser le composable radio (logique copiée de radio-test)
const {
  stations,
  currentStation,
  validationResults,
  isPlaying,
  isLoading,
  volume,
  error,
  loadStations,
  validateAllStations,
  selectStation,
  playAudio,
  pauseAudio,
  setVolume,
  nextStation,
  previousStation,
  setupAudioEventListeners,
  logToResults
} = useRadio()

// État audio réactif (compatible avec l'ancien code)
const audioState = ref({
  get isPlaying() { return isPlaying.value },
  get currentStation() { return currentStation.value },
  get volume() { return volume.value },
  get isLoading() { return isLoading.value },
  get error() { return error.value }
})

// Variables Three.js
let scene, camera, renderer, sphere, material, analyser, dataArray

// Cleanup des timers et animations
let animationId = null
let touchStartTime = 0
let isLongPress = false
let volumeControlActive = false
let initialTouchY = 0
let initialTouchX = 0
let volumeControlTimeout = null
let swipeStartTime = 0
let lastTapTime = 0
let tapCount = 0

// Props pour recevoir les données
const props = defineProps({
  stations: {
    type: Array,
    default: () => []
  },
  currentStationId: {
    type: String,
    default: null
  },
  autoPlay: {
    type: Boolean,
    default: false
  }
})

// Emits pour communiquer avec le parent
const emit = defineEmits([
  'play-started',
  'play-paused', 
  'station-changed',
  'audio-error',
  'loading-state',
  'volume-changed',
  'next-station',
  'previous-station',
  'double-tap'
])

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  uniform float amplitude;
  void main() {
    vUv = uv;
    vec3 newPosition = position + normal * amplitude * 0.3;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

// Fragment Shader avec états audio avancés
const fragmentShader = `
  uniform float time;
  uniform float audioState; // 0.0 = pause, 1.0 = play, 0.5 = loading, 0.3 = volume, 0.8 = special
  uniform float volume; // Volume pour effets visuels
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float wave = sin(uv.x * 10.0 + time) * 0.05;
    uv.y += wave;

    // Couleurs selon l'état audio
    vec3 pauseColor = vec3(0.3, 0.3, 0.8);     // Bleu calme
    vec3 playColor = vec3(0.0, 1.0, 0.5);      // Vert actif
    vec3 loadColor = vec3(1.0, 0.5, 0.0);      // Orange loading
    vec3 volumeColor = vec3(0.8, 0.2, 0.8);    // Magenta volume
    vec3 specialColor = vec3(1.0, 0.8, 0.0);   // Or spécial
    
    vec3 baseColor;
    if (audioState < 0.15) {
      baseColor = pauseColor;
    } else if (audioState < 0.35) {
      baseColor = volumeColor;
    } else if (audioState < 0.65) {
      baseColor = loadColor;
    } else if (audioState < 0.85) {
      baseColor = specialColor;
    } else {
      baseColor = playColor;
    }
    
    // Appliquer le dégradé avec effet volume
    vec3 color = mix(baseColor * 0.7, baseColor, uv.x);
    color = mix(color, baseColor * (1.0 + volume * 0.5), uv.y);

    // Pulsation selon l'état et volume
    float pulseSpeed = audioState > 0.75 ? 3.0 : (audioState > 0.25 ? 2.0 : 1.5);
    float pulse = 0.5 + 0.5 * sin(time * pulseSpeed);
    
    // Intensité basée sur le volume
    float intensity = 0.8 + pulse * (0.2 + volume * 0.3);
    color *= intensity;

    gl_FragColor = vec4(color, 1.0);
  }
`

function initThreeJS() {
  // Scene
  scene = new THREE.Scene()

  // Camera
  const container = canvas.value.parentElement
  const aspect = container.clientWidth / container.clientHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
  camera.position.z = 4

  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvas.value,
    antialias: true,
    alpha: true
  })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x000000, 0)

  // Sphere Geometry
  const geometry = new THREE.SphereGeometry(1, 128, 128)

  // Shader Material avec uniforms audio
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      amplitude: { value: 0 },
      audioState: { value: 0.0 }, // 0.0 = pause, 1.0 = play, 0.5 = loading, 0.3 = volume, 0.8 = special
      volume: { value: 0.8 } // Volume pour effets visuels
    },
    side: THREE.DoubleSide
  })

  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  // Glow
  const glowGeometry = new THREE.SphereGeometry(1.2, 64, 64)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x8a2be2,
    transparent: true,
    opacity: 0.3
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  scene.add(glow)

  // Particules flottantes
  const particleCount = 2000
  const particlesGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    transparent: true,
    opacity: 0.6
  })
  const particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)
}



// Animation optimisée avec cleanup
function animate() {
  if (!material) return
  
  const time = Date.now() * 0.001
  material.uniforms.time.value = time
  
  // Optimisation : réduire la fréquence de rendu si pas d'interaction
  if (isPlaying.value || volumeControlActive) {
  renderer.render(scene, camera)
  }
  
  animationId = requestAnimationFrame(animate)
}

function handleResize() {
  const container = canvas.value.parentElement
  const aspect = container.clientWidth / container.clientHeight
  
  camera.aspect = aspect
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

// === FONCTIONS AUDIO (LOGIQUE RADIO-TEST) ===

// Charger la station actuelle (utilise la logique radio-test)
function loadCurrentStation() {
  const station = stations.value.find(s => s.id === props.currentStationId)
  if (station) {
    selectStation(station)
    updateShaderUniforms()
    emit('station-changed', currentStation.value)
  }
}

// Lecture audio (utilise la logique radio-test)
async function playAudioRadio() {
  try {
    await playAudio(audioElement.value)
    updateShaderUniforms()
    emit('play-started', currentStation.value)
  } catch (error) {
    updateShaderUniforms()
    emit('audio-error', error.message)
  }
}

// Pause audio (utilise la logique radio-test)
function pauseAudioRadio() {
  pauseAudio(audioElement.value)
  updateShaderUniforms()
  emit('play-paused')
}

// Mettre à jour les uniforms des shaders
function updateShaderUniforms() {
  if (!material) return

  // État visuel selon l'état audio
  if (audioState.value.isPlaying) {
    material.uniforms.audioState.value = 1.0 // Vert actif
    material.uniforms.amplitude.value = 0.5
  } else if (audioState.value.isLoading) {
    material.uniforms.audioState.value = 0.5 // Orange loading
    material.uniforms.amplitude.value = 0.3
  } else {
    material.uniforms.audioState.value = 0.0 // Bleu pause
    material.uniforms.amplitude.value = 0.1
  }
  
  // Mettre à jour l'uniform volume
  material.uniforms.volume.value = audioState.value.volume
}

// === GESTIONNAIRES D'ÉVÉNEMENTS AUDIO (RADIO-TEST) ===
// Ces gestionnaires sont maintenant gérés par le composable useRadio
// mais on garde les émissions pour la compatibilité

function handleLoadStart() {
  updateShaderUniforms()
  emit('loading-state', true)
}

function handleCanPlay() {
  updateShaderUniforms()
  emit('loading-state', false)
}

function handlePlay() {
  updateShaderUniforms()
  emit('play-started', currentStation.value)
}

function handlePause() {
  updateShaderUniforms()
  emit('play-paused')
}

function handleAudioError(event) {
  updateShaderUniforms()
  emit('audio-error', 'Impossible de lire cette station')
}

// === GESTIONNAIRES D'ÉVÉNEMENTS TACTILES ===

// Gestionnaire principal de clic (logique radio-test)
async function handleSphereClick() {
  logToResults('🎯 Sphère cliquée', 'info')
  if (isLoading.value) {
    // Ignorer les clics pendant le chargement
    return
  }
  
  try {
    if (isPlaying.value) {
      pauseAudioRadio()
    } else {
      await playAudioRadio()
    }
  } catch (error) {
    logToResults(`Erreur lors du clic: ${error.message}`, 'error')
  }
}

// Gestionnaire de tap (simple/double)
function handleTapGesture() {
  const currentTime = Date.now()
  const timeSinceLastTap = currentTime - lastTapTime
  
  if (timeSinceLastTap < 300) {
    // Double tap détecté
    tapCount = 0
    lastTapTime = 0
    // Suppression du console.log
    emit('double-tap')
    
    // Action spéciale : basculer entre stations favorites
    handleDoubleTapAction()
  } else {
    // Premier tap ou tap simple
    tapCount = 1
    lastTapTime = currentTime
    
    // Attendre 300ms pour voir s'il y a un deuxième tap
    setTimeout(() => {
      if (tapCount === 1 && Date.now() - lastTapTime >= 300) {
        // Tap simple confirmé
        // Suppression du console.log
        handleSphereClick()
        tapCount = 0
        lastTapTime = 0
      }
    }, 300)
  }
}

// Action spéciale pour double tap
function handleDoubleTapAction() {
  // Exemple : basculer le mode aléatoire ou favoris
  // Suppression du console.log
  
  // Effet visuel spécial
  if (sphere) {
    // Animation de "flash"
    sphere.scale.setScalar(1.3)
    setTimeout(() => {
      if (sphere) sphere.scale.setScalar(1.0)
    }, 200)
  }
  
  // Changer temporairement la couleur
  if (material) {
    const originalState = material.uniforms.audioState.value
    material.uniforms.audioState.value = 0.8 // Couleur spéciale
    setTimeout(() => {
      if (material) material.uniforms.audioState.value = originalState
    }, 500)
  }
}

// Gestionnaire de contrôle volume
function handleVolumeControl(event) {
  if (!volumeControlActive || !event.touches || !event.touches[0]) return
  
  event.preventDefault()
  const currentY = event.touches[0].clientY
  const deltaY = initialTouchY - currentY // Inversé : haut = augmenter
  const sensitivity = 200 // Pixels pour aller de 0 à 100%
  
  const volumeChange = deltaY / sensitivity
  const newVolume = Math.max(0, Math.min(1, audioState.value.volume + volumeChange))
  
  setVolumeRadio(newVolume)
  initialTouchY = currentY // Mise à jour pour le mouvement continu
}

// Fonction pour définir le volume (logique radio-test)
function setVolumeRadio(newVolume) {
  setVolume(newVolume, audioElement.value)
  
  // Feedback visuel du volume via l'amplitude
  if (material) {
    material.uniforms.amplitude.value = 0.2 + (volume.value * 0.4) // 0.2 à 0.6
  }
  
  emit('volume-changed', volume.value)
}

// Gestion des événements optimisée
function handleTouchStart(event) {
  touchStartTime = Date.now()
  isLongPress = false
  initialTouchY = event.touches[0].clientY
  initialTouchX = event.touches[0].clientX
  
  // Timer pour long press avec cleanup
  volumeControlTimeout = setTimeout(() => {
    isLongPress = true
    volumeControlActive = true
    // Suppression du console.log
  }, 500)
}

function handleTouchEnd(event) {
  const touchDuration = Date.now() - touchStartTime
  
  if (volumeControlTimeout) {
    clearTimeout(volumeControlTimeout)
    volumeControlTimeout = null
  }
  
  if (isLongPress) {
    volumeControlActive = false
    // Suppression du console.log
    return
  }
  
  // Gestion des taps
  const currentTime = Date.now()
  if (currentTime - lastTapTime < 300) {
    tapCount++
    if (tapCount === 2) {
      // Double tap
      // Suppression du console.log
      emit('double-tap')
      tapCount = 0
    }
  } else {
    tapCount = 1
  }
  lastTapTime = currentTime
  
  // Tap simple
  // Suppression du console.log
}

// Watcher pour les changements de station (logique radio-test)
watch(() => props.currentStationId, (newStationId) => {
  if (newStationId && stations.value.length > 0) {
    loadCurrentStation()
  }
})

watch(() => props.stations, (newStations) => {
  if (newStations.length > 0 && props.currentStationId) {
    loadCurrentStation()
  }
})

onMounted(async () => {
  // Initialiser Three.js
  initThreeJS()
  animate()
  window.addEventListener('resize', handleResize)
  
  // Configurer les événements audio (logique radio-test)
  if (audioElement.value) {
    setupAudioEventListeners(audioElement.value)
  }
  
  // Charger les stations depuis l'API radio-test
  try {
    await loadStations()
    logToResults(`✅ ${stations.value.length} stations chargées depuis radio-test`, 'success')
    
    // Valider toutes les stations (optionnel)
    if (stations.value.length > 0) {
      logToResults('🔍 Validation des stations en arrière-plan...', 'info')
      validateAllStations().then(() => {
        logToResults('✅ Validation des stations terminée', 'success')
      })
    }
    
    // Charger la station initiale si spécifiée
    if (props.currentStationId) {
      loadCurrentStation()
    } else if (stations.value.length > 0) {
      // Sélectionner la première station par défaut
      selectStation(stations.value[0])
      logToResults(`🎵 Station par défaut: ${stations.value[0].name}`, 'info')
    }
    
  } catch (error) {
    logToResults(`❌ Erreur de chargement des stations: ${error.message}`, 'error')
  }
})

onUnmounted(() => {
  // Cleanup complet
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (volumeControlTimeout) {
    clearTimeout(volumeControlTimeout)
  }
  
  // Cleanup Three.js
  if (renderer) {
    renderer.dispose()
  }
  if (scene) {
    scene.clear()
  }
  
  // Nettoyer les timeouts
  if (volumeControlTimeout) {
    clearTimeout(volumeControlTimeout)
  }
  
  // Arrêter l'audio
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
  }
  
  // Nettoyer Three.js
  if (renderer) {
    renderer.dispose()
  }
  if (material) {
    material.dispose()
  }
})
</script>

<style scoped>
.sphere-container {
  width: 250px;
  height: 250px;
  position: relative;
  margin: 2rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: cosmic-pulse 3s ease-in-out infinite;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sphere-container:hover {
  transform: scale(1.05);
  animation-play-state: paused;
}

.sphere-container::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border: 2px solid rgba(138, 43, 226, 0.3);
  border-radius: 50%;
  animation: ripple-expand 2s ease-out infinite;
  pointer-events: none;
}

.sphere-container::after {
  content: '';
  position: absolute;
  top: -40px;
  left: -40px;
  right: -40px;
  bottom: -40px;
  border: 1px solid rgba(255, 20, 147, 0.2);
  border-radius: 50%;
  animation: ripple-expand 2s ease-out infinite 0.5s;
  pointer-events: none;
}

.sphere-canvas {
  width: 100% !important;
  height: 100% !important;
  border-radius: 50%;
}

.audio-prompt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.audio-btn {
  padding: 12px 24px;
  font-size: 16px;
  background: rgba(30, 30, 30, 0.9);
  color: white;
  border: 1px solid #444;
  border-radius: 8px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.audio-btn:hover {
  background: rgba(50, 50, 50, 0.9);
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 480px) {
  .sphere-container {
    width: 200px;
    height: 200px;
  }
}
</style>
