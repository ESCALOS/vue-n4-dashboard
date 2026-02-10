<template>
    <div class="animate-fade-in">
        <div class="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-700 max-md:flex-col max-md:gap-4">
            <div>
                <h2 class="m-0 mb-1.5 text-slate-200 text-2xl font-semibold">{{ vesselData.manifest.name }}</h2>
                <p class="m-0 text-sm text-slate-500 flex items-center gap-3">
                Última actualización: {{ new Date(vesselData.last_update).toLocaleString() }}
                <span
                    v-if="isConnected"
                    class="px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 bg-green-500/15 text-green-500 border border-green-500/30 animate-pulse"
                    title="Conectado en tiempo real"
                >
                    🟢 Live
                </span>
                <span v-else class="px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 bg-red-500/15 text-red-500 border border-red-500/30" title="Desconectado"> 🔴 Offline </span>
                </p>
            </div>
            <div class="flex gap-3 items-center max-md:w-full max-md:flex-col">
                <ExcelExporterButton
                :vessel-data="vesselData"
                :loading="loading"
                />
                <button @click="$emit('refresh')" class="btn btn-success disabled:opacity-50 max-md:w-full" :disabled="loading">
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

    </div>
</template>

<script setup lang="ts">
import type { SummaryData } from '../../composables/monitoring/useMonitoringCalculations';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import ExcelExporterButton from './ExcelExporterButton.vue';
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
</style>