import { ref, onUnmounted } from "vue";
import type { VesselData } from "../../interfaces/monitoring/VesselData";
import { addVesselToMonitor, getMonitoredVessels, createVesselSSEConnection, removeVesselFromMonitor } from "../../services/monitoringService";
import type { VesselsResponse } from "../../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../../interfaces/monitoring/api/VesselResquest";

export function useMonitoringData() {
    const monitoredVessels = ref<VesselsResponse[]>([]);

    const selectedVessel = ref<VesselsResponse | null>(null);

    const selectedVesselData = ref<VesselData | null>(null);
    const loading = ref(false);
    const error = ref('');

    // Referencia a la conexión SSE activa
    let sseConnection: EventSource | null = null;

    const loadMonitoredVessels = async () => {
        try {
            const response = await getMonitoredVessels();
            monitoredVessels.value = response;
        } catch (err) {
            error.value = (err as Error).message || 'Error al cargar las operaciones monitoreadas';
        }
    }

    const selectVessel = async (vesselRequest: VesselsRequest) => {
        try {
            loading.value = true;

            // Cerrar conexión SSE previa si existe
            if (sseConnection) {
                sseConnection.close();
                sseConnection = null;
            }

            const vessel: VesselsResponse | undefined = monitoredVessels.value.find(
                (v) => v.manifest.id === vesselRequest.manifest_id && v.operation_type === vesselRequest.operation_type
            );

            if (vessel) {
                selectedVessel.value = {
                    manifest: { ...vessel.manifest },
                    operation_type: vessel.operation_type,
                };

                // Establecer conexión SSE para recibir actualizaciones en tiempo real
                sseConnection = createVesselSSEConnection(
                    vesselRequest,
                    (data: VesselData) => {
                        selectedVesselData.value = data;
                        loading.value = false;
                    },
                    (err: Error) => {
                        console.error('Error en conexión SSE:', err);
                        error.value = 'Error al recibir actualizaciones del servidor';
                        loading.value = false;
                    }
                );
            }
        } catch (err) {
            console.error('Error cargando datos de nave:', err);
            error.value = 'Error al cargar datos de nave';
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
                // Cerrar conexión SSE
                if (sseConnection) {
                    sseConnection.close();
                    sseConnection = null;
                }
                selectedVessel.value = null;
                selectedVesselData.value = null;
            }
        } catch (err) {
            console.error('Error removiendo nave:', err);
            error.value = 'Error al remover nave';
        }
    };

    const refreshData = async () => {
        // Con SSE, los datos se actualizan automáticamente
        // Esta función ya no es necesaria pero la mantenemos por compatibilidad
        // El servidor envía actualizaciones automáticamente a través del stream
        console.log('Los datos se actualizan automáticamente vía SSE');
    };

    // Limpiar conexión SSE al desmontar el componente
    onUnmounted(() => {
        if (sseConnection) {
            sseConnection.close();
            sseConnection = null;
        }
    });

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