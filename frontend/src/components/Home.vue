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
        <PodcastTab />
      </div>
      
      <!-- Voice Tab Content -->
      <div v-else-if="currentTab === 'Voice'" class="voice-tab-container">
        <VoiceMapOpenStreet />
      </div>
      
      <!-- Audio Player - Outside the card with 12px gap -->
      <!-- <div class="audio-player-container">
        <AudioPlayer @delete="handleDeleteAudio" />
      </div> -->

      <!-- Floating Action Button -->
      <FloatingActionButton @click="$emit('open-record')" />
    </main>
    
    <!-- Tooltip System -->
    <TooltipSystem 
      v-if="showTooltip" 
      :text="tooltipText" 
      :position="tooltipPosition" 
    />
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
import VoiceMap from './VoiceMap.vue'
import VoiceMapModern from './VoiceMapModern.vue'
import VoiceMap3D from './VoiceMap3D.vue'
import VoiceMapAdvanced from './VoiceMapAdvanced.vue'
import VoiceMapSimple from './VoiceMapSimple.vue'
import VoiceMapOpenStreet from './VoiceMapOpenStreet.vue'
import PodcastTab from './PodcastTab.vue'

// Emits
const emit = defineEmits(['open-record'])

// État UI local synchronisé via les événements de SiriSphere
const currentStation = ref(null)
const isPlaying = ref(false)
const isLoading = ref(false)

// Tab state
const currentTab = ref('Radio')

// Reactive state
const showTooltip = ref(false)
const tooltipText = ref('')
const tooltipPosition = ref({})

// Animation management
let animationId = null

// Lifecycle hooks
onMounted(async () => {
  initializeAnimations()
})

onUnmounted(() => {
  cleanupAnimations()
})

// Methods
function initializeAnimations() {
  startVisualizerAnimation()
}

function cleanupAnimations() {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
}

function startVisualizerAnimation() {
  const animate = () => {
    // Animation logic here
    animationId = requestAnimationFrame(animate)
  }
  animate()
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
  console.log('Audio supprimé')
}

// === GESTIONNAIRES D'ÉVÉNEMENTS RADIO ===

function handlePlayStarted(station) {
  currentStation.value = station || currentStation.value
  isPlaying.value = true
  isLoading.value = false
  console.log(`▶️ Lecture démarrée: ${currentStation.value?.name}`)
  showTooltipFor(document.querySelector('.sphere-container'), `🎵 ${currentStation.value?.name}`)
}

function handlePlayPaused() {
  isPlaying.value = false
  isLoading.value = false
  console.log('⏸️ Lecture en pause')
  showTooltipFor(document.querySelector('.sphere-container'), '⏸️ En pause')
}

function handleAudioError(error) {
  isPlaying.value = false
  isLoading.value = false
  console.error(`❌ Erreur audio: ${error}`)
  showTooltipFor(document.querySelector('.sphere-container'), `❌ ${error}`)
}

function handleLoadingState(isLoadingState) {
  isLoading.value = !!isLoadingState
  if (isLoading.value) {
    console.log('🔄 Chargement de la station...')
    showTooltipFor(document.querySelector('.sphere-container'), '🔄 Connexion...')
  }
}

function handleVolumeChanged(newVolume) {
  const volumePercent = Math.round(newVolume * 100)
  console.log(`🔊 Volume: ${volumePercent}%`)
  showTooltipFor(document.querySelector('.sphere-container'), `🔊 ${volumePercent}%`)
}

function handleNextStation() {
  console.log('➡️ Station suivante')
  showTooltipFor(document.querySelector('.sphere-container'), `➡️ ${currentStation.value?.name}`)
}

function handlePreviousStation() {
  console.log('⬅️ Station précédente')
  showTooltipFor(document.querySelector('.sphere-container'), `⬅️ ${currentStation.value?.name}`)
}

function handleDoubleTap() {
  console.log('✨ Mode spécial activé')
  showTooltipFor(document.querySelector('.sphere-container'), '✨ Mode spécial')
}

function handleTabChange(tab) {
  currentTab.value = tab
  console.log('Onglet sélectionné:', tab)
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
