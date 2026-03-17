import { ref, onUnmounted, watch, computed } from "vue";
import type { VesselData } from "../../interfaces/monitoring/VesselData";
import { addVesselToMonitor, createVesselSSEConnection, createOperationsSSEConnection, removeVesselFromMonitor } from "../../services/monitoringService";
import type { SSEConnection } from "../../services/httpClient";
import type { SSEConnectionStatus } from "../../services/httpClient";
import type { VesselsResponse } from "../../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../../interfaces/monitoring/api/VesselResquest";

export function useMonitoringData() {
    const monitoredVessels = ref<VesselsResponse[]>([]);

    const selectedVessel = ref<VesselsResponse | null>(null);

    const selectedVesselData = ref<VesselData | null>(null);
    const loading = ref(false);
    const error = ref('');
    const serverConnected = ref(true);
    const degradedMode = ref(false);
    const connectionState = ref<SSEConnectionStatus | 'idle'>('idle');

    const connectionMessage = computed(() => {
        switch (connectionState.value) {
            case 'connected':
                return '';
            case 'degraded':
                return 'Sin eventos recientes. Activando modo degradado...';
            case 'reconnecting':
                return 'Reconectando stream con el backend...';
            case 'backend-down':
                return 'Backend no disponible (health falló). Mostrando última información conocida.';
            case 'unauthorized':
                return 'Sesión expirada. Redirigiendo al login...';
            case 'closed':
                return 'Conexión cerrada.';
            default:
                return 'Conectando al stream...';
        }
    });

    // Referencia a la conexión SSE activa (datos de nave)
    let sseConnection: SSEConnection | null = null;
    // Referencia a la conexión SSE de operaciones monitoreadas
    let operationsSseConnection: SSEConnection | null = null;

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
                degradedMode.value = false;
                connectionState.value = 'connected';
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
            },
            (status: SSEConnectionStatus) => {
                if (status === 'connected') {
                    serverConnected.value = true;
                    degradedMode.value = false;
                    connectionState.value = 'connected';
                    return;
                }

                if (status === 'degraded' || status === 'reconnecting' || status === 'backend-down') {
                    serverConnected.value = false;
                    degradedMode.value = true;
                    connectionState.value = status;
                    return;
                }

                if (status === 'unauthorized') {
                    serverConnected.value = false;
                    degradedMode.value = false;
                    connectionState.value = status;
                }
            },
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
                        degradedMode.value = false;
                        connectionState.value = 'connected';
                        selectedVesselData.value = data;
                        loading.value = false;
                    },
                    (err: Error) => {
                        serverConnected.value = false;
                        console.error('Error en conexión SSE:', err);
                        loading.value = false;
                    },
                    (status: SSEConnectionStatus) => {
                        if (status === 'connected') {
                            serverConnected.value = true;
                            degradedMode.value = false;
                            connectionState.value = status;
                            return;
                        }

                        if (status === 'degraded' || status === 'reconnecting' || status === 'backend-down') {
                            serverConnected.value = false;
                            degradedMode.value = true;
                            connectionState.value = status;
                            return;
                        }

                        if (status === 'unauthorized') {
                            serverConnected.value = false;
                            degradedMode.value = false;
                            connectionState.value = status;
                        }
                    },
                );
            }
        } catch (err) {
            console.error('Error cargando datos de nave:', err);
            error.value = 'Error al cargar datos de nave';
            loading.value = false;
        }
    };

    /**
     * Espera a que una nave aparezca en la lista de monitoreo (vía SSE).
     * Resuelve cuando la nave está disponible o rechaza por timeout.
     */
    const waitForVesselInList = (vessel: VesselsRequest, timeoutMs = 10000): Promise<void> => {
        return new Promise((resolve, reject) => {
            const exists = monitoredVessels.value.some(
                (v) => v.manifest.id === vessel.manifest_id && v.operation_type === vessel.operation_type
            );
            if (exists) {
                resolve();
                return;
            }

            const timeout = setTimeout(() => {
                stopWatch();
                reject(new Error('Tiempo de espera agotado esperando actualización del servidor'));
            }, timeoutMs);

            const stopWatch = watch(monitoredVessels, (vessels) => {
                const found = vessels.some(
                    (v) => v.manifest.id === vessel.manifest_id && v.operation_type === vessel.operation_type
                );
                if (found) {
                    clearTimeout(timeout);
                    stopWatch();
                    resolve();
                }
            }, { deep: true });
        });
    };

    const addVessel = async (vessel: VesselsRequest) => {
        try {
            loading.value = true;
            error.value = '';
            await addVesselToMonitor(vessel);
            // Esperar a que el SSE actualice la lista con la nueva nave
            await waitForVesselInList(vessel);
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
        degradedMode,
        connectionState,
        connectionMessage,
        startOperationsSSE,
        selectVessel,
        addVessel,
        removeVessel
    };
}