<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-6xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Test des Stations Radio Eclairia</h1>
        <p class="text-gray-600">Vérification en temps réel de la disponibilité des flux radio</p>
      </header>
      
      <RadioTester />
      
      <div class="mt-8 p-4 bg-white rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Comment utiliser</h2>
        <ol class="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Cliquez sur "Tester les stations" pour lancer la vérification</li>
          <li>Les stations seront testées en parallèle (3 à la fois)</li>
          <li>Les résultats s'afficheront en temps réel</li>
          <li>Les stations actives apparaissent en vert, les erreurs en rouge</li>
        </ol>
        
        <div class="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
          <h3 class="font-semibold">Statut du test :</h3>
          <p v-if="!isTesting && results.length === 0">Prêt à démarrer les tests</p>
          <div v-else>
            <p>Dernier test : {{ lastTestTime || 'Jamais' }}</p>
            <p>Stations testées : {{ results.length }}</p>
            <p>Stations actives : <span class="font-semibold">{{ successCount }}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RadioTester from './components/RadioTester.vue'

const results = ref([])
const isTesting = ref(false)
const lastTestTime = ref(null)
const successCount = ref(0)

// Mettre à jour les données en fonction des événements émis par RadioTester
const updateResults = (newResults) => {
  results.value = newResults
  successCount.value = newResults.filter(r => r.ok).length
  lastTestTime.value = new Date().toLocaleTimeString()
}

const updateTestStatus = (status) => {
  isTesting.value = status
}

// Écouter les événements du composant RadioTester
onMounted(() => {
  window.addEventListener('radio-test-update', (event) => {
    if (event.detail.type === 'results') {
      updateResults(event.detail.data)
    } else if (event.detail.type === 'status') {
      updateTestStatus(event.detail.data)
    }
  })
})
</script>
