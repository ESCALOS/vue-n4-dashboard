<template>
  <dialog 
    ref="dialogRef"
    class="bg-[#1a1a2e] border-2 border-blue-500 rounded-xl p-8 max-w-2xl w-[90%] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm open:animate-slide-down"
    @close="handleClose"
  >
    <h2 class="mt-0 mb-6 text-slate-200 text-2xl font-semibold">
      Agregar Nave al Monitoreo
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="flex flex-col">
        <label 
          for="manifestId" 
          class="mb-2 font-medium text-slate-400 text-sm"
        >
          Número de Manifiesto:
        </label>
        <input
          id="manifestId"
          v-model="manifestId"
          type="text"
          placeholder="Ej: 2026-10"
          class="w-full px-3.5 py-2.5 border border-[#2d2d44] rounded-lg text-sm bg-[#0f0f1a] text-slate-200 transition-all duration-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          @keyup.enter="handleSubmit"
          :disabled="loading"
        />
      </div>
      
      <div class="flex flex-col">
        <label 
          for="tipoOperacion" 
          class="mb-2 font-medium text-slate-400 text-sm"
        >
          Tipo de Operación:
        </label>
        <select 
          id="tipoOperacion" 
          v-model="operationType"
          class="w-full px-3.5 py-2.5 border border-[#2d2d44] rounded-lg text-sm bg-[#0f0f1a] text-slate-200 transition-all duration-200 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          <option value="DESPACHO">📦 Despacho</option>
          <option value="EMBARQUE_INDIRECTO">🚢 Embarque Indirecto</option>
          <option value="ACOPIO">📥 Acopio</option>
          <option value="EMBARQUE_DIRECTO">🚢 Embarque Directo</option>
        </select>
      </div>
    </div>
    
    <div class="flex justify-end gap-3 mt-6">
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
      class="text-red-500 mt-4 text-sm px-3 py-3 bg-red-500/10 border border-red-500/30 rounded-lg"
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
const operationType = ref<OperationType>('DESPACHO');

const open = () => {
  dialogRef.value?.showModal();
};

const close = () => {
  dialogRef.value?.close();
};

const handleClose = () => {
  manifestId.value = '';
  operationType.value = 'DESPACHO';
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
dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: inherit;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>