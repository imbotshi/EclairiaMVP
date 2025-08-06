<template>
  <div class="tooltip" :style="position">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  position: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* Tooltip */
.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  z-index: 1000;
  pointer-events: none;
  transform: translateX(-50%);
}
</style> 