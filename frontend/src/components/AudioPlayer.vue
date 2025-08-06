<template>
  <div class="audio-player">
    <!-- Top separator line -->
    <div class="separator-line"></div>

    <!-- Main content -->
    <div class="player-content">
      <!-- Play button -->
      <div class="play-button-container">
        <button class="play-button" @click="togglePlay">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#F1EDE1" stroke-width="1.5"/>
            <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="#F1EDE1"/>
          </svg>
        </button>
      </div>

      <!-- Audio info and progress bar -->
      <div class="audio-info">
        <div class="audio-title">Le changement passera par nous</div>

        <!-- Progress bar -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>

        <!-- Time info -->
        <div class="time-info">
          <span class="current-time">0:24</span>
          <span class="listeners-count">5 ont écoutés</span>
        </div>
      </div>

      <!-- Right controls -->
      <div class="right-controls">
        <button class="delete-button" @click="$emit('delete')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18" stroke="#F1EDE1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#F1EDE1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="total-time">13:11</div>
      </div>
    </div>

    <!-- Bottom separator line -->
    <div class="separator-line"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  audioUrl: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['delete'])

// Reactive state
const isPlaying = ref(false)
const currentTime = ref(24) // 0:24 en secondes
const duration = ref(791) // 13:11 en secondes

// Progress percentage
const progressPercentage = computed(() => {
  return Math.floor((currentTime.value / duration.value) * 100)
})

// Methods
function togglePlay() {
  isPlaying.value = !isPlaying.value
  // Ici on pourrait ajouter la logique de lecture audio
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.audio-player {
  width: 100%;
  max-width: 400px;
  background: #0A1B5A;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 17px;
  height: 96px;
}

@media (max-width: 640px) {
  .audio-player {
    background: #223970;
  }
}

.separator-line {
  width: 100%;
  height: 1px;
  background: #590083;
  mix-blend-mode: luminosity;
}

.player-content {
  display: flex;
  align-items: flex-start;
  gap: 29px;
  width: 100%;
  padding: 0 20px;
}

.play-button-container {
  display: flex;
  width: 36px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 21px;
  align-self: stretch;
}

.play-button {
  background: none;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: scale(1.1);
}

.audio-info {
  display: flex;
  width: 240px;
  height: 62px;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.audio-title {
  align-self: stretch;
  color: #F1EDE1;
  font-family: 'Figtree', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 124%;
}

.progress-container {
  width: 240px;
  height: 32px;
  position: relative;
  display: flex;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(134, 130, 118, 0.18);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #FF4775;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.time-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
}

.current-time,
.listeners-count {
  color: #F1EDE1;
  text-align: center;
  font-family: 'ABC Whyte', system-ui, sans-serif;
  font-size: 7px;
  font-weight: 400;
  line-height: 124%;
}

.right-controls {
  display: flex;
  width: 30px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delete-button:hover {
  transform: scale(1.1);
}

.total-time {
  align-self: stretch;
  color: #F1EDE1;
  text-align: center;
  font-family: 'ABC Whyte', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 124%;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .player-content {
    gap: 20px;
    padding: 0 15px;
  }

  .audio-info {
    width: 200px;
  }

  .progress-container {
    width: 200px;
  }
}

@media (max-width: 360px) {
  .player-content {
    gap: 15px;
    padding: 0 10px;
  }

  .audio-info {
    width: 180px;
  }

  .progress-container {
    width: 180px;
  }

  .audio-title {
    font-size: 14px;
  }

  .total-time {
    font-size: 12px;
  }
}
</style>
