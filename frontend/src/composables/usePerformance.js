import { ref, onMounted, onUnmounted } from 'vue'

// Composable pour optimiser les performances
export function usePerformance() {
  const fps = ref(60)
  const memoryUsage = ref(0)
  const isLowPerformance = ref(false)
  
  let frameCount = 0
  let lastTime = performance.now()
  let performanceMonitor = null
  
  // Détecter les appareils à faible performance
  const detectLowPerformance = () => {
    const memory = navigator.deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 4
    const connection = navigator.connection
    
    isLowPerformance.value = memory < 4 || cores < 4 || 
      (connection && connection.effectiveType === 'slow-2g')
  }
  
  // Monitorer les FPS
  const monitorFPS = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
      frameCount = 0
      lastTime = currentTime
      
      // Ajuster les performances si nécessaire
      if (fps.value < 30) {
        isLowPerformance.value = true
      }
    }
    
    performanceMonitor = requestAnimationFrame(monitorFPS)
  }
  
  // Optimiser les animations selon les performances
  const getAnimationSettings = () => {
    if (isLowPerformance.value) {
      return {
        duration: 0.2, // Animations plus rapides
        easing: 'ease-out',
        reduceMotion: true
      }
    }
    
    return {
      duration: 0.3,
      easing: 'ease-in-out',
      reduceMotion: false
    }
  }
  
  // Optimiser les rendus avec debounce
  const createDebouncedFunction = (fn, delay = 100) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }
  
  // Optimiser les calculs coûteux avec memoization
  const createMemoizedFunction = (fn) => {
    const cache = new Map()
    return (...args) => {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = fn(...args)
      cache.set(key, result)
      return result
    }
  }
  
  // Lazy loading des composants
  const lazyLoadComponent = (importFn) => {
    return {
      component: null,
      loading: ref(false),
      error: ref(null),
      
      async load() {
        if (this.component) return this.component
        
        this.loading.value = true
        this.error.value = null
        
        try {
          const module = await importFn()
          this.component = module.default || module
          return this.component
        } catch (err) {
          this.error.value = err
          throw err
        } finally {
          this.loading.value = false
        }
      }
    }
  }
  
  // Optimiser les images
  const optimizeImage = (src, options = {}) => {
    const { width, height, quality = 0.8 } = options
    
    if (isLowPerformance.value) {
      // Réduire la qualité sur les appareils lents
      return `${src}?quality=0.6&w=${width}&h=${height}`
    }
    
    return `${src}?quality=${quality}&w=${width}&h=${height}`
  }
  
  // Gérer la mémoire
  const clearMemory = () => {
    if (window.gc) {
      window.gc()
    }
    
    // Vider les caches si nécessaire
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old-')) {
            caches.delete(name)
          }
        })
      })
    }
  }
  
  onMounted(() => {
    detectLowPerformance()
    monitorFPS()
    
    // Nettoyer la mémoire périodiquement
    const memoryCleanup = setInterval(clearMemory, 30000) // Toutes les 30 secondes
    
    onUnmounted(() => {
      clearInterval(memoryCleanup)
    })
  })
  
  onUnmounted(() => {
    if (performanceMonitor) {
      cancelAnimationFrame(performanceMonitor)
    }
  })
  
  return {
    fps,
    memoryUsage,
    isLowPerformance,
    getAnimationSettings,
    createDebouncedFunction,
    createMemoizedFunction,
    lazyLoadComponent,
    optimizeImage,
    clearMemory
  }
} 