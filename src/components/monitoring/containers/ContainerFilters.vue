<template>
  <div class="filters-bar">
    <div class="form-group">
      <label class="form-label">Bay</label>
      <select
        :value="bayFilter"
        class="form-select"
        @change="$emit('update:bayFilter', parseSelect($event))"
      >
        <option value="">Todos</option>
        <option v-for="bay in availableBays" :key="bay" :value="bay">
          Bay {{ formatBay(bay) }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Estado</label>
      <select
        :value="statusFilter"
        class="form-select"
        @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Todos</option>
        <option value="TO_DISCHARGE">Por Descargar</option>
        <option value="DISCHARGED">Descargado</option>
        <option value="NOT_ARRIVED">Falta Llegar</option>
        <option value="TO_LOAD">Por Embarcar</option>
        <option value="LOADED">Embarcado</option>
        <option value="RESTOW_PENDING">Reestiba Pend.</option>
        <option value="RESTOW_ON_YARD">En Muelle</option>
        <option value="RESTOW_COMPLETED">Reestiba Comp.</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">ISO</label>
      <select
        :value="isoFilter"
        class="form-select"
        @change="$emit('update:isoFilter', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Todos</option>
        <option v-for="iso in availableIsos" :key="iso" :value="iso">{{ iso }}</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Tamaño</label>
      <select
        :value="sizeFilter"
        class="form-select"
        @change="$emit('update:sizeFilter', parseSelect($event))"
      >
        <option value="">Todos</option>
        <option v-for="s in availableSizes" :key="s" :value="s">{{ s }}'</option>
      </select>
    </div>

    <div class="form-group form-group--action">
      <button class="btn btn-secondary" @click="$emit('clear-filters')">Limpiar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  bayFilter: number | null;
  statusFilter: string;
  isoFilter: string;
  sizeFilter: number | null;
  availableBays: number[];
  availableIsos: string[];
  availableSizes: number[];
}>();

defineEmits<{
  'update:bayFilter': [value: number | null];
  'update:statusFilter': [value: string];
  'update:isoFilter': [value: string];
  'update:sizeFilter': [value: number | null];
  'clear-filters': [];
}>();

const formatBay = (bay: number): string => String(bay).padStart(2, '0');

const parseSelect = (event: Event): number | null => {
  const val = (event.target as HTMLSelectElement).value;
  return val === '' ? null : Number(val);
};
</script>

<style scoped>
.filters-bar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  align-items: end;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.form-group--action {
  display: flex;
  align-items: flex-end;
}

.form-label {
  margin-bottom: 0.375rem;
  font-weight: 500;
  color: #94a3b8;
  font-size: 0.8125rem;
}

.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #2d2d44;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  background: #0f0f1a;
  color: #e2e8f0;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
}

.btn-secondary {
  background: #374151;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #4b5563;
}

@media (min-width: 768px) {
  .filters-bar {
    grid-template-columns: repeat(4, 1fr) auto;
  }
}
</style>
