<script setup lang="ts">
import type { EIRData } from '../../types/monitoring/Eir';


import EIRHeader from './EIRHeader.vue'
import EIRGeneralData from './EIRGeneralData.vue'
import EIRObservations from './EIRObservations.vue'
import EIRDamages from './EIRDamages.vue'

defineProps<{
  data: EIRData
  logoUrl: string
}>()
</script>

<template>
  <div class="eir-page">
    <EIRHeader :data="data" :logo-url="logoUrl" />

    <EIRGeneralData :data="data" />

    <EIRObservations :data="data" />

    <EIRDamages :data="data" />
  </div>
</template>

<style scoped>
.eir-page {
  width: 210mm;
  min-height: 297mm;
  margin: auto;
  padding: 6mm;
  background: white;
  font-size: 10px;
  color: #111;
}

/* PRINT */
@media print {
  .eir-page {
    width: 100%;
    min-height: auto;
    padding: 4mm;
  }
}
</style>