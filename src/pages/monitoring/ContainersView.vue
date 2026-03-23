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
      <ContainerSummaryCards :summary="vesselData.summary" />

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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useContainerMonitoring } from '../../composables/monitoring/useContainerMonitoring';
import ContainerSearchHeader from '../../components/monitoring/containers/ContainerSearchHeader.vue';
import ContainerSummaryCards from '../../components/monitoring/containers/ContainerSummaryCards.vue';
import ContainerPendingByBay from '../../components/monitoring/containers/ContainerPendingByBay.vue';
import ContainerFilters from '../../components/monitoring/containers/ContainerFilters.vue';
import ContainerTable from '../../components/monitoring/containers/ContainerTable.vue';

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

onMounted(() => {
  startVesselsSSE();
});
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