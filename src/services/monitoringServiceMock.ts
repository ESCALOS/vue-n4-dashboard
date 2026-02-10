import type { VesselsResponse } from "../interfaces/monitoring/api/VesselResponse";
import type { VesselData } from "../interfaces/monitoring/VesselData";
import type { VesselsRequest } from "../interfaces/monitoring/api/VesselResquest";
import type { AddVesselResponse } from "../interfaces/monitoring/api/AddVesselResponse";

import monitoredVessels from "../mocks/monitored_vessels.json";

import adastar from "../mocks/VesselData/Adastar_Acopio.json";
import antheia from "../mocks/VesselData/Antheia_Despacho.json";
import cramon from "../mocks/VesselData/cramon_island_embarque_indirecto.json";
import prosperity from "../mocks/VesselData/prosperity_embarque_directo.json";
import seaVoyager from "../mocks/VesselData/sea_voyager_despacho.json";

const vesselDataSources = [adastar, antheia, cramon, prosperity, seaVoyager];

/**
 * Obtener lista de naves monitoreadas
 */
export const getMonitoredVesselsLocal = async (): Promise<VesselsResponse[]> => {
    return (monitoredVessels as unknown) as VesselsResponse[];
}

const findVesselData = (manifestId: string) => {
    for (const src of vesselDataSources) {
        // src may be { success: true, data: { ... } }
        const data = (src as any).data || src;
        if (data?.manifest?.id === manifestId) return data as VesselData;
    }
    return null;
};

export const getVesselMonitorData = async (vessel: VesselsResponse): Promise<VesselData> => {
    const found = findVesselData(vessel.manifest.id);
    if (!found) throw new Error('Mock: datos de nave no encontrados');
    return found;
};

export const refreshVesselData = async (vessel: VesselsResponse): Promise<VesselData> => {
    // For mock, same as get
    return getVesselMonitorData(vessel);
};

export const addVesselToMonitor = async (vessel: VesselsRequest): Promise<AddVesselResponse> => {
    const found = findVesselData(vessel.manifest_id);
    if (!found) throw new Error('Mock: datos de nave no encontrados');
    return { success: true, data: found } as AddVesselResponse;
};

export const removeVesselFromMonitor = async (_vessel: VesselsRequest): Promise<void> => {
    // No-op in mock
    return;
};

export default {
    getMonitoredVesselsLocal,
    getVesselMonitorData,
    refreshVesselData,
    addVesselToMonitor,
    removeVesselFromMonitor,
};
