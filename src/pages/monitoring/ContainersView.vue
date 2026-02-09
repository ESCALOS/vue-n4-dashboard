<template>
    <div class="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
        <h2 class="text-2xl font-bold text-gray-100 mb-4">Monitoreo de Contenedores</h2>
        <p class="text-gray-400">Vista para el monitoreo de operaciones de contenedores.</p>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-indigo-950 border border-indigo-900 p-4 rounded-lg">
                <h3 class="text-lg font-semibold text-indigo-300">Total Contenedores</h3>
                <p class="text-3xl font-bold text-indigo-400 mt-2">0</p>
            </div>
            <div class="bg-green-950 border border-green-900 p-4 rounded-lg">
                <h3 class="text-lg font-semibold text-green-300">Descargados</h3>
                <p class="text-3xl font-bold text-green-400 mt-2">0</p>
            </div>
            <div class="bg-orange-950 border border-orange-900 p-4 rounded-lg">
                <h3 class="text-lg font-semibold text-orange-300">Pendientes</h3>
                <p class="text-3xl font-bold text-orange-400 mt-2">0</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>