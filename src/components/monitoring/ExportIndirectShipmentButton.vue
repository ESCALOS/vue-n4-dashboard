<template>
  <button
    v-if="vesselData.operation_type === 'INDIRECT_LOADING'"
    @click="handleExport"
    class="btn btn-export-indirect-shipment"
    :disabled="loading || exporting"
    :title="exportTooltip"
  >
    <span v-if="exporting">⏳ Exportando...</span>
    <span v-else>📋 Exportar Tickets</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import type { IndirectShipmentTicket } from '../../interfaces/monitoring/api/IndirectShipmentTicket';
import { getIndirectShipmentTickets } from '../../services/monitoringService';

const props = defineProps<{
  vesselData: VesselData;
  loading?: boolean;
}>();

const exporting = ref(false);

const exportTooltip = computed(() => {
  if (props.loading) return 'Esperando datos...';
  if (exporting.value) return 'Exportando...';
  return 'Exportar detalle completo de tickets de embarque indirecto a Excel';
});

const vesselName = computed(() => props.vesselData.manifest.name);

const handleExport = async () => {
  if (exporting.value || props.loading) return;

  try {
    exporting.value = true;
    await new Promise(resolve => setTimeout(resolve, 300));

    const XLSX = await import('xlsx-js-style');

    const blItemGkeys = props.vesselData.summary.services.map(bl => bl.id);
    const tickets = await getIndirectShipmentTickets(props.vesselData.manifest.id, blItemGkeys);

    if (tickets.length === 0) {
      alert('No hay tickets disponibles para exportar.');
      return;
    }

    const wb = XLSX.default.utils.book_new();
    const sheetData = createSheetData(tickets);
    const ws = XLSX.default.utils.aoa_to_sheet(sheetData);

    applyStylesToSheet(ws, tickets.length, XLSX.default);

    ws['!cols'] = [
      { wch: 14 }, // CÓDIGO
      { wch: 20 }, // UNIT
      { wch: 30 }, // ANUNCIO
      { wch: 15 }, // BL ITEMS
      { wch: 15 }, // PESO INGRESO
      { wch: 15 }, // PESO SALIDA
      { wch: 15 }, // NETO
      { wch: 15 }, // BODEGA
      { wch: 12 }, // TRACTO
      { wch: 12 }, // CHASSIS
      { wch: 30 }, // CONDUCTOR
      { wch: 22 }, // FECHA SALIDA
    ];

    XLSX.default.utils.book_append_sheet(wb, ws, 'EMBARQUE INDIRECTO');

    const fileName = `Tickets_Embarque_Indirecto_${vesselName.value}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.default.writeFile(wb, fileName);

  } catch (error) {
    console.error('Error al exportar:', error);
    alert('Error al generar el archivo Excel. Por favor, intente nuevamente.');
  } finally {
    exporting.value = false;
  }
};

const createSheetData = (tickets: IndirectShipmentTicket[]): any[][] => {
  const tonelajeManifestado = props.vesselData.summary.services.reduce(
    (sum, bl) => sum + bl.weight.manifested, 0
  ) / 1000;

  const tonelajeEmbarque = props.vesselData.summary.services.reduce(
    (sum, bl) => sum + bl.weight.processed, 0
  ) / 1000;

  const data: any[][] = [
    [''],
    ['EMBARQUE INDIRECTO', '', '', '', '', '', '', '', '', '', ''],
    ['NAVE', vesselName.value, '', '', '', '', '', '', '', '', ''],
    ['CLIENTE:', '', '', '', '', '', '', '', '', '', ''],
    [''],
    ['', '', '', '', '', '', '', '', '', 'Tonelaje Manifestado', tonelajeManifestado.toFixed(3)],
    ['', '', '', '', '', '', '', '', '', 'Tonelaje Embarcado',   tonelajeEmbarque.toFixed(3)],
    [''],
    [
      'CÓDIGO',
      'UNIT',
      'ANUNCIO',
      'BL ITEMS',
      'PESO INGRESO',
      'PESO SALIDA',
      'NETO',
      'BODEGA',
      'TRACTO',
      'CHASSIS',
      'CONDUCTOR',
      'FECHA SALIDA',
    ],
  ];

  tickets.forEach(ticket => {
    data.push([
      ticket.codigo,
      ticket.unit,
      vesselName.value,
      ticket.blItemNbr,
      ticket.pesoIngreso,
      ticket.pesoSalida,
      ticket.pesoNeto,
      ticket.bodega,
      ticket.tracto,
      ticket.chassis,
      ticket.conductor,
      ticket.fechaSalida
        ? new Date(ticket.fechaSalida).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
    ]);
  });

  return data;
};

const applyStylesToSheet = (ws: any, ticketsCount: number, XLSX: any) => {
  const titleStyle = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: 'FFFFFF' } },
  };

  const labelStyle = {
    font: { bold: true, sz: 11 },
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: 'C00000' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top:    { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left:   { style: 'thin', color: { rgb: '000000' } },
      right:  { style: 'thin', color: { rgb: '000000' } },
    },
  };

  const dataStyle = {
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top:    { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left:   { style: 'thin', color: { rgb: '000000' } },
      right:  { style: 'thin', color: { rgb: '000000' } },
    },
  };

  const tonelajeStyle = {
    font: { bold: true },
    alignment: { horizontal: 'right', vertical: 'center' },
  };

  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 10 } });
  if (ws['A2']) ws['A2'].s = titleStyle;

  if (ws['A3']) ws['A3'].s = labelStyle;
  if (ws['B3']) ws['B3'].s = { alignment: { horizontal: 'left', vertical: 'center' } };
  if (ws['A4']) ws['A4'].s = labelStyle;

  if (ws['J6']) ws['J6'].s = tonelajeStyle;
  if (ws['K6']) { ws['K6'].s = tonelajeStyle; ws['K6'].z = '#,##0.000'; }
  if (ws['J7']) ws['J7'].s = tonelajeStyle;
  if (ws['K7']) { ws['K7'].s = tonelajeStyle; ws['K7'].z = '#,##0.000'; }

  // Encabezados fila 9 (A–L = 12 columnas)
  const headerCols = ['A9','B9','C9','D9','E9','F9','G9','H9','I9','J9','K9','L9'];
  headerCols.forEach(cell => { if (ws[cell]) ws[cell].s = headerStyle; });

  const dataStartRow = 9;
  // columnas de peso: E=4, F=5, G=6
  for (let row = dataStartRow; row < dataStartRow + ticketsCount; row++) {
    for (let col = 0; col < 12; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
      ws[cellAddress].s = dataStyle;
      if ((col === 4 || col === 5 || col === 6) && typeof ws[cellAddress].v === 'number') {
        ws[cellAddress].z = '#,##0.000';
      }
    }
  }

  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][1] = { hpt: 25 };
  ws['!rows'][8] = { hpt: 30 };
};
</script>

<style scoped>
.btn-export-indirect-shipment {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(79, 172, 254, 0.25);
}

.btn-export-indirect-shipment:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(79, 172, 254, 0.35);
}

.btn-export-indirect-shipment:active:not(:disabled) {
  transform: translateY(0);
}

.btn-export-indirect-shipment:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
