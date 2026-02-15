import { ref, onUnmounted } from "vue";
import type { VesselData } from "../../interfaces/monitoring/VesselData";
import { addVesselToMonitor, createVesselSSEConnection, createOperationsSSEConnection, removeVesselFromMonitor } from "../../services/monitoringService";
import type { VesselsResponse } from "../../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../../interfaces/monitoring/api/VesselResquest";

export function useMonitoringData() {
    const monitoredVessels = ref<VesselsResponse[]>([]);

    const selectedVessel = ref<VesselsResponse | null>(null);

    const selectedVesselData = ref<VesselData | null>(null);
    const loading = ref(false);
    const error = ref('');
    const serverConnected = ref(true);

    // Referencia a la conexión SSE activa (datos de nave)
    let sseConnection: EventSource | null = null;
    // Referencia a la conexión SSE de operaciones monitoreadas
    let operationsSseConnection: EventSource | null = null;

    /**
     * Inicia la conexión SSE para recibir la lista de operaciones en tiempo real.
     * Cuando otro cliente agrega o remueve una nave, todos se actualizan.
     */
    const startOperationsSSE = () => {
        if (operationsSseConnection) {
            operationsSseConnection.close();
        }

        operationsSseConnection = createOperationsSSEConnection(
            (operations) => {
                serverConnected.value = true;
                monitoredVessels.value = operations;

                // Si la nave seleccionada ya no está en la lista, limpiar la selección
                if (selectedVessel.value) {
                    const stillExists = operations.some(
                        (v) =>
                            v.manifest.id === selectedVessel.value!.manifest.id &&
                            v.operation_type === selectedVessel.value!.operation_type
                    );
                    if (!stillExists) {
                        if (sseConnection) {
                            sseConnection.close();
                            sseConnection = null;
                        }
                        selectedVessel.value = null;
                        selectedVesselData.value = null;
                    }
                }
            },
            (err) => {
                serverConnected.value = false;
                console.error('Error en SSE de operaciones:', err);
            }
        );
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
                        serverConnected.value = true;
                        selectedVesselData.value = data;
                        loading.value = false;
                    },
                    (err: Error) => {
                        serverConnected.value = false;
                        console.error('Error en conexión SSE:', err);
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
            // La lista se actualiza automáticamente vía SSE de operaciones
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
            // La lista y la selección se limpian automáticamente vía SSE de operaciones
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

    // Limpiar conexiones SSE al desmontar el componente
    onUnmounted(() => {
        if (sseConnection) {
            sseConnection.close();
            sseConnection = null;
        }
        if (operationsSseConnection) {
            operationsSseConnection.close();
            operationsSseConnection = null;
        }
    });

    return {
        monitoredVessels,
        selectedVessel,
        selectedVesselData,
        loading,
        error,
        serverConnected,
        startOperationsSSE,
        selectVessel,
        addVessel,
        removeVessel,
        refreshData
    };
}