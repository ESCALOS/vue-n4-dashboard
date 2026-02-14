<template>
  <dialog 
    ref="dialogRef"
    class="add-vessel-dialog"
    @close="handleClose"
  >
    <h2 class="dialog-title">
      Agregar Nave al Monitoreo
    </h2>
    
    <div class="dialog-grid">
      <div class="form-group">
        <label 
          for="manifestId" 
          class="form-label"
        >
          Número de Manifiesto:
        </label>
        <input
          id="manifestId"
          v-model="manifestId"
          type="text"
          placeholder="Ej: 2026-10"
          class="form-input"
          @keyup.enter="handleSubmit"
          :disabled="loading"
        />
      </div>
      
      <div class="form-group">
        <label 
          for="tipoOperacion" 
          class="form-label"
        >
          Tipo de Operación:
        </label>
        <select 
          id="tipoOperacion" 
          v-model="operationType"
          class="form-select"
          :disabled="loading"
        >
          <option value="DISPATCHING">📦 Despacho</option>
          <option value="INDIRECT_LOADING">🚢 Embarque Indirecto</option>
          <option value="STOCKPILING">📥 Acopio</option>
          <option value="DIRECT_LOADING">🚢 Embarque Directo</option>
        </select>
      </div>
    </div>
    
    <div class="actions">
      <button
        class="btn btn-secondary"
        @click="close"
        :disabled="loading"
      >
        Cancelar
      </button>
      <button
        class="btn btn-success"
        @click="handleSubmit"
        :disabled="loading || !manifestId.trim()"
      >
        {{ loading ? "Cargando..." : "Agregar" }}
      </button>
    </div>
    
    <p 
      v-if="error" 
      class="error-message"
    >
      {{ error }}
    </p>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { OperationType } from '../../types/monitoring/OperationType';
import type { VesselsRequest } from '../../interfaces/monitoring/api/VesselResquest';

const emit = defineEmits<{
  submit: [vessel: VesselsRequest];
  cancel: [];
}>();

defineProps<{
  loading?: boolean;
  error?: string;
}>();

const dialogRef = ref<HTMLDialogElement>();
const manifestId = ref('');
const operationType = ref<OperationType>('DISPATCHING');

const open = () => {
  dialogRef.value?.showModal();
};

const close = () => {
  dialogRef.value?.close();
};

const handleClose = () => {
  manifestId.value = '';
  operationType.value = 'DISPATCHING';
  emit('cancel');
};

const handleSubmit = () => {
  if (!manifestId.value.trim()) return;
  emit('submit', {
    manifest_id: manifestId.value.trim(),
    operation_type: operationType.value
  });
  close();
};

defineExpose({
  open,
  close
});
</script>

<style scoped>
.add-vessel-dialog {
  background: #1a1a2e;
  border: 2px solid #3b82f6;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 42rem;
  width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  animation: slide-down 0.2s ease-out;
}

dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: inherit;
}

.dialog-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #e2e8f0;
  font-size: 1.5rem;
  font-weight: 600;
}

.dialog-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #94a3b8;
  font-size: 0.875rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #2d2d44;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: #0f0f1a;
  color: #e2e8f0;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.form-input::placeholder {
  color: #475569;
}

.form-select {
  cursor: pointer;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.form-input:disabled,
.form-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  animation: fade-in 0.2s ease-out;
}

@media (min-width: 768px) {
  .dialog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-50% - 12px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style>