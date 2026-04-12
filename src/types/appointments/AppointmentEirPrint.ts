export interface AppointmentEirDamageDetail {
    location: string;
    damageType: string;
    component: string;
    repairMethod: string;
    responsible: string;
    quantity: number | null;
    eirNbr: string;
    length: number | null;
    width: number | null;
    area: number | null;
}

export interface AppointmentEirBookingInfo {
    booking: string;
    manifiesto: string;
    nave: string;
    viaje: string;
    mercaderia: string;
    tempRequerida: string;
    tecnologia: string;
}

export interface AppointmentEirHeader {
    gkey: string;
    codigo: string;
    lineaNaviera: string;
    gate: string;
    inicio: string | null;
    fin: string | null;
    tecnico: string;
    contenedor: string;
    iso: string;
    tipo: string;
    tara: number | null;
    pesoMaximo: number | null;
    pesoBruto: number | null;
    estado: string;
    resultado: string;
    tipoCarga: string;
    clasificacion: string;
    condicion: string;
    fabricacion: string;
    precintos: string;
    booking: string;
    placa: string;
    chofer: string;
    humedad: string;
    ventilacion: string;
    tecnologia: string;
    temperaturaBooking: string;
    temperatura: string;
    o2: string;
    co2: string;
    door: string;
    front: string;
    leftSide: string;
    rightSide: string;
    topRoof: string;
    inner: string;
    understructure: string;
    observaciones: string;
}

export interface AppointmentEirPrintData {
    appointmentId: string;
    hasEir: boolean;
    bookingInfo: AppointmentEirBookingInfo;
    eir: AppointmentEirHeader | null;
    damages: AppointmentEirDamageDetail[];
}
