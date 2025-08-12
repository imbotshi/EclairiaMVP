// useRadio.js - Composable reprenant la logique radio, refactorisé avec services
import { ref, reactive } from 'vue'
import { fetchStations, proxyUrl } from '../services/radioApi'
import { validateStream as validateStreamService } from '../services/radioValidator'

export function useRadio() {
  // === ÉTAT COPIÉ DE RADIO-TEST ===
  const stations = ref([])
  const currentStation = ref(null)
  const validationResults = reactive(new Map())
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const volume = ref(0.8)
  const error = ref(null)

  // === FONCTIONS UTILITAIRES (via services) ===

  function updateStats() {
    const totalStations = stations.value.length
    const activeCount = Array.from(validationResults.values()).filter(r => r.ok).length
    return { totalStations, activeCount }
  }

  function logToResults(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : '🔍'
    const line = `[${timestamp}] ${prefix} ${message}`
    return line
  }

  // === GESTION DES STATIONS (COPIÉE) ===

  async function loadStations() {
    try {
      logToResults('🔄 Chargement des stations...', 'info')
      const stationsData = await fetchStations()
      stations.value = stationsData
      
      logToResults(`✅ ${stationsData.length} stations chargées`, 'success')
      return stationsData
    } catch (error) {
      const errorMsg = `Impossible de charger les stations: ${error.message}`
      logToResults(errorMsg, 'error')
      error.value = errorMsg
      throw error
    }
  }

  // === VALIDATION DES FLUX (COPIÉE) ===

  async function validateStream(station) {
    logToResults(`🔍 Test de ${station.name}...`, 'info')
    const result = await validateStreamService(station, { timeout: 15000 })
    validationResults.set(station.id, result)
    if (result.ok) {
      logToResults(`✅ ${station.name} - ${result.status} (${result.duration}ms)`, 'success')
    } else {
      logToResults(`❌ ${station.name} - ${result.error || result.status} (${result.duration}ms)`, 'error')
    }
    return result
  }

  async function validateAllStations(options = {}) {
    const {
      maxConcurrent = 3,        // Nombre maximum de validations en parallèle
      retryAttempts = 2,        // Nombre de tentatives en cas d'échec
      timeout = 10000,          // Timeout par tentative (10s)
      delayBetweenRequests = 50 // Délai minimum entre les requêtes (ms)
    } = options

    if (stations.value.length === 0) {
      logToResults('ℹ️ Aucune station à tester', 'info')
      return []
    }
    
    logToResults(`🔍 Début de validation intelligente de ${stations.value.length} stations...`, 'info')
    validationResults.clear()
    
    const results = []
    const queue = [...stations.value]
    const activeValidations = new Set()
    let completed = 0
    
    // Fonction pour valider une station avec gestion des réessais
    const validateWithRetry = async (station, attempt = 1) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      try {
        const result = await validateStream({
          ...station,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        return { ok: true, result, station }
      } catch (error) {
        clearTimeout(timeoutId)
        
        if (attempt < retryAttempts) {
          logToResults(`↩️ Tentative ${attempt + 1}/${retryAttempts} pour ${station.name}`, 'warning')
          await new Promise(resolve => setTimeout(resolve, 500 * attempt)) // Backoff exponentiel
          return validateWithRetry(station, attempt + 1)
        }
        
        return { 
          ok: false, 
          error: error.message || 'Échec de la validation',
          station 
        }
      }
    }
    
    // Gestion du parallélisme contrôlé
    const processQueue = async () => {
      while (queue.length > 0 && activeValidations.size < maxConcurrent) {
        const station = queue.shift()
        if (!station) continue
        
        const validationId = Symbol()
        activeValidations.add(validationId)
        
        // Lancer la validation
        validateWithRetry(station)
          .then(({ ok, result, error, station: validatedStation }) => {
            const validationResult = ok ? result : { ok: false, error }
            results.push({ station: validatedStation, result: validationResult })
            
            // Mise à jour de l'interface utilisateur
            validationResults.set(validatedStation.id, validationResult)
            const status = ok ? '✓' : '✗'
            logToResults(
              `${status} ${validatedStation.name} - ${ok ? 'Connecté' : error}`,
              ok ? 'success' : 'error'
            )
          })
          .catch(error => {
            logToResults(`❌ Erreur inattendue: ${error.message}`, 'error')
          })
          .finally(() => {
            activeValidations.delete(validationId)
            completed++
            
            // Mise à jour de la progression
            const progress = Math.round((completed / stations.value.length) * 100)
            if (completed % Math.max(1, Math.floor(stations.value.length / 10)) === 0) {
              logToResults(`📊 Progression: ${progress}% (${completed}/${stations.value.length})`, 'info')
            }
            
            // Traiter la file d'attente suivante
            if (queue.length > 0 || activeValidations.size > 0) {
              processQueue()
            } else {
              // Toutes les validations sont terminées
              const successCount = results.filter(r => r.result.ok).length
              const successRate = Math.round((successCount / stations.value.length) * 100)
              
              logToResults(
                `🎉 Validation terminée: ${successCount}/${stations.value.length} stations actives (${successRate}% de réussite)`,
                'success'
              )
              
              // Trier les résultats (stations actives en premier)
              results.sort((a, b) => (b.result.ok ? 1 : 0) - (a.result.ok ? 1 : 0))
            }
          })
        
        // Respecter un délai minimum entre les requêtes
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests))
      }
    }
    
    // Démarrer le traitement avec le niveau de parallélisme souhaité
    await Promise.all(Array.from({ length: Math.min(maxConcurrent, stations.value.length) }, processQueue))
    
    return results
  }

  // === CONTRÔLE AUDIO (COPIÉ ET ADAPTÉ) ===

  function selectStation(station) {
    currentStation.value = station
    logToResults(`🎵 Station sélectionnée: ${station.name}`, 'info')
    return station
  }

  async function playAudio(audioElement) {
    if (!audioElement) {
      throw new Error('Élément audio non disponible')
    }

    if (!currentStation.value) {
      throw new Error('Aucune station sélectionnée')
    }

    try {
      // Charger la station si nécessaire
      if (!audioElement.src || !audioElement.src.includes(currentStation.value.id)) {
        logToResults(`🔄 Chargement de ${currentStation.value.name}...`, 'info')
        audioElement.src = proxyUrl(currentStation.value.stream)
        isLoading.value = true
      }

      await audioElement.play()
      isPlaying.value = true
      isLoading.value = false
      error.value = null
      
      logToResults(`▶️ Lecture démarrée: ${currentStation.value.name}`, 'success')
      
    } catch (err) {
      isPlaying.value = false
      isLoading.value = false
      error.value = err.message
      
      logToResults(`❌ Erreur de lecture: ${err.message}`, 'error')
      throw err
    }
  }

  function pauseAudio(audioElement) {
    if (audioElement) {
      audioElement.pause()
      isPlaying.value = false
      logToResults('⏸️ Lecture en pause', 'info')
    }
  }

  function setVolume(newVolume, audioElement) {
    volume.value = Math.max(0, Math.min(1, newVolume))
    if (audioElement) {
      audioElement.volume = volume.value
    }
    logToResults(`🔊 Volume: ${Math.round(volume.value * 100)}%`, 'info')
  }

  // === NAVIGATION ENTRE STATIONS ===

  function getNextStation() {
    if (!currentStation.value || stations.value.length === 0) return null
    
    const currentIndex = stations.value.findIndex(s => s.id === currentStation.value.id)
    const nextIndex = (currentIndex + 1) % stations.value.length
    return stations.value[nextIndex]
  }

  function getPreviousStation() {
    if (!currentStation.value || stations.value.length === 0) return null
    
    const currentIndex = stations.value.findIndex(s => s.id === currentStation.value.id)
    const prevIndex = currentIndex === 0 ? stations.value.length - 1 : currentIndex - 1
    return stations.value[prevIndex]
  }

  async function nextStation(audioElement) {
    const next = getNextStation()
    if (next) {
      const wasPlaying = isPlaying.value
      if (wasPlaying) pauseAudio(audioElement)
      
      selectStation(next)
      
      if (wasPlaying) {
        await playAudio(audioElement)
      }
    }
  }

  async function previousStation(audioElement) {
    const prev = getPreviousStation()
    if (prev) {
      const wasPlaying = isPlaying.value
      if (wasPlaying) pauseAudio(audioElement)
      
      selectStation(prev)
      
      if (wasPlaying) {
        await playAudio(audioElement)
      }
    }
  }

  // === GESTIONNAIRES D'ÉVÉNEMENTS AUDIO ===

  function setupAudioEventListeners(audioElement) {
    if (!audioElement) return

    audioElement.addEventListener('loadstart', () => {
      isLoading.value = true
      logToResults('🔄 Début du chargement audio', 'info')
    })

    audioElement.addEventListener('canplay', () => {
      isLoading.value = false
      logToResults('✅ Audio prêt à être lu', 'success')
    })

    audioElement.addEventListener('play', () => {
      isPlaying.value = true
      isLoading.value = false
      logToResults('▶️ Lecture audio démarrée', 'success')
    })

    audioElement.addEventListener('pause', () => {
      isPlaying.value = false
      logToResults('⏸️ Lecture audio en pause', 'info')
    })

    audioElement.addEventListener('error', (event) => {
      const audioError = event.target.error
      isPlaying.value = false
      isLoading.value = false
      error.value = 'Erreur de lecture audio'
      logToResults(`❌ Erreur audio: ${audioError?.message || 'Erreur inconnue'}`, 'error')
    })

    // Configurer le volume initial
    audioElement.volume = volume.value
  }

  // === RETOUR DU COMPOSABLE ===

  return {
    // État
    stations,
    currentStation,
    validationResults,
    isPlaying,
    isLoading,
    volume,
    error,
    
    // Fonctions utilitaires
    proxyUrl,
    updateStats,
    logToResults,
    
    // Gestion des stations
    loadStations,
    validateStream,
    validateAllStations,
    selectStation,
    
    // Contrôle audio
    playAudio,
    pauseAudio,
    setVolume,
    
    // Navigation
    getNextStation,
    getPreviousStation,
    nextStation,
    previousStation,
    
    // Setup
    setupAudioEventListeners
  }
}
