<template>
  <div class="metric-card">
    <div class="metric-card-header">
      <h3 class="metric-card-title">
        {{ icon }} {{ title }}
      </h3>
    </div>
    
    <div class="metric-card-content">
      <div class="metric-card-main-stat">
        <span class="metric-card-count">
          {{ count }}
        </span>
        <span class="metric-card-subtitle">
          {{ subtitle }}
        </span>
      </div>
      
      <div class="metric-card-details">
        <div v-if="viewMode === 'weight'" class="detail-row">
          <span class="detail-label">Peso Total:</span>
          <span class="detail-value">{{ formatNumber(summary.weight.manifested.value) }} kg</span>
        </div>
        
        <div v-if="viewMode === 'weight'" class="detail-row">
          <span class="detail-label">{{ getOperationLabel(operationType) }}:</span>
          <span class="detail-value detail-value-primary">{{ formatNumber(summary.weight.processed.value) }} kg</span>
        </div>
        
        <div v-if="viewMode === 'goods'" class="detail-row">
          <span class="detail-label">Bultos Total:</span>
          <span class="detail-value">{{ formatNumber(summary.goods.manifested.value) }}</span>
        </div>
        
        <div v-if="viewMode === 'goods'" class="detail-row">
          <span class="detail-label">Descargado:</span>
          <span class="detail-value detail-value-primary">{{ formatNumber(summary.goods.processed.value) }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Progreso:</span>
          <span
            :class="[
              'progress-value',
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
    DISPATCHING: 'Despachado',
    STOCKPILING: 'Acopiado',
    DIRECT_LOADING: 'Embarcado',
    INDIRECT_LOADING: 'Embarcado',
  };
  return labels[tipo] || '✅ Procesado';
};
</script>

<style scoped>
.metric-card {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.metric-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.metric-card-header {
  padding: 1rem 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 1px solid #2d2d44;
}

.metric-card-title {
  margin: 0;
  font-size: 1rem;
  color: #3b82f6;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metric-card-content {
  padding: 1.25rem;
}

.metric-card-main-stat {
  text-align: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2d2d44;
}

.metric-card-count {
  display: block;
  font-size: 2.25rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: 0.375rem;
}

.metric-card-subtitle {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.detail-label {
  color: #94a3b8;
  flex-shrink: 0;
}

.detail-value {
  color: #e2e8f0;
  font-weight: 500;
  text-align: right;
}

.detail-value-primary {
  color: #3b82f6;
  font-weight: 600;
}

.progress-value {
  font-weight: 600;
  text-align: right;
}

@media (max-width: 767px) {
  .metric-card-count {
    font-size: 2rem;
  }
}

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
