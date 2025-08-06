<template>
  <div class="home-container">
    <!-- Header Component -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="main-content">
      <div class="content-box">
        <!-- Siri-like Sphere Visualizer -->
        <SiriSphere />
        
        <!-- Topic Section -->
        <TopicSection />
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

// Emits
const emit = defineEmits(['open-record'])

// Reactive state
const showTooltip = ref(false)
const tooltipText = ref('')
const tooltipPosition = ref({})

// Animation management
let animationId = null

// Lifecycle hooks
onMounted(() => {
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
  
  .content-box {
    padding: 1.5rem;
  }
}
</style>
