<template>
  <div class="in-progress-view">
    <div class="view-header">
      <div class="header-left">
        <h2 class="view-title">Citas en Proceso - Carga General</h2>
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
      <ExportGeneralCargoInProgressButton :appointments="filteredAppointments" :disabled="isLoading" />
    </div>

    <div v-if="connectionNotice && !error" class="connection-notice">{{ connectionNotice }}</div>

    <GeneralCargoAppointmentFilters
      v-model:searchQuery="searchQuery"
      v-model:filterStage="filterStage"
      v-model:filterTipoOperativa="filterTipoOperativa"
      v-model:filterCliente="filterCliente"
      v-model:filterProducto="filterProducto"
      v-model:filterNave="filterNave"
      :hasActiveFilters="hasActiveFilters"
      :stageOptions="stageOptions"
      :tipoOperativaOptions="tipoOperativaOptions"
      :clienteOptions="clienteOptions"
      :productoOptions="productoOptions"
      :naveOptions="naveOptions"
      @clearFilters="clearFilters"
    />

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando citas de carga general...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="connect" class="btn btn-primary">Reintentar conexión</button>
    </div>

    <GeneralCargoAppointmentTable
      v-else
      :appointments="filteredAppointments"
      :formatTiempo="formatTiempo"
      :getStageLabel="getStageLabel"
      :getStageClass="getStageClass"
      :getTiempoClass="getTiempoClass"
      :getTiempoStageClass="getTiempoStageClass"
    />
  </div>
</template>

<script setup lang="ts">
import GeneralCargoAppointmentFilters from '../../components/appointments/in-progress-general-cargo/GeneralCargoAppointmentFilters.vue';
import GeneralCargoAppointmentTable from '../../components/appointments/in-progress-general-cargo/GeneralCargoAppointmentTable.vue';
import ExportGeneralCargoInProgressButton from '../../components/appointments/in-progress-general-cargo/ExportGeneralCargoInProgressButton.vue';
import { useGeneralCargoAppointmentsInProgress } from '../../composables/appointments/useGeneralCargoAppointmentsInProgress';

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
  searchQuery,
  filterStage,
  filterTipoOperativa,
  filterCliente,
  filterProducto,
  filterNave,
  hasActiveFilters,
  stageOptions,
  tipoOperativaOptions,
  clienteOptions,
  productoOptions,
  naveOptions,
  clearFilters,
  connect,
  formatTiempo,
  formatFecha,
  getStageLabel,
  getStageClass,
  getTiempoClass,
  getTiempoStageClass,
} = useGeneralCargoAppointmentsInProgress();
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

.connection-status { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 500; }
.status-dot { width: 0.5rem; height: 0.5rem; border-radius: 9999px; }
.connected .status-dot { background: #4ade80; }
.connected { color: #4ade80; }
.disconnected .status-dot { background: #f87171; }
.disconnected { color: #f87171; }
.degraded .status-dot { background: #fbbf24; }
.degraded { color: #fbbf24; }
.connection-notice { padding: 0.65rem 0.85rem; border-radius: 0.6rem; border: 1px solid rgba(251, 191, 36, 0.35); background: rgba(251, 191, 36, 0.08); color: #facc15; }
.count-badge { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.last-update { color: #64748b; font-size: 0.75rem; }
.loading-state, .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; gap: 1rem; }
.spinner { width: 2.5rem; height: 2.5rem; border: 3px solid #1e293b; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
