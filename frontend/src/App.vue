<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import SplashScreen from './components/SplashScreen.vue'
import Record from './components/Record.vue'

// App root

// Musique de fond
const backgroundMusic = ref(null)

onMounted(async () => {
  if (backgroundMusic.value) {
    // Définir le volume avant de jouer
    backgroundMusic.value.volume = 0.2
    
    try {
      // Attendre que l'audio soit chargé
      await backgroundMusic.value.load()
      // Jouer la musique
      const playPromise = backgroundMusic.value.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Suppression du console.warn pour la production
          // Ajouter un gestionnaire de clic pour démarrer la lecture
          document.addEventListener('click', () => {
            backgroundMusic.value.play()
          }, { once: true })
        })
      }
    } catch (error) {
      // Suppression du console.error pour la production
    }
  }
})

onUnmounted(() => {
  if (backgroundMusic.value) {
    backgroundMusic.value.pause()
    backgroundMusic.value.currentTime = 0
  }
})

// State
const currentView = ref('splash')
const showRecordModal = ref(false)
const showOnboarding = ref(false)
const onboardingStep = ref(1)

// Timer pour le splash screen - avec cleanup
let splashTimer = null
let onboardingTimer = null

onMounted(() => {
  // Show splash for 10 seconds
  splashTimer = setTimeout(() => {
    currentView.value = 'home'
    
    // Check if first visit
    const hasVisited = localStorage.getItem('eclairia-visited')
    if (!hasVisited) {
      onboardingTimer = setTimeout(() => {
        showOnboarding.value = true
      }, 500)
    }
  }, 10000)
})

onUnmounted(() => {
  // Cleanup des timers
  if (splashTimer) {
    clearTimeout(splashTimer)
  }
  if (onboardingTimer) {
    clearTimeout(onboardingTimer)
  }
})

function openRecordModal() {
  showRecordModal.value = true
}

function closeRecordModal() {
  showRecordModal.value = false
}

function nextOnboardingStep() {
  if (onboardingStep.value < 3) {
    onboardingStep.value++
  }
}

function closeOnboarding() {
  showOnboarding.value = false
  localStorage.setItem('eclairia-visited', 'true')
}

</script>

<template>
  <div id="app">
    <router-view @open-record="openRecordModal" />
    
    <!-- SplashScreen -->
    <SplashScreen v-if="currentView === 'splash'" />
    
    <!-- Record Modal -->
    <Record 
      v-if="showRecordModal"
      :is-open="showRecordModal"
      @close="closeRecordModal"
    />
    
    <!-- Onboarding Popups -->
    <div v-if="showOnboarding" class="onboarding-overlay">
      <div class="onboarding-popup">
        <div class="popup-header">
          <h3>Bienvenue sur Eclairia Voice !</h3>
          <button class="close-popup" @click="closeOnboarding">✕</button>
        </div>
        <div class="popup-content">
          <div class="onboarding-step" v-if="onboardingStep === 1">
            <div class="step-icon">🎤</div>
            <h4>Enregistrez votre voix</h4>
            <p>Appuyez sur le bouton rouge en bas pour commencer à enregistrer. Vous avez 60 secondes maximum.</p>
          </div>
          <div class="onboarding-step" v-if="onboardingStep === 2">
            <div class="step-icon">🎧</div>
            <h4>Écoutez les autres</h4>
            <p>La sphère centrale vous permet d'écouter les enregistrements des autres utilisateurs.</p>
          </div>
          <div class="onboarding-step" v-if="onboardingStep === 3">
            <div class="step-icon">📤</div>
            <h4>Partagez vos idées</h4>
            <p>Une fois enregistré, vous pouvez partager votre audio avec la communauté.</p>
          </div>
        </div>
        <div class="popup-footer">
          <div class="step-indicators">
            <span 
              v-for="step in 3" 
              :key="step"
              class="step-dot"
              :class="{ active: onboardingStep === step }"
            ></span>
          </div>
          <button 
            class="next-btn" 
            @click="nextOnboardingStep"
            v-if="onboardingStep < 3"
          >
            Suivant
          </button>
          <button 
            class="finish-btn" 
            @click="closeOnboarding"
            v-else
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* Onboarding Styles */
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(9, 23, 76, 0.9);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.onboarding-popup {
  width: 90%;
  max-width: 400px;
  background: #F1EDE1;
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 20px 60px rgba(9, 23, 76, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.popup-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #09174C;
  margin: 0;
}

.close-popup {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(9, 23, 76, 0.1);
  color: #09174C;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-popup:hover {
  background: rgba(9, 23, 76, 0.2);
  transform: scale(1.1);
}

.popup-content {
  margin-bottom: 32px;
}

.onboarding-step {
  text-align: center;
  animation: fadeInStep 0.3s ease;
}

@keyframes fadeInStep {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.onboarding-step h4 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #09174C;
  margin-bottom: 12px;
}

.onboarding-step p {
  color: #868276;
  line-height: 1.5;
  font-size: 1rem;
}

.popup-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-indicators {
  display: flex;
  gap: 8px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(9, 23, 76, 0.2);
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #FF4775;
  transform: scale(1.2);
}

.next-btn, .finish-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: #FF4775;
  color: #F1EDE1;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-btn:hover, .finish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.3);
}

.finish-btn {
  background: #11C54D;
}

.finish-btn:hover {
  box-shadow: 0 4px 12px rgba(17, 197, 77, 0.3);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .onboarding-popup {
    margin: 20px;
    padding: 24px 20px;
  }
  
  .popup-header h3 {
    font-size: 1.3rem;
  }
  
  .step-icon {
    font-size: 2.5rem;
  }
  
  .onboarding-step h4 {
    font-size: 1.2rem;
  }
  
  .onboarding-step p {
    font-size: 0.9rem;
  }
}

/* Prevent body scroll when modal is open */
body.modal-open {
  overflow: hidden;
}

/* Eliminate white space between splash and home */
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #09174C 0%, #1a2b5c 50%, #2d4a8a 100%);
}

/* Ensure no gap between components */
.splash-screen,
.home-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(9, 23, 76, 0.1);
}

::-webkit-scrollbar-thumb {
  background: #FF4775;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #09174C;
}
</style>
