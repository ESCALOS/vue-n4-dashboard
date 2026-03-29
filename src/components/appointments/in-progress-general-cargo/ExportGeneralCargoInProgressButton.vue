<template>
  <button
    @click="handleExport"
    class="btn btn-export"
    :disabled="disabled || exporting"
  >
    <span v-if="exporting">⏳ Exportando...</span>
    <span v-else>📥 Exportar Excel</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { GeneralCargoAppointmentInProgress } from '../../../types/appointments/GeneralCargoAppointmentInProgress';
import { GENERAL_CARGO_STAGE_LABELS } from '../../../types/appointments/GeneralCargoAppointmentInProgress';

const props = defineProps<{
  appointments: GeneralCargoAppointmentInProgress[];
  disabled?: boolean;
}>();

const exporting = ref(false);

function formatTiempo(minutos: number | null): string {
  if (minutos === null || minutos === undefined || minutos < 0) return '';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

const handleExport = async () => {
  if (exporting.value || props.disabled) return;

  try {
    exporting.value = true;
    const XLSX = await import('xlsx-js-style');

    if (props.appointments.length === 0) {
      alert('No hay citas de carga general para exportar.');
      return;
    }

    const headers = [
      'Código',
      'Stage',
      'Gate In',
      'Deducible Espera-Inicio',
      'Deducible Inicio-Término',
      'Tiempo Efectivo',
      'Tracto',
      'Chassis',
      'Permiso',
      'Operativa',
      'Producto',
      'Nave',
      'Cliente',
    ];

    const rows = props.appointments.map((appt) => [
      appt.codigo,
      GENERAL_CARGO_STAGE_LABELS[appt.stage] || appt.stage,
      formatTiempo(appt.tiempoGateIn),
      formatTiempo(appt.deducibleEsperaInicioCarguio),
      formatTiempo(appt.deducibleInicioCarguioTermino),
      formatTiempo(appt.tiempoEfectivo),
      appt.tracto,
      appt.chassis,
      appt.permiso,
      appt.tipoOperativa,
      appt.producto,
      appt.nave,
      appt.cliente,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = headers.map(() => ({ wch: 22 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Citas CG');

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Citas_Carga_General_En_Proceso_${fecha}.xlsx`);
  } catch (error) {
    console.error('Error al exportar citas de carga general:', error);
    alert('Error al generar el archivo Excel.');
  } finally {
    exporting.value = false;
  }
};
</script>

<style scoped>
.btn-export {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
