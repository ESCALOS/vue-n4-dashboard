import type { AddVesselResponse } from "../interfaces/monitoring/api/AddVesselResponse";
import type { VesselsResponse } from "../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../interfaces/monitoring/api/VesselResquest";
import type { VesselData } from "../interfaces/monitoring/VesselData";
import type { StockpilingTicket } from "../interfaces/monitoring/api/StockpilingTicket";
import { get, post, del, createAuthSSE } from './httpClient';

export interface WorkingVessel {
    manifest_id: string;
    vessel_name: string;
}

/**
 * Agregar una operación al monitoreo
 */
export const addVesselToMonitor = async (
    vessel: VesselsRequest
): Promise<AddVesselResponse> => {
    const response = await post('/monitoring/general-cargo/operations', {
        manifest_id: vessel.manifest_id,
        operation_type: vessel.operation_type,
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
    const response = await del('/monitoring/general-cargo/operations', {
        manifest_id: vessel.manifest_id,
        operation_type: vessel.operation_type,
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
    const eventSource = createAuthSSE('/monitoring/general-cargo/operations/stream');

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
    const eventSource = createAuthSSE(
        `/monitoring/general-cargo/stream?manifest_id=${vessel.manifest_id}&operation_type=${vessel.operation_type}`
    );

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
    const response = await get(
        `/monitoring/general-cargo/stream?manifest_id=${vessel.manifest.id}&operation_type=${vessel.operation_type}`
    );

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
    return getVesselMonitorData(vessel);
};

/**
 * Forzar refresh de bodegas (holds) — invalida caché y re-consulta N4
 */
export const refreshHolds = async (
    vessel: VesselsRequest
): Promise<void> => {
    const response = await post('/monitoring/general-cargo/refresh-holds', {
        manifest_id: vessel.manifest_id,
        operation_type: vessel.operation_type,
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
    const response = await post('/monitoring/general-cargo/refresh-services', {
        manifest_id: vessel.manifest_id,
        operation_type: vessel.operation_type,
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
    const response = await get(
        `/monitoring/general-cargo/stockpiling-tickets?blItemGkeys=${gkeysParam}`
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al obtener tickets de acopio");
    }

    const result = await response.json();
    return result.data ?? [];
};

/**
 * Obtener naves actualmente trabajando (phase = 40WORKING)
 */
export const getWorkingVessels = async (): Promise<WorkingVessel[]> => {
    try {
        const response = await get('/monitoring/general-cargo/working-vessels');

        if (!response.ok) {
            return [];
        }

        const result = await response.json();
        return result.data ?? [];
    } catch {
        return [];
    }
};