// Configuration des performances pour Eclairia

export const PERFORMANCE_CONFIG = {
  // Limites de performance
  limits: {
    maxFPS: 60,
    minFPS: 30,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxAnimationDuration: 300, // ms
    maxImageSize: 1024 * 1024 // 1MB
  },
  
  // Optimisations pour appareils lents
  lowPerformance: {
    reduceAnimations: true,
    lowerImageQuality: true,
    disableComplexEffects: true,
    reduceUpdateFrequency: true,
    useSimplifiedUI: false
  },
  
  // Cache configuration
  cache: {
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    maxSize: 50 * 1024 * 1024, // 50MB
    enableServiceWorker: true
  },
  
  // Lazy loading
  lazyLoading: {
    enabled: true,
    threshold: 0.1, // 10% de la viewport
    rootMargin: '50px'
  },
  
  // Code splitting
  codeSplitting: {
    enabled: true,
    chunkSize: 100 * 1024, // 100KB
    preloadCritical: true
  },
  
  // Optimisations Three.js
  threeJS: {
    antialias: false, // Désactiver sur mobile
    shadowMap: false,
    maxLights: 2,
    maxParticles: 100,
    useInstancing: true
  },
  
  // Optimisations audio
  audio: {
    bufferSize: 2048,
    sampleRate: 44100,
    maxConcurrentStreams: 2,
    enableCompression: true
  },
  
  // Optimisations réseau
  network: {
    timeout: 10000, // 10 secondes
    retryAttempts: 3,
    enableCompression: true,
    useCDN: true
  }
}

// Détecter les capacités de l'appareil
export function detectDeviceCapabilities() {
  const capabilities = {
    memory: navigator.deviceMemory || 4,
    cores: navigator.hardwareConcurrency || 4,
    connection: navigator.connection?.effectiveType || '4g',
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    supportsWebGL: !!window.WebGLRenderingContext,
    supportsWebAudio: !!window.AudioContext,
    supportsServiceWorker: 'serviceWorker' in navigator
  }
  
  // Déterminer le niveau de performance
  capabilities.performanceLevel = 
    capabilities.memory >= 8 && capabilities.cores >= 8 ? 'high' :
    capabilities.memory >= 4 && capabilities.cores >= 4 ? 'medium' : 'low'
  
  return capabilities
}

// Optimiser les paramètres selon l'appareil
export function getOptimizedConfig() {
  const capabilities = detectDeviceCapabilities()
  const config = { ...PERFORMANCE_CONFIG }
  
  if (capabilities.performanceLevel === 'low') {
    config.threeJS.antialias = false
    config.threeJS.shadowMap = false
    config.threeJS.maxParticles = 50
    config.audio.bufferSize = 1024
    config.lowPerformance.reduceAnimations = true
  }
  
  if (capabilities.isMobile) {
    config.threeJS.maxLights = 1
    config.audio.maxConcurrentStreams = 1
    config.network.timeout = 15000
  }
  
  return config
}

// Optimiser les images selon l'appareil
export function getImageOptimizationSettings() {
  const capabilities = detectDeviceCapabilities()
  
  return {
    quality: capabilities.performanceLevel === 'low' ? 0.6 : 0.8,
    format: capabilities.isMobile ? 'webp' : 'jpeg',
    maxWidth: capabilities.isMobile ? 800 : 1200,
    maxHeight: capabilities.isMobile ? 600 : 900,
    enableLazyLoading: true
  }
}

// Optimiser les animations
export function getAnimationSettings() {
  const capabilities = detectDeviceCapabilities()
  
  return {
    duration: capabilities.performanceLevel === 'low' ? 200 : 300,
    easing: capabilities.performanceLevel === 'low' ? 'ease-out' : 'ease-in-out',
    reduceMotion: capabilities.performanceLevel === 'low',
    useTransform: true,
    useOpacity: true
  }
} 