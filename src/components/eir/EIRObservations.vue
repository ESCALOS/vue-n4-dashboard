<script setup lang="ts">
import type { EIRData } from '../../types/monitoring/Eir';

defineProps<{ data: EIRData }>()

const upperLocations = ['Door', 'Front', 'Left Side', 'Right Side']
const lowerLocations = ['Top(Roof)', 'Inner', 'Understructure']
</script>

<template>
  <div class="observations-grid-top">
    <div
      v-for="loc in upperLocations"
      :key="loc"
      class="panel"
    >
      <div class="panel-title">{{ loc }}</div>

      <div class="obs-list">
        <div
          v-for="(obs, i) in data.locationObservations.filter((o) => o.location === loc)"
          :key="i"
        >
          <div v-for="(item, j) in obs.observations" :key="j">
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="observations-grid-bottom">
    <div
      v-for="loc in lowerLocations"
      :key="loc"
      class="panel"
    >
      <div class="panel-title">{{ loc }}</div>

      <div class="obs-list">
        <div
          v-for="(obs, i) in data.locationObservations.filter((o) => o.location === loc)"
          :key="i"
        >
          <div v-for="(item, j) in obs.observations" :key="j">
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="observations-full-width observations-panel">
    <div class="obs-title">OBSERVACIONES / OBSERVATIONS</div>
    {{ data.generalObservations }}
  </div>

  <div class="signature-grid">
    <div class="signature-cell">
      <div class="sig-label">REVEIVE / DISPATCHERS</div>
      <div class="sig-line">{{ data.technicianName }}</div>
    </div>

    <div class="signature-cell">
      <div class="sig-label sig-center">CONFORMITY RECEIPT</div>
      <div class="sig-box"></div>
    </div>
  </div>
</template>

<style scoped>
.observations-grid-top {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid #9ca3af;
  border-top: 0;
  margin-top: 0;
}

.observations-grid-bottom {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid #9ca3af;
  border-top: 0;
  margin-top: 0;
}

.panel {
  border-right: 1px solid #9ca3af;
  min-height: 120px;
}

.observations-grid-top .panel:nth-child(4n) {
  border-right: 0;
}

.observations-grid-bottom .panel:nth-child(3n) {
  border-right: 0;
}

.panel-title {
  font-size: 8px;
  text-align: center;
  padding: 2px;
  border-bottom: 1px solid #9ca3af;
}

.obs-list {
  font-size: 7px;
  line-height: 1.2;
  padding: 4px;
}

.observations-full-width {
  border: 1px solid #9ca3af;
  border-top: 0;
  min-height: 80px;
}

.observations-panel {
  padding: 4px 8px;
}

.obs-title {
  font-size: 9px;
  font-weight: 700;
  margin-bottom: 4px;
}

.obs-box {
  border: 1px solid #9ca3af;
  min-height: 90px;
  padding: 4px;
  font-size: 7px;
  line-height: 1.2;
}

.signature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid #94a3b8;
  border-top: 0;
}

.signature-cell {
  padding: 4px;
  min-height: 58px;
  border-right: 1px solid #94a3b8;
}

.sig-label {
  font-size: 8px;
  color: #374151;
}

.sig-center {
  text-align: center;
}

.signature-cell:last-child {
  border-right: 0;
}

.sig-line {
  font-size: 9px;
  margin-top: 11px;
}
</style>