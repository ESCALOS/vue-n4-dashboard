<template>
  <div class="current-shift-summary">
    <div class="summary-header">
      <h3 class="summary-title">
        ⏱️ Resumen del turno actual
      </h3>
      <p class="summary-subtitle">
        {{ activeTab === 'holds' ? 'Por Bodega' : 'Por BL Item' }} • {{ currentShift }}
      </p>
      <div class="summary-legend">
        <span class="legend-item">
          <span class="legend-color legend-color-previous" />
          Otros turnos
        </span>
        <span class="legend-item">
          <span class="legend-color legend-color-current" />
          Turno actual
        </span>
        <span class="legend-item">
          <span class="legend-color legend-color-remaining" />
          Restante
        </span>
      </div>
    </div>

    <div class="bars-wrapper" v-if="items.length > 0">
      <div class="progress-item" v-for="item in items" :key="item.id">
        <div class="bar-area">
          <span :class="['bar-percentage', getProgressClass(item.percentage)]">
            {{ item.percentage.toFixed(1) }}%
          </span>
          <div class="bar-track">
            <div
              class="bar-stack"
              :style="{ height: `${Math.min(item.percentage, 100)}%` }"
            >
              <div
                v-if="item.currentShiftPercentage > 0"
                class="bar-segment bar-segment-current"
                :style="{ height: `${item.currentShiftSegmentPercentage}%` }"
              />
              <div
                v-if="item.previousShiftPercentage > 0"
                class="bar-segment bar-segment-previous"
                :style="{ height: `${item.previousShiftSegmentPercentage}%` }"
              />
            </div>
          </div>
        </div>

        <div class="item-label" :title="item.commodity || item.nbr">
          {{ item.nbr }}
        </div>

        <div class="item-metrics">
          <div class="metric-row">
            <span class="metric-label">Otros turnos</span>
            <span class="metric-value previous">
              {{ formatMetricValue(item.previousShiftProcessed) }}
            </span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Turno</span>
            <span class="metric-value accent">
              {{ formatMetricValue(item.currentShiftProcessed) }}
            </span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Avance real</span>
            <span :class="['metric-value', getProgressClass(item.percentage)]">
              {{ formatMetricValue(item.processedTotal) }}
            </span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Total</span>
            <span class="metric-value">{{ formatMetricValue(item.manifested) }}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Restante</span>
            <span :class="['metric-value', item.remaining > 0 ? 'pending' : item.remaining < 0 ? 'overrun' : 'complete']">
              {{ formatMetricValue(item.remaining) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      Sin datos para el turno actual.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Summary } from '../../interfaces/monitoring/Summary';
import { formatNumber, getProgressClass } from '../../utils/monitoring';

type ShiftMode = 'holds' | 'services';
type MetricMode = 'weight' | 'goods';

const props = defineProps<{
  holds: Summary[];
  services: Summary[];
  activeTab: ShiftMode;
  viewMode: MetricMode;
  currentShift: string;
}>();

const items = computed(() => {
  const source = props.activeTab === 'holds' ? props.holds : props.services;

  return source.map((item) => {
    const manifested = props.viewMode === 'weight' ? item.weight.manifested : item.goods.manifested;
    const rawProcessedTotal = props.viewMode === 'weight' ? item.weight.processed : item.goods.processed;
    const currentShiftProcessed =
      props.viewMode === 'weight'
        ? (item.shifts[props.currentShift]?.weight ?? 0)
        : (item.shifts[props.currentShift]?.goods ?? 0);

    const chartProcessedTotal = manifested > 0
      ? Math.min(Math.max(rawProcessedTotal, 0), manifested)
      : Math.max(rawProcessedTotal, 0);
    const chartCurrentShiftProcessed = Math.min(Math.max(currentShiftProcessed, 0), chartProcessedTotal);
    const chartPreviousShiftProcessed = Math.max(chartProcessedTotal - chartCurrentShiftProcessed, 0);

    const processedTotal = rawProcessedTotal;
    const previousShiftProcessed = processedTotal - currentShiftProcessed;
    const remaining = manifested - processedTotal;
    const percentage = manifested > 0 ? (chartProcessedTotal / manifested) * 100 : 0;
    const previousShiftPercentage = manifested > 0 ? (chartPreviousShiftProcessed / manifested) * 100 : 0;
    const currentShiftPercentage = manifested > 0 ? (chartCurrentShiftProcessed / manifested) * 100 : 0;
    const totalProcessedPercentage = previousShiftPercentage + currentShiftPercentage;
    const previousShiftSegmentPercentage = totalProcessedPercentage > 0
      ? (previousShiftPercentage / totalProcessedPercentage) * 100
      : 0;
    const currentShiftSegmentPercentage = totalProcessedPercentage > 0
      ? (currentShiftPercentage / totalProcessedPercentage) * 100
      : 0;

    return {
      id: item.id,
      nbr: item.nbr,
      commodity: item.commodity,
      manifested,
      processedTotal,
      previousShiftProcessed,
      currentShiftProcessed,
      remaining,
      percentage,
      previousShiftPercentage,
      currentShiftPercentage,
      previousShiftSegmentPercentage,
      currentShiftSegmentPercentage,
    };
  });
});

const formatMetricValue = (value: number): string => {
  return props.viewMode === 'weight' ? `${formatNumber(value)} kg` : formatNumber(value);
};
</script>

<style scoped>
.current-shift-summary {
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  background: #1a1a2e;
  padding: 1rem;
  margin-bottom: 2rem;
}

.summary-header {
  margin-bottom: 1rem;
}

.summary-title {
  margin: 0;
  font-size: 1.05rem;
  color: #e2e8f0;
}

.summary-subtitle {
  margin: 0.35rem 0 0 0;
  color: #94a3b8;
  font-size: 0.875rem;
}

.summary-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
  color: #94a3b8;
  font-size: 0.8125rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.legend-color {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.legend-color-previous {
  background: linear-gradient(180deg, #60a5fa, #2563eb);
}

.legend-color-current {
  background: linear-gradient(180deg, #34d399, #059669);
}

.legend-color-remaining {
  background: #0f172a;
}

.bars-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-start;
}

.progress-item {
  flex: 1 1 200px;
  min-width: 200px;
  max-width: 250px;
  border: 1px solid #2d2d44;
  border-radius: 0.625rem;
  padding: 0.75rem;
  background: #151526;
}

.bar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.75rem;
}

.bar-percentage {
  font-weight: 700;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
}

.bar-track {
  width: 2.2rem;
  height: 8.25rem;
  border-radius: 999px;
  background: #0f172a;
  border: 1px solid #334155;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-stack {
  width: 100%;
  transition: height 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bar-segment {
  width: 100%;
}

.bar-segment-previous {
  background: linear-gradient(180deg, #60a5fa, #2563eb);
}

.bar-segment-current {
  background: linear-gradient(180deg, #34d399, #059669);
}

.item-label {
  text-align: center;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 0.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.metric-label {
  color: #94a3b8;
}

.metric-value {
  color: #e2e8f0;
  font-weight: 600;
  text-align: right;
}

.metric-value.accent {
  color: #3b82f6;
}

.metric-value.previous {
  color: #60a5fa;
}

.pending {
  color: #f59e0b;
}

.overrun {
  color: #f97316;
}

.complete {
  color: #10b981;
}

.bar-percentage.progress-high {
  color: #10b981;
}

.bar-percentage.progress-medium {
  color: #f59e0b;
}

.bar-percentage.progress-low {
  color: #ef4444;
}

.empty-state {
  color: #94a3b8;
  padding: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .progress-item {
    flex: 1 1 100%;
    min-width: 100%;
    max-width: 100%;
  }

  .bar-track {
    height: 7rem;
  }
}
</style>