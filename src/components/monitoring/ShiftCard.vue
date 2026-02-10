<template>
  <div class="summary-card">
    <div class="card-header">
      <h3>📅 Jornadas</h3>
    </div>
    <div class="card-body">
      <div class="metric">
        <span class="metric-value">{{ count }}</span>
        <span class="metric-label">Total Jornadas</span>
      </div>
      <div class="metric-list">
        <div class="metric-row">
          <span class="label">Jornada Actual:</span>
          <span :class="['shift-badge', getShiftClass(currentShift)]">
            {{ currentShift }}
          </span>
        </div>
        <div class="metric-row" v-if="viewMode === 'weight'">
          <span class="label">Total en esta jornada:</span>
          <span class="value accent">{{ formatNumber(totalCurrentShift) }} kg</span>
        </div>
        <div class="metric-row" v-if="viewMode === 'goods'">
          <span class="label">Total en esta jornada:</span>
          <span class="value accent">{{ formatNumber(totalGoodsCurrentShift) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber, getShiftClass } from '../../utils/monitoring';


defineProps<{
  count: number;
  currentShift: string;
  viewMode: 'weight' | 'goods';
  totalCurrentShift: number;
  totalGoodsCurrentShift: number;
}>();
</script>

<style scoped>
/* Card Base */
.summary-card {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
}

.summary-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

/* Card Header */
.card-header {
  padding: 1rem 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 1px solid #2d2d44;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #3b82f6;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Card Body */
.card-body {
  padding: 1.25rem;
}

/* Metric Display (Large Number) */
.metric {
  text-align: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2d2d44;
}

.metric-value {
  display: block;
  font-size: 2.25rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: 0.375rem;
}

.metric-label {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Metric List (Details) */
.metric-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.metric-row .label {
  color: #94a3b8;
  flex-shrink: 0;
}

.metric-row .value {
  color: #e2e8f0;
  font-weight: 500;
  text-align: right;
}

.metric-row .value.accent {
  color: #3b82f6;
  font-weight: 600;
}

/* Progress Classes */
.progress-high {
  color: #10b981 !important;
  font-weight: 600;
}

.progress-medium {
  color: #f59e0b !important;
  font-weight: 600;
}

.progress-low {
  color: #ef4444 !important;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .metric-value {
    font-size: 1.875rem;
  }

  .card-header h3 {
    font-size: 0.9375rem;
  }
}

@media (max-width: 480px) {
  .metric-value {
    font-size: 1.5rem;
  }

  .metric-row {
    font-size: 0.8125rem;
  }
}
</style>