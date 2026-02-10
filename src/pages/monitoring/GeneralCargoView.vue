<template>
    <div class="max-w-350 my-0 mx-auto w-full md:p-4">
        <HeaderSection @show-add-vessel-form="addVesselFormRef?.open()" />
        
        <!-- Formulario modal con dialog -->
        <AddVesselForm
            ref="addVesselFormRef"
            :loading="loading"
            :error="error"
            @submit="handleAddVessel"
        />

        <EmptyState
            v-if="monitoredVessels.length === 0"
            @show-add-vessel-form="addVesselFormRef?.open()"
        />
        <VesselTabs
            v-if="monitoredVessels.length > 0"
            :vessels="monitoredVessels"
            :selected-vessel="selectedVessel"
            @select="selectVessel"
            @remove="handleRemoveVessel"
        />

        <VesselDetail
            v-if="selectedVesselData"
            :vessel-data="selectedVesselData"
            :is-connected="true"
            :loading="loading"
        />

    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import EmptyState from '../../components/monitoring/EmptyState.vue';
import HeaderSection from '../../components/monitoring/HeaderSection.vue';
import VesselTabs from '../../components/monitoring/VesselTabs.vue';
import type { VesselsRequest } from '../../interfaces/monitoring/api/VesselResquest';
import { useMonitoringDataMock } from '../../composables/monitoring/useMonitoringDataMock';
import VesselDetail from '../../components/monitoring/VesselDetail.vue';
import AddVesselForm from '../../components/monitoring/AddVesselForm.vue';

const addVesselFormRef = ref<InstanceType<typeof AddVesselForm>>();

const {
  monitoredVessels,
  selectedVessel,
  selectedVesselData,
  loading,
  error,
  loadMonitoredVessels,
  selectVessel,
  addVessel,
  removeVessel

} = useMonitoringDataMock();

const handleAddVessel = async (vessel: VesselsRequest) => {
  await addVessel(vessel);
};

const handleRemoveVessel = async (vessel: VesselsRequest) => {
  if (confirm('¿Está seguro de remover esta nave del monitoreo?')) {
    await removeVessel(vessel);
  }
};

onMounted(() => {
    loadMonitoredVessels();
});

</script>