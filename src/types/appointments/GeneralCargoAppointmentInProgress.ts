export interface GeneralCargoAppointmentInProgress {
    cita: string;
    codigo?: string;
    fechaCita: string | null;
    fechaStage: string | null;
    fechaPreGate: string | null;
    fechaGateIn: string | null;
    fechaZonaEspera: string | null;
    fechaInicioCarguio: string | null;
    fechaYard: string | null;
    fechaGateOut: string | null;
    stage: string;
    tiempo: number | null;
    tiempoGateIn: number | null;
    deducibleEsperaInicioCarguio: number;
    deducibleInicioCarguioTermino: number;
    tiempoEfectivo: number | null;
    linea: string;
    booking: string;
    permiso: string;
    placa: string;
    tracto: string;
    cliente: string;
    tecnologia: string;
    producto: string;
    contenedor: string;
    nave: string;
    carreta: string;
    chassis: string;
    tipo: string;
    tipoOperativa: string;
    puertoDescarga: string | null;
}

export interface GeneralCargoAppointmentsResponse {
    data: GeneralCargoAppointmentInProgress[];
    count: number;
    timestamp: string;
}

export const GENERAL_CARGO_STAGE_LABELS: Record<string, string> = {
    tranquera: 'Tranquera',
    pre_gate: 'Pre-Gate',
    gate_in: 'Gate-In',
    zona_de_espera: 'Zona de Espera',
    inicio_de_carguio: 'Inicio de Carguío',
    yard: 'Término',
    gate_out: 'Gate-Out',
};
