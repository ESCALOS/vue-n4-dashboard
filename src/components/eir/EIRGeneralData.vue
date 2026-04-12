<script setup lang="ts">
import type { EIRData } from '../../types/monitoring/Eir';

import SectionHeader from './SectionHeader.vue'

defineProps<{ data: EIRData }>()
</script>

<template>
  <SectionHeader label="DATOS GENERALES / GENERAL DATA" />

  <div class="grid-row cols-3 no-top">
    <div class="item">
      <div class="label">5. Contenedor / Container</div>
      <div class="value value-primary">{{ data.container }}</div>
    </div>

    <div class="item">
      <div class="label">6. ISO / ISO</div>
      <div class="value">{{ data.iso }}</div>
    </div>

    <div class="item">
      <div class="label">7. Tipo / Kind</div>
      <div class="value">{{ data.kind }}</div>
    </div>
  </div>

  <div class="grid-row cols-5 no-top">
    <div class="item"><div class="label">8. Tara / Tare</div><div class="value">{{ data.tare }}</div></div>
    <div class="item"><div class="label">9. Peso Neto Máximo / Maximum net</div><div class="value">{{ data.maxNet }}</div></div>
    <div class="item"><div class="label">10. Peso Bruto Máximo / Maximum gross</div><div class="value">{{ data.maxGross }}</div></div>
    <div class="item"><div class="label">11. Estado / State</div><div class="value">{{ data.state }}</div></div>
    <div class="item"><div class="label">12. Resultado / OutCome</div><div class="value">{{ data.outcome }}</div></div>
  </div>

  <div class="grid-row cols-4 no-top">
    <div class="item"><div class="label">13. Clasificación / Classification</div><div class="value centered">{{ data.classification }}</div></div>
    <div class="item"><div class="label">14. Mes/Año Fabricación / Month/Year Manufacturing</div><div class="value centered">{{ data.manufacturing }}</div></div>
    <div class="item"><div class="label">15. Condición / Condition</div><div class="value centered">{{ data.condition }}</div></div>
    <div class="item"><div class="label">16. Precintos / Precincts</div><div class="value centered">{{ data.precincts }}</div></div>
  </div>

  <SectionHeader label="DATOS BOOKING / BOOKING DATA" />

  <div class="grid-row cols-5 no-top">
    <div class="item"><div class="label">17. Reserva / Booking</div><div class="value">{{ data.booking }}</div></div>
    <div class="item"><div class="label">18. Cliente / Client</div><div class="value">{{ data.shippingLine }}</div></div>
    <div class="item"><div class="label">19. Placa / Licence Plate</div><div class="value">{{ data.licencePlate }}</div></div>
    <div class="item"><div class="label">20. Apellidos y Nombres / Full Name</div><div class="value">{{ data.fullName }}</div></div>
    <div class="item"><div class="label">21. Mercadería</div><div class="value">{{ data.merchandise }}</div></div>
  </div>

  <SectionHeader label="REFRIGERADO / REEFER" />

  <div class="grid-row cols-4 no-top">
    <div class="item"><div class="label">22. Humedad / Humidity</div><div class="value">{{ data.humidity }}</div></div>
    <div class="item"><div class="label">23. Ventilación / Ventilation</div><div class="value">{{ data.ventilation }}</div></div>
    <div class="item"><div class="label">24. Tecnología / Technology</div><div class="value">{{ data.technology }}</div></div>
    <div class="item"><div class="label">25. Temperatura Booking</div><div class="value">{{ data.tempBooking }}</div></div>
  </div>

  <div class="grid-row cols-4 no-top">
    <div class="item span-2"><div class="label">26. Temperatura Ajuste / Temperature Adjustment</div><div class="value">{{ data.tempAdjust }}</div></div>
    <div class="item"><div class="label">27. Temperatura Carga / Temperature Load</div><div class="value">{{ data.tempLoad }}</div></div>
    <div class="item split-gases">
      <div class="gas">
        <div class="label">28. O2 / O2</div>
        <div class="value">{{ data.o2 }}</div>
      </div>
      <div class="gas">
        <div class="label">29. CO2 / CO2</div>
        <div class="value">{{ data.co2 }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-row {
  display: grid;
  border: 1px solid #94a3b8;
}

.item {
  border-right: 1px solid #94a3b8;
  padding: 4px 8px;
}

.item:last-child {
  border-right: 0;
}

.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }

.no-top {
  border-top: 0;
}

.span-2 {
  grid-column: span 2;
}

.label {
  font-size: 8px;
  color: #4b5563;
}

.value {
  margin-top: 2px;
  font-size: 10px;
  min-height: 12px;
}

.value-primary {
  font-weight: 700;
}

.centered {
  text-align: center;
}

.split-gases {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0;
}

.gas {
  padding: 4px 8px;
}

.gas:first-child {
  border-right: 1px solid #94a3b8;
}
</style>