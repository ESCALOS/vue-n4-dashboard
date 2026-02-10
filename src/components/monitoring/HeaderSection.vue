<template>
    <div class=" pt-2 md:pt-0 flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 class="text-center md:text-left text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            🚢 Monitoreo de Naves
        </h1>

        <div class="w-full md:w-auto">
            <button
                class="btn btn-primary w-full md:w-auto flex items-center justify-center md:justify-start gap-2"
                @click="emit('show-add-vessel-form')"
                aria-label="Agregar Nave"
            >
                Agregar Nave
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    'show-add-vessel-form': [];
}>();
</script>