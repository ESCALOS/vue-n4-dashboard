import type { OperationItem } from "./OperationItem";

export interface Summary extends OperationItem {
    processed_weight: number;
    processed_goods: number;
    shifts: {
        [key: string]: {
            weight: number;
            goods: number;
        };
    }
}