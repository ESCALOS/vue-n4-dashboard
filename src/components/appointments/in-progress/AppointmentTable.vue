<template>
  <div class="table-container">
    <table class="data-table appointments-table">
      <thead>
        <tr>
          <th class="col-cita">Cita</th>
          <th class="col-fecha">Fecha Cita</th>
          <th class="col-fecha">Fecha Stage</th>
          <th class="col-stage">Stage</th>
          <th class="col-tiempo">
            <div class="header-tiempo">
              <div>Tiempo</div>
              <div>Atención</div>
            </div>
          </th>
          <th class="col-tiempo">
            <div class="header-tiempo">
              <div>Tiempo</div>
              <div>Stage</div>
            </div>
          </th>
          <th class="col-tiempo">
            <div class="header-tiempo">
              <div>Tiempo</div>
              <div>Efectivo</div>
            </div>
          </th>
          <th class="col-linea">Línea</th>
          <th class="col-booking">Booking</th>
          <th class="col-placa">Placa</th>
          <th class="col-cliente">Cliente</th>
          <th class="col-tecnologia">Tecnología</th>
          <th class="col-producto">Producto</th>
          <th class="col-contenedor">Contenedor</th>
          <th class="col-nave">Nave</th>
          <th class="col-tipo">Tipo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="appointments.length === 0">
          <td colspan="16" class="empty-row">
            <div class="empty-state">
              <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No hay citas en proceso</p>
            </div>
          </td>
        </tr>
        <tr v-for="appt in appointments" :key="appt.cita" class="appointment-row">
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
            <span :class="['tiempo-badge', getTiempoStageEffectiveClass(getTiempoStage(appt))]">
              {{ formatTiempo(getTiempoStage(appt)) }}
            </span>
          </td>
          <td class="cell-tiempo">
            <span :class="['tiempo-badge', getTiempoStageEffectiveClass(getTiempoEfectivo(appt))]">
              {{ formatTiempo(getTiempoEfectivo(appt)) }}
              <span v-if="appt.tiempo_eir" class="tiempo-eir-note" :title="`Inspección: ${appt.tiempo_eir}m`">*</span>
            </span>
          </td>
          <td>{{ appt.linea || '—' }}</td>
          <td>{{ appt.booking || '—' }}</td>
          <td>{{ appt.placa || '—' }}</td>
          <td class="cell-cliente">{{ appt.cliente || '—' }}</td>
          <td>{{ appt.tecnologia || '—' }}</td>
          <td>{{ appt.producto || '—' }}</td>
          <td class="cell-contenedor">{{ appt.contenedor || '—' }}</td>
          <td class="cell-nave">{{ appt.nave || '—' }}</td>
          <td>
            <span class="tipo-badge">{{ appt.tipo || '—' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { AppointmentInProgress } from '../../../types/appointments/AppointmentInProgress';

defineProps<{
  appointments: AppointmentInProgress[];
  formatFecha: (fecha: string | null) => string;
  formatTiempo: (minutos: number | null) => string;
  getStageLabel: (stage: string) => string;
  getStageClass: (stage: string) => string;
  getTiempoClass: (minutos: number | null) => string;
  getTiempoStageEffectiveClass: (minutos: number | null) => string;
  getTiempoAtencion: (appointment: AppointmentInProgress) => number | null;
  getTiempoStage: (appointment: AppointmentInProgress) => number | null;
  getTiempoEfectivo: (appointment: AppointmentInProgress) => number | null;
}>();
</script>

<style scoped>
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

/* Tiempo Stage and Tiempo Efectivo colors */
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
