export interface IndirectShipmentTicket {
    codigo: number;
    unit: string;
    blItemNbr: string;
    pesoIngreso: number;
    pesoSalida: number;
    pesoNeto: number;
    bodega: string;
    tracto: string;
    chassis: string;
    conductor: string;
    fechaSalida: string;
}
