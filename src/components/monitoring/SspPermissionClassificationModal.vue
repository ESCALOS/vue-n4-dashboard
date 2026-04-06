<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Clasificar permisos SSP</h2>
            <p class="modal-subtitle">
              Define cuáles permisos son internos o externos para {{ vesselData.manifest.name }}.
            </p>
          </div>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>

        <div v-if="error" class="modal-error">{{ error }}</div>

        <div v-if="sspPermissions.length === 0" class="modal-empty">
          No hay permisos SSP disponibles para clasificar.
        </div>

        <div v-else class="permissions-list">
          <div v-for="item in formItems" :key="item.bl_item_gkey" class="permission-row">
            <div class="permission-main">
              <strong>{{ item.permission_nbr }}</strong>
              <span v-if="item.commodity" class="permission-commodity">{{ item.commodity }}</span>
            </div>

            <div class="permission-actions">
              <button
                :class="['scope-btn', { active: item.permission_scope === 'INTERNAL' }]"
                @click="setScope(item.bl_item_gkey, 'INTERNAL')"
                :disabled="isSaving"
              >
                Interno
              </button>
              <button
                :class="['scope-btn', { active: item.permission_scope === 'EXTERNAL' }]"
                @click="setScope(item.bl_item_gkey, 'EXTERNAL')"
                :disabled="isSaving"
              >
                Externo
              </button>
              <button
                class="scope-btn scope-btn-clear"
                @click="setScope(item.bl_item_gkey, null)"
                :disabled="isSaving"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="$emit('close')" :disabled="isSaving">
            Cancelar
          </button>
          <button class="btn btn-primary" @click="handleSave" :disabled="isSaving || sspPermissions.length === 0">
            <span v-if="isSaving">Guardando...</span>
            <span v-else>Guardar clasificación</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import {
  saveSspPermissionClassifications,
  type SspPermissionClassificationItem,
  type SspPermissionScope,
} from '../../services/monitoringService';

const props = defineProps<{
  vesselData: VesselData;
}>();

const emit = defineEmits<{
  close: [];
  saved: [items: SspPermissionClassificationItem[]];
}>();

type FormItem = SspPermissionClassificationItem & {
  commodity?: string;
};

const isSaving = ref(false);
const error = ref('');
const formItems = ref<FormItem[]>([]);

const sspPermissions = computed(() =>
  props.vesselData.summary.services
    .filter((item) => item.is_ssp_permission)
    .map((item) => ({
      bl_item_gkey: item.id,
      permission_nbr: item.nbr,
      permission_scope: item.permission_scope ?? null,
      commodity: item.commodity,
    })),
);

watch(
  sspPermissions,
  (items) => {
    formItems.value = items.map((item) => ({ ...item }));
    error.value = '';
  },
  { immediate: true },
);

function setScope(blItemGkey: number, scope: SspPermissionScope | null) {
  formItems.value = formItems.value.map((item) =>
    item.bl_item_gkey === blItemGkey
      ? { ...item, permission_scope: scope }
      : item,
  );
}

async function handleSave() {
  error.value = '';
  isSaving.value = true;

  try {
    const savedItems = await saveSspPermissionClassifications(
      {
        manifest_id: props.vesselData.manifest.id,
        operation_type: props.vesselData.operation_type,
      },
      formItems.value.map((item) => ({
        bl_item_gkey: item.bl_item_gkey,
        permission_nbr: item.permission_nbr,
        permission_scope: item.permission_scope,
      })),
    );

    emit('saved', savedItems);
  } catch (e: any) {
    error.value = e.message || 'No se pudo guardar la clasificación SSP';
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.74);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 60;
}

.modal-card {
  width: min(100%, 52rem);
  max-height: 90vh;
  overflow: auto;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.45);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.2rem;
}

.modal-subtitle {
  margin: 0.35rem 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.modal-close {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.25rem;
}

.modal-error,
.modal-empty {
  margin-bottom: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
}

.modal-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.32);
  color: #fca5a5;
}

.modal-empty {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #bfdbfe;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.permission-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 0.85rem;
}

.permission-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: #e2e8f0;
}

.permission-commodity {
  color: #94a3b8;
  font-size: 0.85rem;
}

.permission-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.scope-btn {
  border: 1px solid #334155;
  background: #0f172a;
  color: #cbd5e1;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.scope-btn:hover:not(:disabled) {
  border-color: #60a5fa;
  color: #eff6ff;
}

.scope-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

.scope-btn-clear {
  color: #fca5a5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  border: none;
  border-radius: 0.65rem;
  padding: 0.75rem 1.15rem;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary {
  background: #1f2937;
  color: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
}

.btn:disabled,
.scope-btn:disabled,
.modal-close:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .permission-row {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>