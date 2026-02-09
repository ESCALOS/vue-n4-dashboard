<template>
    <div class="flex flex-row
 justify-between items-center mb-8 gap-4">
        <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-white">🚢 Monitoreo de Naves</h1>
        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer" 
            @click="emit('show-add-vessel-form')">
            <span class="hidden md:inline">Agregar Nave</span>
            <span class="md:hidden">+</span>
        </button>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    'show-add-vessel-form': [];
}>();
</script>