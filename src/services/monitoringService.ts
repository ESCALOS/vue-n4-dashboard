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
} from "../interfaces/monitoring/ContainerMonitoring";
import { get, post, del, createAuthSSE } from './httpClient';
import type { SSEConnection } from './httpClient';
import type { SSEConnectionStatus } from './httpClient';
import { USE_MOCK_DATA } from '../config/mockMode';
import * as monitoringServiceMock from './monitoringServiceMock';

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.addVesselToMonitor(vessel);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.removeVesselFromMonitor(vessel);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.createOperationsSSEConnection(onData, onError, onStatusChange);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.createVesselSSEConnection(vessel, onData, onError, onStatusChange);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.getVesselMonitorData({
            manifest_id: vessel.manifest.id,
            operation_type: vessel.operation_type,
        });
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.refreshVesselData({
            manifest_id: vessel.manifest.id,
            operation_type: vessel.operation_type,
        });
    }

    return getVesselMonitorData(vessel);
};

/**
 * Forzar refresh de bodegas (holds) — invalida caché y re-consulta N4
 */
export const refreshHolds = async (
    vessel: VesselsRequest
): Promise<void> => {
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.refreshHolds(vessel);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.refreshServices(vessel);
    }

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
    manifestId: string,
    blItemGkeys: number[]
): Promise<StockpilingTicket[]> => {
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.getStockpilingTickets(manifestId, blItemGkeys);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.getIndirectShipmentTickets(manifestId, blItemGkeys);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.getWorkingVessels();
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.getContainerWorkingVessels();
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.addContainerVessel(manifestId);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.removeContainerVessel(manifestId);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.createContainerVesselsSSE(onData, onError, onStatusChange);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.createContainerDataSSE(manifestId, onData, onError, onStatusChange);
    }

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
    if (USE_MOCK_DATA) {
        return monitoringServiceMock.getContainerOperationsReport(manifestId);
    }

    const response = await get(
        `/monitoring/containers/export-data?manifest_id=${encodeURIComponent(manifestId)}`,
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || result.error || 'Error al obtener reporte de contenedores');
    }

    return result.data as ContainerOperationsReport;
};