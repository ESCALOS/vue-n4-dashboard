<template>
    <div class="view-toggle">
      <button
        :class="['toggle-btn', { active: activeTab === 'bodegas' }]"
        @click="$emit('update:activeTab', 'bodegas')"
      >
        📦 Por Bodega
      </button>
      <button
        :class="['toggle-btn', { active: activeTab === 'bls' }]"
        @click="$emit('update:activeTab', 'bls')"
      >
        📋 Por BL
      </button>
    </div>
</template>

<script>

</script>

<style scoped>
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
</style>