<template>
    <div class="vessel-detail animate-fade-in">
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
                <ExcelExporterButton
                :vessel-data="vesselData"
                :loading="loading"
                />
                <button @click="$emit('refresh')" class="btn btn-success refresh-button" :disabled="loading">
                🔄 Actualizar
                </button>
            </div>
        </div>

        <SummaryCards
            :holds-count="vesselData.summary.holds.length"
            :services-count="vesselData.summary.services.length"
            :shifts-count="vesselData.shifts_worked.length"
            :current-shift="currentShift"
            :view-mode="viewMode"
            :total-weight-current-shift="totalWeightCurrentShift"
            :total-goods-current-shift="totalGoodsCurrentShift"
            :operation-type="vesselData.operation_type"
            :summary="summary"
        />

        <ToggleView
            v-if="showHoldsTab"
            :active-tab="activeTab"
            @update:activeTab="activeTab = $event"
        />

        <SwitchMetric
            :view-mode="viewMode"
            @update:viewMode="viewMode = $event"
        />

        <MonitoringTable
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
import { ref, toRef, computed, watch } from 'vue';
import type { SummaryData } from '../../composables/monitoring/useMonitoringCalculations';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import ExcelExporterButton from './ExcelExporterButton.vue';
import ExportStockpilingButton from './ExportStockpilingButton.vue';
import ExportStockpilingDetailButton from './ExportStockpilingDetailButton.vue';
import MonitoringTable from './MonitoringTable.vue';
import SummaryCards from './SummaryCards.vue';
import SwitchMetric from './SwitchMetric.vue';
import ToggleView from './ToggleView.vue';
import { useTablePivot } from '../../composables/monitoring/useTablePivot';

interface CompleteSummary {
  holds: SummaryData;
  services: SummaryData;
}

const props = defineProps<{
    vesselData: VesselData,
    loading: boolean,
    currentShift: string
    summary: CompleteSummary
    totalWeightCurrentShift: number
    totalGoodsCurrentShift: number
}>();

defineEmits<{
  refresh: [];
}>();

const viewMode = ref<'weight' | 'goods'>('weight');

// Determinar el tab inicial basado en el tipo de operación
const activeTab = ref<'holds' | 'services'>(
  props.vesselData.operation_type === 'STOCKPILING' ? 'services' : 'holds'
);

// Actualizar activeTab cuando cambie el tipo de operación del buque
watch(() => props.vesselData.operation_type, (newOperationType) => {
  activeTab.value = newOperationType === 'STOCKPILING' ? 'services' : 'holds';
});

// Verificar si el tab de holds debe estar disponible
const showHoldsTab = computed(() => props.vesselData.operation_type !== 'STOCKPILING');
const vesselDataRef = toRef(props, 'vesselData');

const { pivotedData, columnTotals } = useTablePivot(vesselDataRef, activeTab);

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
    gap: 0.75rem;
    align-items: center;
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