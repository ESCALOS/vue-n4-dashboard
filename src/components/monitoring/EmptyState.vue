<template>
    <div class="text-center py-16 px-6 bg-gray-800 border border-gray-700 rounded-lg">
        <div class="text-5xl md:text-6xl mb-4 opacity-60 ">🚢</div>
        <h2 class="text-gray-200 mb-2 text-xl md:text-2xl">No hay naves monitoreadas</h2>
        <p class="mb-6 text-sm md:text-lg text-gray-300">Haz clic en "Agregar Nave" para comenzar a monitorear carga general</p>
        <button class="btn btn-primary" @click="emit('show-add-vessel-form')">Agregar Nave</button>

    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    'show-add-vessel-form': [];
}>();
</script>
