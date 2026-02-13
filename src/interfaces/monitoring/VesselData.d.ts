import type { OperationType } from "../../types/monitoring/OperationType";
import type { Manifest } from "./Manifest";
import type { Summary } from "./Summary";
import type { Transaction } from "./Transaction";

export interface VesselData {
    manifest: Manifest;
    operation_type: OperationType;
    summary: {
        holds: Summary[];
        services: Summary[];
    };
    last_update: string;
    shifts_worked: string[];
    transactions: Transaction[]
}