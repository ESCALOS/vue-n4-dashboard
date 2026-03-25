import type { VesselsResponse } from '../interfaces/monitoring/api/VesselResponse';
import type { VesselData } from '../interfaces/monitoring/VesselData';
import type { VesselsRequest } from '../interfaces/monitoring/api/VesselResquest';
import type { AddVesselResponse } from '../interfaces/monitoring/api/AddVesselResponse';
import type { StockpilingTicket } from '../interfaces/monitoring/api/StockpilingTicket';
import type { IndirectShipmentTicket } from '../interfaces/monitoring/api/IndirectShipmentTicket';
import type {
    ContainerMonitoringData,
    MonitoredContainerVessel,
    ContainerOperationsReport,
} from '../interfaces/monitoring/ContainerMonitoring';
import type { SSEConnection, SSEConnectionStatus } from './httpClient';
import { createMockSSEConnection } from './mockSSE';

import monitoredVessels from '../mocks/monitored_vessels.json';

import adastar from '../mocks/VesselData/adastar_acopio.json';
import antheia from '../mocks/VesselData/Antheia_Despacho.json';
import cramon from '../mocks/VesselData/cramon_island_embarque_indirecto.json';
import prosperity from '../mocks/VesselData/prosperity_embarque_directo.json';
import seaVoyager from '../mocks/VesselData/sea_voyager_despacho.json';
import containerMonitoringMock from '../mocks/containers/container-monitoring.json';
import containerReportsMock from '../mocks/containers/operations-reports.json';

type VesselDataSourceItem = { data?: VesselData } | VesselData;

const vesselDataSources = [
    adastar,
    antheia,
    cramon,
    prosperity,
    seaVoyager,
] as VesselDataSourceItem[];

const monitoredVesselsState = [...(monitoredVessels as unknown as VesselsResponse[])];
const containerMonitoringState = [...(containerMonitoringMock as unknown as ContainerMonitoringData[])];
const containerReports = [...(containerReportsMock as unknown as ContainerOperationsReport[])];
const monitoredContainerVesselsState: MonitoredContainerVessel[] = containerMonitoringState
    .slice(0, 1)
    .map((item) => ({
        id: item.manifest.id,
        gkey: item.manifest.gkey,
        vessel_name: item.manifest.vessel_name,
    }));

const stockpilingTicketsSeed: StockpilingTicket[] = [
    {
        codigo: 'TK-1001',
        blItemNbr: 'SSP-001',
        gRemision: 'GR-100',
        gTransportista: 'TRN-44',
        pesoIngreso: 32000,
        pesoSalida: 12800,
        pesoNeto: 19200,
        tracto: 'A1B-123',
        carreta: 'CH-3321',
        conductor: 'Luis Perez',
        fechaSalida: '2026-03-24 08:42:00',
        notas: '',
        rucTransportista: '20123456789',
        bodega: 'B1',
    },
];

const indirectShipmentTicketsSeed: IndirectShipmentTicket[] = [
    {
        codigo: 2001,
        unit: 'MSCU7654321',
        blItemNbr: 'OS-020',
        pesoIngreso: 29000,
        pesoSalida: 12000,
        pesoNeto: 17000,
        bodega: 'B2',
        tracto: 'D3F-741',
        chassis: 'CH-1180',
        conductor: 'Carlos Ruiz',
        fechaSalida: '2026-03-24 09:20:00',
    },
];

const unwrapVesselData = (source: VesselDataSourceItem): VesselData => {
    const data = (source as { data?: VesselData }).data;
    return (data ?? source) as VesselData;
};

const findVesselData = (vesselRequest: VesselsRequest): VesselData | null => {
    for (const source of vesselDataSources) {
        const data = unwrapVesselData(source);
        if (
            data?.manifest?.id === vesselRequest.manifest_id &&
            data?.operation_type === vesselRequest.operation_type
        ) {
            return {
                ...data,
                last_update: new Date().toISOString(),
            };
        }
    }

    return null;
};

const cloneMonitoredOperations = (): VesselsResponse[] =>
    monitoredVesselsState.map((item) => ({
        manifest: { ...item.manifest },
        operation_type: item.operation_type,
    }));

const cloneMonitoredContainerVessels = (): MonitoredContainerVessel[] =>
    monitoredContainerVesselsState.map((vessel) => ({ ...vessel }));

const findContainerDataByManifest = (manifestId: string): ContainerMonitoringData | null => {
    const found = containerMonitoringState.find((item) => item.manifest.id === manifestId);
    if (!found) return null;

    return {
        ...found,
        manifest: { ...found.manifest },
        summary: {
            ...found.summary,
            discharge: { ...found.summary.discharge },
            load: { ...found.summary.load },
            restow: { ...found.summary.restow },
        },
        pending_by_bay: {
            discharge: [...found.pending_by_bay.discharge],
            load: [...found.pending_by_bay.load],
            not_arrived: [...found.pending_by_bay.not_arrived],
            restow: [...found.pending_by_bay.restow],
        },
        containers: found.containers.map((container) => ({ ...container })),
        last_update: new Date().toISOString(),
    };
};

export const getMonitoredVesselsLocal = async (): Promise<VesselsResponse[]> => {
    return cloneMonitoredOperations();
};

export const createOperationsSSEConnection = (
    onData: (operations: VesselsResponse[]) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    return createMockSSEConnection(cloneMonitoredOperations, onData, onError, onStatusChange);
};

export const createVesselSSEConnection = (
    vessel: VesselsRequest,
    onData: (data: VesselData) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    return createMockSSEConnection(
        () => {
            const data = findVesselData(vessel);
            if (!data) {
                throw new Error('Mock: datos de nave no encontrados');
            }
            return data;
        },
        onData,
        onError,
        onStatusChange,
    );
};

export const getVesselMonitorData = async (vesselRequest: VesselsRequest): Promise<VesselData> => {
    const found = findVesselData(vesselRequest);
    if (!found) throw new Error('Mock: datos de nave no encontrados');
    return found;
};

export const refreshVesselData = async (vessel: VesselsRequest): Promise<VesselData> => {
    return getVesselMonitorData(vessel);
};

export const addVesselToMonitor = async (vessel: VesselsRequest): Promise<AddVesselResponse> => {
    const found = findVesselData(vessel);
    if (!found) throw new Error('Mock: datos de nave no encontrados');

    const alreadyMonitored = monitoredVesselsState.some(
        (item) =>
            item.manifest.id === found.manifest.id &&
            item.operation_type === found.operation_type,
    );

    if (!alreadyMonitored) {
        monitoredVesselsState.push({
            manifest: found.manifest,
            operation_type: found.operation_type,
        });
    }

    return { success: true, data: found };
};

export const removeVesselFromMonitor = async (vessel: VesselsRequest): Promise<void> => {
    const index = monitoredVesselsState.findIndex(
        (item) =>
            item.manifest.id === vessel.manifest_id &&
            item.operation_type === vessel.operation_type,
    );

    if (index >= 0) {
        monitoredVesselsState.splice(index, 1);
    }
};

export const refreshHolds = async (_vessel: VesselsRequest): Promise<void> => {
    return;
};

export const refreshServices = async (_vessel: VesselsRequest): Promise<void> => {
    return;
};

export const getStockpilingTickets = async (
    _manifestId: string,
    _blItemGkeys: number[],
): Promise<StockpilingTicket[]> => {
    return stockpilingTicketsSeed.map((ticket) => ({ ...ticket }));
};

export const getIndirectShipmentTickets = async (
    _manifestId: string,
    _blItemGkeys: number[],
): Promise<IndirectShipmentTicket[]> => {
    return indirectShipmentTicketsSeed.map((ticket) => ({ ...ticket }));
};

export const getWorkingVessels = async (): Promise<{ manifest_id: string; vessel_name: string }[]> => {
    const working = vesselDataSources.map((item) => {
        const data = unwrapVesselData(item);
        return {
            manifest_id: data.manifest.id,
            vessel_name: data.manifest.name,
        };
    });

    return working;
};

export const getContainerWorkingVessels = async (): Promise<{ manifest_id: string; vessel_name: string }[]> => {
    return containerMonitoringState.map((item) => ({
        manifest_id: item.manifest.id,
        vessel_name: item.manifest.vessel_name,
    }));
};

export const addContainerVessel = async (manifestId: string): Promise<void> => {
    const found = findContainerDataByManifest(manifestId);
    if (!found) {
        throw new Error('Mock: nave de contenedores no encontrada');
    }

    const alreadyMonitored = monitoredContainerVesselsState.some((vessel) => vessel.id === manifestId);
    if (!alreadyMonitored) {
        monitoredContainerVesselsState.push({
            id: found.manifest.id,
            gkey: found.manifest.gkey,
            vessel_name: found.manifest.vessel_name,
        });
    }
};

export const removeContainerVessel = async (manifestId: string): Promise<void> => {
    const index = monitoredContainerVesselsState.findIndex((vessel) => vessel.id === manifestId);
    if (index >= 0) {
        monitoredContainerVesselsState.splice(index, 1);
    }
};

export const createContainerVesselsSSE = (
    onData: (vessels: MonitoredContainerVessel[]) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    return createMockSSEConnection(cloneMonitoredContainerVessels, onData, onError, onStatusChange);
};

export const createContainerDataSSE = (
    manifestId: string,
    onData: (data: ContainerMonitoringData) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    return createMockSSEConnection(
        () => {
            const data = findContainerDataByManifest(manifestId);
            if (!data) {
                throw new Error('Mock: datos de contenedores no encontrados');
            }
            return data;
        },
        onData,
        onError,
        onStatusChange,
    );
};

export const getContainerOperationsReport = async (
    manifestId: string,
): Promise<ContainerOperationsReport> => {
    const report = containerReports.find((item) => item.manifest_id === manifestId);
    if (!report) {
        throw new Error('Mock: reporte de contenedores no encontrado');
    }

    return {
        ...report,
        loading: { ...report.loading },
        discharge: { ...report.discharge },
        restow: { ...report.restow },
        generated_at: new Date().toISOString(),
    };
};

export default {
    getMonitoredVesselsLocal,
    createOperationsSSEConnection,
    createVesselSSEConnection,
    getVesselMonitorData,
    refreshVesselData,
    addVesselToMonitor,
    removeVesselFromMonitor,
    refreshHolds,
    refreshServices,
    getStockpilingTickets,
    getIndirectShipmentTickets,
    getWorkingVessels,
    getContainerWorkingVessels,
    addContainerVessel,
    removeContainerVessel,
    createContainerVesselsSSE,
    createContainerDataSSE,
    getContainerOperationsReport,
};
