import type { VesselsResponse } from "../interfaces/monitoring/api/VesselResponse";
import type { VesselData } from "../interfaces/monitoring/VesselData";
import type { VesselsRequest } from "../interfaces/monitoring/api/VesselResquest";
import type { AddVesselResponse } from "../interfaces/monitoring/api/AddVesselResponse";

import monitoredVessels from "../mocks/monitored_vessels.json";

import adastar from "../mocks/VesselData/adastar_acopio.json";
import antheia from "../mocks/VesselData/Antheia_Despacho.json";
import cramon from "../mocks/VesselData/cramon_island_embarque_indirecto.json";
import prosperity from "../mocks/VesselData/prosperity_embarque_directo.json";
import seaVoyager from "../mocks/VesselData/sea_voyager_despacho.json";

const vesselDataSources = [adastar, antheia, cramon, prosperity, seaVoyager];
const monitoredVesselsState = [...((monitoredVessels as unknown) as VesselsResponse[])];

/**
 * Obtener lista de naves monitoreadas
 */
export const getMonitoredVesselsLocal = async (): Promise<VesselsResponse[]> => {
    return monitoredVesselsState;
}

const findVesselData = (vesselRequest: VesselsRequest) => {
    for (const src of vesselDataSources) {
        // src may be { success: true, data: { ... } }
        const data = (src as any).data || src;
        if (data?.manifest?.id === vesselRequest.manifest_id && data?.operation_type === vesselRequest.operation_type) {
            return data as VesselData;
        }
    }
    return null;
};

export const getVesselMonitorData = async (vesselRequest: VesselsRequest): Promise<VesselData> => {
    const found = findVesselData(vesselRequest);
    if (!found) throw new Error('Mock: datos de nave no encontrados');
    return found;
};

export const refreshVesselData = async (vessel: VesselsRequest): Promise<VesselData> => {
    // For mock, same as get
    return getVesselMonitorData(vessel);
};

export const addVesselToMonitor = async (vessel: VesselsRequest): Promise<AddVesselResponse> => {
    const found = findVesselData(vessel);
    if (!found) throw new Error('Mock: datos de nave no encontrados');

    const alreadyMonitored = monitoredVesselsState.some(
        (item) =>
            item.manifest.id === found.manifest.id &&
            item.operation_type === found.operation_type
    );

    if (!alreadyMonitored) {
        monitoredVesselsState.push({
            manifest: found.manifest,
            operation_type: found.operation_type,
        });
    }

    return { success: true, data: found } as AddVesselResponse;
};

export const removeVesselFromMonitor = async (vessel: VesselsRequest): Promise<void> => {
    const index = monitoredVesselsState.findIndex(
        (item) =>
            item.manifest.id === vessel.manifest_id &&
            item.operation_type === vessel.operation_type
    );

    if (index >= 0) {
        monitoredVesselsState.splice(index, 1);
    }

    return;
};

export default {
    getMonitoredVesselsLocal,
    getVesselMonitorData,
    refreshVesselData,
    addVesselToMonitor,
    removeVesselFromMonitor,
};
