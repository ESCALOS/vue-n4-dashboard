<template>
    <div class="p-6 max-w-350 my-0 mx-auto w-full md:p-4">
        <HeaderSection @show-add-vessel-form="show_add_vessel_form" />
    </div>
</template>

<script setup lang="ts">
import HeaderSection from '../../components/monitoring/HeaderSection.vue';

const show_add_vessel_form = () => {
    console.log('Mostrar formulario para agregar nave');
}

</script>

<style scoped>

</style>