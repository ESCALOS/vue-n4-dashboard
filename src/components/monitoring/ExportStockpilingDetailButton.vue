<template>
  <button 
    v-if="vesselData.operation_type === 'STOCKPILING'"
    @click="handleExport" 
    class="btn btn-export-stockpiling-detail" 
    :disabled="loading || exporting"
    :title="exportTooltip"
  >
    <span v-if="exporting">⏳ Exportando...</span>
    <span v-else>📋 Exportar Detalle Acopio</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import * as XLSX from 'xlsx-js-style';
import type { StockpilingTicket } from '../../interfaces/monitoring/api/StockpilingTicket';
import { getStockpilingTickets } from '../../services/monitoringService';

const props = defineProps<{
  vesselData: VesselData;
  loading?: boolean;
}>();

const exporting = ref(false);

const exportTooltip = computed(() => {
  if (props.loading) return 'Esperando datos...';
  if (exporting.value) return 'Exportando...';
  return 'Exportar detalle completo de tickets de acopio a Excel';
});

const handleExport = async () => {
  if (exporting.value || props.loading) return;

  try {
    exporting.value = true;
    await new Promise(resolve => setTimeout(resolve, 300));

    // Obtener los gkeys de todos los BL items
    const blItemGkeys = props.vesselData.summary.services.map(bl => bl.id);

    // Obtener los tickets desde el backend
    const tickets = await getStockpilingTickets(blItemGkeys);

    if (tickets.length === 0) {
      alert('No hay tickets disponibles para exportar.');
      return;
    }

    // Crear el workbook
    const wb = XLSX.utils.book_new();
    const sheetData = createSheetData(tickets);
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Aplicar estilos
    applyStylesToSheet(ws, tickets.length);

    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 12 }, // Código
      { wch: 25 }, // Anuncio
      { wch: 20 }, // OS
      { wch: 15 }, // Zona
      { wch: 15 }, // G Remision
      { wch: 20 }, // G Transportista
      { wch: 15 }, // Peso Ingreso
      { wch: 15 }, // Peso Salida
      { wch: 15 }, // Peso Neto
      { wch: 12 }, // Tracto
      { wch: 12 }, // Carreta
      { wch: 30 }, // Conductor
      { wch: 20 }, // Fecha Salida
      { wch: 30 }, // Notas
      { wch: 20 }  // RUC Transportista
    ];

    // Agregar al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Detalle Acopio');

    // Generar el archivo
    const fileName = `Detalle_Acopio_${props.vesselData.manifest.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

  } catch (error) {
    console.error('Error al exportar:', error);
    alert('Error al generar el archivo Excel. Por favor, intente nuevamente.');
  } finally {
    exporting.value = false;
  }
};

const createSheetData = (tickets: StockpilingTicket[]): any[][] => {
  const vesselName = props.vesselData.manifest.name;
  
  // Calcular tonelajes
  const tonelajeManifestado = props.vesselData.summary.services.reduce(
    (sum, bl) => sum + bl.weight.manifested,
    0
  ) / 1000; // Convertir a toneladas
  
  const tonelajeAcopiado = props.vesselData.summary.services.reduce(
    (sum, bl) => sum + bl.weight.processed,
    0
  ) / 1000; // Convertir a toneladas

  const data: any[][] = [
    // Fila 1: Vacía
    [''],
    // Fila 2: "ACOPIO DE PIEDRA DE HIERRO"
    ['ACOPIO DE PIEDRA DE HIERRO', '', '', '', '', '', '', '', '', '', ''],
    // Fila 3: Info de la nave
    ['NAVE', vesselName, '', '', '', '', '', '', '', '', ''],
    // Fila 4: Cliente (vacío por ahora)
    ['CLIENTE:', '', '', '', '', '', '', '', '', '', ''],
    // Fila 5: Vacía
    [''],
    // Fila 6: Tonelajes
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Tonelaje Manifestado',
      tonelajeManifestado.toFixed(3)
    ],
    // Fila 7: Tonelaje acopiado
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Tonelaje acopiado',
      tonelajeAcopiado.toFixed(3)
    ],
    // Fila 8: Vacía
    [''],
    // Fila 9: Encabezados de la tabla
    [
      'CÓDIGO',
      'ANUNCIO',
      'OS',
      'ZONA',
      'G REMISION',
      'G TRANSPORTISTA',
      'PESO INGRESO',
      'PESO SALIDA',
      'PESO NETO',
      'TRACTO',
      'CARRETA',
      'CONDUCTOR',
      'FECHA SALIDA',
      'NOTAS',
      'RUC TRANSPORTISTA'
    ]
  ];

  // Agregar filas de tickets
  tickets.forEach(ticket => {
    data.push([
      ticket.codigo,
      vesselName,
      ticket.blItemNbr,
      '', // Zona vacía
      ticket.gRemision,
      ticket.gTransportista,
      ticket.pesoIngreso, // Convertir a toneladas
      ticket.pesoSalida,  // Convertir a toneladas
      ticket.pesoNeto,    // Convertir a toneladas
      ticket.tracto,
      ticket.carreta,
      ticket.conductor,
      ticket.fechaSalida ? new Date(ticket.fechaSalida).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '',
      ticket.notas,
      ticket.rucTransportista
    ]);
  });

  return data;
};

const applyStylesToSheet = (ws: any, ticketsCount: number) => {
  // Estilo para el título principal (Fila 2)
  const titleStyle = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: 'FFFFFF' } }
  };

  // Estilo para etiquetas (NAVE, CLIENTE)
  const labelStyle = {
    font: { bold: true, sz: 11 },
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  // Estilo para los encabezados de tabla (Fila 9)
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: 'C00000' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Estilo para datos de la tabla
  const dataStyle = {
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Estilo para tonelajes
  const tonelajeStyle = {
    font: { bold: true },
    alignment: { horizontal: 'right', vertical: 'center' }
  };

  // Aplicar merge y estilo al título (Fila 2)
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 10 } });
  if (ws['A2']) ws['A2'].s = titleStyle;

  // Aplicar estilo a "NAVE"
  if (ws['A3']) ws['A3'].s = labelStyle;
  if (ws['B3']) ws['B3'].s = { alignment: { horizontal: 'left', vertical: 'center' } };

  // Aplicar estilo a "CLIENTE:"
  if (ws['A4']) ws['A4'].s = labelStyle;

  // Aplicar estilo a tonelajes
  if (ws['J6']) ws['J6'].s = tonelajeStyle;
  if (ws['K6']) {
    ws['K6'].s = tonelajeStyle;
    ws['K6'].z = '#,##0.000';
  }
  if (ws['J7']) ws['J7'].s = tonelajeStyle;
  if (ws['K7']) {
    ws['K7'].s = tonelajeStyle;
    ws['K7'].z = '#,##0.000';
  }

  // Aplicar estilos a los encabezados (Fila 9)
  const headerCols = ['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9', 'J9', 'K9', 'L9', 'M9', 'N9', 'O9'];
  headerCols.forEach(cell => {
    if (ws[cell]) ws[cell].s = headerStyle;
  });

  // Aplicar estilos a las filas de datos (desde fila 10)
  const dataStartRow = 9; // Fila 10 en base 0
  for (let row = dataStartRow; row < dataStartRow + ticketsCount; row++) {
    for (let col = 0; col < 15; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
      ws[cellAddress].s = dataStyle;

      // Aplicar formato numérico a columnas de peso (E, F, G - índices 4, 5, 6)
      if ((col === 4 || col === 5 || col === 6) && ws[cellAddress].v && typeof ws[cellAddress].v === 'number') {
        ws[cellAddress].z = '#,##0.000';
      }
    }
  }

  // Ajustar alturas de fila
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][1] = { hpt: 25 }; // Fila 2: título
  ws['!rows'][8] = { hpt: 30 }; // Fila 9: encabezados (más alta para wrap text)
};
</script>

<style scoped>
.btn-export-acopio-detalle {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(240, 147, 251, 0.25);
}

.btn-export-acopio-detalle:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(240, 147, 251, 0.35);
}

.btn-export-acopio-detalle:active:not(:disabled) {
  transform: translateY(0);
}

.btn-export-acopio-detalle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
