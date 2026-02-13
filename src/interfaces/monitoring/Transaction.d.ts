import type { ShiftType } from "../../types/monitoring/ShiftType";

export interface Transaction {
    hold: string;
    serviceId: number;
    shift: string;
    weight: number;
    goods: number;
    totalTickets: number;
}