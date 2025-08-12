<template>
  <div class="podcast-tab-container">
    <!-- Header minimaliste -->
    <div class="podcast-header">
      <div class="header-content">
        <h1 class="header-title">Podcasts</h1>
        <p class="header-subtitle">Découvrez des voix d'Afrique</p>
      </div>
      <div class="header-actions">
        <button class="search-btn" @click="toggleSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Carrousel horizontal épuré -->
    <div class="carousel-section">
      <div class="section-header">
        <h2 class="section-title">Catégories</h2>
      </div>
      <div class="carousel-container" ref="carouselContainer">
        <div class="carousel-track" ref="carouselTrack">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="carousel-item"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <span class="category-name">{{ category.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des podcasts - scroll fluide -->
    <div class="podcasts-section">
      <div class="section-header">
        <h2 class="section-title">{{ getCategoryTitle() }}</h2>
        <span class="podcast-count">{{ filteredPodcasts.length }} podcasts</span>
      </div>
      
      <div class="podcasts-list" ref="podcastsList">
        <div 
          v-for="podcast in filteredPodcasts" 
          :key="podcast.id"
          class="podcast-item"
          :class="{ playing: podcast.isPlaying }"
          @click="togglePlayback(podcast)"
        >
          <!-- Couverture minimaliste -->
          <div class="podcast-cover">
            <img :src="podcast.cover" :alt="podcast.title" />
            <div class="play-indicator" :class="{ playing: podcast.isPlaying }">
              <svg v-if="!podcast.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
              </svg>
            </div>
          </div>

          <!-- Informations épurées -->
          <div class="podcast-details">
            <h3 class="podcast-title">{{ podcast.title }}</h3>
            <p class="podcast-author">{{ podcast.author }}</p>
            <div class="podcast-meta">
              <span class="duration">{{ formatDuration(podcast.duration) }}</span>
              <span class="location">{{ podcast.location }}</span>
            </div>
          </div>

          <!-- Barre de progression subtile -->
          <div class="progress-indicator" v-if="podcast.isPlaying">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${podcast.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contrôles de lecture minimalistes -->
    <div class="mini-player" v-if="currentPodcast">
      <div class="player-content">
        <div class="player-info">
          <div class="mini-cover">
            <img :src="currentPodcast.cover" :alt="currentPodcast.title" />
          </div>
          <div class="player-text">
            <div class="player-title">{{ currentPodcast.title }}</div>
            <div class="player-author">{{ currentPodcast.author }}</div>
          </div>
        </div>
        
        <div class="player-controls">
          <button class="control-btn" @click="skipBackward">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M11 19V5L5 12L11 19ZM19 19V5L13 12L19 19Z" fill="currentColor"/>
            </svg>
          </button>
          <button class="control-btn play-btn" @click="togglePlayback(currentPodcast)">
            <svg v-if="!currentPodcast.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
            </svg>
          </button>
          <button class="control-btn" @click="skipForward">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 19V5L19 12L13 19ZM5 19V5L11 12L5 19Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// État réactif
const selectedCategory = ref('all')
const currentPodcast = ref(null)
const showSearch = ref(false)

// Références DOM
const carouselContainer = ref(null)
const carouselTrack = ref(null)
const podcastsList = ref(null)

// Catégories épurées
const categories = ref([
  { id: 'all', name: 'Tous', icon: '🎧' },
  { id: 'educatif', name: 'Éducatif', icon: '📚' },
  { id: 'culture', name: 'Culture', icon: '🎨' },
  { id: 'actualites', name: 'Actualités', icon: '📰' },
  { id: 'divertissement', name: 'Divertissement', icon: '🎭' },
  { id: 'technologie', name: 'Tech', icon: '💻' }
])

// Podcasts avec design minimaliste
const podcasts = ref([
  {
    id: 1,
    title: 'L\'Histoire de l\'Afrique Moderne',
    author: 'Dr. Kwame Nkrumah',
    category: 'educatif',
    duration: 3600,
    currentTime: 0,
    progress: 0,
    cover: 'https://picsum.photos/300/300?random=1',
    location: 'Ghana',
    isPlaying: false
  },
  {
    id: 2,
    title: 'Musique Traditionnelle Africaine',
    author: 'Mama Africa',
    category: 'culture',
    duration: 2400,
    currentTime: 0,
    progress: 0,
    cover: 'https://picsum.photos/300/300?random=2',
    location: 'Sénégal',
    isPlaying: false
  },
  {
    id: 3,
    title: 'Innovation Tech en Afrique',
    author: 'Tech Hub Africa',
    category: 'technologie',
    duration: 1800,
    currentTime: 0,
    progress: 0,
    cover: 'https://picsum.photos/300/300?random=3',
    location: 'Kenya',
    isPlaying: false
  },
  {
    id: 4,
    title: 'Contes et Légendes',
    author: 'Griot Traditionnel',
    category: 'divertissement',
    duration: 1200,
    currentTime: 0,
    progress: 0,
    cover: 'https://picsum.photos/300/300?random=4',
    location: 'Mali',
    isPlaying: false
  },
  {
    id: 5,
    title: 'Actualités Économiques',
    author: 'Africa Business News',
    category: 'actualites',
    duration: 900,
    currentTime: 0,
    progress: 0,
    cover: 'https://picsum.photos/300/300?random=5',
    location: 'Nigeria',
    isPlaying: false
  }
])

// Computed
const filteredPodcasts = computed(() => {
  if (selectedCategory.value === 'all') {
    return podcasts.value
  }
  return podcasts.value.filter(podcast => podcast.category === selectedCategory.value)
})

// Méthodes
const getCategoryTitle = () => {
  if (selectedCategory.value === 'all') return 'Tous les podcasts'
  const category = categories.value.find(c => c.id === selectedCategory.value)
  return category ? category.name : 'Podcasts'
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  // Animation fluide de transition
  if (podcastsList.value) {
    podcastsList.value.style.opacity = '0'
    setTimeout(() => {
      if (podcastsList.value) {
        podcastsList.value.style.opacity = '1'
      }
    }, 150)
  }
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const togglePlayback = (podcast) => {
  // Arrêter tous les autres podcasts
  podcasts.value.forEach(p => {
    if (p.id !== podcast.id) {
      p.isPlaying = false
      p.progress = 0
      p.currentTime = 0
    }
  })

  // Basculer l'état du podcast sélectionné
  podcast.isPlaying = !podcast.isPlaying
  currentPodcast.value = podcast.isPlaying ? podcast : null

  if (podcast.isPlaying) {
    startPlayback(podcast)
  } else {
    stopPlayback(podcast)
  }
}

const startPlayback = (podcast) => {
  // Simuler la lecture avec animation fluide
  const interval = setInterval(() => {
    if (podcast.isPlaying && podcast.currentTime < podcast.duration) {
      podcast.currentTime += 1
      podcast.progress = (podcast.currentTime / podcast.duration) * 100
    } else {
      clearInterval(interval)
      if (podcast.currentTime >= podcast.duration) {
        podcast.isPlaying = false
        podcast.progress = 0
        podcast.currentTime = 0
        currentPodcast.value = null
      }
    }
  }, 1000)
}

const stopPlayback = (podcast) => {
  podcast.isPlaying = false
}

const skipForward = () => {
  if (currentPodcast.value) {
    currentPodcast.value.currentTime = Math.min(
      currentPodcast.value.currentTime + 10,
      currentPodcast.value.duration
    )
    currentPodcast.value.progress = (currentPodcast.value.currentTime / currentPodcast.value.duration) * 100
  }
}

const skipBackward = () => {
  if (currentPodcast.value) {
    currentPodcast.value.currentTime = Math.max(
      currentPodcast.value.currentTime - 10,
      0
    )
    currentPodcast.value.progress = (currentPodcast.value.currentTime / currentPodcast.value.duration) * 100
  }
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Gestion du carrousel horizontal
const handleCarouselScroll = () => {
  if (carouselContainer.value && carouselTrack.value) {
    const container = carouselContainer.value
    const track = carouselTrack.value
    
    // Scroll fluide avec momentum
    let isScrolling = false
    let startX = 0
    let scrollLeft = 0
    
    const startScroll = (e) => {
      isScrolling = true
      startX = e.pageX - container.offsetLeft
      scrollLeft = container.scrollLeft
    }
    
    const scroll = (e) => {
      if (!isScrolling) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 2
      container.scrollLeft = scrollLeft - walk
    }
    
    const stopScroll = () => {
      isScrolling = false
    }
    
    container.addEventListener('mousedown', startScroll)
    container.addEventListener('mousemove', scroll)
    container.addEventListener('mouseup', stopScroll)
    container.addEventListener('mouseleave', stopScroll)
  }
}

// Lifecycle
onMounted(() => {
  handleCarouselScroll()
})

onUnmounted(() => {
  // Cleanup des event listeners si nécessaire
})
</script>

<style scoped>
.podcast-tab-container {
  flex: 1;
  background: var(--eclairia-dark);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header minimaliste */
.podcast-header {
  padding: 2rem 1.5rem 1.5rem;
  background: var(--eclairia-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  margin-bottom: 1rem;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
}

.search-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.8);
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: scale(1.05);
}

/* Carrousel horizontal épuré */
.carousel-section {
  padding: 1.5rem 0;
}

.section-header {
  padding: 0 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.carousel-container {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 1.5rem;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 1rem;
  min-width: max-content;
}

.carousel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  min-width: 100px;
}

.carousel-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.carousel-item.active {
  background: var(--eclairia-pink);
  border-color: var(--eclairia-pink);
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.3);
}

.category-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.category-name {
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
  text-align: center;
}

/* Section podcasts */
.podcasts-section {
  flex: 1;
  overflow: hidden;
}

.podcast-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-weight: 400;
}

.podcasts-list {
  padding: 0 1.5rem;
  overflow-y: auto;
  height: 100%;
  transition: opacity 0.15s ease;
}

.podcast-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.podcast-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.podcast-item.playing {
  background: rgba(236, 72, 153, 0.1);
  border-color: rgba(236, 72, 153, 0.3);
}

.podcast-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.podcast-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
}

.podcast-item:hover .play-indicator {
  opacity: 1;
}

.play-indicator.playing {
  opacity: 1;
  background: rgba(236, 72, 153, 0.9);
}

.podcast-details {
  flex: 1;
  min-width: 0;
}

.podcast-title {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.podcast-author {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.podcast-meta {
  display: flex;
  gap: 1rem;
}

.podcast-meta span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 400;
}

/* Barre de progression subtile */
.progress-indicator {
  width: 60px;
  flex-shrink: 0;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--eclairia-pink);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Mini player minimaliste */
.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 1.5rem;
  z-index: 1000;
}

.player-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.mini-cover {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.mini-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-text {
  flex: 1;
  min-width: 0;
}

.player-title {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.player-author {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.8);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: scale(1.05);
}

.play-btn {
  width: 44px;
  height: 44px;
  background: var(--eclairia-pink);
  color: white;
}

.play-btn:hover {
  background: var(--eclairia-pink);
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .podcast-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .header-title {
    font-size: 1.75rem;
  }
  
  .carousel-container {
    padding: 0 1rem;
  }
  
  .podcasts-list {
    padding: 0 1rem;
  }
  
  .mini-player {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .carousel-item {
    min-width: 80px;
    padding: 0.75rem 1rem;
  }
  
  .podcast-item {
    padding: 0.75rem;
  }
  
  .podcast-cover {
    width: 50px;
    height: 50px;
  }
}
</style>
