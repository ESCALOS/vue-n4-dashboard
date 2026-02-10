<template>
    <div class="vessels-tabs">
        <div
            v-for="vessel in vessels"
            :key="`${vessel.manifest.id}:${vessel.operation_type}`"
            :class="[
                'vessel-tab',
                {
          active:
            selectedVessel?.manifest.id === vessel.manifest.id && selectedVessel?.operation_type === vessel.operation_type
        },
      ]"
            @click="$emit('select', vessel)">

        </div>
    </div>
</template>

<script setup lang="ts">
import type { VesselsResponse } from '../../interfaces/monitoring/responses/VesselResponse';


defineProps<{
    vessels: VesselsResponse[]
    selectedVessel: VesselsResponse | null
}>();

defineEmits<{
    select: [vessel: VesselsResponse],
    remove: [vessel: VesselsResponse]
}>();
</script>

<style scoped>
  .vessel-tabs {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .vessel-tab {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    background: #1a1a2e;
    border: 2px solid #2d2d44;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    position: relative;
    min-width: fit-content;
  }

  .vessel-tab:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
  }

  .vessel-tab.active {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }

  .vessel-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .vessel-name {
    font-weight: 600;
    color: #e2e8f0;
    font-size: 0.9375rem;
  }

  .vessel-manifest {
    font-size: 0.8125rem;
    color: #94a3b8;
  }

  .operation-badge {
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .badge-despacho {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .badge-embarque_indirecto {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .badge-descarga {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .badge-acopio {
    background: rgba(139, 92, 246, 0.15);
    color: #8b5cf6;
    border: 1px solid rgba(139, 92, 246, 0.3);
  }

  .badge-embarque_directo {
    background: rgba(236, 72, 153, 0.15);
    color: #ec4899;
    border: 1px solid rgba(236, 72, 153, 0.3);
  }

  .btn-remove {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.375rem;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-remove:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .vessel-tabs {
      flex-direction: column;
      overflow-x: visible;
    }

    .vessel-tab {
      width: 100%;
      flex-wrap: wrap;
      padding: 0.75rem 1rem;
    }

    .vessel-info {
      flex: 1;
      min-width: 0;
    }

    .operation-badge {
      order: 3;
      margin-top: 0.5rem;
      flex-basis: 100%;
    }

    .btn-remove {
      order: 2;
    }
  }
</style>