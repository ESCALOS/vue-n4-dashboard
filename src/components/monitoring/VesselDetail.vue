<template>
    <div class="vessel-detail animate-fade-in">
        <div class="vessel-detail-header">
            <div>
                <h2 class="vessel-title">{{ vesselData.manifest.name }}</h2>
                <p class="vessel-last-update">
                Última actualización: {{ new Date(vesselData.last_update).toLocaleString() }}
                <span
                    v-if="isConnected"
                    class="connection-badge connection-badge-live"
                    title="Conectado en tiempo real"
                >
                    🟢 Live
                </span>
                <span v-else class="connection-badge connection-badge-offline" title="Desconectado"> 🔴 Offline </span>
                </p>
            </div>
            <div class="header-actions">
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
import MonitoringTable from './MonitoringTable.vue';
import SummaryCards from './SummaryCards.vue';

interface CompleteSummary {
  holds: SummaryData;
  services: SummaryData;
}

defineProps<{
    vesselData: VesselData,
    isConnected: boolean,
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

.connection-badge {
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border: 1px solid transparent;
}

.connection-badge-live {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.3);
    animation: pulse 1.5s ease-in-out infinite;
}

.connection-badge-offline {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
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

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}
</style>