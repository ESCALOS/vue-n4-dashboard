import type { VesselData } from "../VesselData";

export interface AddVesselResponse {
    success: boolean;
    data: VesselData;
}