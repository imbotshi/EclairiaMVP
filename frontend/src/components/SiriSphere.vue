<template>
  <div class="sphere-container">
    <canvas ref="canvas" class="sphere-canvas"></canvas>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvas = ref(null)
const audioActive = ref(false)

let scene, camera, renderer, sphere, material, analyser, dataArray
let animationId = null

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

// Fragment Shader
const fragmentShader = `
  uniform float time;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float wave = sin(uv.x * 10.0 + time) * 0.05;
    uv.y += wave;

    vec3 color1 = vec3(0.0, 1.0, 1.0);
    vec3 color2 = vec3(0.3, 0.0, 1.0);
    vec3 color3 = vec3(1.0, 0.0, 1.0);

    vec3 color = mix(color1, color2, uv.x);
    color = mix(color, color3, uv.y);

    float pulse = 0.5 + 0.5 * sin(time * 2.0);
    color *= 0.8 + pulse * 0.2;

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

  // Shader Material
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      amplitude: { value: 0 }
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

async function initAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioContext.createMediaStreamSource(stream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)
    source.connect(analyser)
    audioActive.value = true
  } catch (error) {
    console.error('Erreur d\'accès au microphone:', error)
  }
}

function animate(time) {
  animationId = requestAnimationFrame(animate)

  // Rotation
  sphere.rotation.y += 0.005
  scene.children.forEach(child => {
    if (child.type === 'Mesh' && child !== sphere) {
      child.rotation.y += 0.002
    }
    if (child.type === 'Points') {
      child.rotation.y += 0.001
    }
  })

  // Update shader time
  material.uniforms.time.value = time * 0.001

  // Audio analysis
  if (analyser) {
    analyser.getByteFrequencyData(dataArray)
    let avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
    let normalized = avg / 256
    material.uniforms.amplitude.value = normalized
  }

  renderer.render(scene, camera)
}

function handleResize() {
  const container = canvas.value.parentElement
  const aspect = container.clientWidth / container.clientHeight
  
  camera.aspect = aspect
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

onMounted(() => {
  initThreeJS()
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  
  if (renderer) {
    renderer.dispose()
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
