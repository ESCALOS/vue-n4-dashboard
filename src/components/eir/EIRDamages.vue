<script setup lang="ts">
import type { EIRData } from '../../types/monitoring/Eir';

defineProps<{ data: EIRData }>()
</script>

<template>
  <div class="damages-grid">
    <div class="head">Location</div>
    <div class="head">Damage Type Description</div>
    <div class="head">Component Description</div>
    <div class="head">Repair Method Description</div>
    <div class="head">Responsible Description</div>
    <div class="head">Quantity</div>
    <div class="head">EIR Inspection EIR Nbr</div>
    <div class="head">Length(cm)</div>
    <div class="head">Width(cm)</div>
    <div class="head">Area(cm2)</div>

    <template v-if="data.damages.length === 0">
      <div class="cell">-</div>
      <div class="cell">-</div>
      <div class="cell">-</div>
      <div class="cell">-</div>
      <div class="cell">-</div>
      <div class="cell">-</div>
      <div class="cell">-</div>
      <div class="cell">-</div>
      <div class="cell">-</div>
      <div class="cell">-</div>
    </template>

    <template v-else>
      <template v-for="(row, i) in data.damages" :key="i">
        <div class="cell">{{ row.location || '-' }}</div>
        <div class="cell">{{ row.damageType || '-' }}</div>
        <div class="cell">{{ row.component || '-' }}</div>
        <div class="cell">{{ row.repairMethod || '-' }}</div>
        <div class="cell">{{ row.responsible || '-' }}</div>
        <div class="cell">{{ row.quantity || '-' }}</div>
        <div class="cell">{{ row.eirInspectionNbr || '-' }}</div>
        <div class="cell">{{ row.length || '-' }}</div>
        <div class="cell">{{ row.width || '-' }}</div>
        <div class="cell">{{ row.area || '-' }}</div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.damages-grid {
  display: grid;
  grid-template-columns: 7% 13% 12% 13% 14% 7% 14% 7% 7% 6%;
  border: 1px solid #94a3b8;
  border-top: 0;
  font-size: 7px;
}

.head,
.cell {
  border-right: 1px solid #94a3b8;
  padding: 3px 4px;
  text-align: center;
  min-height: 20px;
}

.head {
  border-bottom: 1px solid #94a3b8;
}

.head:nth-child(10n),
.cell:nth-child(10n) {
  border-right: 0;
}

.head {
  font-weight: 700;
  background: #f9fafb;
}
</style>