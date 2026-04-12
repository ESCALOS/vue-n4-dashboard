export interface LocationObservation {
    location: string;
    observations: string[];
}

export interface EIRData {
    printDate: string;
    printTime: string;
    eirNumber: string;

    shippingLine: string;
    manifest: string;
    vesselName: string;
    voyage: string;
    gate: string;
    startDate: string;
    finishedDate: string;
    technician: string;

    gate: string;

    container: string;
    iso: string;
    kind: string;
    tare: string;
    maxNet: string;
    maxGross: string;
    state: string;
    outcome: string;
    classification: string;
    manufacturing: string;
    condition: string;
    precincts: string;

    booking: string;
    licencePlate: string;
    fullName: string;
    merchandise: string;

    humidity: string;
    ventilation: string;
    technology: string;
    tempBooking: string;
    tempAdjust: string;
    tempLoad: string;
    o2: string;
    co2: string;

    locationObservations: LocationObservation[];
    generalObservations: string;

    technicianName: string;

    damages: DamageRow[];
}

export interface DamageRow {
    location: string;
    damageType: string;
    component: string;
    repairMethod: string;
    responsible: string;
    quantity: string;
    eirInspectionNbr: string;
    length: string;
    width: string;
    area: string;
}
