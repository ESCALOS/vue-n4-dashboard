import { ref } from "vue";
import type { VesselData } from "../../interfaces/monitoring/VesselData";
import { addVesselToMonitor, getVesselMonitorData, refreshVesselData, removeVesselFromMonitor, getMonitoredVesselsLocal } from "../../services/monitoringServiceMock";
import type { VesselsResponse } from "../../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../../interfaces/monitoring/api/VesselResquest";

export function useMonitoringDataMock() {
    const monitoredVessels = ref<VesselsResponse[]>([]);

    const selectedVessel = ref<VesselsResponse | null>(null);

    const selectedVesselData = ref<VesselData | null>(null);
    const loading = ref(false);
    const error = ref('');

    const loadMonitoredVessels = async () => {
        try {
            const response = await getMonitoredVesselsLocal();
            monitoredVessels.value = response;
        } catch (err) {
            error.value = (err as Error).message || 'Error al cargar las naves monitoreadas';
        }
    }

    const selectVessel = async (vesselRequest: VesselsRequest) => {
        try {
            loading.value = true;
            const vessel: VesselsResponse | undefined = monitoredVessels.value.find(
                (v) => v.manifest.id === vesselRequest.manifest_id && v.operation_type === vesselRequest.operation_type
            );
            if (vessel) {
                selectedVessel.value = {
                    manifest: { ...vessel.manifest },
                    operation_type: vessel.operation_type,
                };
                selectedVesselData.value = await getVesselMonitorData(vessel);
            }
        } catch (err) {
            console.error('Error cargando datos de nave:', err);
            error.value = 'Error al cargar datos de nave';
        } finally {
            loading.value = false;
        }
    };

    const addVessel = async (vessel: VesselsRequest) => {
        try {
            loading.value = true;
            error.value = '';
            await addVesselToMonitor(vessel);
            await loadMonitoredVessels();
            await selectVessel(vessel);
            return { success: true };
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Error al agregar nave';
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
        }
    };

    const removeVessel = async (vessel: VesselsRequest) => {
        try {
            await removeVesselFromMonitor(vessel);
            await loadMonitoredVessels();
            if (
                selectedVessel.value?.manifest.id === vessel.manifest_id &&
                selectedVessel.value?.operation_type === vessel.operation_type
            ) {
                selectedVessel.value = null;
                selectedVesselData.value = null;
            }
        } catch (err) {
            console.error('Error removiendo nave:', err);
            error.value = 'Error al remover nave';
        }
    };

    const refreshData = async () => {
        if (!selectedVessel.value) return;

        try {
            loading.value = true;
            selectedVesselData.value = await refreshVesselData(selectedVessel.value);
        } catch (err) {
            console.error('Error refrescando datos:', err);
            error.value = 'Error al refrescar datos';
        } finally {
            loading.value = false;
        }
    };

    return {
        monitoredVessels,
        selectedVessel,
        selectedVesselData,
        loading,
        error,
        loadMonitoredVessels,
        selectVessel,
        addVessel,
        removeVessel,
        refreshData
    };
}