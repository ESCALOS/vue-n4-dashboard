<template>
  <div class="filters-bar">
    <!-- Search -->
    <div class="filter-search">
      <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" :value="searchQuery" @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        placeholder="Buscar cita, contenedor, booking, placa..." class="search-input" />
    </div>

    <!-- Selects -->
    <div class="filter-selects">
      <select :value="filterStage" @change="$emit('update:filterStage', ($event.target as HTMLSelectElement).value)"
        class="filter-select">
        <option value="">Todos los Stages</option>
        <option v-for="opt in stageOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>

      <select :value="filterTipo" @change="$emit('update:filterTipo', ($event.target as HTMLSelectElement).value)"
        class="filter-select">
        <option value="">Todos los Tipos</option>
        <option v-for="opt in tipoOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <select :value="filterLinea" @change="$emit('update:filterLinea', ($event.target as HTMLSelectElement).value)"
        class="filter-select">
        <option value="">Todas las Líneas</option>
        <option v-for="opt in lineaOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <select :value="filterNave" @change="$emit('update:filterNave', ($event.target as HTMLSelectElement).value)"
        class="filter-select">
        <option value="">Todas las Naves</option>
        <option v-for="opt in naveOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <select :value="filterCliente"
        @change="$emit('update:filterCliente', ($event.target as HTMLSelectElement).value)" class="filter-select">
        <option value="">Todos los Clientes</option>
        <option v-for="opt in clienteOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <select :value="filterTecnologia"
        @change="$emit('update:filterTecnologia', ($event.target as HTMLSelectElement).value)" class="filter-select">
        <option value="">Todas las Tecnologías</option>
        <option v-for="opt in tecnologiaOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <select :value="filterProducto"
        @change="$emit('update:filterProducto', ($event.target as HTMLSelectElement).value)" class="filter-select">
        <option value="">Todos los Productos</option>
        <option v-for="opt in productoOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>

    <!-- Clear filters -->
    <button v-if="hasActiveFilters" @click="$emit('clearFilters')" class="btn btn-secondary btn-sm">
      <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Limpiar filtros
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string;
  filterStage: string;
  filterTipo: string;
  filterLinea: string;
  filterNave: string;
  filterCliente: string;
  filterTecnologia: string;
  filterProducto: string;
  hasActiveFilters: boolean;
  stageOptions: { value: string; label: string }[];
  tipoOptions: string[];
  lineaOptions: string[];
  naveOptions: string[];
  clienteOptions: string[];
  tecnologiaOptions: string[];
  productoOptions: string[];
}>();

defineEmits<{
  'update:searchQuery': [value: string];
  'update:filterStage': [value: string];
  'update:filterTipo': [value: string];
  'update:filterLinea': [value: string];
  'update:filterNave': [value: string];
  'update:filterCliente': [value: string];
  'update:filterTecnologia': [value: string];
  'update:filterProducto': [value: string];
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
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  border-color: #3b82f6;
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
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 140px;
}

.filter-select:focus {
  border-color: #3b82f6;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-icon {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
