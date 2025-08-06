<template>
  <div class="spotify-waveform">
    <div 
      v-for="(bar, index) in bars" 
      :key="index" 
      class="bar" 
      :style="{ transform: `scaleY(${bar})` }"
    ></div>
    <div class="controls">
      <button @click="startRecording" :disabled="isRecording">Start</button>
      <button @click="stopRecording" :disabled="!isRecording">Stop</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';

const bars = ref(Array(6).fill(0.2)); // 6 bars like Spotify
let audioContext = null;
let analyser = null;
let source = null;
let dataArray = null;
let animationId = null;
let mediaStream = null;
const isRecording = ref(false);

const startRecording = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaStreamSource(mediaStream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);

    isRecording.value = true;
    animateBars();
  } catch (error) {
    console.error('Microphone access denied:', error);
    alert('Please allow microphone access to use this feature.');
  }
};

const stopRecording = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
  isRecording.value = false;
};

const animateBars = () => {
  const draw = () => {
    if (!analyser || !dataArray) return;
    
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    // Get average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length / 255; // Normalize 0-1

    // Animate bars with random variation around avg
    bars.value = bars.value.map(bar => {
      const target = Math.max(0.2, avg + Math.random() * 0.5);
      return bar + (target - bar) * 0.2; // Smooth transition
    });
  };

  draw();
};

onBeforeUnmount(() => {
  stopRecording();
});
</script>

<style scoped>
.spotify-waveform {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  height: 60px;
  margin-top: 20px;
}

.bar {
  width: 6px;
  height: 100%;
  background-color: #1db954; /* Spotify green */
  border-radius: 3px;
  transform-origin: bottom;
  transition: transform 0.1s ease-out;
}

.controls {
  margin-top: 10px;
  text-align: center;
}

button {
  padding: 8px 16px;
  margin: 0 5px;
  background: #1db954;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

button:hover:not(:disabled) {
  background: #1ed760;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 