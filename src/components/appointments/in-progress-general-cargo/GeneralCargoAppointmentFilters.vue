<template>
  <div class="filters-bar">
    <div class="filter-search">
      <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        placeholder="Buscar permiso, tracto, chassis, cliente..."
        class="search-input"
      />
    </div>

    <div class="filter-selects">
      <select :value="filterStage" @change="$emit('update:filterStage', ($event.target as HTMLSelectElement).value)" class="filter-select">
        <option value="">Todos los stages</option>
        <option v-for="opt in stageOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>

      <select :value="filterTipoOperativa" @change="$emit('update:filterTipoOperativa', ($event.target as HTMLSelectElement).value)" class="filter-select">
        <option value="">Todas las operativas</option>
        <option v-for="opt in tipoOperativaOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <select :value="filterCliente" @change="$emit('update:filterCliente', ($event.target as HTMLSelectElement).value)" class="filter-select">
        <option value="">Todos los clientes</option>
        <option v-for="opt in clienteOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <select :value="filterProducto" @change="$emit('update:filterProducto', ($event.target as HTMLSelectElement).value)" class="filter-select">
        <option value="">Todos los productos</option>
        <option v-for="opt in productoOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <select :value="filterNave" @change="$emit('update:filterNave', ($event.target as HTMLSelectElement).value)" class="filter-select">
        <option value="">Todas las naves</option>
        <option v-for="opt in naveOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>

    <button v-if="hasActiveFilters" @click="$emit('clearFilters')" class="btn btn-secondary btn-sm">
      Limpiar filtros
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string;
  filterStage: string;
  filterTipoOperativa: string;
  filterCliente: string;
  filterProducto: string;
  filterNave: string;
  hasActiveFilters: boolean;
  stageOptions: { value: string; label: string }[];
  tipoOperativaOptions: string[];
  clienteOptions: string[];
  productoOptions: string[];
  naveOptions: string[];
}>();

defineEmits<{
  'update:searchQuery': [value: string];
  'update:filterStage': [value: string];
  'update:filterTipoOperativa': [value: string];
  'update:filterCliente': [value: string];
  'update:filterProducto': [value: string];
  'update:filterNave': [value: string];
  clearFilters: [];
}>();
</script>

<style scoped>
.filters-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter-search {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.1rem;
  height: 1.1rem;
  color: #6b7280;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  outline: none;
}

.filter-selects {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.4rem 0.6rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  color: #e2e8f0;
  font-size: 0.8rem;
  min-width: 150px;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}
</style>
