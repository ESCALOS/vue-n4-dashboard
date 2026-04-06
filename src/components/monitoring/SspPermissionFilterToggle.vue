<template>
  <div class="ssp-filter-toggle">
    <span class="filter-label">Filtro SSP</span>
    <div class="filter-actions">
      <button
        v-for="option in options"
        :key="option.value"
        :class="['filter-btn', { active: modelValue === option.value }]"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'all' | 'internal' | 'external';
}>();

defineEmits<{
  'update:modelValue': [value: 'all' | 'internal' | 'external'];
}>();

const options = [
  { value: 'all', label: 'Todo' },
  { value: 'internal', label: 'Interno' },
  { value: 'external', label: 'Externo' },
] as const;
</script>

<style scoped>
.ssp-filter-toggle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
}

.filter-actions {
  display: inline-flex;
  padding: 0.25rem;
  border-radius: 0.75rem;
  background: #111827;
  border: 1px solid #374151;
  gap: 0.25rem;
}

.filter-btn {
  border: none;
  background: transparent;
  color: #94a3b8;
  padding: 0.5rem 0.875rem;
  border-radius: 0.55rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  color: #e2e8f0;
  background: rgba(59, 130, 246, 0.12);
}

.filter-btn.active {
  background: #2563eb;
  color: #fff;
}
</style>