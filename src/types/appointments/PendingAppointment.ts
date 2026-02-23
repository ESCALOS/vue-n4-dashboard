export type AppointmentEstado = 'vencida' | 'activa' | 'pendiente';

export interface PendingAppointment {
    cita: string;
    fechaCita: string | null;
    linea: string;
    booking: string;
    placa: string;
    carreta: string;
    cliente: string;
    tecnologia: string;
    producto: string;
    contenedor: string;
    nave: string;
    tipo: string;
    estado: AppointmentEstado;
}

export interface PendingAppointmentsResponse {
    data: PendingAppointment[];
    count: number;
    timestamp: string;
}

/** Labels legibles para los estados */
export const ESTADO_LABELS: Record<AppointmentEstado, string> = {
    vencida: 'Vencida',
    activa: 'Activa',
    pendiente: 'Pendiente',
};
