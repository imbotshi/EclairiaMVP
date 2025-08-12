<template>
  <div class="topic-section">
    <!-- En-tête avec métadonnées dynamiques -->
    <div class="topic-header">
      <!-- Meta-badge dynamique basé sur la station radio -->
      <div class="meta-badge" :class="getGenreClass(currentStation?.genre)">
        <span class="category-icon">{{ getGenreIcon(currentStation?.genre) }}</span>
        <span class="topic-category">{{ currentStation?.genre || 'Radio' }}</span>
      </div>
      
      <div class="connection-status">
        <div class="status-dot" :class="{ 'playing': isPlaying }"></div>
        <span class="status-text">{{ getStatusText() }}</span>
      </div>
    </div>
    
    <!-- Contenu dynamique basé sur la station -->
    <div class="topic-content">
      <h2 class="topic-text">{{ getTopicTitle() }}</h2>
      <div class="topic-subtitle">{{ getTopicSubtitle() }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props pour recevoir les données de la station
const props = defineProps({
  currentStation: {
    type: Object,
    default: null
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// === FONCTIONS DE MAPPING GENRE → ICÔNE ===

function getGenreIcon(genre) {
  const iconMap = {
    'Musique/Variétés': '🎵',
    'Info/Actualités': '📰',
    'Généraliste': '📻',
    'Info/Musique': '🎙️',
    'Musique urbaine': '🎤',
    'Info continue': '⚡',
    'Musique traditionnelle': '🥁'
  }
  return iconMap[genre] || '📻'
}

function getGenreClass(genre) {
  const classMap = {
    'Musique/Variétés': 'genre-music',
    'Info/Actualités': 'genre-news',
    'Généraliste': 'genre-general',
    'Info/Musique': 'genre-talk',
    'Musique urbaine': 'genre-urban',
    'Info continue': 'genre-live',
    'Musique traditionnelle': 'genre-traditional'
  }
  return classMap[genre] || 'genre-default'
}

// === CONTENU DYNAMIQUE ===

function getTopicTitle() {
  if (!props.currentStation) {
    return 'Découvrez la Radio Africaine Interactive'
  }
  
  const titleMap = {
    'Musique/Variétés': `🎵 En Direct de ${props.currentStation.city} : Les Hits du Moment`,
    'Info/Actualités': `📰 Actualités en Direct depuis ${props.currentStation.country}`,
    'Généraliste': `📻 Votre Radio Généraliste de ${props.currentStation.city}`,
    'Info/Musique': `🎙️ Talk & Musique depuis ${props.currentStation.city}`,
    'Musique urbaine': `🎤 Sons Urbains de ${props.currentStation.country}`,
    'Info continue': `⚡ Info Non-Stop depuis ${props.currentStation.city}`,
    'Musique traditionnelle': `🥁 Patrimoine Musical de ${props.currentStation.country}`
  }
  
  return titleMap[props.currentStation.genre] || `📻 ${props.currentStation.name} en Direct`
}

function getTopicSubtitle() {
  if (!props.currentStation) {
    return 'Connectez-vous aux voix de l\'Afrique avec notre sphère interactive'
  }
  
  const subtitleMap = {
    'Musique/Variétés': 'Découvrez les derniers tubes et classiques africains',
    'Info/Actualités': 'Restez informé avec les dernières nouvelles locales et internationales',
    'Généraliste': 'Votre compagnon quotidien pour l\'info, la musique et le divertissement',
    'Info/Musique': 'Le parfait mélange entre information et divertissement musical',
    'Musique urbaine': 'Hip-hop, R&B et sons contemporains de la scène africaine',
    'Info continue': 'L\'actualité en temps réel, 24h/24',
    'Musique traditionnelle': 'Plongez dans la richesse culturelle et musicale ancestrale'
  }
  
  return subtitleMap[props.currentStation.genre] || `Écoutez ${props.currentStation.name} en ${props.currentStation.language}`
}

function getStatusText() {
  if (props.isLoading) {
    return 'Connexion...'
  } else if (props.isPlaying) {
    return 'En direct'
  } else if (props.currentStation) {
    return 'Prêt à écouter'
  } else {
    return 'Aucune station'
  }
}
</script>

<style scoped>
/* Topic Section - Design moderne et engageant */
.topic-section {
  text-align: left;
  margin-bottom: 2rem;
  padding: 2rem;
  border-radius: 1.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.topic-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

/* En-tête avec métadonnées */
.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Badge de catégorie avec icône - Styles dynamiques par genre */
.meta-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  border: 1px solid;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.meta-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Styles spécifiques par genre */
.genre-music {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%);
  border-color: rgba(255, 107, 107, 0.3);
}

.genre-music:hover {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.3) 0%, rgba(255, 107, 107, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.genre-news {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(78, 205, 196, 0.1) 100%);
  border-color: rgba(78, 205, 196, 0.3);
}

.genre-news:hover {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.3) 0%, rgba(78, 205, 196, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.genre-general {
  background: linear-gradient(135deg, rgba(69, 183, 209, 0.2) 0%, rgba(69, 183, 209, 0.1) 100%);
  border-color: rgba(69, 183, 209, 0.3);
}

.genre-general:hover {
  background: linear-gradient(135deg, rgba(69, 183, 209, 0.3) 0%, rgba(69, 183, 209, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(69, 183, 209, 0.3);
}

.genre-talk {
  background: linear-gradient(135deg, rgba(150, 206, 180, 0.2) 0%, rgba(150, 206, 180, 0.1) 100%);
  border-color: rgba(150, 206, 180, 0.3);
}

.genre-talk:hover {
  background: linear-gradient(135deg, rgba(150, 206, 180, 0.3) 0%, rgba(150, 206, 180, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(150, 206, 180, 0.3);
}

.genre-urban {
  background: linear-gradient(135deg, rgba(255, 234, 167, 0.2) 0%, rgba(255, 234, 167, 0.1) 100%);
  border-color: rgba(255, 234, 167, 0.3);
}

.genre-urban:hover {
  background: linear-gradient(135deg, rgba(255, 234, 167, 0.3) 0%, rgba(255, 234, 167, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(255, 234, 167, 0.3);
}

.genre-live {
  background: linear-gradient(135deg, rgba(221, 160, 221, 0.2) 0%, rgba(221, 160, 221, 0.1) 100%);
  border-color: rgba(221, 160, 221, 0.3);
}

.genre-live:hover {
  background: linear-gradient(135deg, rgba(221, 160, 221, 0.3) 0%, rgba(221, 160, 221, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(221, 160, 221, 0.3);
}

.genre-traditional {
  background: linear-gradient(135deg, rgba(152, 216, 200, 0.2) 0%, rgba(152, 216, 200, 0.1) 100%);
  border-color: rgba(152, 216, 200, 0.3);
}

.genre-traditional:hover {
  background: linear-gradient(135deg, rgba(152, 216, 200, 0.3) 0%, rgba(152, 216, 200, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(152, 216, 200, 0.3);
}

.genre-default {
  background: linear-gradient(135deg, rgba(255, 71, 117, 0.2) 0%, rgba(255, 71, 117, 0.1) 100%);
  border-color: rgba(255, 71, 117, 0.3);
}

.genre-default:hover {
  background: linear-gradient(135deg, rgba(255, 71, 117, 0.3) 0%, rgba(255, 71, 117, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.3);
}

.category-icon {
  font-size: 0.9rem;
}

.topic-category {
  color: #F1EDE1;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Statut de connexion amélioré */
.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  padding: 0.4rem 0.8rem;
  border-radius: 1.5rem;
  border: 1px solid;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.connection-status {
  color: #94A3B8;
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}

.connection-status.playing {
  color: #4ADE80;
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94A3B8;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.status-dot.playing {
  background: #4ADE80;
  animation: pulse 2s infinite;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}

.status-text {
  color: #4ADE80;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Contenu principal du topic */
.topic-content {
  margin-top: 1rem;
}

.topic-text {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.4;
  color: #F1EDE1;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.3px;
  text-align: left;
  background: linear-gradient(135deg, #F1EDE1 0%, #E1E5E9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.topic-subtitle {
  font-size: 0.9rem;
  color: rgba(241, 237, 225, 0.7);
  line-height: 1.4;
  font-weight: 400;
  margin: 0;
}

/* Informations de station */
 





/* Responsive design optimisé */
@media (max-width: 480px) {
  .topic-section {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .topic-header {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: nowrap;
  }
  
  .topic-text {
    font-size: 1.1rem;
    line-height: 1.4;
  }
  
  .topic-subtitle {
    font-size: 0.85rem;
  }
  
  .meta-badge {
    padding: 0.4rem 0.8rem;
    flex-shrink: 0;
  }
  
  .connection-status {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
    flex-shrink: 0;
  }
}

/* Très petits écrans - garantir l'alignement */
@media (max-width: 360px) {
  .topic-header {
    gap: 0.5rem;
  }
  
  .meta-badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .connection-status {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
}

/* Optimisation pour les écrans plus grands */
@media (min-width: 768px) {
  .topic-text {
    font-size: 1.2rem;
    line-height: 1.6;
  }
  
  .connection-status {
    font-size: 0.85rem;
  }
}

.meta-dot {
  width: 8px;
  height: 8px;
  background: #4ADE80;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
  animation: dot-pulse 2s ease-in-out infinite;
}

.visitors-count {
  color: #F1EDE1;
  opacity: 0.8;
}

@keyframes dot-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 12px rgba(74, 222, 128, 0.8);
  }
}
</style>
