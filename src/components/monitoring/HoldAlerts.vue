<template>
  <div v-if="alerts.length > 0" class="hold-alerts">
    <div
      v-for="(alert, index) in alerts"
      :key="index"
      :class="['alert', `alert-${alert.type === 'missing' ? 'error' : 'warning'}`]"
    >
      <span class="alert-icon">{{ alert.type === 'missing' ? '⚠️' : '🚨' }}</span>
      <div class="alert-content">
        <strong>{{ alert.type === 'missing' ? 'Unidades sin bodega' : `Bodega no reconocida: ${alert.hold}` }}</strong>
        <p>{{ alert.type === 'missing'
          ? `Se encontraron ${alert.units.length} unidad(es) sin bodega asignada.`
          : `Se encontraron ${alert.units.length} unidad(es) con bodega "${alert.hold}" no especificada.`
        }}</p>
        <div v-if="alert.units.length > 0" class="alert-details">
          <details>
            <summary>Ver unidades ({{ alert.units.length }})</summary>
            <ul>
              <li v-for="(unit, idx) in alert.units.slice(0, 10)" :key="idx">
                {{ unit }}
              </li>
              <li v-if="alert.units.length > 10" class="more-items">
                ... y {{ alert.units.length - 10 }} más
              </li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HoldAlert } from '../../interfaces/monitoring/VesselData';

const props = defineProps<{
  holdAlerts: HoldAlert[];
}>();

const alerts = computed(() => props.holdAlerts ?? []);
</script>

<style scoped>
.hold-alerts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.alert {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
  color: #fbbf24;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #f87171;
}

.alert-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content strong {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
  color: #e2e8f0;
}

.alert-content p {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.alert-details {
  margin-top: 0.75rem;
}

.alert-details details {
  cursor: pointer;
}

.alert-details summary {
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.alert-details summary:hover {
  background: rgba(0, 0, 0, 0.3);
}

.alert-details ul {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
  font-size: 0.8125rem;
  opacity: 0.85;
}

.alert-details li {
  margin: 0.25rem 0;
  font-family: 'Courier New', monospace;
}

.more-items {
  font-style: italic;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .alert {
    flex-direction: column;
    gap: 0.5rem;
  }

  .alert-icon {
    font-size: 1.25rem;
  }
}
</style>