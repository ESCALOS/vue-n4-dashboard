<template>
  <div class="containers-view">
    <ContainerSearchHeader
      :monitored-vessels="monitoredVessels"
      :selected-vessel="selectedVessel"
      :loading="loading"
      :error="error"
      :vessel-name="vesselData?.manifest.vessel_name"
      :last-update="vesselData?.last_update"
      :connection-message="connectionMessage"
      @add-vessel="addVessel"
      @remove-vessel="removeVessel"
      @select-vessel="selectVessel"
    />

    <template v-if="vesselData">
      <div class="selected-vessel-actions">
        <div>
          <strong>{{ vesselData.manifest.vessel_name }}</strong>
          <span>Manifiesto {{ vesselData.manifest.id }}</span>
        </div>
        <div class="selected-vessel-buttons">
          <button class="export-button" :disabled="loading || exportLoading" @click="exportReport">
            Exportar resumen de operación
          </button>
          <button class="export-button export-button--booking" :disabled="loading || exportLoading" @click="exportBookings">
            Exportar reservas de embarque
          </button>
        </div>
      </div>

      <ContainerSummaryCards
        :summary="vesselData.summary"
        @open-not-arrived="openNotArrivedModal"
      />

      <ContainerPendingByBay
        :pending-by-bay="vesselData.pending_by_bay"
        :show-restow="vesselData.summary.restow.total > 0"
        @select-bay="selectBay"
      />

      <ContainerFilters
        :bay-filter="bayFilter"
        :status-filter="statusFilter"
        :iso-filter="isoFilter"
        :size-filter="sizeFilter"
        :position-filter="positionFilter"
        :available-bays="availableBays"
        :available-isos="availableIsos"
        :available-sizes="availableSizes"
        @update:bay-filter="bayFilter = $event"
        @update:status-filter="statusFilter = $event"
        @update:iso-filter="isoFilter = $event"
        @update:size-filter="sizeFilter = $event"
        @update:position-filter="positionFilter = $event"
        @clear-filters="clearFilters"
      />

      <ContainerTable :containers="filteredContainers" />
    </template>

    <NotArrivedContainersModal
      ref="notArrivedModalRef"
      :items="notArrivedItems"
      :loading="notArrivedLoading"
      :error="notArrivedError"
      :vessel-name="vesselData?.manifest.vessel_name"
      :manifest-id="vesselData?.manifest.id"
      @close="handleNotArrivedModalClose"
      @export="exportNotArrivedExcel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useContainerMonitoring } from '../../composables/monitoring/useContainerMonitoring';
import {
  getContainerOperationsReport,
  getContainerBookingExport,
  getNotArrivedContainersByManifest,
} from '../../services/monitoringService';
import { exportContainerOperationsExcel } from '../../services/containerOperationsExcelService';
import { exportNotArrivedContainersExcel } from '../../services/notArrivedContainersExcelService';
import { exportContainerBookingExcel } from '../../services/containerBookingExcelService';
import type { NotArrivedContainerItem } from '../../interfaces/monitoring/ContainerMonitoring';
import ContainerSearchHeader from '../../components/monitoring/containers/ContainerSearchHeader.vue';
import ContainerSummaryCards from '../../components/monitoring/containers/ContainerSummaryCards.vue';
import ContainerPendingByBay from '../../components/monitoring/containers/ContainerPendingByBay.vue';
import ContainerFilters from '../../components/monitoring/containers/ContainerFilters.vue';
import ContainerTable from '../../components/monitoring/containers/ContainerTable.vue';
import NotArrivedContainersModal from '../../components/monitoring/containers/NotArrivedContainersModal.vue';

const {
  monitoredVessels,
  selectedVessel,
  vesselData,
  loading,
  error,
  connectionMessage,
  bayFilter,
  statusFilter,
  isoFilter,
  sizeFilter,
  positionFilter,
  availableBays,
  availableIsos,
  availableSizes,
  filteredContainers,
  startVesselsSSE,
  selectVessel,
  addVessel,
  removeVessel,
  clearFilters,
  selectBay,
} = useContainerMonitoring();

const notArrivedModalRef = ref<InstanceType<typeof NotArrivedContainersModal> | null>(null);
const notArrivedItems = ref<NotArrivedContainerItem[]>([]);
const notArrivedLoading = ref(false);
const notArrivedError = ref('');
const exportLoading = ref(false);

onMounted(() => {
  startVesselsSSE();
});

const exportReport = async () => {
  if (!selectedVessel.value) return;

  try {
    exportLoading.value = true;
    const report = await getContainerOperationsReport(selectedVessel.value.gkey);
    await exportContainerOperationsExcel(report);
  } catch (err) {
    console.error('Error exportando reporte de contenedores:', err);
    error.value = err instanceof Error ? err.message : 'Error al exportar reporte';
  } finally {
    exportLoading.value = false;
  }
};

const exportBookings = async () => {
  if (!selectedVessel.value) return;
  try {
    exportLoading.value = true;
    error.value = '';
    const items = await getContainerBookingExport(selectedVessel.value.gkey);
    await exportContainerBookingExcel(items, vesselData.value?.manifest.id ?? selectedVessel.value.id);
  } catch (err) {
    console.error('Error exportando reservas de embarque:', err);
    error.value = err instanceof Error ? err.message : 'Error al exportar reservas de embarque';
  } finally {
    exportLoading.value = false;
  }
};

const openNotArrivedModal = async () => {
  if (!selectedVessel.value) return;

  notArrivedError.value = '';
  notArrivedLoading.value = true;
  notArrivedItems.value = [];
  notArrivedModalRef.value?.open();

  try {
    notArrivedItems.value = await getNotArrivedContainersByManifest(selectedVessel.value.gkey);
  } catch (err) {
    notArrivedError.value = err instanceof Error
      ? err.message
      : 'Error al cargar contenedores faltantes';
  } finally {
    notArrivedLoading.value = false;
  }
};

const handleNotArrivedModalClose = () => {
  notArrivedItems.value = [];
  notArrivedError.value = '';
  notArrivedLoading.value = false;
};

const exportNotArrivedExcel = async () => {
  if (!selectedVessel.value) return;

  await exportNotArrivedContainersExcel(
    vesselData.value?.manifest.id ?? selectedVessel.value.id,
    vesselData.value?.manifest.vessel_name ?? 'NAVE',
    notArrivedItems.value,
  );
};
</script>

<style scoped>
.containers-view {
  max-width: 87.5rem;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selected-vessel-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  background: #1a1a2e;
  color: #e2e8f0;
}

.selected-vessel-actions span {
  display: block;
  margin-top: 0.25rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

.selected-vessel-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.export-button {
  padding: 0.625rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #0ea5e9;
  color: #fff;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.export-button--booking { background: #4f46e5; }
.export-button:disabled { cursor: not-allowed; opacity: 0.5; }

@media (max-width: 48rem) {
  .selected-vessel-actions { align-items: flex-start; flex-direction: column; }
}
</style>
