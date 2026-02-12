<template>
    <div class="empty-state">
        <div class="empty-state-icon">🚢</div>
        <h2 class="empty-state-title">No hay naves monitoreadas</h2>
        <p class="empty-state-description">Haz clic en "Agregar Nave" para comenzar a monitorear carga general</p>
        <button class="btn btn-primary" @click="emit('show-add-vessel-form')">Agregar Nave</button>

    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    'show-add-vessel-form': [];
}>();
</script>

<style scoped>
.empty-state {
    text-align: center;
    padding: 4rem 1.5rem;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 0.5rem;
}

.empty-state-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.6;
}

.empty-state-title {
    color: #e5e7eb;
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
}

.empty-state-description {
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: #d1d5db;
}

@media (min-width: 768px) {
    .empty-state-icon {
        font-size: 3.75rem;
    }

    .empty-state-title {
        font-size: 1.5rem;
    }

    .empty-state-description {
        font-size: 1.125rem;
    }
}
</style>
