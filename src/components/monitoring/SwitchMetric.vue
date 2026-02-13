<template>
    <div class="metric-switch">
      <button
        :class="['metric-btn', { active: viewMode === 'weight' }]"
        @click="$emit('update:viewMode', 'weight')"
      >
        ⚖️ Peso (kg)
      </button>
      <button
        :class="['metric-btn', { active: viewMode === 'goods' }]"
        @click="$emit('update:viewMode', 'goods')"
      >
        📦 Bultos
      </button>
    </div>
</template>

<script setup lang="ts">
    defineProps<{
        viewMode: 'weight' | 'goods'
    }>();

    defineEmits<{
        'update:viewMode': [mode: 'weight' | 'goods']
    }>();
</script>