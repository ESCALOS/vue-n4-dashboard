import type { OperationType } from "../../../types/monitoring/OperationType";

export interface MonitoredOperation {
    manifest_id: string;
    operation_type: OperationType;
}

export interface MonitoredOperationsResponse {
    success: boolean;
    data: MonitoredOperation[];
}
