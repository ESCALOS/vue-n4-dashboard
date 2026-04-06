import type { OperationType } from "../../types/monitoring/OperationType";
import type { Manifest } from "./Manifest";
import type { Summary } from "./Summary";
import type { Transaction } from "./Transaction";

export interface HoldAlert {
    type: 'missing' | 'unrecognized';
    hold: string;
    units: string[];
}

export interface CompletionAlert {
    hold: string;
    estimatedRemainingTrucks: number;
    remainingWeight: number;
    averageWeightPerTruck: number;
    totalTicketsProcessed: number;
}

export interface VesselData {
    manifest: Manifest;
    operation_type: OperationType;
    supports_ssp_classification: boolean;
    summary: {
        holds: Summary[];
        services: Summary[];
    };
    last_update: string;
    shifts_worked: string[];
    transactions: Transaction[];
    hold_alerts: HoldAlert[];
    completion_alerts: CompletionAlert[];
}