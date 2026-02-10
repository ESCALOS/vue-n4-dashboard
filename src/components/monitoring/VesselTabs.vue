<template>
    <div class="flex gap-3 mb-6 overflow-x-auto pt-2 max-md:flex-col max-md:overflow-x-visible">
        <div
            v-for="vessel in vessels"
            :key="`${vessel.manifest.id}:${vessel.operation_type}`"
            :class="[
                'flex items-center gap-3 p-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl cursor-pointer transition-all duration-200 whitespace-nowrap relative min-w-fit hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 max-md:w-full max-md:flex-wrap',
                {
                    'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/25': selectedVessel?.manifest.id === vessel.manifest.id && selectedVessel?.operation_type === vessel.operation_type
                }
            ]"
            @click="$emit('select', { manifest_id: vessel.manifest.id, operation_type: vessel.operation_type })">
          <div class="flex flex-col gap-1 flex-1 max-md:min-w-0">
            <span class="font-semibold text-slate-200 text-sm">{{ vessel.manifest.name }}</span>
            <span class="text-xs text-slate-400">{{ vessel.manifest.id }}</span>
          </div>
          <span :class="[
              'px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap max-md:order-3 max-md:mt-2 max-md:flex-basis-full',
              getOperationBadge(vessel.operation_type)
          ]">
            {{ getOperationLabel(vessel.operation_type) }}
          </span>
          <button
            class="bg-red-500/10 text-red-500 border border-red-500/30 rounded-md w-6 h-6 flex items-center justify-center text-lg leading-none cursor-pointer transition-all duration-200 hover:bg-red-500/20 hover:border-red-500 max-md:order-2"
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
import { getOperationBadge, getOperationLabel } from '../../utils/monitoring';

defineProps<{
    vessels: VesselsResponse[]
    selectedVessel: VesselsResponse | null
}>();

defineEmits<{
    select: [vessel: VesselsRequest],
    remove: [vessel: VesselsRequest]
}>();
</script>