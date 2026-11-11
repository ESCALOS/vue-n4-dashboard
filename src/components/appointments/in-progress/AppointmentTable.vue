<template>
  <div class="table-container">
    <table class="data-table appointments-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :class="column.className"
            :aria-sort="sortKey === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
            <button type="button" class="sort-button" @click="toggleSort(column.key)"
              :title="sortKey === column.key ? (sortDirection === 'asc' ? 'Ordenar descendente' : 'Restablecer orden original') : 'Ordenar ascendente'">
              <span>{{ column.label }}</span>
              <span class="sort-indicator" :class="{ active: sortKey === column.key }" aria-hidden="true">{{ sortKey === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </button>
          </th>
          <!-- <th class="col-acciones">Acciones</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-if="appointments.length === 0">
          <td :colspan="columns.length" class="empty-row">
            <div class="empty-state">
              <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No hay citas en proceso</p>
            </div>
          </td>
        </tr>
        <tr v-for="appt in sortedAppointments" :key="appt.cita" class="appointment-row">
          <td class="cell-cita">{{ appt.cita || '—' }}</td>
          <td class="cell-fecha">{{ formatFecha(appt.fechaCita) }}</td>
          <td class="cell-fecha">{{ formatFecha(appt.fechaStage) }}</td>
          <td class="cell-stage">
            <span :class="['stage-badge', getStageClass(appt.stage)]">
              {{ getStageLabel(appt.stage) }}
            </span>
          </td>
          <td class="cell-tiempo">
            <span :class="['tiempo-badge', getTiempoClass(getTiempoAtencion(appt))]">
              {{ formatTiempo(getTiempoAtencion(appt)) }}
            </span>
          </td>
          <td class="cell-tiempo">
            <span :class="['tiempo-badge', getTiempoStageClass(getTiempoStage(appt))]">
              {{ formatTiempo(getTiempoStage(appt)) }}
            </span>
          </td>
          <td>{{ appt.linea || '—' }}</td>
          <td>{{ appt.booking || '—' }}</td>
          <td>{{ appt.tecnologia || '—' }}</td>
          <td>{{ appt.puertoDescarga || '—' }}</td>
          <td>{{ appt.placa || '—' }}</td>
          <td class="cell-cliente">{{ appt.cliente || '—' }}</td>
          <td>{{ appt.producto || '—' }}</td>
          <td class="cell-contenedor">{{ appt.contenedor || '—' }}</td>
          <td class="cell-nave">{{ appt.nave || '—' }}</td>
          <td>
            <span class="tipo-badge">{{ appt.tipo || '—' }}</span>
          </td>
          <!-- <td class="cell-acciones">
            <button
              v-if="appt.hasEir"
              class="btn-eir"
              :disabled="printingAppointmentId === appt.cita"
              @click="onPrintEir(appt)"
            >
              {{ printingAppointmentId === appt.cita ? 'Imprimiendo...' : 'Imprimir EIR' }}
            </button>
            <span v-else class="no-eir">Sin EIR</span>
          </td> -->
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { STAGE_ORDER } from '../../../types/appointments/AppointmentInProgress';
import type { AppointmentInProgress } from '../../../types/appointments/AppointmentInProgress';

const props = defineProps<{
  appointments: AppointmentInProgress[];
  formatFecha: (fecha: string | null) => string;
  formatTiempo: (minutos: number | null) => string;
  getStageLabel: (stage: string) => string;
  getStageClass: (stage: string) => string;
  getTiempoClass: (minutos: number | null) => string;
  getTiempoStageClass: (minutos: number | null) => string;
  getTiempoAtencion: (appointment: AppointmentInProgress) => number | null;
  getTiempoStage: (appointment: AppointmentInProgress) => number | null;
  onPrintEir: (appointment: AppointmentInProgress) => void;
  printingAppointmentId: string | null;
}>();

type SortKey = keyof AppointmentInProgress | 'tiempoAtencion' | 'tiempoStage';
const columns: { key: SortKey; label: string; className: string }[] = [
  {
    "key": "cita",
    "label": "Cita",
    "className": "col-cita"
  },
  {
    "key": "fechaCita",
    "label": "Fecha Cita",
    "className": "col-fecha"
  },
  {
    "key": "fechaStage",
    "label": "Fecha Stage",
    "className": "col-fecha"
  },
  {
    "key": "stage",
    "label": "Stage",
    "className": "col-stage"
  },
  {
    "key": "tiempoAtencion",
    "label": "Tiempo Atención",
    "className": "col-tiempo"
  },
  {
    "key": "tiempoStage",
    "label": "Tiempo Stage",
    "className": "col-tiempo"
  },
  {
    "key": "linea",
    "label": "Línea",
    "className": "col-linea"
  },
  {
    "key": "booking",
    "label": "Booking",
    "className": "col-booking"
  },
  {
    "key": "tecnologia",
    "label": "Tec.",
    "className": "col-tecnologia"
  },
  {
    "key": "puertoDescarga",
    "label": "Puerto Descarga",
    "className": "col-puerto"
  },
  {
    "key": "placa",
    "label": "Placa",
    "className": "col-placa"
  },
  {
    "key": "cliente",
    "label": "Cliente",
    "className": "col-cliente"
  },
  {
    "key": "producto",
    "label": "Producto",
    "className": "col-producto"
  },
  {
    "key": "contenedor",
    "label": "Contenedor",
    "className": "col-contenedor"
  },
  {
    "key": "nave",
    "label": "Nave",
    "className": "col-nave"
  },
  {
    "key": "tipo",
    "label": "Tipo",
    "className": "col-tipo"
  }
];
const sortKey = ref<SortKey | null>(null);
const sortDirection = ref<'asc' | 'desc'>('asc');
const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });
function toggleSort(key: SortKey) {
  if (sortKey.value !== key) {
    sortKey.value = key;
    sortDirection.value = 'asc';
  } else if (sortDirection.value === 'asc') sortDirection.value = 'desc';
  else sortKey.value = null;
}
function getSortValue(appointment: AppointmentInProgress, key: SortKey): string | number | null {
  let value: string | number | boolean | null;
  if (key === 'tiempoAtencion') value = props.getTiempoAtencion(appointment);
  else if (key === 'tiempoStage') value = props.getTiempoStage(appointment);
  else if (key === 'fechaCita' || key === 'fechaStage') {
    const date = appointment[key];
    value = date ? Date.parse(date) : null;
  } else if (key === 'stage') value = STAGE_ORDER[appointment.stage] ?? props.getStageLabel(appointment.stage);
  else value = appointment[key];
  if (value == null || (typeof value === 'number' && !Number.isFinite(value))) return null;
  if ((key === 'tiempoAtencion' || key === 'tiempoStage') && typeof value === 'number' && value < 0) return null;
  return typeof value === 'string' ? value.trim() || null : typeof value === 'boolean' ? Number(value) : value;
}
const sortedAppointments = computed(() => {
  const key = sortKey.value;
  if (!key) return props.appointments;
  const direction = sortDirection.value === 'asc' ? 1 : -1;
  return props.appointments.map(appointment => ({ appointment, value: getSortValue(appointment, key) }))
    .sort((a, b) => {
      // Missing values stay last regardless of direction; do not mutate the stream data.
      if (a.value === null) return b.value === null ? 0 : 1;
      if (b.value === null) return -1;
      return direction * (typeof a.value === 'number' && typeof b.value === 'number'
        ? a.value - b.value : collator.compare(String(a.value), String(b.value)));
    }).map(({ appointment }) => appointment);
});
</script>

<style scoped>
.sort-button { display: flex; align-items: center; gap: 0.35rem; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-transform: inherit; letter-spacing: inherit; text-align: inherit; cursor: pointer; }
.sort-button:hover, .sort-button:focus-visible, .sort-indicator.active { color: #93c5fd; }
.sort-button:focus-visible { outline: 2px solid #60a5fa; outline-offset: 4px; }
.sort-indicator { color: #64748b; }
.col-tiempo .sort-button > span:first-child, .col-puerto .sort-button > span:first-child { white-space: normal; text-align: center; }

.table-container {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #1e293b;
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.825rem;
}

.appointments-table th {
  background: #0f172a;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  padding: 0.6rem 0.75rem;
  text-align: left;
  white-space: nowrap;
  border-bottom: 2px solid #1e293b;
  position: sticky;
  top: 0;
  z-index: 1;
}

.header-tiempo {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  line-height: 1.2;
  text-align: center;
}

.col-tiempo {
  width: 80px;
  min-width: 80px;
}

.header-puerto {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  line-height: 1.2;
  text-align: center;
}


.col-puerto  {
  width: 80px;
  min-width: 80px;
}

.appointments-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #1e293b;
  color: #cbd5e1;
  white-space: nowrap;
}

.appointment-row {
  transition: background 0.15s ease;
}

.appointment-row:hover {
  background: #1e293b;
}

.cell-cita {
  font-weight: 600;
  color: #e2e8f0;
}

.cell-tiempo {
  text-align: center;
}

.cell-fecha {
  font-size: 0.8rem;
  color: #94a3b8;
}

.cell-cliente,
.cell-nave {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-contenedor {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #93c5fd;
}

/* Stage badges */
.stage-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stage-tranquera {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.stage-pregate {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.stage-gatein {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.stage-yard {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* Tiempo badges */
.tiempo-badge {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

/* Tiempo de Atención colors */
.time-atencion-ok {
  color: #4ade80;
  background: rgba(34, 197, 94, 0.1);
}

.time-atencion-warning {
  color: #fb923c;
  background: rgba(251, 146, 60, 0.1);
}

.time-atencion-critical {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}

/* Tiempo Stage color */
.time-stage-ok {
  color: #4ade80;
  background: rgba(34, 197, 94, 0.1);
}

.time-stage-warning {
  color: #fb923c;
  background: rgba(251, 146, 60, 0.1);
}

.time-stage-critical {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}

.time-neutral {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
}

.tiempo-eir-note {
  margin-left: 0.25rem;
  font-size: 0.6rem;
  font-weight: bold;
  opacity: 0.7;
  cursor: help;
}

/* Tipo badge */
.tipo-badge {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.cell-acciones {
  min-width: 120px;
}

.btn-eir {
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.28rem 0.52rem;
  cursor: pointer;
}

.btn-eir:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.no-eir {
  color: #94a3b8;
  font-size: 0.75rem;
}

/* Empty state */
.empty-row {
  text-align: center;
  padding: 3rem !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
}

.empty-icon {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
