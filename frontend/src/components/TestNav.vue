<template>
  <nav class="fixed bottom-4 right-4 z-50">
    <div class="bg-white p-3 rounded-full shadow-lg">
      <router-link 
        to="/test-radio" 
        class="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full flex items-center justify-center transition-colors"
        title="Tester les stations radio"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'TestNav'
}
</script>
