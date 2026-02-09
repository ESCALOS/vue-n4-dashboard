import type { OperationItem } from "./OperationItem";

export interface Summary extends OperationItem {
    processed_weight: number;
    processed_goods: number;
    processed_weight_percentage: number;
    processed_goods_percentage: number;
    shifts: {
        [key: string]: {
            weight: number;
            goods: number;
        };
    }
}