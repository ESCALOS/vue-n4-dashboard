<template>
  <div class="summary-cards">
    <MetricCard
      icon="📦"
      title="Bodegas Totales"
      subtitle="Bodegas"
      :count="holdsCount"
      :view-mode="viewMode"
      :summary="summary.holds"
      :operation-type="operationType"
    />

    <MetricCard
      icon="📋"
      title="Servicios Totales"
      subtitle="Servicios"
      :count="servicesCount"
      :view-mode="viewMode"
      :summary="summary.services"
      :operation-type="operationType"
    />

    <ShiftCard
        :count="shiftsCount"
        :current-shift="currentShift"
        :view-mode="viewMode"
        :total-current-shift="totalWeightCurrentShift"
        :total-goods-current-shift="totalGoodsCurrentShift"
     />

  </div>
</template>

<script setup lang="ts">
import type { SummaryData } from '../../composables/monitoring/useMonitoringCalculations';
import type { OperationType } from '../../types/monitoring/OperationType';
import MetricCard from './MetricCard.vue';
import ShiftCard from './ShiftCard.vue';

interface CompleteSummary {
  holds: SummaryData;
  services: SummaryData;
}

defineProps<{
  holdsCount: number;
  servicesCount: number;
  shiftsCount: number;
  currentShift: string;
  viewMode: 'weight' | 'goods';
  summary: CompleteSummary;
  totalWeightCurrentShift: number;
  totalGoodsCurrentShift: number;
  operationType: OperationType;
}>();
</script>

<style scoped>
/* Cards Container */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    gap: 0.75rem;
  }
}
</style>