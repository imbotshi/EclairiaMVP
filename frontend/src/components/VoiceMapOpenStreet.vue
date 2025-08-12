<template>
  <div class="voice-map-simple">
    <div class="map-placeholder">
      <div class="map-content">
        <h3>🗺️ Carte Voice</h3>
        <p>Interface de carte interactive</p>
        <div class="map-controls">
          <button class="control-btn">📍 Localiser</button>
          <button class="control-btn">🎯 Marqueurs</button>
          <button class="control-btn">🔥 Heatmap</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// État simple
const isLocating = ref(false)

// Méthodes
function locateUser() {
  isLocating.value = true
  setTimeout(() => {
    isLocating.value = false
  }, 2000)
}
</script>

<style scoped>
.voice-map-simple {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 1rem;
  overflow: hidden;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #09174C 0%, #1a2b5c 50%, #2d4a8a 100%);
  position: relative;
}

.map-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 71, 117, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(17, 197, 77, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 193, 7, 0.05) 0%, transparent 50%);
}

.map-content {
  text-align: center;
  color: #F1EDE1;
  z-index: 2;
  position: relative;
}

.map-content h3 {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.map-content p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.map-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  color: #F1EDE1;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(255, 71, 117, 0.2);
  border-color: #FF4775;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.3);
}

/* Animation de pulsation pour simuler une carte active */
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.map-placeholder::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 71, 117, 0.1) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}
</style> 