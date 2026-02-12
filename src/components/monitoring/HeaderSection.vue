<template>
    <div class="header-section">
        <h1 class="header-title">
            🚢 Monitoreo de Naves
        </h1>

        <div class="header-action-wrapper">
            <button
                class="btn btn-primary header-add-button"
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

<style scoped>
.header-section {
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.header-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
}

.header-action-wrapper {
    width: 100%;
}

.header-add-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

@media (min-width: 768px) {
    .header-section {
        padding-top: 0;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .header-title {
        text-align: left;
        font-size: 1.875rem;
    }

    .header-action-wrapper {
        width: auto;
    }

    .header-add-button {
        width: auto;
        justify-content: flex-start;
    }
}

@media (min-width: 1024px) {
    .header-title {
        font-size: 2.25rem;
    }
}
</style>