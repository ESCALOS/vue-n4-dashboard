<template>
  <button 
    v-if="vesselData.operation_type === 'STOCKPILING'"
    @click="handleExport" 
    class="btn btn-export-stockpiling" 
    :disabled="loading || exporting"
    :title="exportTooltip"
  >
    <span v-if="exporting">⏳ Exportando...</span>
    <span v-else>📊 Exportar Acopio</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import type { Summary } from '../../interfaces/monitoring/Summary';

const props = defineProps<{
  vesselData: VesselData;
  loading?: boolean;
}>();

const exporting = ref(false);

const exportTooltip = computed(() => {
  if (props.loading) return 'Esperando datos...';
  if (exporting.value) return 'Exportando...';
  return 'Exportar reporte de Acopio a Excel (formato especial)';
});

const handleExport = async () => {
  if (exporting.value || props.loading) return;

  try {
    exporting.value = true;
    await new Promise(resolve => setTimeout(resolve, 300));

    // Dynamic import de XLSX - se carga solo cuando se exporta
    const XLSX = await import('xlsx-js-style');

    // Crear el workbook
    const wb = XLSX.default.utils.book_new();

    // Crear una hoja por cada BL
    props.vesselData.summary.services.forEach((service) => {
      const sheetData = createSheetForBL(service);
      const ws = XLSX.default.utils.aoa_to_sheet(sheetData);

      // Aplicar estilos
      applyStylesToSheet(ws);

      // Ajustar anchos de columna
      ws['!cols'] = [
        { wch: 30 }, // NAVE
        { wch: 15 }, // MANIFIESTO
        { wch: 10 }, // Origen
        { wch: 15 }, // O/S (BL Item)
        { wch: 20 }, // Zona
        { wch: 12 }, // # Viajes
        { wch: 20 }, // Peso Manifestado (Tn)
        { wch: 20 }, // Peso Recibido (Tn)
        { wch: 20 }, // Peso Pendiente (Tn)
      ];

      // Nombre de la hoja (limitado a 31 caracteres)
      let sheetName = service.nbr.substring(0, 31);
      XLSX.default.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Generar el archivo
    const fileName = `Acopio_${props.vesselData.manifest.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.default.writeFile(wb, fileName);

  } catch (error) {
    console.error('Error al exportar:', error);
    alert('Error al generar el archivo Excel. Por favor, intente nuevamente.');
  } finally {
    exporting.value = false;
  }
};

const createSheetForBL = (service: Summary) => {
  const vesselName = props.vesselData.manifest.name;
  const manifestId = props.vesselData.manifest.id;
  
  // Calcular número de viajes sumando los totalTickets de todas las transacciones para este BL
  const numViajes = props.vesselData.transactions
    .filter(t => t.serviceId === service.id)
    .reduce((sum, t) => sum + (t.totalTickets || 0), 0);

  // Convertir kg a toneladas (como números, no strings)
  const pesoManifestadoTn = service.weight.manifested / 1000;
  const pesoRecibidoTn = service.weight.processed / 1000;
  const pesoPendienteTn = (service.weight.manifested - service.weight.processed) / 1000;

  // Crear la estructura de datos
  const data = [
    // Fila 1: Nombre de la nave (merge de 9 columnas)
    [vesselName, '', '', '', '', '', '', '', ''],
    // Fila 2: Encabezados de columnas
    [
      'NAVE',
      'MANIFIESTO',
      'Origen',
      'O/S',
      'Zona',
      '# Viajes',
      'Peso Manifestado (Tn)',
      'Peso Recibido (Tn)',
      'Peso Pendiente (Tn)'
    ],
    // Fila 3: Datos del BL
    [
      vesselName,        // Columna 1: Nombre de la nave
      manifestId,      // Columna 2: manifestId
      '',                // Columna 3: vacío
      service.nbr,           // Columna 4: BL Item nbr
      '',                // Columna 5: vacío
      '',                // Columna 6: vacío
      '',                // Columna 7: vacío
      '',                // Columna 8: vacío
      ''                 // Columna 9: vacío
    ],
    // Fila 4: TOTAL con los datos calculados
    [
      'TOTAL',           // Columna 1-5: TOTAL (se hará merge)
      '',
      '',
      '',
      '',
      numViajes,         // Columna 6: número de viajes
      pesoManifestadoTn, // Columna 7: peso manifestado (número en toneladas)
      pesoRecibidoTn,    // Columna 8: peso recibido (número en toneladas)
      pesoPendienteTn    // Columna 9: peso pendiente (número en toneladas)
    ]
  ];

  return data;
};

const applyStylesToSheet = (ws: any) => {
  // Estilo para el título (Fila 1: Nombre de la nave)
  const titleStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 },
    fill: { fgColor: { rgb: 'C00000' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Estilo para los encabezados de columna (Fila 2)
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

  // Estilo para la fila de datos (Fila 3)
  const dataStyle = {
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Estilo para "TOTAL" (Fila 4, columnas 1-5)
  const totalLabelStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: 'C00000' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Estilo para los valores del total (Fila 4, columnas 6-9)
  const totalValueStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'FFF2CC' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Aplicar merge y estilo a la Fila 1 (Nombre de la nave)
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });
  if (ws['A1']) {
    ws['A1'].s = titleStyle;
  }

  // Aplicar estilos a los encabezados (Fila 2)
  const headerCols = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'];
  headerCols.forEach(cell => {
    if (ws[cell]) {
      ws[cell].s = headerStyle;
    }
  });

  // Aplicar estilos a la fila de datos (Fila 3)
  const dataCols = ['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'];
  dataCols.forEach(cell => {
    if (!ws[cell]) ws[cell] = { t: 's', v: '' };
    ws[cell].s = dataStyle;
  });

  // Aplicar merge y estilo a "TOTAL" (Fila 4, columnas 1-5)
  ws['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 4 } });
  const totalLabelCols = ['A4', 'B4', 'C4', 'D4', 'E4'];
  totalLabelCols.forEach(cell => {
    if (!ws[cell]) ws[cell] = { t: 's', v: '' };
    ws[cell].s = totalLabelStyle;
  });

  // Aplicar estilo a los valores del total (Fila 4, columnas 6-9)
  const totalValueCols = ['F4', 'G4', 'H4', 'I4'];
  totalValueCols.forEach(cell => {
    if (ws[cell]) {
      ws[cell].s = totalValueStyle;
    }
  });

  // Aplicar formato numérico a las celdas de peso (columnas G, H, I de la fila 4)
  // Formato: 3 decimales con separador de miles
  const pesoCols = ['G4', 'H4', 'I4'];
  pesoCols.forEach(cell => {
    if (ws[cell] && typeof ws[cell].v === 'number') {
      ws[cell].z = '#,##0.000';
    }
  });

  // Ajustar altura de filas
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][0] = { hpt: 25 }; // Fila 1: título
  ws['!rows'][1] = { hpt: 30 }; // Fila 2: encabezados (más alta para wrap text)
  ws['!rows'][2] = { hpt: 20 }; // Fila 3: datos
  ws['!rows'][3] = { hpt: 20 }; // Fila 4: total
};
</script>

<style scoped>
.btn-export-stockpiling {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
}

.btn-export-stockpiling:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.35);
}

.btn-export-stockpiling:active:not(:disabled) {
  transform: translateY(0);
}

.btn-export-stockpiling:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
