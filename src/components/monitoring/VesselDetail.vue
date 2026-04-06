<template>
    <div class="vessel-detail animate-fade-in">
    <SspPermissionClassificationModal
      v-if="showSspModal"
      :vessel-data="vesselData"
      @close="showSspModal = false"
      @saved="handleSspSaved"
    />

        <div class="vessel-detail-header">
            <div>
                <h2 class="vessel-title">{{ vesselData.manifest.name }}</h2>
                <p class="vessel-last-update">
                Última actualización: {{ new Date(vesselData.last_update).toLocaleString() }}
            </p>
            </div>
            <div class="header-actions">
                <ExportStockpilingButton
                    :vessel-data="vesselData"
                    :loading="loading"
                />
                <ExportStockpilingDetailButton
                    :vessel-data="vesselData"
                    :loading="loading"
                />
                <ExportIndirectShipmentButton
                    :vessel-data="vesselData"
                    :loading="loading"
                />
                <ExcelExporterButton
                :vessel-data="vesselData"
                :loading="loading"
                />
                <button
                  v-if="supportsSspClassification"
                  @click="showSspModal = true"
                  class="btn btn-outline-primary refresh-button"
                  :disabled="loading"
                >
                  ⚙️ Clasificar SSP
                </button>
                <button
                    @click="handleRefreshHolds"
                    class="btn btn-outline-info refresh-button"
                    :disabled="refreshingHolds || loading"
                >
                    {{ refreshingHolds ? '⏳' : '🔄' }} Bodegas
                </button>
                <button
                    @click="handleRefreshServices"
                    class="btn btn-outline-info refresh-button"
                    :disabled="refreshingServices || loading"
                >
                  {{ refreshingServices ? '⏳' : '🔄' }} {{ serviceLabel }}
                </button>
            </div>
        </div>

        <HoldAlerts
          v-if="vesselData.operation_type !== 'STOCKPILING'"
          :hold-alerts="vesselData.hold_alerts"
          :completion-alerts="vesselData.completion_alerts"
        />

        <SummaryCards
          :holds-count="displayVesselData.summary.holds.length"
          :services-count="displayVesselData.summary.services.length"
          :shifts-count="displayVesselData.shifts_worked.length"
            :current-shift="currentShift"
            :view-mode="viewMode"
            :total-weight-current-shift="totalWeightCurrentShift"
            :total-goods-current-shift="totalGoodsCurrentShift"
            :operation-type="vesselData.operation_type"
            :summary="summary"
          :service-label="serviceLabel"
        />

        <ToggleView
            :active-tab="activeTab"
          :service-label="serviceLabelSingular"
            @update:activeTab="activeTab = $event"
        />

        <SspPermissionFilterToggle
          v-if="supportsSspClassification"
          :model-value="sspFilter"
          @update:modelValue="sspFilter = $event"
        />

        <SwitchMetric
            :view-mode="viewMode"
            @update:viewMode="viewMode = $event"
        />

        <ToggleDetailMode
          :mode="detailMode"
          @update:mode="detailMode = $event"
        />

        <CurrentShiftSummary
          v-if="detailMode === 'current-shift'"
          :holds="displayVesselData.summary.holds"
          :services="displayVesselData.summary.services"
          :active-tab="activeTab"
          :view-mode="viewMode"
          :current-shift="currentShift"
          :service-label="serviceLabelSingular"
        />

        <MonitoringTable
          v-else
            :shifts="pivotedData.shifts"
            :columns="pivotedData.columns"
            :column-totals="columnTotals"
            :view-mode="viewMode"
            :current-shift="currentShift"
            :operation-type="vesselData.operation_type"
        />

    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SummaryData } from '../../composables/monitoring/useMonitoringCalculations';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import ExcelExporterButton from './ExcelExporterButton.vue';
import ExportStockpilingButton from './ExportStockpilingButton.vue';
import ExportStockpilingDetailButton from './ExportStockpilingDetailButton.vue';
import ExportIndirectShipmentButton from './ExportIndirectShipmentButton.vue';
import CurrentShiftSummary from './CurrentShiftSummary.vue';
import MonitoringTable from './MonitoringTable.vue';
import SummaryCards from './SummaryCards.vue';
import SwitchMetric from './SwitchMetric.vue';
import ToggleDetailMode from './ToggleDetailMode.vue';
import ToggleView from './ToggleView.vue';
import { useTablePivot } from '../../composables/monitoring/useTablePivot';
import { useMonitoringCalculations } from '../../composables/monitoring/useMonitoringCalculations';
import { refreshHolds, refreshServices } from '../../services/monitoringService';
import HoldAlerts from './HoldAlerts.vue';
import SspPermissionFilterToggle from './SspPermissionFilterToggle.vue';
import SspPermissionClassificationModal from './SspPermissionClassificationModal.vue';

interface CompleteSummary {
  holds: SummaryData;
  services: SummaryData;
}

const props = defineProps<{
    vesselData: VesselData,
  loading: boolean
}>();

const viewMode = ref<'weight' | 'goods'>('weight');
const refreshingHolds = ref(false);
const refreshingServices = ref(false);
const detailMode = ref<'current-shift' | 'detailed'>('current-shift');
const showSspModal = ref(false);
const sspFilter = ref<'all' | 'internal' | 'external'>('all');

// Determinar el tab inicial basado en el tipo de operación
const activeTab = ref<'holds' | 'services'>(
  props.vesselData.operation_type === 'STOCKPILING' ? 'services' : 'holds'
);

// Actualizar activeTab cuando cambie el tipo de operación del buque
watch(() => props.vesselData.operation_type, (newOperationType) => {
  activeTab.value = newOperationType === 'STOCKPILING' ? 'services' : 'holds';
});

watch(() => props.vesselData.manifest.id, () => {
  sspFilter.value = 'all';
  showSspModal.value = false;
});

const supportsSspClassification = computed(() => props.vesselData.supports_ssp_classification);

const serviceLabel = computed(() => supportsSspClassification.value ? 'Permisos' : 'Servicios');
const serviceLabelSingular = computed(() => supportsSspClassification.value ? 'Permiso' : 'BL Item');

const filteredServices = computed(() => {
  const services = props.vesselData.summary.services ?? [];

  if (!supportsSspClassification.value || sspFilter.value === 'all') {
    return services;
  }

  const expectedScope = sspFilter.value === 'internal' ? 'INTERNAL' : 'EXTERNAL';
  return services.filter((service) => service.permission_scope === expectedScope);
});

const displayVesselData = computed<VesselData>(() => ({
  ...props.vesselData,
  summary: {
    ...props.vesselData.summary,
    services: filteredServices.value,
  },
}));

const {
  currentShift,
  totalGoodsCurrentShift,
  totalWeightCurrentShift,
  serviceSummary,
  holdSummary,
} = useMonitoringCalculations(displayVesselData);

const summary = computed<CompleteSummary>(() => ({
  holds: holdSummary.value,
  services: serviceSummary.value,
}));

const { pivotedData, columnTotals } = useTablePivot(displayVesselData, activeTab);

async function handleRefreshHolds() {
  refreshingHolds.value = true;
  try {
    await refreshHolds({
      manifest_id: props.vesselData.manifest.id,
      operation_type: props.vesselData.operation_type,
    });
  } catch (error) {
    console.error('Error al refrescar bodegas:', error);
  } finally {
    refreshingHolds.value = false;
  }
}

async function handleRefreshServices() {
  refreshingServices.value = true;
  try {
    await refreshServices({
      manifest_id: props.vesselData.manifest.id,
      operation_type: props.vesselData.operation_type,
    });
  } catch (error) {
    console.error('Error al refrescar servicios:', error);
  } finally {
    refreshingServices.value = false;
  }
}

function handleSspSaved() {
  showSspModal.value = false;
}

</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

.vessel-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #374151;
}

.vessel-title {
    margin: 0;
    margin-bottom: 0.375rem;
    color: #e2e8f0;
    font-size: 1.5rem;
    font-weight: 600;
}

.vessel-last-update {
    margin: 0;
    font-size: 0.875rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}



.header-actions {
    display: flex;
  flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-outline-primary {
  background: rgba(59, 130, 246, 0.14);
  color: #bfdbfe;
  border: 1px solid rgba(59, 130, 246, 0.35);
}

.btn-outline-primary:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
}

.refresh-button:disabled {
    opacity: 0.5;
}

@media (max-width: 767px) {
    .vessel-detail-header {
        flex-direction: column;
        gap: 1rem;
    }

    .header-actions {
        width: 100%;
        flex-direction: column;
    }

    .refresh-button {
        width: 100%;
    }
}

</style>