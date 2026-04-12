<script setup lang="ts">
import type { EIRData } from '../../types/monitoring/Eir';

defineProps<{
  data: EIRData
  logoUrl: string
}>()
</script>

<template>
    <div class="meta-row">
      <span>{{ data.printDate }} {{ data.printTime }}</span>
      <span class="meta-eir">EIR-{{ data.container }}</span>
      <span />
    </div>

  <div class="header-root">
    <div class="header-grid top-grid" style="border-bottom: 1px solid #94a3b8">
      <div class="cell label-cell">
        <p>1. Línea Naviera / Shipping Line</p>
        <p class="value-cell company-name">{{ data.shippingLine }}</p>
      </div>

      <div class="cell center-cell">
        <div class="title">Equipment Interchange Receipt (EIR)</div>
        <div class="eir-number">{{ data.container }}</div>
        <div class="cell detail-cell">
        <div class="details-grid" style="margin-top: 5px;">
            <span>Inicio / Start:</span><span>{{ data.startDate }}</span>
            <span>Término / Finished:</span><span>{{ data.finishedDate }}</span>
            <span>Técnico / Technician:</span><span>{{ data.technician }}</span>
          </div>
        </div>
      </div>

      <div class="cell logo-cell">
        <img
          :src="logoUrl"
          class="logo"
          alt="Logo TPP"
        />
        <div class="company">TERMINAL PORTUARIO PARACAS S.A.</div>
        <div>Punta Pejerrey Nro S/N Ica Pisco Paracas</div>
      </div>
    </div>

    <div class="header-grid bottom-grid">
      <div class="cell">
        <div class="mini-label">2. Nave / Viaje / Vessel's name</div>
        <div class="mini-value">{{ data.vesselName }} VOYAGE:{{ data.voyage }}</div>
      </div>

      <div class="cell">
        <div class="mini-label">3. Puerto / Port</div>
        <div class="mini-value">TERMINAL PORTUARIO GENERAL SAN MARTÍN - TPGSM</div>
      </div>

      <div class="cell">
        <div class="mini-label">4. Gate</div>
        <div class="mini-value">{{ data.gate }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-root {
  border: 1px solid #94a3b8;
}

.meta-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  font-size: 10px;
  color: #4b5563;
  margin-bottom: 2px;
}

.meta-eir {
  font-weight: 600;
}

.header-grid {
  display: grid;
}

.top-grid {
  grid-template-columns: 30% 40% 30%;
}

.bottom-grid {
  grid-template-columns: 30% 58% 12%;
}

.cell {
  border-right: 1px solid #94a3b8;
  padding: 4px 8px;
  min-height: 34px;
}

.cell:nth-child(3n) {
  border-right: 0;
}

.top-grid .cell:nth-last-child(-n + 3) {
  border-bottom: 0;
}

.bottom-grid .cell {
  min-height: 42px;
}

.bottom-grid .cell:last-child {
  border-right: 0;
}

.label-cell {
  font-size: 9px;
}

.center-cell {
  text-align: center;
}

.title {
  font-size: 10px;
}

.eir-number {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
}

.logo-cell {
  text-align: center;
}

.logo {
  height: 48px;
  object-fit: contain;
}

.company {
  margin-top: 4px;
  font-size: 9px;
  font-weight: 700;
}

.value-cell {
  font-weight: 600;
}

.company-name {
  text-transform: uppercase;
  font-size: 16px;
}

.detail-cell {
  font-size: 9px;
  border-top: 0.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1px 8px;
}

.mini-label {
  font-size: 8px;
  color: #4b5563;
}

.mini-value {
  margin-top: 2px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}
</style>