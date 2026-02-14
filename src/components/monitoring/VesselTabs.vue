<template>
    <div class="vessel-tabs">
        <div
            v-for="vessel in vessels"
            :key="`${vessel.manifest.id}:${vessel.operation_type}`"
            :class="[
                'vessel-tab-item',
                {
                    'is-active': selectedVessel?.manifest.id === vessel.manifest.id && selectedVessel?.operation_type === vessel.operation_type
                }
            ]"
            @click="$emit('select', { manifest_id: vessel.manifest.id, operation_type: vessel.operation_type })">
          <div class="vessel-tab-info">
            <span class="vessel-tab-name">{{ vessel.manifest.name }}</span>
            <span class="vessel-tab-id">{{ vessel.manifest.id }}</span>
          </div>
          <span :class="[
              'operation-badge',
              getOperationBadgeClass(vessel.operation_type)
          ]">
            {{ getOperationLabel(vessel.operation_type) }}
          </span>
          <button
            class="remove-button"
            @click.stop="$emit('remove', { manifest_id: vessel.manifest.id, operation_type: vessel.operation_type })"
            title="Remover del monitoreo"
          >
            ×
          </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { VesselsResponse } from '../../interfaces/monitoring/api/VesselResponse';
import type { VesselsRequest } from '../../interfaces/monitoring/api/VesselResquest';
import type { OperationType } from '../../types/monitoring/OperationType';
import { getOperationLabel } from '../../utils/monitoring';

defineProps<{
    vessels: VesselsResponse[]
    selectedVessel: VesselsResponse | null
}>();

defineEmits<{
    select: [vessel: VesselsRequest],
    remove: [vessel: VesselsRequest]
}>();

const getOperationBadgeClass = (operationType: OperationType): string => {
  const badges: Record<OperationType, string> = {
    DISPATCHING: 'dispatching-badge',
    INDIRECT_LOADING: 'indirect-loading-badge',
    STOCKPILING: 'stockpiling-badge',
    DIRECT_LOADING: 'direct-loading-badge'
  };

  return badges[operationType] ?? 'badge-default';
};
</script>

<style scoped>
.vessel-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-top: 0.5rem;
}

.vessel-tab-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
  white-space: nowrap;
  position: relative;
  min-width: fit-content;
}

.vessel-tab-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.vessel-tab-item.is-active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.25);
}

.vessel-tab-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.vessel-tab-name {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.vessel-tab-id {
  font-size: 0.75rem;
  color: #94a3b8;
}

.operation-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
}

.dispatching-badge {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}

.indirect-loading-badge {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.stockpiling-badge {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.3);
}

.direct-loading-badge {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
  border-color: rgba(236, 72, 153, 0.3);
}

.badge-default {
  background: rgba(107, 114, 128, 0.15);
  color: #9ca3af;
  border-color: rgba(107, 114, 128, 0.3);
}

.remove-button {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.remove-button:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

@media (max-width: 767px) {
  .vessel-tabs {
    flex-direction: column;
    overflow-x: visible;
  }

  .vessel-tab-item {
    width: 100%;
    flex-wrap: wrap;
  }

  .vessel-tab-info {
    min-width: 0;
  }

  .operation-badge {
    order: 3;
    margin-top: 0.5rem;
    flex-basis: 100%;
  }

  .remove-button {
    order: 2;
  }
}
</style>