<template>
  <div class="pending-bay-section">
    <div class="pending-bay-grid">
      <div class="pending-bay-panel">
        <h3 class="pending-bay-title">Pendientes Descarga por Bay</h3>
        <div class="pending-bay-scroll">
          <table class="pending-bay-table">
            <thead>
              <tr>
                <th class="th-left">Bay</th>
                <th class="th-right">Pendientes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="b in pendingByBay.discharge"
                :key="`pd-${b.bay}`"
                class="pending-bay-row"
                @click="$emit('select-bay', b.bay)"
              >
                <td>{{ formatBay(b.bay) }}</td>
                <td class="td-right td-bold">{{ b.pending }}</td>
              </tr>
              <tr v-if="!pendingByBay.discharge.length">
                <td colspan="2" class="td-empty">Sin pendientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pending-bay-panel">
        <h3 class="pending-bay-title">Faltan Llegar por Bay</h3>
        <div class="pending-bay-scroll">
          <table class="pending-bay-table">
            <thead>
              <tr>
                <th class="th-left">Bay</th>
                <th class="th-right">Pendientes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="b in pendingByBay.not_arrived"
                :key="`pna-${b.bay}`"
                class="pending-bay-row"
                @click="$emit('select-bay', b.bay)"
              >
                <td>{{ formatBay(b.bay) }}</td>
                <td class="td-right td-bold">{{ b.pending }}</td>
              </tr>
              <tr v-if="!pendingByBay.not_arrived.length">
                <td colspan="2" class="td-empty">Sin pendientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="pending-bay-panel">
        <h3 class="pending-bay-title">Pendientes Embarque por Bay</h3>
        <div class="pending-bay-scroll">
          <table class="pending-bay-table">
            <thead>
              <tr>
                <th class="th-left">Bay</th>
                <th class="th-right">Pendientes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="b in pendingByBay.load"
                :key="`pl-${b.bay}`"
                class="pending-bay-row"
                @click="$emit('select-bay', b.bay)"
              >
                <td>{{ formatBay(b.bay) }}</td>
                <td class="td-right td-bold">{{ b.pending }}</td>
              </tr>
              <tr v-if="!pendingByBay.load.length">
                <td colspan="2" class="td-empty">Sin pendientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showRestow" class="pending-bay-panel">
        <h3 class="pending-bay-title">Pendientes Reestiba por Bay</h3>
        <div class="pending-bay-scroll">
          <table class="pending-bay-table">
            <thead>
              <tr>
                <th class="th-left">Bay</th>
                <th class="th-right">Pendientes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="b in pendingByBay.restow"
                :key="`pr-${b.bay}`"
                class="pending-bay-row"
                @click="$emit('select-bay', b.bay)"
              >
                <td>{{ formatBay(b.bay) }}</td>
                <td class="td-right td-bold">{{ b.pending }}</td>
              </tr>
              <tr v-if="!pendingByBay.restow.length">
                <td colspan="2" class="td-empty">Sin pendientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContainerMonitoringData } from '../../../interfaces/monitoring/ContainerMonitoring';

defineProps<{
  pendingByBay: ContainerMonitoringData['pending_by_bay'];
  showRestow: boolean;
}>();

defineEmits<{
  'select-bay': [bay: number];
}>();

const formatBay = (bay: number): string => String(bay).padStart(2, '0');
</script>

<style scoped>
.pending-bay-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.pending-bay-panel {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}

.pending-bay-title {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #e2e8f0;
}

.pending-bay-scroll {
  max-height: 15rem;
  overflow-y: auto;
}

.pending-bay-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.pending-bay-table thead {
  position: sticky;
  top: 0;
  background: #1a1a2e;
  z-index: 1;
}

.pending-bay-table th {
  padding: 0.5rem 0.25rem;
  font-weight: 500;
  color: #64748b;
  font-size: 0.8125rem;
  border-bottom: 1px solid #2d2d44;
}

.th-left {
  text-align: left;
}

.th-right {
  text-align: right;
}

.pending-bay-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.pending-bay-row:hover {
  background: rgba(59, 130, 246, 0.1);
}

.pending-bay-row td {
  padding: 0.375rem 0.25rem;
  border-top: 1px solid #1e1e38;
}

.td-right {
  text-align: right;
}

.td-bold {
  font-weight: 600;
}

.td-empty {
  padding: 0.75rem;
  text-align: center;
  color: #475569;
  border-top: 1px solid #1e1e38;
}

@media (min-width: 1280px) {
  .pending-bay-grid {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  }
}
</style>
