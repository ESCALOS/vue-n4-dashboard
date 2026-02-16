<template>
  <div v-if="alerts.length > 0" class="hold-alerts">
    <div
      v-for="(alert, index) in alerts"
      :key="index"
      :class="['alert', `alert-${alert.type}`]"
    >
      <span class="alert-icon">{{ alert.icon }}</span>
      <div class="alert-content">
        <strong>{{ alert.title }}</strong>
        <p>{{ alert.message }}</p>
        <div v-if="alert.details.length > 0" class="alert-details">
          <details>
            <summary>Ver detalles ({{ alert.details.length }})</summary>
            <ul>
              <li v-for="(detail, idx) in alert.details.slice(0, 10)" :key="idx">
                {{ detail }}
              </li>
              <li v-if="alert.details.length > 10" class="more-items">
                ... y {{ alert.details.length - 10 }} más
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
import type { VesselData } from '../../interfaces/monitoring/VesselData';

interface Alert {
  type: 'warning' | 'error';
  icon: string;
  title: string;
  message: string;
  details: string[];
}

const props = defineProps<{
  vesselData: VesselData;
}>();

const alerts = computed<Alert[]>(() => {
  const result: Alert[] = [];
  const validBodegas = new Set(
    props.vesselData.summary.holds.map((b) => b.nbr)
  );
  
  // Solo verificar si hay bodegas definidas
  if (validBodegas.size === 0) {
    return result;
  }

  // Detectar transacciones sin bodega
  const sinBodega = props.vesselData.transactions.filter(
    (t) => !t.hold || t.hold.trim() === '' || t.hold === 'SIN BODEGA'
  );

  if (sinBodega.length > 0) {
    result.push({
      type: 'error',
      icon: '⚠️',
      title: 'Transacciones sin bodega',
      message: `Se encontraron ${sinBodega.length} transacción(es) sin bodega asignada.`,
      details: sinBodega.map(
        (t) => `Jornada: ${t.shift}`
      ),
    });
  }

  // Detectar bodegas no especificadas
  const bodegasNoEspecificadas = props.vesselData.transactions.filter(
    (t) =>
      t.hold &&
      t.hold.trim() !== '' &&
      t.hold !== 'SIN BODEGA' &&
      !validBodegas.has(t.hold)
  );

  if (bodegasNoEspecificadas.length > 0) {
    const bodegasInvalidas = new Set(
      bodegasNoEspecificadas.map((t) => t.hold)
    );

    result.push({
      type: 'warning',
      icon: '🚨',
      title: 'Bodegas no reconocidas',
      message: `Se encontraron transacciones con bodegas no especificadas: ${Array.from(bodegasInvalidas).join(', ')}`,
      details: bodegasNoEspecificadas.map(
        (t) =>
          `Bodega: ${t.hold} - Jornada: ${t.shift}`
      ),
    });
  }

  return result;
});
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