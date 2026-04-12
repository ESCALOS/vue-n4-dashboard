<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="section-header">
    <span>
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.section-header {
  background: #f3f4f6;
  border: 1px solid #94a3b8;
  border-top: 0;
  padding: 2px 8px;
}

.section-header span {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}
</style>