import type { ShiftType } from "../../types/monitoring/ShiftType";

export interface Transaction {
    CargoHoldNumber: string;
    CargoServiceGkey: number;
    shift: ShiftType;
    totalWeight: number;
    totalGoods: number;
}