<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Reportes</p>
        <h1>Reporte TPR</h1>
        <p>Totales contables de Container Vessel y Truck IN / OUT.</p>
      </div>
    </header>

    <div class="filters-card">
      <label>
        <span>Período</span>
        <input v-model="filters.period" type="month" />
      </label>
      <label>
        <span>Tipo de reporte</span>
        <select v-model="filters.type">
          <option value="ALL">Todos</option>
          <option value="CONTAINER_VESSEL">Container Vessel</option>
          <option value="TRUCK_IN_OUT">Truck IN / OUT</option>
        </select>
      </label>
      <label class="search-field">
        <span>Buscar tópico</span>
        <input v-model="search" type="search" placeholder="UNIQUE ID o descripción" />
      </label>
      <div class="actions">
        <button class="button button-primary" :disabled="loading" @click="consult">
          {{ loading ? 'Consultando…' : 'Consultar' }}
        </button>
        <button class="button button-secondary" :disabled="!report || exporting" @click="exportSummary">
          {{ exporting ? 'Exportando…' : 'Exportar resumen' }}
        </button>
        <button
          v-if="authStore.isAdmin"
          class="button button-warning"
          :disabled="regenerating || loading"
          @click="regenerate"
        >
          {{ regenerating ? 'Regenerando…' : 'Regenerar caché' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="notice notice-error">{{ error }}</p>
    <div v-if="report" class="report-meta">
      <span>{{ report.cached ? 'Respuesta desde caché' : 'Respuesta generada desde N4' }}</span>
      <span>Generado: {{ formatGeneratedAt(report.generatedAt) }}</span>
      <span>{{ filteredRows.length }} tópicos</span>
    </div>

    <div class="table-card">
      <p v-if="!report && !loading" class="empty-state">
        Selecciona los filtros y presiona Consultar para generar el reporte.
      </p>
      <p v-else-if="loading" class="empty-state">Consultando Reporte TPR…</p>
      <p v-else-if="filteredRows.length === 0" class="empty-state">
        No hay tópicos que coincidan con la búsqueda.
      </p>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>UNIQUE ID</th>
              <th>ACCOUNT DESCRIPTION</th>
              <th class="numeric">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in filteredRows" :key="`${row.reportType ?? 'DEFAULT'}-${row.uniqueId}`">
              <tr
                v-if="row.hasDetails"
                class="interactive"
                tabindex="0"
                @click="openDetail(row)"
                @keydown.enter="openDetail(row)"
              >
                <td class="unique-id">{{ row.uniqueId }}</td>
                <td>{{ row.accountDescription }}</td>
                <td class="numeric total">{{ row.total.toLocaleString('es-PE') }}</td>
              </tr>
              <tr v-else class="non-interactive" title="Sin registros para mostrar">
                <td class="unique-id">{{ row.uniqueId }}</td>
                <td>{{ row.accountDescription }}</td>
                <td class="numeric total">{{ row.total.toLocaleString('es-PE') }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <TprDetailModal
      v-if="selectedTopic && appliedPeriod"
      :period="appliedPeriod"
      :topic="selectedTopic"
      @close="selectedTopic = null"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import TprDetailModal from '../../components/reports/TprDetailModal.vue';
import { tprReportService } from '../../services/tprReportService';
import { useAuthStore } from '../../stores/auth';
import type {
  TprReportType,
  TprSummaryResponse,
  TprSummaryRow,
} from '../../types/reports/TprReport';

const authStore = useAuthStore();
const currentPeriodParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Lima',
  year: 'numeric',
  month: '2-digit',
}).formatToParts(new Date());
const currentPeriod = `${currentPeriodParts.find((part) => part.type === 'year')?.value}-${currentPeriodParts.find((part) => part.type === 'month')?.value}`;

const filters = reactive<{ period: string; type: TprReportType }>({
  period: currentPeriod,
  type: 'ALL',
});
const search = ref('');
const report = ref<TprSummaryResponse | null>(null);
const appliedPeriod = ref('');
const appliedType = ref<TprReportType>('ALL');
const selectedTopic = ref<TprSummaryRow | null>(null);
const loading = ref(false);
const exporting = ref(false);
const regenerating = ref(false);
const error = ref('');

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!report.value || !query) return report.value?.rows ?? [];
  return report.value.rows.filter((row) =>
    row.uniqueId.toLowerCase().includes(query)
    || row.accountDescription.toLowerCase().includes(query),
  );
});

async function consult() {
  loading.value = true;
  error.value = '';
  selectedTopic.value = null;
  try {
    report.value = await tprReportService.getSummary(filters.period, filters.type);
    appliedPeriod.value = filters.period;
    appliedType.value = filters.type;
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Error al consultar el reporte';
  } finally {
    loading.value = false;
  }
}

function openDetail(row: TprSummaryRow) {
  if (!row.hasDetails || !row.reportType) return;
  selectedTopic.value = row;
}

async function exportSummary() {
  if (!report.value || !appliedPeriod.value) return;
  exporting.value = true;
  error.value = '';
  try {
    await tprReportService.exportSummary(appliedPeriod.value, appliedType.value);
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Error al exportar el resumen';
  } finally {
    exporting.value = false;
  }
}

async function regenerate() {
  regenerating.value = true;
  error.value = '';
  try {
    await tprReportService.regenerate(filters.period);
    await consult();
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Error al regenerar el caché';
  } finally {
    regenerating.value = false;
  }
}

function formatGeneratedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-PE');
}
</script>

<style scoped>
.page { max-width: 88rem; margin: 0 auto; color: #e5e7eb; }
.page-header { margin-bottom: 1.25rem; }
.page-header h1 { margin: 0.2rem 0; font-size: clamp(1.7rem, 3vw, 2.25rem); }
.page-header p { margin: 0; color: #94a3b8; }
.eyebrow { color: #60a5fa !important; font-size: 0.75rem; font-weight: 750; letter-spacing: 0.08em; text-transform: uppercase; }
.filters-card, .table-card {
  background: #111827;
  border: 1px solid #273449;
  border-radius: 0.85rem;
}
.filters-card { display: grid; grid-template-columns: 12rem 15rem minmax(16rem, 1fr); gap: 1rem; padding: 1rem; }
label { display: flex; flex-direction: column; gap: 0.4rem; color: #cbd5e1; font-size: 0.8rem; font-weight: 650; }
input, select {
  min-height: 2.5rem;
  padding: 0.55rem 0.7rem;
  color: #e5e7eb;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  font: inherit;
}
.actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 0.65rem; }
.button { border: 0; border-radius: 0.5rem; padding: 0.6rem 0.95rem; cursor: pointer; font-weight: 700; }
.button:disabled { cursor: not-allowed; opacity: 0.55; }
.button-primary { color: white; background: #2563eb; }
.button-secondary { color: #e2e8f0; background: #334155; }
.button-warning { color: #111827; background: #f59e0b; }
.notice, .report-meta { margin: 1rem 0; padding: 0.75rem 1rem; border-radius: 0.6rem; font-size: 0.85rem; }
.notice-error { color: #fecaca; background: rgba(127, 29, 29, 0.45); border: 1px solid #991b1b; }
.report-meta { display: flex; flex-wrap: wrap; gap: 1.25rem; color: #93c5fd; background: rgba(30, 58, 138, 0.25); border: 1px solid #1e3a8a; }
.table-card { margin-top: 1rem; overflow: hidden; }
.table-wrapper { overflow: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.8rem 1rem; border-bottom: 1px solid #1f2937; text-align: left; }
th { color: #94a3b8; background: #0f172a; font-size: 0.75rem; letter-spacing: 0.03em; }
tbody tr { transition: background 0.15s, opacity 0.15s; }
tbody tr.interactive { cursor: pointer; }
tbody tr.interactive:hover, tbody tr.interactive:focus { outline: none; background: rgba(37, 99, 235, 0.14); }
tbody tr.non-interactive { cursor: default; opacity: 0.68; }
.unique-id { color: #93c5fd; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 700; }
.numeric { text-align: right; }
.total { font-size: 1rem; font-weight: 750; }
.empty-state { margin: 0; padding: 3rem 1rem; color: #64748b; text-align: center; }
@media (max-width: 820px) {
  .filters-card { grid-template-columns: 1fr 1fr; }
  .search-field { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .filters-card { grid-template-columns: 1fr; }
  .search-field, .actions { grid-column: auto; }
  .actions .button { width: 100%; }
  th, td { padding-inline: 0.7rem; }
}
</style>
