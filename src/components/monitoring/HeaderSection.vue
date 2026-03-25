<template>
    <div class="header-section">
        <div class="header-title">
            <h1 class="system-name">
                A.M.A.G.I.
            </h1>
            <p class="system-description">Aplicación de Monitoreo de Actividades de Gestión Integral</p>
        </div>

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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.system-name {
    font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem);
    font-weight: 800;
    letter-spacing: 0.15em;
    line-height: 1.1;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.3));
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(0.5rem, 2vw, 1rem);
}

.system-name img {
    height: clamp(2.5rem, 5vw + 1rem, 4.5rem);
    width: auto;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.system-description {
    font-size: clamp(0.75rem, 1.5vw + 0.5rem, 1rem);
    font-weight: 300;
    color: #e2e8f0;
    margin: 0;
    line-height: 1.5;
    letter-spacing: 0.02em;
    opacity: 0.9;
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
    }

    .system-name {
        justify-content: flex-start;
    }

    .header-action-wrapper {
        width: auto;
    }

    .header-add-button {
        width: auto;
        justify-content: flex-start;
    }
}
</style>