export interface OperationItem {
    nbr: string;
    manifest_weight: number;
    manifest_goods: number;
}

export interface CargoService extends OperationItem { }
export interface CargoHold extends OperationItem { }