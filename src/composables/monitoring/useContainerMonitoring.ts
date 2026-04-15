import { ref, computed, onUnmounted, watch } from 'vue';
import type { ContainerMonitoringData, MonitoredContainerVessel, ContainerMonitoringItem } from '../../interfaces/monitoring/ContainerMonitoring';
import type { SSEConnection, SSEConnectionStatus } from '../../services/httpClient';
import {
    addContainerVessel,
    removeContainerVessel,
    createContainerVesselsSSE,
    createContainerDataSSE,
    getContainerWorkingVessels,
} from '../../services/monitoringService';

export function useContainerMonitoring() {
    // ============================================
    // STATE
    // ============================================
    const monitoredVessels = ref<MonitoredContainerVessel[]>([]);
    const selectedVessel = ref<MonitoredContainerVessel | null>(null);
    const vesselData = ref<ContainerMonitoringData | null>(null);
    const loading = ref(false);
    const error = ref('');
    const connectionState = ref<SSEConnectionStatus | 'idle'>('idle');

    // Filters
    const bayFilter = ref<number | null>(null);
    const statusFilter = ref<string>('');
    const isoFilter = ref('');
    const sizeFilter = ref<number | null>(null);
    const positionFilter = ref('');

    // SSE connections
    let vesselsSSE: SSEConnection | null = null;
    let dataSSE: SSEConnection | null = null;

    // ============================================
    // COMPUTED
    // ============================================

    const connectionMessage = computed(() => {
        switch (connectionState.value) {
            case 'connected': return '';
            case 'degraded': return 'Sin eventos recientes. Activando modo degradado...';
            case 'reconnecting': return 'Reconectando stream con el backend...';
            case 'backend-down': return 'Backend no disponible. Mostrando última información conocida.';
            case 'unauthorized': return 'Sesión expirada. Redirigiendo al login...';
            case 'closed': return 'Conexión cerrada.';
            default: return 'Conectando al stream...';
        }
    });

    const serverConnected = computed(() =>
        connectionState.value === 'connected' || connectionState.value === 'idle',
    );

    const availableBays = computed(() => {
        if (!vesselData.value) return [];
        const bays = new Set<number>();
        for (const c of vesselData.value.containers) {
            if (c.bay !== null) bays.add(c.bay);
        }
        return Array.from(bays).sort((a, b) => a - b);
    });

    const availableIsos = computed(() => {
        if (!vesselData.value) return [];
        const isos = new Set<string>();
        for (const c of vesselData.value.containers) {
            if (c.iso_type) isos.add(c.iso_type);
        }
        return Array.from(isos).sort();
    });

    const availableSizes = computed(() => {
        if (!vesselData.value) return [];
        const sizes = new Set<number>();
        for (const c of vesselData.value.containers) {
            if (c.size !== null) sizes.add(c.size);
        }
        return Array.from(sizes).sort((a, b) => a - b);
    });

    const filteredContainers = computed<ContainerMonitoringItem[]>(() => {
        if (!vesselData.value) return [];
        let result = vesselData.value.containers;

        if (bayFilter.value !== null) {
            result = result.filter((c) => c.bay === bayFilter.value);
        }
        if (statusFilter.value) {
            result = result.filter((c) => c.operation_status === statusFilter.value);
        }
        if (isoFilter.value) {
            result = result.filter((c) => c.iso_type === isoFilter.value);
        }
        if (sizeFilter.value !== null) {
            result = result.filter((c) => c.size === sizeFilter.value);
        }
        if (positionFilter.value.trim()) {
            const query = positionFilter.value.trim().toLowerCase();
            result = result.filter((c) => c.position.toLowerCase().includes(query));
        }

        return result;
    });

    // ============================================
    // SSE - VESSELS LIST
    // ============================================

    const startVesselsSSE = () => {
        if (vesselsSSE) vesselsSSE.close();

        vesselsSSE = createContainerVesselsSSE(
            (vessels) => {
                connectionState.value = 'connected';
                monitoredVessels.value = vessels;

                // If selected vessel was removed, clean up
                if (selectedVessel.value) {
                    const stillExists = vessels.some((v) => v.id === selectedVessel.value!.id);
                    if (!stillExists) {
                        closeDataSSE();
                        selectedVessel.value = null;
                        vesselData.value = null;
                    }
                }
            },
            (err) => {
                console.error('Error SSE naves contenedores:', err);
            },
            (status) => {
                if (status === 'connected') {
                    connectionState.value = 'connected';
                } else if (status === 'degraded' || status === 'reconnecting' || status === 'backend-down') {
                    connectionState.value = status;
                } else if (status === 'unauthorized') {
                    connectionState.value = status;
                }
            },
        );
    };

    // ============================================
    // SSE - VESSEL DATA
    // ============================================

    const closeDataSSE = () => {
        if (dataSSE) {
            dataSSE.close();
            dataSSE = null;
        }
    };

    const selectVessel = (vessel: MonitoredContainerVessel) => {
        closeDataSSE();
        loading.value = true;
        error.value = '';
        selectedVessel.value = { ...vessel };

        // Reset filters on vessel change
        bayFilter.value = null;
        statusFilter.value = '';
        isoFilter.value = '';
        sizeFilter.value = null;
        positionFilter.value = '';

        dataSSE = createContainerDataSSE(
            vessel.id,
            (data) => {
                connectionState.value = 'connected';
                vesselData.value = data;
                loading.value = false;
            },
            (err) => {
                console.error('Error SSE datos contenedores:', err);
                loading.value = false;
            },
            (status) => {
                if (status === 'connected') {
                    connectionState.value = 'connected';
                } else if (status === 'degraded' || status === 'reconnecting' || status === 'backend-down') {
                    connectionState.value = status;
                } else if (status === 'unauthorized') {
                    connectionState.value = status;
                }
            },
        );
    };

    // ============================================
    // CRUD
    // ============================================

    const waitForVessel = (manifestId: string, timeoutMs = 10000): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (monitoredVessels.value.some((v) => v.id === manifestId)) {
                resolve();
                return;
            }

            const timeout = setTimeout(() => {
                stopWatch();
                reject(new Error('Tiempo de espera agotado esperando actualización del servidor'));
            }, timeoutMs);

            const stopWatch = watch(monitoredVessels, (vessels) => {
                if (vessels.some((v) => v.id === manifestId)) {
                    clearTimeout(timeout);
                    stopWatch();
                    resolve();
                }
            }, { deep: true });
        });
    };

    const addVessel = async (manifestId: string) => {
        try {
            loading.value = true;
            error.value = '';
            await addContainerVessel(manifestId);
            await waitForVessel(manifestId);

            // Auto-select the newly added vessel
            const vessel = monitoredVessels.value.find((v) => v.id === manifestId);
            if (vessel) selectVessel(vessel);

            return { success: true };
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Error al agregar nave';
            loading.value = false;
            return { success: false, error: error.value };
        }
    };

    const removeVessel = async (manifestId: string) => {
        try {
            await removeContainerVessel(manifestId);
            // The SSE will update the list and clean up automatically
        } catch (err) {
            console.error('Error removiendo nave:', err);
            error.value = 'Error al remover nave';
        }
    };

    const fetchWorkingVessels = async () => {
        return getContainerWorkingVessels();
    };

    // ============================================
    // FILTER HELPERS
    // ============================================

    const clearFilters = () => {
        bayFilter.value = null;
        statusFilter.value = '';
        isoFilter.value = '';
        sizeFilter.value = null;
        positionFilter.value = '';
    };

    const selectBay = (bay: number) => {
        bayFilter.value = bay;
    };

    // ============================================
    // CLEANUP
    // ============================================

    onUnmounted(() => {
        closeDataSSE();
        if (vesselsSSE) {
            vesselsSSE.close();
            vesselsSSE = null;
        }
    });

    return {
        // State
        monitoredVessels,
        selectedVessel,
        vesselData,
        loading,
        error,
        connectionState,
        connectionMessage,
        serverConnected,

        // Filters
        bayFilter,
        statusFilter,
        isoFilter,
        sizeFilter,
        positionFilter,
        availableBays,
        availableIsos,
        availableSizes,
        filteredContainers,

        // Actions
        startVesselsSSE,
        selectVessel,
        addVessel,
        removeVessel,
        fetchWorkingVessels,
        clearFilters,
        selectBay,
    };
}
