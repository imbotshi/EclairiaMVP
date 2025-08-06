<template>
  <div class="topic-section">
    <!-- En-tête avec métadonnées -->
    <div class="topic-header">
      <div class="meta-badge">
        <span class="category-icon">💻</span>
        <span class="topic-category">Technologie</span>
      </div>
      
      <div class="connection-status">
        <div class="status-dot"></div>
        <span class="status-text">5 connectés</span>
      </div>
    </div>
    
    <!-- Topic principal avec amélioration visuelle -->
    <div class="topic-content">
      <h2 class="topic-text">Design Weekend : Comment switcher d'une interface utilisateur à une page web ?</h2>
      <div class="topic-subtitle">Partagez votre expertise et découvrez les meilleures pratiques</div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for this component
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

/* Badge de catégorie avec icône */
.meta-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(255, 71, 117, 0.2) 0%, rgba(255, 71, 117, 0.1) 100%);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  border: 1px solid rgba(255, 71, 117, 0.3);
  transition: all 0.3s ease;
}

.meta-badge:hover {
  background: linear-gradient(135deg, rgba(255, 71, 117, 0.3) 0%, rgba(255, 71, 117, 0.2) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.2);
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
  color: #4ADE80;
  font-weight: 500;
  white-space: nowrap;
  padding: 0.4rem 0.8rem;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 1.5rem;
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ADE80;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.status-text {
  color: #4ADE80;
  font-weight: 600;
  letter-spacing: 0.5px;
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
