<template>
  <section class="mobile-appointments" :aria-label="mode === 'pending' ? 'Citas pendientes' : 'Citas en proceso'">
    <div v-if="types.length" class="type-legend" aria-label="Leyenda de tipos de cita">
      <span class="legend-label">Tipos de cita</span>
      <ul>
        <li v-for="type in types" :key="type" :class="typeClass(type)">
          <span class="type-dot" aria-hidden="true"></span>{{ type }}
        </li>
      </ul>
    </div>

    <p v-if="!appointments.length" class="mobile-empty">
      {{ mode === 'pending' ? 'No hay citas pendientes' : 'No hay citas en proceso' }}
    </p>

    <article v-for="appointment in appointments" :key="appointment.cita" class="appointment-card">
      <header class="card-heading">
        <h3>Cita {{ appointment.cita || '—' }}</h3>
        <span class="line-code" :style="lineStyle(appointment.linea)" :aria-label="`Línea ${appointment.linea || 'N.E.'}`">{{ appointment.linea || 'N.E.' }}</span>
        <span class="appointment-type" :class="typeClass(appointment.tipo)">
          <span class="type-dot" aria-hidden="true"></span>{{ appointment.tipo || 'Otro' }}
        </span>
        <span class="card-status"><slot name="status" :appointment="appointment" /></span>
      </header>

      <dl class="priority-data">
        <div :class="{ 'full-width': isType(appointment.tipo, 'Despacho') }">
          <dt>Placa</dt><dd>{{ appointment.placa || '—' }}</dd>
        </div>
        <div v-if="!isType(appointment.tipo, 'Despacho')">
          <dt>Contenedor</dt><dd>{{ appointment.contenedor || '—' }}</dd>
        </div>
        <div v-if="mode === 'pending'" class="full-width appointment-date">
          <dt>Fecha de cita</dt><dd>{{ formatFecha(appointment.fechaCita) }}</dd>
        </div>
      </dl>

      <dl v-if="mode === 'in-progress'" class="priority-data time-data">
        <slot name="times" :appointment="appointment" />
      </dl>

      <details class="appointment-details">
        <summary>
          <span class="show-detail">Ver detalle</span><span class="hide-detail">Ocultar detalle</span>
          <span class="sr-only"> de cita {{ appointment.cita }}</span>
          <span class="detail-chevron" aria-hidden="true">⌄</span>
        </summary>
        <dl class="detail-data">
          <div><dt>Cliente</dt><dd>{{ appointment.cliente || '—' }}</dd></div>
          <template v-if="!isType(appointment.tipo, 'Devolución')">
            <div><dt>Booking</dt><dd>{{ appointment.booking || '—' }}</dd></div>
            <div><dt>Producto</dt><dd>{{ appointment.producto || '—' }}</dd></div>
            <div><dt>Tecnología</dt><dd>{{ appointment.tecnologia || '—' }}</dd></div>
            <div><dt>Puerto de descarga</dt><dd>{{ appointment.puertoDescarga || '—' }}</dd></div>
            <div><dt>Nave</dt><dd>{{ appointment.nave || '—' }}</dd></div>
          </template>
          <div><dt>Carreta</dt><dd>{{ appointment.carreta || '—' }}</dd></div>
          <template v-if="mode === 'in-progress'">
            <div><dt>Fecha de cita</dt><dd>{{ formatFecha(appointment.fechaCita) }}</dd></div>
            <div><dt>Ingreso a etapa</dt><dd>{{ formatFecha('fechaStage' in appointment ? appointment.fechaStage : null) }}</dd></div>
          </template>
        </dl>
      </details>
    </article>
  </section>
</template>

<script setup lang="ts" generic="T extends PendingAppointment | AppointmentInProgress">
import { computed } from 'vue';
import type { PendingAppointment } from '../../types/appointments/PendingAppointment';
import type { AppointmentInProgress } from '../../types/appointments/AppointmentInProgress';

const props = defineProps<{
  appointments: T[];
  legendTypes?: string[];
  mode: 'pending' | 'in-progress';
  formatFecha: (fecha: string | null) => string;
}>();

defineSlots<{
  status(props: { appointment: T }): unknown;
  times(props: { appointment: T }): unknown;
}>();

const normalizeType = (type: string) => (type || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const isType = (type: string, expected: string) => normalizeType(type) === normalizeType(expected);
const types = computed(() => [...new Set(props.legendTypes ?? props.appointments.map(appointment => appointment.tipo))].filter(Boolean));
const typeColors: Record<string, string> = {
  'recepcion full': 'type-reception',
  despacho: 'type-dispatch',
  devolucion: 'type-return',
  'retiro full': 'type-pickup',
  'ingreso import': 'type-import',
};
const typeClass = (type: string) => typeColors[normalizeType(type)] ?? 'type-other';
const lineColors: Record<string, { background: string; color: string }> = {
  CMA: { background: '#e20101', color: '#ffffff' },
  MAE: { background: '#42b0d5', color: '#0f172a' },
  MSC: { background: '#eed484', color: '#0f172a' },
  ONE: { background: '#BD0F72', color: '#ffffff' },
  ZIM: { background: '#203C91', color: '#ffffff' },
  EVE: { background: '#009933', color: '#0f172a' },
  SML: { background: '#153e7e', color: '#ffffff' },
  STM: { background: '#0457aa', color: '#ffffff' },
};
const lineStyle = (line: string) => {
  const palette = lineColors[(line || '').trim().toUpperCase()];
  return palette ? { '--line-background': palette.background, '--line-color': palette.color, '--line-border': '#94a3b8' } : undefined;
};
</script>

<style scoped>
.mobile-appointments { display: none; }

@media (max-width: 767px) {
  .mobile-appointments { display: grid; gap: 0.875rem; min-width: 0; }
}

.type-legend { color: #cbd5e1; font-size: 0.75rem; }
.legend-label { display: block; margin-bottom: 0.5rem; color: #94a3b8; }
.type-legend ul { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; list-style: none; margin: 0; padding: 0; }
.type-legend li, .appointment-type { display: inline-flex; align-items: center; gap: 0.4rem; }
.type-dot { flex: 0 0 0.5rem; width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--type-color, #94a3b8); }
.type-reception { --type-color: #60a5fa; }
.type-dispatch { --type-color: #a78bfa; }
.type-return { --type-color: #2dd4bf; }
.type-pickup { --type-color: #fbbf24; }
.type-import { --type-color: #f472b6; }
.type-other { --type-color: #94a3b8; }
.appointment-card { container-type: inline-size; min-width: 0; border: 1px solid #334155; border-radius: 0.625rem; background: #0f172a; color: #e2e8f0; }
.card-heading { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 0.625rem; padding: 1rem 1rem 0; }
.card-heading h3 { margin: 0; font-size: 1rem; line-height: 1.4; overflow-wrap: anywhere; }
.line-code { max-width: 8rem; padding: 0.2rem 0.45rem; border: 1px solid var(--line-border, #475569); border-radius: 0.25rem; background: var(--line-background, transparent); color: var(--line-color, #cbd5e1); font-size: 0.75rem; font-weight: 600; overflow-wrap: anywhere; }
@media (forced-colors: active) {
  .line-code { background: Canvas; color: CanvasText; border-color: CanvasText; }
}
.appointment-type { min-width: 0; color: #cbd5e1; font-size: 0.8rem; overflow-wrap: anywhere; }
.card-status { max-width: 9rem; text-align: right; overflow-wrap: anywhere; }
.priority-data { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.875rem; margin: 0; padding: 1rem; }
.priority-data :deep(div) { min-width: 0; }
dt, .time-data :deep(dt) { color: #94a3b8; font-size: 0.75rem; line-height: 1.5; }
dd, .time-data :deep(dd) { margin: 0.2rem 0 0; font-size: 0.875rem; line-height: 1.5; overflow-wrap: anywhere; }
.priority-data dd, .time-data :deep(dd) { font-weight: 600; }
.full-width { grid-column: 1 / -1; }
.appointment-date dd { font-weight: 400; }
.time-data { padding-top: 0; }
.appointment-details { border-top: 1px solid #334155; }
summary { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; min-height: 44px; box-sizing: border-box; padding: 0.75rem 1rem; color: #93c5fd; font-size: 0.875rem; cursor: pointer; list-style: none; }
summary::-webkit-details-marker { display: none; }
summary:focus-visible { outline: 2px solid #60a5fa; outline-offset: -3px; border-radius: 0.25rem; }
.hide-detail, details[open] .show-detail { display: none; }
details[open] .hide-detail { display: inline; }
details[open] .detail-chevron { transform: rotate(180deg); }
.detail-data { margin: 0; padding: 0 1rem 1rem; }
.detail-data > div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: 0.75rem; padding: 0.625rem 0; border-top: 1px solid #1e293b; }
.detail-data dd { margin: 0; }
.mobile-empty { margin: 0; padding: 2rem 1rem; color: #94a3b8; text-align: center; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
@container (max-width: 260px) {
  .priority-data { grid-template-columns: minmax(0, 1fr); }
  .detail-data > div { grid-template-columns: minmax(0, 1fr); gap: 0.2rem; }
}
</style>
