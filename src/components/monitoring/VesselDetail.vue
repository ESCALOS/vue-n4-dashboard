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
            :active-tab="activeTab"
            @update:activeTab="$emit('update:activeTab', $event)"
        />

        <SwitchMetric
            :view-mode="viewMode"
            @update:viewMode="$emit('update:viewMode', $event)"
        />

        <MonitoringTable
            :shifts="pivotedShifts"
            :columns="pivotedColumns"
            :column-totals="columnTotals"
            :view-mode="viewMode"
            :current-shift="currentShift"
            :operation-type="vesselData.operation_type"
        />

    </div>
</template>

<script setup lang="ts">
import type { SummaryData } from '../../composables/monitoring/useMonitoringCalculations';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import ExcelExporterButton from './ExcelExporterButton.vue';
import ExportStockpilingButton from './ExportStockpilingButton.vue';
import MonitoringTable from './MonitoringTable.vue';
import SummaryCards from './SummaryCards.vue';
import SwitchMetric from './SwitchMetric.vue';
import ToggleView from './ToggleView.vue';

interface CompleteSummary {
  holds: SummaryData;
  services: SummaryData;
}

defineProps<{
    vesselData: VesselData,
    loading: boolean,
    activeTab: 'holds' | 'services'
    viewMode: 'weight' | 'goods'
    currentShift: string
    summary: CompleteSummary
    totalWeightCurrentShift: number
    totalGoodsCurrentShift: number
    pivotedShifts: {
        shift: string;
        columns: {
            weight: number;
            goods: number;
        }[];
        totalWeight: number;
        totalGoods: number;
    }[],
    pivotedColumns: {
        key: string;
        manifested_weight: number;
        manifested_goods: number;
    }[],
    columnTotals: {
        weight: {
            manifested: number[];
            processed: number[];
            difference: number[];
        };
        goods: {
            manifested: number[];
            processed: number[];
            difference: number[];
        };
    }
}>();

defineEmits<{
  refresh: [];
  'update:activeTab': [value: 'holds' | 'services'];
  'update:viewMode': [value: 'weight' | 'goods'];
}>();
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