<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="warning-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#FF4775" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="#FF4775" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="#FF4775" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="modal-title">Signaler un problème</h2>
      </div>

      <!-- Content -->
      <div class="modal-body">
        <p class="report-text">
          Aidez-nous à maintenir une communauté respectueuse et bienveillante en signalant tout contenu qui ne respecte pas nos valeurs.
        </p>
        
        <!-- Report Options -->
        <div class="report-options">
          <h3 class="options-title">Pourquoi signalez-vous ce contenu ?</h3>
          
          <div class="option-group">
            <label class="option-item" :class="{ selected: selectedReason === 'inappropriate' }">
              <input 
                type="radio" 
                name="reason" 
                value="inappropriate"
                v-model="selectedReason"
                class="option-input"
              />
              <div class="option-content">
                <div class="option-icon">🚫</div>
                <div class="option-text">
                  <span class="option-title">Contenu inapproprié</span>
                  <span class="option-description">Violence, harcèlement, discrimination ou propos offensants</span>
                </div>
              </div>
            </label>



            <label class="option-item" :class="{ selected: selectedReason === 'fake' }">
              <input 
                type="radio" 
                name="reason" 
                value="fake"
                v-model="selectedReason"
                class="option-input"
              />
              <div class="option-content">
                <div class="option-icon">🤥</div>
                <div class="option-text">
                  <span class="option-title">Fausses informations</span>
                  <span class="option-description">Contenu trompeur, mensonger ou non vérifié</span>
                </div>
              </div>
            </label>

            <label class="option-item" :class="{ selected: selectedReason === 'other' }">
              <input 
                type="radio" 
                name="reason" 
                value="other"
                v-model="selectedReason"
                class="option-input"
              />
              <div class="option-content">
                <div class="option-icon">❓</div>
                <div class="option-text">
                  <span class="option-title">Autre raison</span>
                  <span class="option-description">Autre violation de nos règles de communauté</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Additional Details -->
        <div v-if="selectedReason" class="details-section">
          <label class="details-label">
            Pouvez-vous nous donner plus de détails ?
          </label>
          <textarea 
            v-model="additionalDetails"
            class="details-textarea"
            placeholder="Décrivez brièvement le problème que vous avez observé..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button class="cancel-button" @click="closeModal">
          Annuler
        </button>
        <button 
          class="report-button" 
          @click="submitReport"
          :disabled="!selectedReason"
          :class="{ disabled: !selectedReason }"
        >
          Envoyer le signalement
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'report'])

// Reactive state
const selectedReason = ref('')
const additionalDetails = ref('')

// Methods
function closeModal() {
  selectedReason.value = ''
  additionalDetails.value = ''
  emit('close')
}

function submitReport() {
  if (!selectedReason.value) return
  
  const reportData = {
    reason: selectedReason.value,
    details: additionalDetails.value,
    timestamp: new Date().toISOString(),
    audioId: null // À connecter avec l'audio actuel
  }
  
  // Afficher un message de confirmation
  alert('Merci pour votre vigilance ! Votre signalement a été reçu et sera traité dans les plus brefs délais par notre équipe de modération.')
  
  emit('report', reportData)
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(9, 23, 76, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 32px 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(9, 23, 76, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.warning-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 71, 117, 0.1);
  border-radius: 50%;
  padding: 4px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #09174C;
  margin: 0;
}

.modal-body {
  margin-bottom: 32px;
}

.report-text {
  color: #868276;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
  font-weight: 400;
}

.report-options {
  margin-bottom: 24px;
}

.options-title {
  font-size: 1rem;
  font-weight: 600;
  color: #09174C;
  margin: 0 0 16px 0;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid rgba(9, 23, 76, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.option-item:hover {
  border-color: rgba(255, 71, 117, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.1);
}

.option-item.selected {
  border-color: #FF4775;
  background: rgba(255, 71, 117, 0.05);
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.2);
}

.option-input {
  display: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.option-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #09174C;
}

.option-description {
  font-size: 0.75rem;
  color: #868276;
  line-height: 1.3;
}

.details-section {
  margin-top: 20px;
}

.details-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #09174C;
  margin-bottom: 8px;
}

.details-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(9, 23, 76, 0.1);
  border-radius: 8px;
  background: white;
  color: #09174C;
  font-size: 0.85rem;
  line-height: 1.4;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.details-textarea:focus {
  outline: none;
  border-color: #FF4775;
}

.details-textarea::placeholder {
  color: #868276;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button {
  padding: 12px 24px;
  border: 2px solid rgba(9, 23, 76, 0.2);
  border-radius: 12px;
  background: transparent;
  color: #09174C;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  border-color: rgba(9, 23, 76, 0.4);
  background: rgba(9, 23, 76, 0.05);
}

.report-button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: #FF4775;
  color: #F1EDE1;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.report-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 117, 0.3);
}

.report-button.disabled {
  background: rgba(255, 71, 117, 0.3);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 480px) {
  .modal-content {
    padding: 24px 20px;
    margin: 20px;
  }
  
  .modal-title {
    font-size: 1.3rem;
  }
  
  .option-item {
    padding: 14px;
  }
  
  .option-title {
    font-size: 0.85rem;
  }
  
  .option-description {
    font-size: 0.7rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-button,
  .report-button {
    width: 100%;
    text-align: center;
  }
}
</style> 