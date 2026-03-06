export interface AppointmentInProgress {
    cita: string;
    fechaCita: string | null;
    fechaStage: string | null;
    fechaPreGate: string | null;
    fechaGateIn: string | null;
    stage: string;
    tiempo: number | null;
    linea: string;
    booking: string;
    placa: string;
    cliente: string;
    tecnologia: string;
    producto: string;
    contenedor: string;
    nave: string;
    carreta: string;
    tipo: string;
    /**
     * Inspection time duration in minutes from CUSTOM_INSPEIR.
     * NULL if no inspection records exist for the container's UFV.
     * Used to calculate effective handling time.
     */
    tiempoEir?: number | null;
    puertoDescarga: string;
}

export interface AppointmentsResponse {
    data: AppointmentInProgress[];
    count: number;
    timestamp: string;
}

/** Stage labels legibles */
export const STAGE_LABELS: Record<string, string> = {
    tranquera: 'Tranquera',
    pre_gate: 'Pre-Gate',
    gate_in: 'Gate-In',
    ingate: 'Gate-In',
    yard: 'Yard',
};

/** Orden de los stages */
export const STAGE_ORDER: Record<string, number> = {
    tranquera: 1,
    pre_gate: 2,
    gate_in: 3,
    ingate: 3,
    yard: 4,
};
