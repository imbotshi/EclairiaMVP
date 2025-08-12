<template>
  <div class="home-container">
    <!-- Header Component -->
    <AppHeader @tab-change="handleTabChange" />
    
    <!-- Main Content -->
    <main class="main-content">
      <!-- Radio Tab Content -->
      <div v-if="currentTab === 'Radio'" class="content-box">
        <!-- Siri-like Sphere Visualizer (source unique de l'état radio) -->
        <SiriSphere 
          @play-started="handlePlayStarted"
          @play-paused="handlePlayPaused"
          @audio-error="handleAudioError"
          @loading-state="handleLoadingState"
          @volume-changed="handleVolumeChanged"
          @next-station="handleNextStation"
          @previous-station="handlePreviousStation"
          @station-changed="s => (currentStation.value = s)"
          @double-tap="handleDoubleTap"
        />
        
        <!-- Topic Section avec données radio dynamiques -->
        <TopicSection 
          :currentStation="currentStation"
          :isPlaying="isPlaying"
          :isLoading="isLoading"
        />
      </div>
      
      <!-- Podcast Tab Content -->
      <div v-else-if="currentTab === 'Podcast'" class="podcast-tab-container">
        <div class="coming-soon">
          <h3>Podcast</h3>
          <p>Bientôt disponible !</p>
        </div>
      </div>
      
      <!-- Voice Tab Content -->
      <div v-else-if="currentTab === 'Voice'" class="voice-tab-container">
        <VoiceMapOpenStreet />
      </div>
      
      <!-- Audio Player - Outside the card with 12px gap -->
      <!-- <div class="audio-player-container">
        <AudioPlayer @delete="handleDeleteAudio" />
      </div> -->
    </main>
    
    <!-- Floating Action Button -->
    <FloatingActionButton @click="openRecordModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from './AppHeader.vue'
import TopicSection from './TopicSection.vue'
import SiriSphere from './SiriSphere.vue'
import AudioPlayer from './AudioPlayer.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import TooltipSystem from './TooltipSystem.vue'
import VoiceMapOpenStreet from './VoiceMapOpenStreet.vue'

// Emits
const emit = defineEmits(['open-record'])

// État UI local synchronisé via les événements de SiriSphere
const currentStation = ref(null)
const isPlaying = ref(false)
const isLoading = ref(false)

// Tab state
const currentTab = ref('Radio')
const activeTab = ref('Radio')

// Reactive state
const showTooltip = ref(false)
const tooltipText = ref('')
const tooltipPosition = ref({})

// Animation optimisée avec cleanup
let animationId = null

function animate() {
  // Logique d'animation optimisée
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  // Démarrer l'animation seulement si nécessaire
  animate()
})

onUnmounted(() => {
  // Cleanup de l'animation
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

// Fonctions optimisées sans console logs
function deleteAudio() {
  // Logique de suppression
  // Suppression du console.log
}

function playAudio() {
  if (currentStation.value) {
    // Logique de lecture
    // Suppression du console.log
  }
}

function pauseAudio() {
  // Logique de pause
  // Suppression du console.log
}

function handleAudioError(error) {
  // Gestion d'erreur sans console
  // Suppression du console.error
}

function loadStation() {
  // Logique de chargement
  // Suppression du console.log
}

function setVolume(volumePercent) {
  // Logique de volume
  // Suppression du console.log
}

function nextStation() {
  // Logique de station suivante
  // Suppression du console.log
}

function previousStation() {
  // Logique de station précédente
  // Suppression du console.log
}

function activateSpecialMode() {
  // Logique de mode spécial
  // Suppression du console.log
}

function selectTab(tab) {
  activeTab.value = tab
  // Suppression du console.log
}

function showTooltipFor(element, text) {
  const rect = element.getBoundingClientRect()
  tooltipPosition.value = {
    left: rect.left + rect.width / 2 + 'px',
    top: rect.top - 40 + 'px'
  }
  tooltipText.value = text
  showTooltip.value = true
  
  setTimeout(() => {
    showTooltip.value = false
  }, 3000)
}

function handleDeleteAudio() {
  // Logique pour supprimer l'audio
  }

function openRecordModal() {
  emit('open-record')
}

// === GESTIONNAIRES D'ÉVÉNEMENTS RADIO ===

function handlePlayStarted(station) {
  currentStation.value = station || currentStation.value
  isPlaying.value = true
  isLoading.value = false
  showTooltipFor(document.querySelector('.sphere-container'), `🎵 ${currentStation.value?.name}`)
}

function handlePlayPaused() {
  isPlaying.value = false
  isLoading.value = false
  showTooltipFor(document.querySelector('.sphere-container'), '⏸️ En pause')
}

function handleLoadingState(isLoadingState) {
  isLoading.value = !!isLoadingState
  if (isLoading.value) {
    showTooltipFor(document.querySelector('.sphere-container'), '🔄 Connexion...')
  }
}

function handleVolumeChanged(newVolume) {
  const volumePercent = Math.round(newVolume * 100)
  showTooltipFor(document.querySelector('.sphere-container'), `🔊 ${volumePercent}%`)
}

function handleNextStation() {
  showTooltipFor(document.querySelector('.sphere-container'), `➡️ ${currentStation.value?.name}`)
}

function handlePreviousStation() {
  showTooltipFor(document.querySelector('.sphere-container'), `⬅️ ${currentStation.value?.name}`)
}

function handleDoubleTap() {
  showTooltipFor(document.querySelector('.sphere-container'), '✨ Mode spécial')
}

function handleTabChange(tab) {
  currentTab.value = tab
  }

</script>

<style scoped>
/* Main Container */
.home-container {
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #09174C 0%, #1a2b5c 50%, #2d4a8a 100%);
  color: #F1EDE1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 2rem;
  /* Ajouter padding-bottom pour éviter que le contenu soit caché par le FAB */
  padding-bottom: 6rem;
  min-height: 0;
  margin-top: 1rem;
}

/* Content Box */
.content-box {
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Audio Player Container */
.audio-player-container {
  margin-top: 12px;
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 480px) {
  .home-container {
    height: 100vh;
    min-height: 100vh;
  }
  
  .main-content {
    flex: 1;
    padding: 1rem;
    padding-bottom: 5rem; /* Moins d'espace sur mobile */
    justify-content: flex-start;
    margin-top: 0.5rem;
  }
  
  .voice-tab-container {
    margin: -1rem;
    padding: 0;
  }
  
  .content-box {
    padding: 1.5rem;
  }
}

  
  .voice-tab-container {
    margin: -1rem;
    padding: 0;
  }
/* Podcast Content Styles */
.podcast-content {
  text-align: center;
  padding: 2rem 1rem;
}

.podcast-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.podcast-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #F1EDE1;
}

.podcast-description {
  color: #868276;
  line-height: 1.6;
  margin-bottom: 2rem;
}

/* Podcast Tab Container */
.podcast-tab-container {
  flex: 1;
  position: relative;
  overflow: hidden;

/* Voice Tab Container */
.voice-tab-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 0;
  background: transparent;
  width: 100%;
  height: 100%;
  margin: -2rem -1rem;
  padding: 0;
}
  border-radius: 0;
  background: transparent;
  width: 100%;
  height: 100%;
  margin: -2rem -1rem;
  padding: 0;
}

/* Voice Tab Container */
.voice-tab-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 0;
  background: transparent;
  width: 100%;
  height: 100%;
  margin: -2rem -1rem;
  padding: 0;
}

/* Voice Content Styles */
.voice-content {
  text-align: center;
  padding: 2rem 1rem;
}

.voice-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.voice-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #F1EDE1;
}

.voice-description {
  color: #868276;
  line-height: 1.6;
  margin-bottom: 2rem;
}

/* Coming Soon Badge */
.coming-soon {
  display: inline-block;
  background: linear-gradient(135deg, #FF4775, #F10F47);
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.3);
}

.coming-soon-text {
  color: #F1EDE1;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Animations */
@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>
