<template>
  <dialog ref="dialogRef" class="detail-dialog" @close="emit('close')">
    <div class="dialog-header">
      <div>
        <p class="eyebrow">Detalle Reporte TPR</p>
        <h2>{{ topic.uniqueId }}</h2>
        <p class="description">{{ topic.accountDescription }}</p>
      </div>
      <button class="icon-button" type="button" aria-label="Cerrar" @click="close">✕</button>
    </div>

    <div class="dialog-toolbar">
      <div class="detail-meta">
        <span>Total general: <strong>{{ topic.total.toLocaleString('es-PE') }}</strong></span>
        <span v-if="isEquipmentDetail">Subtotal filtrado: <strong>{{ (detail?.filteredTotal ?? 0).toLocaleString('es-PE') }}</strong></span>
        <span v-if="detail">{{ detail.cached ? 'Desde caché' : 'Generado desde N4' }}</span>
      </div>
      <label v-if="isEquipmentTopic" class="ownership-filter">
        <span>Tipo de equipo</span>
        <select v-model="ownership" :disabled="loading" @change="changeOwnership">
          <option value="ALL">Todos</option>
          <option value="INTERNAL">Internas</option>
          <option value="RENTED">Alquiladas</option>
        </select>
      </label>
      <button class="button button-primary" :disabled="exporting" @click="exportDetail">
        {{ exporting ? 'Exportando…' : 'Exportar detalle' }}
      </button>
    </div>

    <p v-if="loading" class="feedback">Cargando detalle…</p>
    <p v-else-if="error" class="feedback error">{{ error }}</p>
    <p v-else-if="!detail || detail.rows.length === 0" class="feedback">
      No existen movimientos para este tópico en el período seleccionado.
    </p>

    <div v-else class="table-wrapper">
      <table v-if="detail.detailKind === 'EQUIPMENT_MOVES'" class="equipment-table">
        <thead><tr><th>EQUIPO</th><th>TIPO</th><th class="numeric">TOTAL MOVIMIENTOS</th></tr></thead>
        <tbody>
          <tr v-for="row in equipmentRows" :key="`${row.equipment}-${row.ownership}`">
            <td>{{ row.equipment }}</td>
            <td>{{ row.ownership === 'INTERNAL' ? 'Interna' : 'Alquilada' }}</td>
            <td class="numeric">{{ row.total.toLocaleString('es-PE') }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="detail.detailKind === 'VESSEL_CALLS'" class="vessel-calls-table">
        <thead>
          <tr>
            <th>ATD</th>
            <th>MANIFIESTO</th>
            <th>NAVE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in vesselCallRows" :key="`${row.manifest}-${row.atd}-${index}`">
            <td>{{ formatDate(row.atd) }}</td>
            <td>{{ row.manifest }}</td>
            <td>{{ display(row.vessel) }}</td>
          </tr>
        </tbody>
      </table>

      <table v-else class="movements-table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>CONTENEDOR</th>
            <th>OPERACIÓN</th>
            <th>ESTADO</th>
            <th>EQUIPO</th>
            <th>TAMAÑO</th>
            <th>ISO</th>
            <th>TIPO CONTENEDOR</th>
            <th>CATEGORY</th>
            <th>LÍNEA</th>
            <th>NOMBRE LÍNEA</th>
            <th>MANIFIESTO</th>
            <th>NAVE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in movementRows" :key="`${row.container}-${row.movementDate}-${index}`">
            <td>{{ formatDate(row.movementDate) }}</td>
            <td>{{ row.container }}</td>
            <td>{{ row.operation }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.equipment }}</td>
            <td>{{ row.size }}</td>
            <td>{{ row.iso }}</td>
            <td>{{ row.containerType }}</td>
            <td>{{ row.category }}</td>
            <td>{{ display(row.shippingLine) }}</td>
            <td>{{ display(row.shippingLineName) }}</td>
            <td>{{ display(row.manifest) }}</td>
            <td>{{ display(row.vessel) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="detail && detail.pagination.totalPages > 1" class="pagination">
      <span>
        Página {{ detail.pagination.page }} de {{ detail.pagination.totalPages }}
      </span>
      <div>
        <button
          class="button button-secondary"
          :disabled="loading || detail.pagination.page <= 1"
          @click="loadPage(detail.pagination.page - 1)"
        >
          Anterior
        </button>
        <button
          class="button button-secondary"
          :disabled="loading || detail.pagination.page >= detail.pagination.totalPages"
          @click="loadPage(detail.pagination.page + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { tprReportService } from '../../services/tprReportService';
import type {
  TprDetailResponse,
  TprDetailRow,
  TprEquipmentDetailRow,
  TprEquipmentOwnership,
  TprSummaryRow,
  TprVesselCallDetailRow,
} from '../../types/reports/TprReport';

const props = defineProps<{
  period: string;
  topic: TprSummaryRow;
}>();

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLDialogElement>();
const detail = ref<TprDetailResponse | null>(null);
const loading = ref(false);
const exporting = ref(false);
const error = ref('');
const pageSize = 100;
const ownership = ref<TprEquipmentOwnership>('ALL');
const isEquipmentTopic = computed(() => props.topic.reportType === 'PERFORMANCE_EQUIPMENT');
const isEquipmentDetail = computed(() => detail.value?.detailKind === 'EQUIPMENT_MOVES');
const movementRows = computed(() =>
  detail.value?.detailKind === 'MOVEMENTS'
    ? detail.value.rows as TprDetailRow[]
    : [],
);
const vesselCallRows = computed(() =>
  detail.value?.detailKind === 'VESSEL_CALLS'
    ? detail.value.rows as TprVesselCallDetailRow[]
    : [],
);
const equipmentRows = computed(() =>
  detail.value?.detailKind === 'EQUIPMENT_MOVES'
    ? detail.value.rows as TprEquipmentDetailRow[]
    : [],
);

async function loadPage(page: number) {
  if (!props.topic.reportType) return;
  loading.value = true;
  error.value = '';
  try {
    detail.value = await tprReportService.getDetails(
      props.period,
      props.topic.reportType,
      props.topic.uniqueId,
      page,
      pageSize,
      ownership.value,
    );
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Error al cargar el detalle';
  } finally {
    loading.value = false;
  }
}

async function exportDetail() {
  if (!props.topic.reportType) return;
  exporting.value = true;
  error.value = '';
  try {
    await tprReportService.exportDetails(
      props.period,
      props.topic.reportType,
      props.topic.uniqueId,
      ownership.value,
    );
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Error al exportar el detalle';
  } finally {
    exporting.value = false;
  }
}

async function changeOwnership() {
  await loadPage(1);
}

function close() {
  dialogRef.value?.close();
}

function display(value: string | null): string {
  return value?.trim() || 'No aplica';
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('es-PE', {
      timeZone: 'UTC',
      dateStyle: 'short',
      timeStyle: 'medium',
    });
}

onMounted(async () => {
  await nextTick();
  dialogRef.value?.showModal();
  await loadPage(1);
});
</script>

<style scoped>
.detail-dialog {
  width: min(96vw, 92rem);
  max-height: 90vh;
  padding: 0;
  overflow: hidden;
  color: #e5e7eb;
  background: #111827;
  border: 1px solid #334155;
  border-radius: 0.85rem;
}
.detail-dialog::backdrop { background: rgba(2, 6, 23, 0.8); }
.dialog-header, .dialog-toolbar, .pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
}
.dialog-header { border-bottom: 1px solid #273449; }
.dialog-header h2 { margin: 0.15rem 0; font-size: 1.25rem; }
.eyebrow { margin: 0; color: #60a5fa; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.description { margin: 0; color: #94a3b8; font-size: 0.9rem; }
.icon-button { border: 0; background: transparent; color: #cbd5e1; cursor: pointer; font-size: 1.25rem; }
.dialog-toolbar { padding-block: 0.75rem; flex-wrap: wrap; }
.detail-meta { display: flex; flex-wrap: wrap; gap: 1rem; color: #94a3b8; font-size: 0.85rem; }
.ownership-filter { display: flex; align-items: center; gap: 0.5rem; color: #cbd5e1; font-size: 0.8rem; }
.ownership-filter select { padding: 0.45rem 0.65rem; color: #e5e7eb; background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; }
.table-wrapper { max-height: 58vh; overflow: auto; border-block: 1px solid #273449; }
table { width: 100%; border-collapse: collapse; }
.movements-table { min-width: 105rem; }
.vessel-calls-table { min-width: 40rem; }
.equipment-table { min-width: 36rem; }
.numeric { text-align: right; }
th, td { padding: 0.65rem 0.75rem; border-bottom: 1px solid #1f2937; text-align: left; white-space: nowrap; font-size: 0.78rem; }
th { position: sticky; top: 0; z-index: 1; color: #cbd5e1; background: #0f172a; }
tbody tr:nth-child(even) { background: rgba(30, 41, 59, 0.35); }
.feedback { margin: 1.5rem; color: #94a3b8; text-align: center; }
.feedback.error { color: #fca5a5; }
.button { border: 0; border-radius: 0.5rem; padding: 0.55rem 0.9rem; cursor: pointer; font-weight: 650; }
.button:disabled { cursor: not-allowed; opacity: 0.55; }
.button-primary { color: white; background: #2563eb; }
.button-secondary { margin-left: 0.5rem; color: #e2e8f0; background: #334155; }
.pagination { color: #94a3b8; font-size: 0.85rem; }
@media (max-width: 640px) {
  .dialog-toolbar, .pagination { align-items: stretch; flex-direction: column; }
}
</style>
