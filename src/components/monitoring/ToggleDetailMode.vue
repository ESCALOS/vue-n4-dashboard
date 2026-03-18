<template>
  <div class="detail-toggle">
    <button
      :class="['detail-toggle-btn', { active: mode === 'current-shift' }]"
      @click="$emit('update:mode', 'current-shift')"
    >
      📊 Resumen turno actual
    </button>
    <button
      :class="['detail-toggle-btn', { active: mode === 'detailed' }]"
      @click="$emit('update:mode', 'detailed')"
    >
      📋 Detalle por jornadas
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'current-shift' | 'detailed'
}>();

defineEmits<{
  'update:mode': [mode: 'current-shift' | 'detailed']
}>();
</script>

<style scoped>
.detail-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  width: fit-content;
}

.detail-toggle-btn {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #94a3b8;
  transition: all 0.2s;
  font-weight: 500;
  font-family: inherit;
}

.detail-toggle-btn:hover {
  color: #e2e8f0;
  background: rgba(16, 185, 129, 0.1);
}

.detail-toggle-btn.active {
  background: #10b981;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

@media (max-width: 768px) {
  .detail-toggle {
    width: 100%;
  }

  .detail-toggle-btn {
    flex: 1;
  }
}
</style>