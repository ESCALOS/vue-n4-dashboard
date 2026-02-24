<template>
  <button
    @click="handleExport"
    class="btn btn-export"
    :disabled="disabled || exporting"
    :title="exporting ? 'Exportando...' : 'Exportar citas pendientes a Excel'"
  >
    <span v-if="exporting">⏳ Exportando...</span>
    <span v-else>📥 Exportar Excel</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as XLSX from 'xlsx-js-style';
import type { PendingAppointment } from '../../../types/appointments/PendingAppointment';
import { ESTADO_LABELS } from '../../../types/appointments/PendingAppointment';

const props = defineProps<{
  appointments: PendingAppointment[];
  disabled?: boolean;
}>();

const exporting = ref(false);

function formatFecha(fecha: string | null): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getEstadoLabel(estado: string): string {
  return ESTADO_LABELS[estado as keyof typeof ESTADO_LABELS] || estado;
}

const handleExport = async () => {
  if (exporting.value || props.disabled) return;

  try {
    exporting.value = true;
    await new Promise(resolve => setTimeout(resolve, 200));

    const data = props.appointments;
    if (data.length === 0) {
      alert('No hay citas pendientes para exportar.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Encabezados
    const headers = [
      'Cita', 'Fecha', 'Estado', 'Línea', 'Booking',
      'Placa', 'Carreta', 'Cliente', 'Tecnología',
      'Producto', 'Contenedor', 'Nave', 'Tipo',
    ];

    // Filas de datos
    const rows = data.map(appt => [
      appt.cita || '',
      formatFecha(appt.fechaCita),
      getEstadoLabel(appt.estado),
      appt.linea || '',
      appt.booking || '',
      appt.placa || '',
      appt.carreta || '',
      appt.cliente || '',
      appt.tecnologia || '',
      appt.producto || '',
      appt.contenedor || '',
      appt.nave || '',
      appt.tipo || '',
    ]);

    const sheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Estilos de cabecera
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: 'C00000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Estilo para datos
    const dataStyle = {
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Aplicar estilo a cabeceras (fila 1)
    for (let col = 0; col < headers.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellRef]) ws[cellRef].s = headerStyle;
    }

    // Aplicar estilo a datos
    for (let row = 1; row <= rows.length; row++) {
      for (let col = 0; col < headers.length; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        ws[cellRef].s = dataStyle;
      }
    }

    // Anchos de columna
    ws['!cols'] = [
      { wch: 14 }, // Cita
      { wch: 18 }, // Fecha
      { wch: 12 }, // Estado
      { wch: 18 }, // Línea
      { wch: 15 }, // Booking
      { wch: 12 }, // Placa
      { wch: 12 }, // Carreta
      { wch: 25 }, // Cliente
      { wch: 14 }, // Tecnología
      { wch: 18 }, // Producto
      { wch: 16 }, // Contenedor
      { wch: 22 }, // Nave
      { wch: 10 }, // Tipo
    ];

    // Altura de cabecera
    ws['!rows'] = [{ hpt: 28 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Citas Pendientes');

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Citas_Pendientes_${fecha}.xlsx`);
  } catch (error) {
    console.error('Error al exportar citas pendientes:', error);
    alert('Error al generar el archivo Excel. Por favor, intente nuevamente.');
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
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
  white-space: nowrap;
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.35);
}

.btn-export:active:not(:disabled) {
  transform: translateY(0);
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
