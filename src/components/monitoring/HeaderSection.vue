<template>
    <div class="flex flex-row justify-between items-center mb-8 gap-4">
        <h1 class="px-4 py-12 md:px-0 md:py-0 text-xl md:text-2xl lg:text-3xl font-bold text-white">🚢 Monitoreo de Naves</h1>
        <button class="btn btn-primary"
            @click="emit('show-add-vessel-form')">
            <span class="hidden md:inline">Agregar Nave</span>
            <span class="md:hidden font-bold text-xl">+</span>
        </button>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    'show-add-vessel-form': [];
}>();
</script>