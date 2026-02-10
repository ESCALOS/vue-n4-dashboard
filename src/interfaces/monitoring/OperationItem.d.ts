export interface OperationItem {
    nbr: string;
    manifested_weight: number;
    manifested_goods: number;
}

export interface CargoService extends OperationItem { }
export interface CargoHold extends OperationItem { }