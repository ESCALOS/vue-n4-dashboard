import type { OperationType } from "../../../types/monitoring/OperationType";
import type { Manifest } from "../Manifest";

export interface VesselsRequest {
    manifest_id: string;
    operation_type: OperationType;
}