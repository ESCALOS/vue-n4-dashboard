<template>
  <div class="summary-section">
    <!-- Descarga -->
    <div class="summary-group">
      <h3 class="summary-group-title">Descarga</h3>
      <div class="summary-cards summary-cards--3">
        <div class="summary-card summary-card--cyan">
          <span class="summary-card-label">Por Descargar</span>
          <span class="summary-card-value">{{ summary.discharge.to_discharge }}</span>
        </div>
        <div class="summary-card summary-card--green">
          <span class="summary-card-label">Descargados</span>
          <span class="summary-card-value">{{ summary.discharge.discharged }}</span>
        </div>
        <div class="summary-card summary-card--indigo">
          <span class="summary-card-label">Total</span>
          <span class="summary-card-value">{{ summary.discharge.total }}</span>
        </div>
      </div>
    </div>

    <!-- Embarque -->
    <div class="summary-group">
      <h3 class="summary-group-title">Embarque</h3>
      <div class="summary-cards summary-cards--4">
        <div class="summary-card summary-card--rose">
          <span class="summary-card-label">Faltan Llegar</span>
          <span class="summary-card-value">{{ summary.load.not_arrived }}</span>
        </div>
        <div class="summary-card summary-card--amber">
          <span class="summary-card-label">Por Embarcar</span>
          <span class="summary-card-value">{{ summary.load.to_load }}</span>
        </div>
        <div class="summary-card summary-card--orange">
          <span class="summary-card-label">Embarcados</span>
          <span class="summary-card-value">{{ summary.load.loaded }}</span>
        </div>
        <div class="summary-card summary-card--indigo">
          <span class="summary-card-label">Total</span>
          <span class="summary-card-value">{{ summary.load.total }}</span>
        </div>
      </div>
    </div>

    <!-- Reestiba -->
    <div v-if="summary.restow.total > 0" class="summary-group">
      <h3 class="summary-group-title">Reestiba</h3>
      <div class="summary-cards summary-cards--4">
        <div class="summary-card summary-card--purple">
          <span class="summary-card-label">Pendiente</span>
          <span class="summary-card-value">{{ summary.restow.pending }}</span>
        </div>
        <div class="summary-card summary-card--fuchsia">
          <span class="summary-card-label">En Muelle</span>
          <span class="summary-card-value">{{ summary.restow.on_yard }}</span>
        </div>
        <div class="summary-card summary-card--pink">
          <span class="summary-card-label">Completada</span>
          <span class="summary-card-value">{{ summary.restow.completed }}</span>
        </div>
        <div class="summary-card summary-card--indigo">
          <span class="summary-card-label">Total</span>
          <span class="summary-card-value">{{ summary.restow.total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContainerMonitoringData } from '../../../interfaces/monitoring/ContainerMonitoring';

defineProps<{
  summary: ContainerMonitoringData['summary'];
}>();
</script>

<style scoped>
.summary-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-group-title {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.summary-cards {
  display: grid;
  gap: 0.75rem;
}

.summary-cards--3 {
  grid-template-columns: repeat(3, 1fr);
}

.summary-cards--4 {
  grid-template-columns: repeat(2, 1fr);
}

.summary-card {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.summary-card-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
}

.summary-card-value {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1;
}

/* Color variants */
.summary-card--cyan {
  background: rgba(8, 145, 178, 0.12);
  border-color: rgba(8, 145, 178, 0.3);
}
.summary-card--cyan .summary-card-label { color: #67e8f9; }
.summary-card--cyan .summary-card-value { color: #22d3ee; }

.summary-card--green {
  background: rgba(22, 163, 74, 0.12);
  border-color: rgba(22, 163, 74, 0.3);
}
.summary-card--green .summary-card-label { color: #86efac; }
.summary-card--green .summary-card-value { color: #4ade80; }

.summary-card--indigo {
  background: rgba(79, 70, 229, 0.12);
  border-color: rgba(79, 70, 229, 0.3);
}
.summary-card--indigo .summary-card-label { color: #a5b4fc; }
.summary-card--indigo .summary-card-value { color: #818cf8; }

.summary-card--amber {
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.3);
}
.summary-card--amber .summary-card-label { color: #fcd34d; }
.summary-card--amber .summary-card-value { color: #fbbf24; }

.summary-card--orange {
  background: rgba(234, 88, 12, 0.12);
  border-color: rgba(234, 88, 12, 0.3);
}
.summary-card--orange .summary-card-label { color: #fdba74; }
.summary-card--orange .summary-card-value { color: #fb923c; }

.summary-card--purple {
  background: rgba(147, 51, 234, 0.12);
  border-color: rgba(147, 51, 234, 0.3);
}
.summary-card--purple .summary-card-label { color: #d8b4fe; }
.summary-card--purple .summary-card-value { color: #c084fc; }

.summary-card--fuchsia {
  background: rgba(192, 38, 211, 0.12);
  border-color: rgba(192, 38, 211, 0.3);
}
.summary-card--fuchsia .summary-card-label { color: #f0abfc; }
.summary-card--fuchsia .summary-card-value { color: #e879f9; }

.summary-card--pink {
  background: rgba(219, 39, 119, 0.12);
  border-color: rgba(219, 39, 119, 0.3);
}
.summary-card--pink .summary-card-label { color: #f9a8d4; }
.summary-card--pink .summary-card-value { color: #f472b6; }

.summary-card--rose {
  background: rgba(225, 29, 72, 0.12);
  border-color: rgba(225, 29, 72, 0.3);
}
.summary-card--rose .summary-card-label { color: #fda4af; }
.summary-card--rose .summary-card-value { color: #fb7185; }

@media (max-width: 640px) {
  .summary-cards--3,
  .summary-cards--4 {
    grid-template-columns: 1fr 1fr;
  }

  .summary-card-value {
    font-size: 1.5rem;
  }
}

@media (min-width: 768px) {
  .summary-cards--4 {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
