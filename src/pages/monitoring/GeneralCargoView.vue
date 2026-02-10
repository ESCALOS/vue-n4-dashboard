<template>
    <div class="max-w-350 my-0 mx-auto w-full md:p-4">
        <HeaderSection @show-add-vessel-form="show_add_vessel_form" />
        <EmptyState
            v-if="monitoredVessels.length === 0 && !showAddDialog" @show-add-vessel-form="show_add_vessel_form"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EmptyState from '../../components/monitoring/EmptyState.vue';
import HeaderSection from '../../components/monitoring/HeaderSection.vue';
import type { VesselData } from '../../interfaces/monitoring/VesselData';

const showAddDialog = ref(false);

const show_add_vessel_form = () => {
    console.log('Mostrar formulario para agregar nave');
}

const monitoredVessels: VesselData[] = []; // Aquí se gestionarán las naves monitoreadas

</script>

<style scoped>

</style>