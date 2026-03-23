<template>
  <div class="container-table-panel">
    <div class="container-table-header">
      <h3 class="container-table-title">Contenedores</h3>
      <span class="container-table-count">{{ containers.length }} unidades</span>
    </div>

    <div class="container-table-scroll">
      <table class="container-table">
        <thead>
          <tr>
            <th>Contenedor</th>
            <th>ISO</th>
            <th>Tecnología</th>
            <th>Tamaño</th>
            <th>Estado</th>
            <th>Bay</th>
            <th>Posición</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in containers" :key="item.unit_gkey">
            <td class="td-mono">{{ item.container_number }}</td>
            <td>{{ item.iso_type }}</td>
            <td>{{ item.technology }}</td>
            <td>{{ item.size ? `${item.size}'` : '-' }}</td>
            <td>
              <span :class="['status-badge', statusClassName(item.operation_status)]">
                {{ statusLabel(item.operation_status) }}
              </span>
            </td>
            <td>{{ item.bay !== null ? formatBay(item.bay) : '-' }}</td>
            <td class="td-mono">{{ item.position }}</td>
          </tr>
          <tr v-if="!containers.length">
            <td colspan="7" class="td-empty">No se encontraron contenedores</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ContainerMonitoringItem,
  ContainerOperationStatus,
} from '../../../interfaces/monitoring/ContainerMonitoring';

defineProps<{
  containers: ContainerMonitoringItem[];
}>();

const formatBay = (bay: number): string => String(bay).padStart(2, '0');

const statusLabel = (status: ContainerOperationStatus): string => {
  const labels: Record<ContainerOperationStatus, string> = {
    TO_DISCHARGE: 'Por Descargar',
    DISCHARGED: 'Descargado',
    NOT_ARRIVED: 'Falta Llegar',
    TO_LOAD: 'Por Embarcar',
    LOADED: 'Embarcado',
    RESTOW_PENDING: 'Reestiba Pend.',
    RESTOW_ON_YARD: 'En Muelle',
    RESTOW_COMPLETED: 'Reestiba Comp.',
  };
  return labels[status];
};

const statusClassName = (status: ContainerOperationStatus): string => {
  const map: Record<ContainerOperationStatus, string> = {
    TO_DISCHARGE: 'status--cyan',
    DISCHARGED: 'status--green',
    NOT_ARRIVED: 'status--rose',
    TO_LOAD: 'status--amber',
    LOADED: 'status--orange',
    RESTOW_PENDING: 'status--purple',
    RESTOW_ON_YARD: 'status--fuchsia',
    RESTOW_COMPLETED: 'status--pink',
  };
  return map[status];
};
</script>

<style scoped>
.container-table-panel {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}

.container-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.container-table-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #e2e8f0;
}

.container-table-count {
  font-size: 0.75rem;
  color: #64748b;
}

.container-table-scroll {
  max-height: 32rem;
  overflow: auto;
}

.container-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  color: #cbd5e1;
  white-space: nowrap;
}

.container-table thead {
  position: sticky;
  top: 0;
  background: #1a1a2e;
  z-index: 1;
}

.container-table th {
  text-align: left;
  padding: 0.5rem 0.625rem;
  font-weight: 500;
  color: #64748b;
  font-size: 0.8125rem;
  border-bottom: 1px solid #2d2d44;
}

.container-table td {
  padding: 0.375rem 0.625rem;
  border-top: 1px solid #1e1e38;
}

.container-table tbody tr {
  transition: background 0.15s ease;
}

.container-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.06);
}

.td-mono {
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
}

.td-empty {
  padding: 1.5rem;
  text-align: center;
  color: #475569;
}

/* Status badges */
.status-badge {
  font-weight: 600;
  font-size: 0.8125rem;
}

.status--cyan { color: #22d3ee; }
.status--green { color: #4ade80; }
.status--amber { color: #fbbf24; }
.status--orange { color: #fb923c; }
.status--purple { color: #c084fc; }
.status--fuchsia { color: #e879f9; }
.status--pink { color: #f472b6; }
.status--rose { color: #fb7185; }
</style>
