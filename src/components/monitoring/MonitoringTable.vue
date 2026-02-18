<template>
  <div class="table-container">
    <table class="data-table pivoted-table">
        <thead>
            <tr>
                <th class="shift-column">Jornada</th>
                <th v-for="(col, idx) in columns" :key="`col-${idx}`" class="data-column" :title="col.commodity">
                    {{ col.key }}
                </th>
                <th class="total-column">Total Jornada</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="shiftRow in shifts"
                :key="shiftRow.shift"
                class="shift-row"
                :class="{ 'current-shift': shiftRow.shift === currentShift }"
            >
                <td class="shift-cell">
                    <span :class="['shift-badge', getShiftClass(shiftRow.shift)]">
                        <span class="shift-badge-date">{{ formatShiftBadge(shiftRow.shift).date }}</span>
                        <span class="shift-badge-time">{{ formatShiftBadge(shiftRow.shift).time }}</span>
                    </span>
                </td>
                <td v-for="(col, idx) in shiftRow.columns" :key="idx" class="data-cell">
                    <span v-if="viewMode === 'weight'">{{ formatNumber(col.weight) }}</span>
                    <span v-else>{{ formatNumber(col.goods) }}</span>
                </td>
                <td class="total-cell">
                    <strong v-if="viewMode === 'weight'">{{ formatNumber(shiftRow.totalWeight) }}</strong>
                    <strong v-else>{{ formatNumber(shiftRow.totalGoods) }}</strong>
                </td>
            </tr>
        </tbody>
         <tfoot>
        <tr class="footer-row footer-manifested">
          <td class="footer-label">📋 Manifestado</td>
          <td v-for="(col, idx) in columns" :key="`man-${idx}`" class="footer-cell">
            <span v-if="viewMode === 'weight'">{{ formatNumber(col.manifested_weight) }}</span>
            <span v-else>{{ formatNumber(col.manifested_goods) }}</span>
          </td>
          <td class="footer-total">
            <strong v-if="viewMode === 'weight'">
              {{ formatNumber(columnTotals.weight.manifested.reduce((s, t) => s + t, 0)) }}
            </strong>
            <strong v-else>
              {{ formatNumber(columnTotals.goods.manifested.reduce((s, t) => s + t, 0)) }}
            </strong>
          </td>
        </tr>
        <tr class="footer-row footer-processed">
          <td class="footer-label">{{ getOperationLabel(operationType) }}</td>
          <td v-for="(_, idx) in columns" :key="`desc-${idx}`" class="footer-cell">
            <span v-if="viewMode === 'weight'"
              >{{ formatNumber(columnTotals.weight.processed[idx] ?? 0) }}</span
            >
            <span v-else>{{ formatNumber(columnTotals.goods.processed[idx] ?? 0) }}</span>
          </td>
          <td class="footer-total">
            <strong v-if="viewMode === 'weight'">
              {{ formatNumber(columnTotals.weight.processed.reduce((s, t) => s + t, 0)) }}
            </strong>
            <strong v-else>
              {{ formatNumber(columnTotals.goods.processed.reduce((s, t) => s + t, 0)) }}
            </strong>
          </td>
        </tr>
        <tr class="footer-row footer-difference">
          <td class="footer-label">📊 Diferencia</td>
          <td v-for="(_, idx) in columns" :key="`dif-${idx}`" class="footer-cell">
            <span
              v-if="viewMode === 'weight'"
              :class="(columnTotals.weight.difference[idx] ?? 0) > 0 ? 'diff-pending' : 'diff-complete'"
            >
              {{ formatNumber(columnTotals.weight.difference[idx] ?? 0) }}
            </span>
            <span
              v-else
              :class="
                (columnTotals.goods.difference[idx] ?? 0) > 0 ? 'diff-pending' : 'diff-complete'
              "
            >
              {{ formatNumber(columnTotals.goods.difference[idx] ?? 0) }}
            </span>
          </td>
          <td class="footer-total">
            <strong
              v-if="viewMode === 'weight'"
              :class="
                columnTotals.weight.difference.reduce((s, t) => s + t, 0) > 0
                  ? 'diff-pending'
                  : 'diff-complete'
              "
            >
              {{ formatNumber(columnTotals.weight.difference.reduce((s, t) => s + t, 0)) }}
            </strong>
            <strong
              v-else
              :class="
                columnTotals.goods.difference.reduce((s, t) => s + t, 0) > 0
                  ? 'diff-pending'
                  : 'diff-complete'
              "
            >
              {{ formatNumber(columnTotals.goods.difference.reduce((s, t) => s + t, 0)) }}
            </strong>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script lang="ts" setup>
import type { OperationType } from '../../types/monitoring/OperationType';
import { getShiftClass, formatShiftBadge, formatNumber } from '../../utils/monitoring';

type Shift = {
    shift: string;
    columns: { weight: number; goods: number }[];
    totalWeight: number;
    totalGoods: number;
}

type Column = {
    key: string;
    commodity?: string;
    manifested_weight: number;
    manifested_goods: number;
}

type ColumnsTotals = {
    weight: {
        manifested: number[];
        processed: number[];
        difference: number[];
    },
    goods: {
        manifested: number[];
        processed: number[];
        difference: number[];
    }
}

defineProps<{
    shifts: Shift[];
    columns: Column[];
    columnTotals: ColumnsTotals;
    viewMode: 'weight' | 'goods';
    currentShift: string;
    operationType: OperationType;
}>();

const getOperationLabel = (tipo: OperationType): string => {
  const labels: Record<OperationType, string> = {
    DISPATCHING: '🚚 Despachado',
    STOCKPILING: '📦 Acopiado',
    DIRECT_LOADING: '🚢 Embarcado',
    INDIRECT_LOADING: '🚢 Embarcado',
  };
  return labels[tipo] || '✅ Procesado';
};
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid #2d2d44;
  background: #1a1a2e;
  margin-bottom: 2rem;
}

/* Base Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 800px;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #2d2d44;
}

/* Table Header */
.data-table thead {
  background: rgba(59, 130, 246, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table thead th {
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  font-size: 0.8125rem;
  letter-spacing: 0.05em;
  white-space: nowrap;
  border-bottom: 2px solid #3b82f6;
}

/* Table Body */
.data-table tbody tr {
  transition: background-color 0.15s;
}

.data-table tbody tr:hover {
  background: #17233a;
  color: inherit;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody td {
  color: #cbd5e1;
}

/* Pivoted Table Specific */
.pivoted-table .shift-column {
  min-width: 180px;
  width: 180px;
  position: sticky;
  left: 0;
  background: #1a1a2e;
  z-index: 5;
  font-weight: 600;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.3);
}

.pivoted-table thead .shift-column {
  background: rgba(59, 130, 246, 0.1);
}

.pivoted-table .data-column {
  min-width: 120px;
  text-align: right;
  font-weight: 600;
  color: #3b82f6;
}

.pivoted-table .total-column {
  min-width: 140px;
  width: 140px;
  text-align: center;
  background: #1a1a2e;
  color: #10b981;
  font-weight: 700;
  position: sticky;
  right: 0;
  z-index: 5;
  border-left: 2px solid #2d2d44;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.3);
}

.pivoted-table thead .total-column {
  background: rgba(16, 185, 129, 0.1);
}

/* Shift Rows */
.shift-row {
  cursor: pointer;
  transition: all 0.2s;
  background: #1a1a2e;
}

.shift-row:hover {
  background: rgba(59, 130, 246, 0.08);
}

.shift-row.current-shift {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #f59e0b;
}

.shift-row.current-shift:hover {
  background: rgba(245, 158, 11, 0.15);
}

.shift-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 4;
}

.data-cell {
  text-align: right;
  font-weight: 500;
  color: #e2e8f0;
}

.total-cell {
  text-align: right;
  background: #1a1a2e;
  color: #10b981;
  font-size: 0.9375rem;
  position: sticky;
  right: 0;
  z-index: 4;
  border-left: 2px solid #2d2d44;
}

/* Table Footer */
.data-table tfoot {
  position: sticky;
  bottom: 0;
  z-index: 3;
  background: #1a1a2e;
}

.footer-row {
  background: #1a1a2e;
  border-top: 2px solid #2d2d44;
  font-weight: 600;
}

.footer-row td {
  border-bottom: 1px solid #2d2d44;
  padding: 1rem;
}

.footer-manifested {
  background: #1e2842;
}

.footer-processed {
  background: #1a2e29;
}

.footer-difference {
  background: #2e2419;
  border-top: 3px solid #f59e0b;
}

.footer-label {
  position: sticky;
  left: 0;
  background: #1a1a2e;
  z-index: 4;
  font-weight: 700;
  color: #e2e8f0;
  padding-left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.3);
}

.footer-manifested .footer-label {
  background: #1e2842;
}

.footer-processed .footer-label {
  background: #1a2e29;
}

.footer-difference .footer-label {
  background: #2e2419;
}

.footer-cell {
  text-align: right;
  color: #e2e8f0;
}

.footer-total {
  text-align: right;
  font-size: 1rem;
  color: #10b981;
  position: sticky;
  right: 0;
  background: #1a1a2e;
  z-index: 4;
  border-left: 2px solid #2d2d44;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.3);
}

.footer-manifested .footer-total {
  background: #1e2842;
}

.footer-processed .footer-total {
  background: #1a2e29;
}

.footer-difference .footer-total {
  background: #2e2419;
}

/* Difference States */
.diff-pending {
  color: #f59e0b;
  font-weight: 600;
}

.diff-complete {
  color: #10b981;
  font-weight: 600;
}

/* Number formatting */
.data-table .number {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.data-table .accent {
  color: #3b82f6 !important;
  font-weight: 600;
}

.data-table .positive {
  color: #10b981;
}

.data-table .negative {
  color: #ef4444;
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  width: fit-content;
}

.toggle-btn {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #94a3b8;
  transition: all 0.2s;
  font-weight: 500;
  font-family: inherit;
}

.toggle-btn:hover {
  color: #e2e8f0;
  background: rgba(59, 130, 246, 0.1);
}

.toggle-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* Metric Switch (Peso/Bultos) */
.metric-switch {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  width: fit-content;
}

.metric-btn {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #94a3b8;
  transition: all 0.2s;
  font-weight: 500;
  font-family: inherit;
}

.metric-btn:hover {
  color: #e2e8f0;
  background: rgba(16, 185, 129, 0.1);
}

.metric-btn.active {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #2d2d44;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .shift-badge {
    flex-direction: column;
  }
  .data-table {
    font-size: 0.8125rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.625rem 0.75rem;
  }

  .pivoted-table .shift-column {
    min-width: 120px;
    width: 120px;
  }

  .pivoted-table .data-column {
    min-width: 100px;
  }

  .pivoted-table .total-column {
    min-width: 120px;
    width: 120px;
  }
}

@media (max-width: 768px) {
  .table-container {
    border-radius: 0.5rem;
    border-left: none;
    border-right: none;
  }

  .data-table {
    font-size: 0.75rem;
    min-width: 700px;
  }

  .data-table th,
  .data-table td {
    padding: 0.5rem 0.625rem;
  }

  .data-table thead th {
    font-size: 0.7rem;
  }

  .pivoted-table .shift-column {
    min-width: 100px;
    width: 100px;
  }

  .pivoted-table .data-column {
    min-width: 90px;
  }

  .pivoted-table .total-column {
    min-width: 100px;
    width: 130px;
  }

  .total-cell {
    font-size: 0.8125rem;
  }

  .footer-row td {
    padding: 0.75rem;
  }

  .footer-total {
    font-size: 0.875rem;
  }

  .view-toggle,
  .metric-switch {
    width: 100%;
  }

  .toggle-btn,
  .metric-btn {
    flex: 1;
    justify-content: center;
  }

  .shift-badge {
    font-size: 0.6875rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .data-table {
    font-size: 0.6875rem;
    min-width: 600px;
  }

  .data-table th,
  .data-table td {
    padding: 0.375rem 0.5rem;
  }

  .data-table thead th {
    font-size: 0.625rem;
    letter-spacing: 0.025em;
  }

  .pivoted-table .shift-column {
    min-width: 85px;
    width: 85px;
  }

  .pivoted-table .data-column {
    min-width: 80px;
  }

  .pivoted-table .total-column {
    min-width: 85px;
    width: 85px;
  }

  .total-cell {
    font-size: 0.75rem;
  }

  .footer-total {
    font-size: 0.75rem;
  }

  .shift-badge {
    font-size: 0.5625rem;
    padding: 0.1875rem 0.375rem;
    text-align: center;
  }

  .shift-cell {
    gap: 0.375rem;
  }

  .footer-row td {
    padding: 0.625rem 0.375rem;
  }

  .footer-label {
    font-size: 0.6875rem;
  }
}
</style>