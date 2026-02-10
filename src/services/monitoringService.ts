import type { AddVesselResponse } from "../interfaces/monitoring/api/AddVesselResponse";
import type { VesselsResponse } from "../interfaces/monitoring/api/VesselResponse";
import type { VesselsRequest } from "../interfaces/monitoring/api/VesselResquest";
import type { VesselData } from "../interfaces/monitoring/VesselData";


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Obtener lista de naves monitoreadas
 */
export const getMonitoredVessels = async (): Promise<VesselsResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/monitoring/vessels`);
    if (!response.ok) {
        throw new Error('Error al obtener las naves monitoreadas');
    }

    return response.json();
}

/**
 * Agregar una nave al monitoreo
 */
export const addVesselToMonitor = async (
    vessel: VesselsRequest
): Promise<AddVesselResponse> => {
    const response = await fetch(`${API_BASE_URL}/monitoreo/vessels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id: vessel.manifest_id, operation_type: vessel.operation_type }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Error al agregar nave");
    }
    return data;
};

/**
 * Remover una nave del monitoreo
 */
export const removeVesselFromMonitor = async (
    vessel: VesselsRequest
): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/monitoreo/vessels/${vessel.manifest_id}/${vessel.operation_type}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al remover nave");
    }
};

/**
 * Obtener datos completos de una nave monitoreada
 */
export const getVesselMonitorData = async (
    vessel: VesselsResponse
): Promise<VesselData> => {
    const url = vessel.operation_type
        ? `${API_BASE_URL}/monitoreo/vessels/${vessel.manifest.id}?operation_type=${vessel.operation_type}`
        : `${API_BASE_URL}/monitoreo/vessels/${vessel.manifest.id}`;

    const response = await fetch(url);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al obtener datos de nave");
    }

    return response.json();
};

/**
 * Forzar refresh de una nave
 */
export const refreshVesselData = async (
    vessel: VesselsResponse
): Promise<VesselData> => {
    const response = await fetch(
        `${API_BASE_URL}/monitoreo/vessels/${vessel.manifest.id}/refresh?operation_type=${vessel.operation_type}`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar nave");
    }

    return response.json();
};