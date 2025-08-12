<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Testeur de Stations Radio</h1>
    
    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <div>
          <button 
            @click="runTests" 
            :disabled="isTesting" 
            class="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 disabled:opacity-50"
          >
            {{ isTesting ? 'Test en cours...' : 'Tester les stations' }}
          </button>
          
          <span v-if="isTesting" class="text-sm text-gray-600">
            Progression: {{ progress }}% ({{ completed }}/{{ totalStations }})
          </span>
        </div>
        
        <div v-if="results.length > 0" class="text-right">
          <div class="text-sm">
            <span class="font-semibold">Résultats:</span>
            <span class="text-green-600 ml-2">✓ {{ successCount }} actives</span>
            <span class="text-red-600 ml-2">✗ {{ errorCount }} erreurs</span>
          </div>
          <div class="text-xs text-gray-500">
            Dernier test: {{ lastTestTime }}
          </div>
        </div>
      </div>
      
      <div v-if="isTesting" class="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          class="bg-blue-600 h-2.5 rounded-full" 
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
    
    <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
      <div 
        v-for="(result, index) in results" 
        :key="index"
        class="p-3 border rounded flex items-center"
        :class="{
          'bg-green-50 border-green-200': result.ok,
          'bg-red-50 border-red-200': !result.ok
        }"
      >
        <div class="flex-1">
          <div class="font-medium">
            {{ result.station.name }}
            <span class="ml-2 text-sm font-normal text-gray-500">
              ({{ result.station.genre }} - {{ result.station.country }})
            </span>
          </div>
          <div class="text-sm text-gray-600">{{ result.station.stream }}</div>
          <div v-if="!result.ok" class="text-red-500 text-sm mt-1">
            {{ result.error }}
          </div>
          <div v-else class="text-green-600 text-sm mt-1">
            Connecté ({{ result.duration }}ms)
          </div>
        </div>
        <div class="ml-4 text-2xl">
          {{ result.ok ? '✓' : '✗' }}
        </div>
      </div>
      
      <div v-if="results.length === 0" class="text-center py-10 text-gray-500">
        Cliquez sur "Tester les stations" pour commencer la vérification
      </div>
    </div>
    
    <div v-if="results.length > 0" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-semibold mb-2">Résumé des tests</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-3 bg-white rounded border">
          <div class="text-sm text-gray-500">Stations testées</div>
          <div class="text-2xl font-bold">{{ results.length }}</div>
        </div>
        <div class="p-3 bg-white rounded border">
          <div class="text-sm text-gray-500">Stations actives</div>
          <div class="text-2xl font-bold text-green-600">{{ successCount }}</div>
        </div>
        <div class="p-3 bg-white rounded border">
          <div class="text-sm text-gray-500">Taux de réussite</div>
          <div class="text-2xl font-bold">
            {{ successRate }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRadio } from '../composables/useRadio'

const { validateAllStations, loadStations } = useRadio()
const results = ref([])
const isTesting = ref(false)
const completed = ref(0)
const totalStations = ref(0)
const lastTestTime = ref(null)

const progress = computed(() => {
  if (totalStations.value === 0) return 0
  return Math.round((completed.value / totalStations.value) * 100)
})

const successCount = computed(() => 
  results.value.filter(r => r.ok).length
)

const errorCount = computed(() => 
  results.value.filter(r => !r.ok).length
)

const successRate = computed(() => {
  if (results.value.length === 0) return 0
  return Math.round((successCount.value / results.value.length) * 100)
})

async function runTests() {
  try {
    isTesting.value = true
    results.value = []
    completed.value = 0
    
    // Charger les stations si nécessaire
    const stationsData = await loadStations()
    totalStations.value = stationsData.length
    
    // Lancer la validation
    const testResults = await validateAllStations({
      maxConcurrent: 3,
      retryAttempts: 1,
      timeout: 10000
    })
    
    // Mettre à jour les résultats
    results.value = testResults
    lastTestTime.value = new Date().toLocaleTimeString()
    
  } catch (error) {
    console.error('Erreur lors du test des stations:', error)
  } finally {
    isTesting.value = false
  }
}

// Mettre à jour la progression
const unwatch = watch(
  () => useRadio().validationResults,
  (newVal) => {
    completed.value = newVal.size
  },
  { deep: true }
)

onMounted(() => {
  // Charger les stations au montage
  loadStations()
})

// Nettoyer le watcher
onUnmounted(() => {
  unwatch()
})
</script>
