<template>
  <div class="general-cargo-view">
        <Transition name="banner">
            <div v-if="!serverConnected" class="server-disconnected-banner">
                <span class="banner-icon">⚠️</span>
                <span>Sin conexión con el servidor. Reintentando automáticamente...</span>
            </div>
        </Transition>

        <HeaderSection @show-add-vessel-form="addVesselFormRef?.open()" />
        
        <!-- Formulario modal con dialog -->
        <AddVesselForm
            ref="addVesselFormRef"
            :loading="loading"
            :error="error"
            @submit="handleAddVessel"
            @cancel="clearError"
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
  serverConnected,
  startOperationsSSE,
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
  const result = await addVessel(vessel);
  if (result.success) {
    addVesselFormRef.value?.close();
  }
};

const clearError = () => {
  error.value = '';
};

const handleRemoveVessel = async (vessel: VesselsRequest) => {
  if (confirm('¿Está seguro de remover esta nave del monitoreo?')) {
    await removeVessel(vessel);
  }
};

onMounted(() => {
    startOperationsSSE();
});

</script>

<style scoped>
.general-cargo-view {
  max-width: 87.5rem;
  margin: 0 auto;
  width: 100%;
}

.server-disconnected-banner {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 0.5rem;
  color: #fca5a5;
  font-size: 0.875rem;
  font-weight: 500;
  animation: pulse-banner 2s ease-in-out infinite;
}

.banner-icon {
  font-size: 1.125rem;
}

@keyframes pulse-banner {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.banner-enter-active {
  transition: all 0.3s ease-out;
}
.banner-leave-active {
  transition: all 0.2s ease-in;
}
.banner-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}
.banner-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>