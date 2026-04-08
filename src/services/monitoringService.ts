import type { AddVesselResponse } from "../interfaces/monitoring/api/AddVesselResponse";
import type { VesselsResponse } from "../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../interfaces/monitoring/api/VesselResquest";
import type { VesselData } from "../interfaces/monitoring/VesselData";
import type { StockpilingTicket } from "../interfaces/monitoring/api/StockpilingTicket";
import type { IndirectShipmentTicket } from "../interfaces/monitoring/api/IndirectShipmentTicket";
import type {
    ContainerMonitoringData,
    MonitoredContainerVessel,
    ContainerOperationsReport,
    NotArrivedContainerItem,
} from "../interfaces/monitoring/ContainerMonitoring";
import { get, post, del, createAuthSSE } from './httpClient';
import type { SSEConnection } from './httpClient';
import type { SSEConnectionStatus } from './httpClient';

export interface WorkingVessel {
    manifest_id: string;
    vessel_name: string;
}

export type SspPermissionScope = 'INTERNAL' | 'EXTERNAL';

export interface SspPermissionClassificationItem {
    bl_item_gkey: number;
    permission_nbr: string;
    permission_scope: SspPermissionScope | null;
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
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
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

    eventSource.onstatuschange = (status) => {
        onStatusChange?.(status);
    };

    return eventSource;
};

/**
 * Crear conexión SSE para recibir actualizaciones en tiempo real
 */
export const createVesselSSEConnection = (
    vessel: VesselsRequest,
    onData: (data: VesselData) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
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

    eventSource.onstatuschange = (status) => {
        onStatusChange?.(status);
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
 * Guardar clasificación interno/externo para permisos SSP.
 */
export const saveSspPermissionClassifications = async (
    vessel: VesselsRequest,
    items: SspPermissionClassificationItem[]
): Promise<SspPermissionClassificationItem[]> => {
    const response = await post('/monitoring/general-cargo/ssp-permissions/classifications', {
        manifest_id: vessel.manifest_id,
        operation_type: vessel.operation_type,
        items,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al guardar clasificación SSP');
    }

    return data.data ?? [];
};

/**
 * Obtener tickets de acopio (stockpiling) por BL item gkeys
 */
export const getStockpilingTickets = async (
    manifestId: string,
    blItemGkeys: number[]
): Promise<StockpilingTicket[]> => {
    if (blItemGkeys.length === 0) {
        return [];
    }

    const gkeysParam = blItemGkeys.join(',');
    const response = await get(
        `/monitoring/general-cargo/stockpiling-tickets?manifestId=${encodeURIComponent(manifestId)}&blItemGkeys=${gkeysParam}`
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al obtener tickets de acopio");
    }

    const result = await response.json();
    return result.data ?? [];
};

/**
 * Obtener tickets de embarque indirecto por BL item gkeys
 */
export const getIndirectShipmentTickets = async (
    manifestId: string,
    blItemGkeys: number[]
): Promise<IndirectShipmentTicket[]> => {
    if (blItemGkeys.length === 0) {
        return [];
    }

    const gkeysParam = blItemGkeys.join(',');
    const response = await get(
        `/monitoring/general-cargo/indirect-shipment-tickets?manifestId=${encodeURIComponent(manifestId)}&blItemGkeys=${gkeysParam}`
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al obtener tickets de embarque indirecto");
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

/**
 * Obtener naves de contenedores actualmente trabajando (phase = 40WORKING)
 */
export const getContainerWorkingVessels = async (): Promise<{ manifest_id: string; vessel_name: string }[]> => {
    try {
        const response = await get('/monitoring/containers/working-vessels');
        if (!response.ok) return [];
        const result = await response.json();
        return result.data ?? [];
    } catch {
        return [];
    }
};

/**
 * Agregar una nave al monitoreo de contenedores
 */
export const addContainerVessel = async (manifestId: string): Promise<void> => {
    const response = await post('/monitoring/containers/vessels', {
        manifest_id: manifestId,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al agregar nave al monitoreo');
    }
};

/**
 * Remover una nave del monitoreo de contenedores
 */
export const removeContainerVessel = async (manifestId: string): Promise<void> => {
    const response = await del('/monitoring/containers/vessels', {
        manifest_id: manifestId,
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al remover nave del monitoreo');
    }
};

/**
 * Crear conexión SSE para recibir lista de naves monitoreadas de contenedores
 */
export const createContainerVesselsSSE = (
    onData: (vessels: MonitoredContainerVessel[]) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    const eventSource = createAuthSSE('/monitoring/containers/vessels/stream');

    eventSource.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            onData(parsed);
        } catch (error) {
            console.error('Error parseando datos SSE naves contenedores:', error);
            onError?.(new Error('Error al procesar lista de naves'));
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error en conexión SSE naves contenedores:', error);
        onError?.(new Error('Error en conexión de naves'));
    };

    eventSource.onstatuschange = (status) => {
        onStatusChange?.(status);
    };

    return eventSource;
};

/**
 * Crear conexión SSE para recibir datos de monitoreo de contenedores de una nave
 */
export const createContainerDataSSE = (
    manifestId: string,
    onData: (data: ContainerMonitoringData) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    const eventSource = createAuthSSE(
        `/monitoring/containers/stream?manifest_id=${encodeURIComponent(manifestId)}`
    );

    eventSource.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            const data = parsed.data ?? parsed;
            onData(data);
        } catch (error) {
            console.error('Error parseando datos SSE contenedores:', error);
            onError?.(new Error('Error al procesar datos de contenedores'));
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error en conexión SSE contenedores:', error);
        onError?.(new Error('Error en conexión de contenedores'));
    };

    eventSource.onstatuschange = (status) => {
        onStatusChange?.(status);
    };

    return eventSource;
};

/**
 * Obtener datos del reporte operacional de contenedores para exportación Excel
 */
export const getContainerOperationsReport = async (
    manifestId: string,
): Promise<ContainerOperationsReport> => {
    const response = await get(
        `/monitoring/containers/export-data?manifest_id=${encodeURIComponent(manifestId)}`,
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || result.error || 'Error al obtener reporte de contenedores');
    }

    return result.data as ContainerOperationsReport;
};

/**
 * Obtener contenedores faltantes por llegar para un manifiesto.
 */
export const getNotArrivedContainersByManifest = async (
    manifestId: string,
): Promise<NotArrivedContainerItem[]> => {
    const response = await get(
        `/monitoring/containers/not-arrived?manifest_id=${encodeURIComponent(manifestId)}`,
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || result.error || 'Error al obtener contenedores faltantes');
    }

    return (result.data ?? []) as NotArrivedContainerItem[];
};

