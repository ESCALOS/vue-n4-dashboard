import type { OperationType } from "../../../types/monitoring/OperationType";

export interface VesselsRequest {
    manifest_id: string;
    operation_type: OperationType;
}