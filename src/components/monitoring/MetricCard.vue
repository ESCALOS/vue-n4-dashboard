<template>
  <div class="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl overflow-hidden transition-all duration-200 hover:border-blue-500 hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:-translate-y-0.5">
    <div class="px-5 py-4 bg-blue-500/10 border-b border-[#2d2d44]">
      <h3 class="m-0 text-base text-blue-500 font-semibold flex items-center gap-2">
        {{ icon }} {{ title }}
      </h3>
    </div>
    
    <div class="p-5">
      <div class="text-center mb-4 pb-4 border-b border-[#2d2d44]">
        <span class="block text-4xl md:text-[2.25rem] font-bold text-blue-500 leading-none mb-1.5">
          {{ count }}
        </span>
        <span class="block text-sm text-slate-400 uppercase tracking-wide">
          {{ subtitle }}
        </span>
      </div>
      
      <div class="flex flex-col gap-3">
        <div v-if="viewMode === 'weight'" class="flex justify-between items-center text-sm gap-2">
          <span class="text-slate-400 shrink-0">Peso Total:</span>
          <span class="text-slate-200 font-medium text-right">{{ formatNumber(summary.weight.manifested.value) }} kg</span>
        </div>
        
        <div v-if="viewMode === 'weight'" class="flex justify-between items-center text-sm gap-2">
          <span class="text-slate-400 shrink-0">{{ getOperationLabel(operationType) }}:</span>
          <span class="text-blue-500 font-semibold text-right">{{ formatNumber(summary.weight.processed.value) }} kg</span>
        </div>
        
        <div v-if="viewMode === 'goods'" class="flex justify-between items-center text-sm gap-2">
          <span class="text-slate-400 shrink-0">Bultos Total:</span>
          <span class="text-slate-200 font-medium text-right">{{ formatNumber(summary.goods.manifested.value) }}</span>
        </div>
        
        <div v-if="viewMode === 'goods'" class="flex justify-between items-center text-sm gap-2">
          <span class="text-slate-400 shrink-0">Descargado:</span>
          <span class="text-blue-500 font-semibold text-right">{{ formatNumber(summary.goods.processed.value) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-sm gap-2">
          <span class="text-slate-400 shrink-0">Progreso:</span>
          <span
            :class="[
              'font-semibold text-right',
              getProgressClass(viewMode === 'weight' ? summary.weight.percentage.value : summary.goods.percentage.value),
            ]"
          >
            {{ (viewMode === 'weight' ? summary.weight.percentage.value : summary.goods.percentage.value).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SummaryData } from '../../composables/monitoring/useMonitoringCalculations';
import type { OperationType } from '../../types/monitoring/OperationType';
import { formatNumber, getProgressClass } from '../../utils/monitoring';

defineProps<{
  icon: string;
  title: string;
  subtitle: string;
  count: number;
  viewMode: 'weight' | 'goods';
  summary: SummaryData;
  operationType: OperationType;
}>();

const getOperationLabel = (tipo: OperationType): string => {
  const labels: Record<OperationType, string> = {
    DESPACHO: 'Despachado',
    ACOPIO: 'Acopiado',
    EMBARQUE_DIRECTO: 'Embarcado',
    EMBARQUE_INDIRECTO: 'Embarcado',
  };
  return labels[tipo] || '✅ Procesado';
};
</script>

<style scoped>
/* Progress Classes */
.progress-high {
  color: #10b981 !important;
}

.progress-medium {
  color: #f59e0b !important;
}

.progress-low {
  color: #ef4444 !important;
}
</style>
