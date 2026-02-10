<template>
  <button 
    @click="handleExport" 
    class="btn btn-export" 
    :disabled="loading || exporting"
    :title="exportTooltip"
  >
    <span v-if="exporting">⏳ Exportando...</span>
    <span v-else>📥 Exportar Excel</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import { MonitoringExcelExporter } from '../../services/excelMonitoringService';

const props = defineProps<{
  vesselData: VesselData;
  loading?: boolean;
}>();

const exporting = ref(false);

const exportTooltip = computed(() => {
  if (props.loading) return 'Esperando datos...';
  if (exporting.value) return 'Exportando...';
  return 'Exportar reporte completo (Bodegas y BL Items) a Excel';
});

const handleExport = async () => {
  if (exporting.value || props.loading) return;

  try {
    exporting.value = true;

    // Pequeño delay para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 300));

    MonitoringExcelExporter.export({
      vesselData: props.vesselData,
    });

  } catch (error) {
    console.error('Error al exportar:', error);
    alert('Error al generar el archivo Excel. Por favor, intente nuevamente.');
  } finally {
    exporting.value = false;
  }
};
</script>

<style scoped>
.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-export:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

.btn-export:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.btn-export:disabled {
  background: #2d2d44;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .btn-export {
    width: 100%;
    justify-content: center;
  }
}
</style>