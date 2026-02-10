import type { OperationType } from "../../types/monitoring/OperationType";
import type { Manifest } from "./Manifest";
import type { Summary } from "./Summary";

export interface VesselData {
    manifest: Manifest;
    operation_type: OperationType;
    summary: {
        holds: Summary[];
        services: Summary[];
    };
    last_update: string;
    shifts_worked: string[];
}