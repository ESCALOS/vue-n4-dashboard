<template>
  <div class="table-container">
    <table class="data-table appointments-table">
      <thead>
        <tr>
          <th class="col-cita">Cita</th>
          <th class="col-fecha">Fecha</th>
          <th class="col-estado">Estado</th>
          <th class="col-linea">Línea</th>
          <th class="col-booking">Booking</th>
          <th class="col-placa">Placa</th>
          <th class="col-carreta">Carreta</th>
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
          <td colspan="13" class="empty-row">
            <div class="empty-state">
              <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No hay citas pendientes</p>
            </div>
          </td>
        </tr>
        <tr v-for="appt in appointments" :key="appt.cita"
          :class="['appointment-row', getRowClass(appt.estado)]">
          <td class="cell-cita">{{ appt.cita || '—' }}</td>
          <td class="cell-fecha">{{ formatFecha(appt.fechaCita) }}</td>
          <td class="cell-estado">
            <span :class="['estado-badge', getEstadoClass(appt.estado)]">
              {{ getEstadoLabel(appt.estado) }}
            </span>
          </td>
          <td>{{ appt.linea || '—' }}</td>
          <td>{{ appt.booking || '—' }}</td>
          <td>{{ appt.placa || '—' }}</td>
          <td>{{ appt.carreta || '—' }}</td>
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
import type { AppointmentEstado, PendingAppointment } from '../../../types/appointments/PendingAppointment';


defineProps<{
  appointments: PendingAppointment[];
  formatFecha: (fecha: string | null) => string;
  getEstadoLabel: (estado: AppointmentEstado) => string;
  getEstadoClass: (estado: AppointmentEstado) => string;
  getRowClass: (estado: AppointmentEstado) => string;
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

/* ============================================
   ROW BACKGROUND COLORS BY ESTADO
   ============================================ */

/* Vencida: fondo rojo */
.row-vencida {
  background: rgba(239, 68, 68, 0.1);
}

.row-vencida:hover {
  background: rgba(239, 68, 68, 0.18);
}

/* Activa: fondo verde */
.row-activa {
  background: rgba(34, 197, 94, 0.1);
}

.row-activa:hover {
  background: rgba(34, 197, 94, 0.18);
}

.cell-cita {
  font-weight: 600;
  color: #e2e8f0;
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

/* ============================================
   ESTADO BADGES
   ============================================ */
.estado-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.estado-vencida {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.estado-activa {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.estado-pendiente {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
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
