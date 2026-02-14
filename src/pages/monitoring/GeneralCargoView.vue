<template>
  <div class="general-cargo-view">
        <HeaderSection @show-add-vessel-form="addVesselFormRef?.open()" />
        
        <!-- Formulario modal con dialog -->
        <AddVesselForm
            ref="addVesselFormRef"
            :loading="loading"
            :error="error"
            @submit="handleAddVessel"
        />

        <EmptyState
            v-if="monitoredVessels.length === 0"
            @show-add-vessel-form="addVesselFormRef?.open()"
        />
        <VesselTabs
            v-if="monitoredVessels.length > 0"
            :vessels="monitoredVessels"
            :selected-vessel="selectedVessel"
            @select="selectVessel"
            @remove="handleRemoveVessel"
        />

        <VesselDetail
            v-if="selectedVesselData"
            :vessel-data="selectedVesselData"
            :is-connected="true"
            :loading="loading"
            v-model:active-tab="activeTab"
            v-model:view-mode="viewMode"
            :current-shift="currentShift"
            :summary="summary"
            :total-goods-current-shift="totalGoodsCurrentShift"
            :total-weight-current-shift="totalWeightCurrentShift"
            :pivoted-shifts="pivotedData.shifts"
            :pivoted-columns="pivotedData.columns"
            :column-totals="columnTotals"
            @refresh="refreshData"
        />

    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import EmptyState from '../../components/monitoring/EmptyState.vue';
import HeaderSection from '../../components/monitoring/HeaderSection.vue';
import VesselTabs from '../../components/monitoring/VesselTabs.vue';
import type { VesselsRequest } from '../../interfaces/monitoring/api/VesselResquest';
import VesselDetail from '../../components/monitoring/VesselDetail.vue';
import AddVesselForm from '../../components/monitoring/AddVesselForm.vue';
import { useMonitoringCalculations } from '../../composables/monitoring/useMonitoringCalculations';
import { useTablePivot } from '../../composables/monitoring/useTablePivot';
import { useMonitoringData } from '../../composables/monitoring/useMonitoringData';

const addVesselFormRef = ref<InstanceType<typeof AddVesselForm>>();
const activeTab = ref<'holds' | 'services'>('holds');
const viewMode = ref<'weight' | 'goods'>('weight');

const {
  monitoredVessels,
  selectedVessel,
  selectedVesselData,
  loading,
  error,
  loadMonitoredVessels,
  selectVessel,
  addVessel,
  removeVessel,
  refreshData
} = useMonitoringData();


const {
  currentShift,
  totalGoodsCurrentShift,
  totalWeightCurrentShift,
  serviceSummary,
  holdSummary
} = useMonitoringCalculations(selectedVesselData);

const summary = computed(() => ({
  holds: holdSummary.value,
  services: serviceSummary.value
}));

const { pivotedData, columnTotals } = useTablePivot(selectedVesselData, activeTab);

const handleAddVessel = async (vessel: VesselsRequest) => {
  await addVessel(vessel);
};

const handleRemoveVessel = async (vessel: VesselsRequest) => {
  if (confirm('¿Está seguro de remover esta nave del monitoreo?')) {
    await removeVessel(vessel);
  }
};

onMounted(() => {
    loadMonitoredVessels();
});

</script>

<style scoped>
.general-cargo-view {
  max-width: 87.5rem;
  margin: 0 auto;
  width: 100%;
}
</style>