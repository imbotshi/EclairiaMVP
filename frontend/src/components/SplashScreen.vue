<template>
  <div class="splash-screen">
    <main class="splash">
      <div class="top-hatch"></div>
      <div class="grid-overlay"></div>

      <button 
        ref="centerBtn" 
        class="center-circle" 
        :class="{ pressed: isPressed }"
        aria-label="Eclairia launch"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
      >
        <span class="inner-disc">
          <img 
            src="/Logo.svg" 
          alt="Eclairia Logo" 
            class="icon" 
            @error="handleImageError"
            @load="handleImageLoad"
          />
        </span>
        <span class="outer-ring"></span>
      </button>

      <div class="brand">
        <div class="brand-name">Eclairia <small class="beta">BETA</small></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const centerBtn = ref(null)
const isPressed = ref(false)

const handlePointerDown = () => {
  isPressed.value = true
}

const handlePointerUp = () => {
  isPressed.value = false
}

const handleImageError = (event) => {
  }

const handleImageLoad = () => {
  }

onMounted(() => {
  // Animation d'apparition après 600ms
  setTimeout(() => {
    if (centerBtn.value) {
      centerBtn.value.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.02)' },
        { transform: 'scale(1)' }
      ], { duration: 1200, easing: 'ease-in-out' })
    }
  }, 600)


})
</script>

<style scoped>
.splash-screen {
  --bg-1: #0b2249;
  --bg-2: #08183a;
  --accent: #ff2b88;
  --muted-grid: rgba(255,255,255,0.03);
  --font: 'Poppins', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

@keyframes ring-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.splash {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 32px 20px;
  background: linear-gradient(135deg, #09174C 0%, #1a2b5c 50%, #2d4a8a 100%);
  color: white;
  font-family: var(--font);
}

.top-hatch {
  position: absolute;
  left: 0;
  right: 0;
  top: -2%;
  height: 22vh;
  background: repeating-linear-gradient(
    -25deg,
    rgba(255, 43, 136, 0.18) 0 2px,
    transparent 2px 18px
  );
  mask: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0) 100%);
  opacity: 0.95;
  transform: translateY(-6%);
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--muted-grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--muted-grid) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.55;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.center-circle {
  position: relative;
  width: 126px;
  height: 126px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 40% 35%,
    rgba(12, 18, 35, 0.5),
    rgba(6, 8, 20, 0.9) 60%
  );
  border: 1px solid rgba(255, 255, 255, 0.03);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.22s;
  box-shadow: 0 8px 30px rgba(3, 6, 20, 0.6), inset 0 2px 10px rgba(255, 255, 255, 0.02);
}

.center-circle .inner-disc {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 20%, rgba(0,0,0,0.35), rgba(3,6,20,0.9) 60%);
  box-shadow: inset 0 6px 14px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 2;
  transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.icon {
  width: 44px;
  height: 44px;
  color: var(--accent);
  filter: drop-shadow(0 6px 18px rgba(255, 43, 136, 0.12));
}

.center-circle .outer-ring {
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  z-index: 1;
  animation: ring-rotate 20s linear infinite;
  left: 50%;
  top: 50%;
  pointer-events: none;
  background:
    radial-gradient(circle, rgba(255,255,255,0.02), rgba(0,0,0,0) 60%),
    conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0.02), transparent 20%);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.center-circle::before,
.center-circle::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
  top: 50%;
  transform: translateY(-50%);
  left: -6px;
  opacity: 0.85;
}

.center-circle::after {
  left: auto;
  right: -6px;
  transform: translateY(-50%) rotate(180deg);
}

.center-circle.pressed {
  transform: scale(0.98);
  box-shadow: 0 14px 40px rgba(3, 6, 20, 0.7);
}

.center-circle.pressed .inner-disc {
  transform: scale(0.96);
}

.brand {
  position: absolute;
  bottom: 36px;
  left: 0;
  right: 0;
  text-align: center;
}

.brand-name {
  font-weight: 300;
  font-size: 28px;
  letter-spacing: 0.6px;
  color: #fff;
  opacity: 0.95;
}

.brand-name .beta {
  font-size: 10px;
  margin-left: 8px;
  font-weight: 600;
  vertical-align: super;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 420px) {
  .center-circle {
    width: 112px;
    height: 112px;
  }
  
  .center-circle .inner-disc {
    width: 74px;
    height: 74px;
  }
  
  .icon {
    width: 40px;
    height: 40px;
  }
  
  .brand-name {
    font-size: 24px;
  }
  
  .grid-overlay {
    background-size: 72px 72px;
  }
  
  .top-hatch {
    height: 18vh;
    transform: translateY(-12%);
  }
}
</style>
