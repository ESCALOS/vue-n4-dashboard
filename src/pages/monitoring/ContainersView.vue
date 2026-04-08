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
      @export-report="exportReport"
    />

    <template v-if="vesselData">
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
        :available-bays="availableBays"
        :available-isos="availableIsos"
        :available-sizes="availableSizes"
        @update:bay-filter="bayFilter = $event"
        @update:status-filter="statusFilter = $event"
        @update:iso-filter="isoFilter = $event"
        @update:size-filter="sizeFilter = $event"
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
      :manifest-id="selectedVessel?.id"
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
  getNotArrivedContainersByManifest,
} from '../../services/monitoringService';
import { exportContainerOperationsExcel } from '../../services/containerOperationsExcelService';
import { exportNotArrivedContainersExcel } from '../../services/notArrivedContainersExcelService';
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

onMounted(() => {
  startVesselsSSE();
});

const exportReport = async () => {
  if (!selectedVessel.value) return;

  try {
    const report = await getContainerOperationsReport(selectedVessel.value.id);
    await exportContainerOperationsExcel(report);
  } catch (err) {
    console.error('Error exportando reporte de contenedores:', err);
    error.value = err instanceof Error ? err.message : 'Error al exportar reporte';
  }
};

const openNotArrivedModal = async () => {
  if (!selectedVessel.value) return;

  notArrivedError.value = '';
  notArrivedLoading.value = true;
  notArrivedItems.value = [];
  notArrivedModalRef.value?.open();

  try {
    notArrivedItems.value = await getNotArrivedContainersByManifest(selectedVessel.value.id);
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
    selectedVessel.value.id,
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
</style>