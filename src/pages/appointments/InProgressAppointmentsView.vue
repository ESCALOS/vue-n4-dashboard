<template>
  <div class="in-progress-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h2 class="view-title">Citas en Proceso de Atención</h2>
        <div class="header-meta">
          <span class="connection-status" :class="isConnected ? 'connected' : isDegraded ? 'degraded' : 'disconnected'">
            <span class="status-dot"></span>
            {{ connectionLabel }}
          </span>
          <span class="count-badge">
            {{ filteredAppointments.length }}
            <template v-if="hasActiveFilters">/ {{ count }}</template>
            {{ count === 1 ? 'cita' : 'citas' }}
          </span>
          <span v-if="lastUpdate" class="last-update">
            Última actualización: {{ formatFecha(lastUpdate) }}
          </span>
        </div>
      </div>
      <ExportInProgressButton :appointments="filteredAppointments" :disabled="isLoading" />
    </div>

    <!-- Notice no bloqueante -->
    <div v-if="connectionNotice && !error" class="connection-notice">
      {{ connectionNotice }}
    </div>

    <!-- Filters -->
    <AppointmentFilters v-model:searchQuery="searchQuery" v-model:filterStage="filterStage"
      v-model:filterTipo="filterTipo" v-model:filterLinea="filterLinea" v-model:filterNave="filterNave"
      v-model:filterCliente="filterCliente" v-model:filterTecnologia="filterTecnologia"
      v-model:filterProducto="filterProducto" :hasActiveFilters="hasActiveFilters" :stageOptions="stageOptions"
      :tipoOptions="tipoOptions" :lineaOptions="lineaOptions" :naveOptions="naveOptions"
      :clienteOptions="clienteOptions" :tecnologiaOptions="tecnologiaOptions" :productoOptions="productoOptions"
      @clearFilters="clearFilters" />

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando citas en proceso...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p>{{ error }}</p>
      <button @click="connect" class="btn btn-primary">Reintentar conexión</button>
    </div>

    <!-- Table -->
    <AppointmentTable v-else :appointments="filteredAppointments" :formatFecha="formatFecha"
      :formatTiempo="formatTiempo" :getStageLabel="getStageLabel" :getStageClass="getStageClass"
      :getTiempoClass="getTiempoClass" :getTiempoStageClass="getTiempoStageClass"
      :getTiempoAtencion="getTiempoAtencion" :getTiempoStage="getTiempoStage" />
  </div>
</template>

<script setup lang="ts">
import AppointmentFilters from '../../components/appointments/in-progress/AppointmentFilters.vue';
import AppointmentTable from '../../components/appointments/in-progress/AppointmentTable.vue';
import ExportInProgressButton from '../../components/appointments/in-progress/ExportInProgressButton.vue';
import { useAppointmentsInProgress } from '../../composables/appointments/useAppointmentsInProgress';

const {
  filteredAppointments,
  count,
  lastUpdate,
  isLoading,
  isConnected,
  isDegraded,
  connectionLabel,
  connectionNotice,
  error,

  // Filters
  searchQuery,
  filterNave,
  filterLinea,
  filterCliente,
  filterTecnologia,
  filterProducto,
  filterStage,
  filterTipo,
  hasActiveFilters,

  // Filter options
  naveOptions,
  lineaOptions,
  clienteOptions,
  tecnologiaOptions,
  productoOptions,
  stageOptions,
  tipoOptions,

  // Methods
  clearFilters,
  connect,
  formatTiempo,
  formatFecha,
  getStageLabel,
  getTiempoClass,
  getTiempoStageClass,
  getStageClass,
  // New time calculation methods
  getTiempoAtencion,
  getTiempoStage,

} = useAppointmentsInProgress();
</script>

<style scoped>
.in-progress-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.view-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}

.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
}

.connected .status-dot {
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.5);
}

.connected {
  color: #4ade80;
}

.disconnected .status-dot {
  background: #f87171;
  box-shadow: 0 0 6px rgba(248, 113, 113, 0.5);
}

.disconnected {
  color: #f87171;
}

.degraded .status-dot {
  background: #fbbf24;
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.45);
}

.degraded {
  color: #fbbf24;
}

.connection-notice {
  padding: 0.65rem 0.85rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.08);
  color: #facc15;
  font-size: 0.82rem;
}

.count-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.last-update {
  color: #64748b;
  font-size: 0.75rem;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: #94a3b8;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #1e293b;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #f87171;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 0.75rem;
}

.error-icon {
  width: 2.5rem;
  height: 2.5rem;
}
</style>