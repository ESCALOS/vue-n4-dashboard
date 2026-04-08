<template>
  <dialog ref="dialogRef" class="not-arrived-dialog" @close="emit('close')">
    <div class="dialog-header">
      <h3 class="dialog-title">Contenedores que faltan llegar</h3>
      <button type="button" class="icon-close" @click="close">✕</button>
    </div>

    <p class="dialog-subtitle">
      Nave: <strong>{{ vesselName || '-' }}</strong>
      <span class="separator">•</span>
      Manifiesto: <strong>{{ manifestId || '-' }}</strong>
    </p>

    <div class="dialog-actions">
      <button class="btn btn-secondary" :disabled="loading || items.length === 0" @click="emit('export')">
        Descargar Excel
      </button>
      <button class="btn btn-ghost" @click="close">Cerrar</button>
    </div>

    <p v-if="loading" class="feedback">Cargando datos...</p>
    <p v-else-if="error" class="feedback feedback-error">{{ error }}</p>
    <p v-else-if="items.length === 0" class="feedback">No hay contenedores faltantes para este manifiesto.</p>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Contenedor</th>
            <th>Booking</th>
            <th>Operador</th>
            <th>POD</th>
            <th>Shipper</th>
            <th>Tec.</th>
            <th>Producto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="`${item.container_number}-${item.order_gkey ?? 'none'}`">
            <td>{{ item.container_number }}</td>
            <td>{{ item.booking }}</td>
            <td>{{ item.operator }}</td>
            <td>{{ item.pod }}</td>
            <td>{{ item.shipper_name }}</td>
            <td>{{ item.technology }}</td>
            <td>{{ item.commodity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { NotArrivedContainerItem } from '../../../interfaces/monitoring/ContainerMonitoring';

defineProps<{
  items: NotArrivedContainerItem[];
  loading: boolean;
  error: string;
  vesselName?: string;
  manifestId?: string;
}>();

const emit = defineEmits<{
  close: [];
  export: [];
}>();

const dialogRef = ref<HTMLDialogElement>();

const open = () => {
  if (!dialogRef.value?.open) {
    dialogRef.value?.showModal();
  }
};

const close = () => {
  dialogRef.value?.close();
};

defineExpose({
  open,
  close,
});
</script>

<style scoped>
.not-arrived-dialog {
  background: #111827;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  color: #e2e8f0;
  width: min(90vw, 72rem);
  max-height: 85vh;
  padding: 1rem;
}

.not-arrived-dialog::backdrop {
  background: rgba(2, 6, 23, 0.75);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.dialog-title {
  margin: 0;
  font-size: 1.125rem;
}

.icon-close {
  border: none;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 1.25rem;
}

.dialog-subtitle {
  margin: 0.5rem 0 0.75rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.separator {
  margin: 0 0.375rem;
}

.dialog-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.btn {
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.875rem;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary {
  background: #0284c7;
  color: #fff;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost {
  background: #1e293b;
  color: #e2e8f0;
}

.feedback {
  margin: 0.5rem 0 0.75rem;
  color: #94a3b8;
}

.feedback-error {
  color: #fca5a5;
}

.table-wrapper {
  overflow: auto;
  border: 1px solid #334155;
  border-radius: 0.5rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 62rem;
}

.data-table th,
.data-table td {
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid #1f2937;
  text-align: left;
  font-size: 0.8125rem;
}

.data-table th {
  position: sticky;
  top: 0;
  background: #0f172a;
  color: #cbd5e1;
  z-index: 1;
}

.data-table tbody tr:nth-child(even) {
  background: rgba(30, 41, 59, 0.35);
}
</style>
