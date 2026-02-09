import type { OperationType } from "../../../types/monitoring/OperationType";
import type { Manifest } from "../Manifest";

export interface VesselsResponse {
    manifest: Manifest;
    operation_type: OperationType;
}