<template>
  <div class="table-container">
    <table class="data-table appointments-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Stage</th>
          <th class="col-tiempo">
            <div class="header-tiempo">
              <div>Gate</div>
              <div>In</div>
            </div>
          </th>
          <th class="col-tiempo">
            <div class="header-tiempo">
              <div>Ded. Espera</div>
              <div>→ Inicio</div>
            </div>
          </th>
          <th class="col-tiempo">
            <div class="header-tiempo">
              <div>Ded. Inicio</div>
              <div>→ Término</div>
            </div>
          </th>
          <th class="col-tiempo">
            <div class="header-tiempo">
              <div>Tiempo</div>
              <div>Efectivo</div>
            </div>
          </th>
          <th>Tracto</th>
          <th>Chassis</th>
          <th>Permiso</th>
          <th>Operativa</th>
          <th>Producto</th>
          <th>Nave</th>
          <th>Cliente</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="appointments.length === 0">
          <td colspan="13" class="empty-row">No hay citas en proceso de carga general</td>
        </tr>
        <tr v-for="(appt, index) in appointments" :key="`${appt.permiso}-${appt.tracto}-${index}`" class="appointment-row">
          <td>{{ appt.codigo || '—' }}</td>
          <td>
            <span :class="['stage-badge', getStageClass(appt.stage)]">
              {{ getStageLabel(appt.stage) }}
            </span>
          </td>
          <td><span :class="['tiempo-badge', getTiempoClass(appt.tiempoGateIn)]">{{ formatTiempo(appt.tiempoGateIn) }}</span></td>
          <td>{{ formatTiempo(appt.deducibleEsperaInicioCarguio) }}</td>
          <td>{{ formatTiempo(appt.deducibleInicioCarguioTermino) }}</td>
          <td><span :class="['tiempo-badge', getTiempoStageClass(appt.tiempoEfectivo)]">{{ formatTiempo(appt.tiempoEfectivo) }}</span></td>
          <td>{{ appt.tracto || '—' }}</td>
          <td>{{ appt.chassis || '—' }}</td>
          <td>{{ appt.permiso || '—' }}</td>
          <td>{{ appt.tipoOperativa || '—' }}</td>
          <td>{{ appt.producto || '—' }}</td>
          <td class="truncate">{{ appt.nave || '—' }}</td>
          <td class="truncate">{{ appt.cliente || '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { GeneralCargoAppointmentInProgress } from '../../../types/appointments/GeneralCargoAppointmentInProgress';

defineProps<{
  appointments: GeneralCargoAppointmentInProgress[];
  formatTiempo: (minutos: number | null) => string;
  getStageLabel: (stage: string) => string;
  getStageClass: (stage: string) => string;
  getTiempoClass: (minutos: number | null) => string;
  getTiempoStageClass: (minutos: number | null) => string;
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
  padding: 0.6rem 0.75rem;
  text-align: left;
  white-space: nowrap;
  border-bottom: 2px solid #1e293b;
}

.col-tiempo {
  width: 92px;
  min-width: 92px;
  text-align: center;
}

.header-tiempo {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  gap: 0.05rem;
}

.appointments-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #1e293b;
  color: #cbd5e1;
  white-space: nowrap;
}

.appointment-row:hover {
  background: #1e293b;
}

.stage-badge,
.tiempo-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stage-tranquera { background: rgba(234, 179, 8, 0.15); color: #facc15; }
.stage-pregate { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.stage-gatein { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
.stage-zonaespera { background: rgba(251, 146, 60, 0.15); color: #fb923c; }
.stage-iniciocarguio { background: rgba(244, 114, 182, 0.15); color: #f472b6; }
.stage-yard { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.stage-gateout { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }

.time-atencion-ok, .time-stage-ok { color: #4ade80; background: rgba(34, 197, 94, 0.1); }
.time-atencion-warning, .time-stage-warning { color: #fb923c; background: rgba(251, 146, 60, 0.1); }
.time-atencion-critical, .time-stage-critical { color: #f87171; background: rgba(239, 68, 68, 0.1); }
.time-neutral { color: #94a3b8; background: rgba(148, 163, 184, 0.1); }

.truncate {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-row {
  text-align: center;
  padding: 2rem !important;
}
</style>
