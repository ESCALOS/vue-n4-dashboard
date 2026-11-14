<template>
  <details ref="dropdown" class="multi-select" @keydown.esc="close" @focusout="onFocusOut">
    <summary :title="selectedLabels" :aria-label="`${label}: ${selectedLabels}`">
      <span>{{ label }}</span>
      <span class="selection-count">{{ modelValue.length || 'Todos' }}</span>
    </summary>
    <div class="options">
      <button type="button" class="clear-selection" :disabled="!modelValue.length"
        @click="$emit('update:modelValue', [])">Limpiar selección</button>
      <label v-for="option in normalizedOptions" :key="option.value" class="option">
        <input type="checkbox" :value="option.value" :checked="modelValue.includes(option.value)"
          @change="toggle(option.value, ($event.target as HTMLInputElement).checked)" />
        <span>{{ option.label }}</span>
      </label>
      <p v-if="!normalizedOptions.length" class="empty-options">Sin opciones</p>
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  modelValue: string[];
  label: string;
  options: (string | { value: string; label: string })[];
}>();
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>();
const dropdown = ref<HTMLDetailsElement | null>(null);
const normalizedOptions = computed(() => props.options.map(option =>
  typeof option === 'string' ? { value: option, label: option } : option));
const selectedLabels = computed(() => props.modelValue.length
  ? props.modelValue.map(value => normalizedOptions.value.find(option => option.value === value)?.label ?? value).join(', ')
  : 'Todos');

function toggle(value: string, checked: boolean) {
  emit('update:modelValue', checked ? [...new Set([...props.modelValue, value])] : props.modelValue.filter(item => item !== value));
}
function close() {
  if (dropdown.value) dropdown.value.open = false;
}
function onOutsideClick(event: MouseEvent) {
  if (event.target instanceof Node && !dropdown.value?.contains(event.target)) close();
}
function onFocusOut(event: FocusEvent) {
  if (event.relatedTarget instanceof Node && !dropdown.value?.contains(event.relatedTarget)) close();
}
onMounted(() => document.addEventListener('click', onOutsideClick));
onUnmounted(() => document.removeEventListener('click', onOutsideClick));
</script>

<style scoped>
.multi-select { position: relative; min-width: 140px; color: #e2e8f0; font-size: 0.8rem; }
summary { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; padding: 0.4rem 0.6rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.375rem; cursor: pointer; list-style: none; }
summary::-webkit-details-marker { display: none; }
summary::after { content: '▾'; color: #94a3b8; }
summary:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
.selection-count { color: #93c5fd; font-size: 0.75rem; }
.options { position: absolute; top: calc(100% + 0.25rem); left: 0; z-index: 20; min-width: 100%; width: max-content; max-width: min(340px, 85vw); max-height: 280px; overflow-y: auto; padding: 0.4rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.375rem; box-shadow: 0 8px 20px #0005; }
.option { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem; cursor: pointer; overflow-wrap: anywhere; }
.option:hover { background: #334155; }
input { accent-color: #3b82f6; }
.clear-selection { border: 0; background: transparent; color: #93c5fd; cursor: pointer; padding: 0.4rem; font: inherit; }
.clear-selection:disabled { opacity: 0.5; cursor: default; }
.empty-options { padding: 0.4rem; color: #94a3b8; }
</style>
