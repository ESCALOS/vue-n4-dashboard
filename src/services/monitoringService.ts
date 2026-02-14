import type { AddVesselResponse } from "../interfaces/monitoring/api/AddVesselResponse";
import type { VesselsResponse } from "../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../interfaces/monitoring/api/VesselResquest";
import type { VesselData } from "../interfaces/monitoring/VesselData";


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Obtener lista de operaciones monitoreadas
 */
export const getMonitoredVessels = async (): Promise<VesselsResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/monitoring/general-cargo/operations`);
    if (!response.ok) {
        throw new Error('Error al obtener las operaciones monitoreadas');
    }

    const result = await response.json();
    return result.data || [];
}

/**
 * Agregar una operación al monitoreo
 */
export const addVesselToMonitor = async (
    vessel: VesselsRequest
): Promise<AddVesselResponse> => {
    const response = await fetch(`${API_BASE_URL}/monitoring/general-cargo/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            manifest_id: vessel.manifest_id,
            operation_type: vessel.operation_type
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al agregar operación");
    }
    return data;
};

/**
 * Remover una operación del monitoreo
 */
export const removeVesselFromMonitor = async (
    vessel: VesselsRequest
): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/monitoring/general-cargo/operations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            manifest_id: vessel.manifest_id,
            operation_type: vessel.operation_type
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al remover operación");
    }
};

/**
 * Crear conexión SSE para recibir actualizaciones en tiempo real
 */
export const createVesselSSEConnection = (
    vessel: VesselsRequest,
    onData: (data: VesselData) => void,
    onError?: (error: Error) => void
): EventSource => {
    const url = `${API_BASE_URL}/monitoring/general-cargo/stream?manifest_id=${vessel.manifest_id}&operation_type=${vessel.operation_type}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Datos SSE recibidos:', data);
            onData(data);
        } catch (error) {
            console.error('Error parseando datos SSE:', error);
            onError?.(new Error('Error al procesar datos del servidor'));
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error en conexión SSE:', error);
        onError?.(new Error('Error en conexión con el servidor'));
    };

    return eventSource;
};

/**
 * Obtener datos completos de una nave monitoreada (llamada única)
 */
export const getVesselMonitorData = async (
    vessel: VesselsResponse
): Promise<VesselData> => {
    const url = `${API_BASE_URL}/monitoring/general-cargo/stream?manifest_id=${vessel.manifest.id}&operation_type=${vessel.operation_type}`;

    const response = await fetch(url);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al obtener datos de nave");
    }

    return response.json();
};

/**
 * Forzar refresh de una nave (ya no es necesario con SSE, pero lo mantenemos por compatibilidad)
 */
export const refreshVesselData = async (
    vessel: VesselsResponse
): Promise<VesselData> => {
    // Con SSE, el servidor emite automáticamente cuando hay cambios
    // Esta función podría quedar obsoleta o triggear un refresh manual en el backend
    return getVesselMonitorData(vessel);
};