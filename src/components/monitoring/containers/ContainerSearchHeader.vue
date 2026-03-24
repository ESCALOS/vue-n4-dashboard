<template>
  <div class="search-header">
    <h2 class="search-header-title">Monitoreo de Contenedores</h2>

    <!-- Add Vessel -->
    <div class="add-vessel-row">
      <input
        v-model="newManifestId"
        type="text"
        class="form-input"
        placeholder="ID Manifiesto (ej: 2026-101)"
        :disabled="loading"
        @keyup.enter="handleAdd"
      />
      <button class="btn btn-primary" :disabled="loading || !newManifestId.trim()" @click="handleAdd">
        {{ loading ? 'Agregando...' : 'Agregar Nave' }}
      </button>
      <button
        class="btn btn-secondary"
        :disabled="!selectedVessel"
        @click="$emit('export-report')"
      >
        Exportar Excel
      </button>
    </div>

    <!-- Monitored Vessels Tabs -->
    <div v-if="monitoredVessels.length" class="vessel-tabs">
      <button
        v-for="vessel in monitoredVessels"
        :key="vessel.id"
        :class="['vessel-tab', { 'vessel-tab--active': selectedVessel?.id === vessel.id }]"
        @click="$emit('select-vessel', vessel)"
      >
        <span class="vessel-tab-name">{{ vessel.vessel_name }}</span>
        <span class="vessel-tab-id">{{ vessel.id }}</span>
        <button
          class="vessel-tab-remove"
          title="Remover nave"
          @click.stop="$emit('remove-vessel', vessel.id)"
        >✕</button>
      </button>
    </div>

    <!-- Info line -->
    <p v-if="vesselName" class="search-header-info">
      Nave: <span class="search-header-vessel">{{ vesselName }}</span>
      &mdash; Última actualización: {{ lastUpdate }}
    </p>

    <p v-if="error" class="search-header-error">{{ error }}</p>

    <!-- Connection status -->
    <p v-if="connectionMessage" class="search-header-connection">{{ connectionMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MonitoredContainerVessel } from '../../../interfaces/monitoring/ContainerMonitoring';

defineProps<{
  monitoredVessels: MonitoredContainerVessel[];
  selectedVessel: MonitoredContainerVessel | null;
  loading: boolean;
  error: string;
  vesselName?: string;
  lastUpdate?: string;
  connectionMessage?: string;
}>();

const emit = defineEmits<{
  'add-vessel': [manifestId: string];
  'remove-vessel': [manifestId: string];
  'select-vessel': [vessel: MonitoredContainerVessel];
  'export-report': [];
}>();

const newManifestId = ref('');

const handleAdd = () => {
  const id = newManifestId.value.trim();
  if (!id) return;
  emit('add-vessel', id);
  newManifestId.value = '';
};
</script>

<style scoped>
.search-header {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.search-header-title {
  margin: 0 0 1.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
}

.add-vessel-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.form-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid #2d2d44;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: #0f0f1a;
  color: #e2e8f0;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input::placeholder {
  color: #475569;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Vessel tabs */
.vessel-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.vessel-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #2d2d44;
  border-radius: 0.5rem;
  background: #0f0f1a;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.8125rem;
  font-family: inherit;
  transition: all 0.15s ease;
}

.vessel-tab:hover {
  border-color: #3b82f6;
  color: #e2e8f0;
}

.vessel-tab--active {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.15);
  color: #e2e8f0;
}

.vessel-tab-name {
  font-weight: 600;
}

.vessel-tab-id {
  color: #64748b;
  font-size: 0.75rem;
}

.vessel-tab-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #64748b;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vessel-tab-remove:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;
  white-space: nowrap;
}

.btn-primary {
  background: #4f46e5;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-secondary {
  background: #0ea5e9;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background: #0284c7;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-header-info {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.search-header-vessel {
  color: #e2e8f0;
  font-weight: 600;
}

.search-header-error {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  color: #ef4444;
  padding: 0.625rem 0.875rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
}

.search-header-connection {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  color: #f59e0b;
}
</style>
