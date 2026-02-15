import type { AddVesselResponse } from "../interfaces/monitoring/api/AddVesselResponse";
import type { VesselsResponse } from "../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../interfaces/monitoring/api/VesselResquest";
import type { VesselData } from "../interfaces/monitoring/VesselData";
import type { StockpilingTicket } from "../interfaces/monitoring/api/StockpilingTicket";


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
 * Crear conexión SSE para recibir actualizaciones de la lista de operaciones monitoreadas
 */
export const createOperationsSSEConnection = (
    onData: (operations: VesselsResponse[]) => void,
    onError?: (error: Error) => void
): EventSource => {
    const url = `${API_BASE_URL}/monitoring/general-cargo/operations/stream`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            onData(parsed);
        } catch (error) {
            console.error('Error parseando datos SSE operaciones:', error);
            onError?.(new Error('Error al procesar lista de operaciones'));
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error en conexión SSE operaciones:', error);
        onError?.(new Error('Error en conexión de operaciones'));
    };

    return eventSource;
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
            const parsed = JSON.parse(event.data);
            const data = parsed.data ?? parsed;
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

    const result = await response.json();
    return result.data ?? result;
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

/**
 * Forzar refresh de bodegas (holds) — invalida caché y re-consulta N4
 */
export const refreshHolds = async (
    vessel: VesselsRequest
): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/monitoring/general-cargo/refresh-holds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            manifest_id: vessel.manifest_id,
            operation_type: vessel.operation_type,
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al refrescar bodegas");
    }
};

/**
 * Forzar refresh de servicios (BL items) — invalida caché y re-consulta N4
 */
export const refreshServices = async (
    vessel: VesselsRequest
): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/monitoring/general-cargo/refresh-services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            manifest_id: vessel.manifest_id,
            operation_type: vessel.operation_type,
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al refrescar servicios");
    }
};

/**
 * Obtener tickets de acopio (stockpiling) por BL item gkeys
 */
export const getStockpilingTickets = async (
    blItemGkeys: number[]
): Promise<StockpilingTicket[]> => {
    if (blItemGkeys.length === 0) {
        return [];
    }

    const gkeysParam = blItemGkeys.join(',');
    const url = `${API_BASE_URL}/monitoring/general-cargo/stockpiling-tickets?blItemGkeys=${gkeysParam}`;

    const response = await fetch(url);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al obtener tickets de acopio");
    }

    const result = await response.json();
    return result.data ?? [];
};