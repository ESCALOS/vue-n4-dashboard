export type ContainerOperationStatus =
    | 'TO_DISCHARGE'
    | 'DISCHARGED'
    | 'NOT_ARRIVED'
    | 'TO_LOAD'
    | 'LOADED'
    | 'RESTOW_PENDING'
    | 'RESTOW_ON_YARD'
    | 'RESTOW_COMPLETED';

export interface ContainerMonitoringItem {
    unit_gkey: number;
    container_number: string;
    iso_type: string;
    technology: string;
    size: 20 | 40 | null;
    operation_status: ContainerOperationStatus;
    position: string;
    arrival_position: string;
    planned_position: string;
    freight_kind: string;
    bay: number | null;
}

export interface BayPendingCount {
    bay: number;
    pending: number;
}

export interface ContainerMonitoringData {
    manifest: {
        id: string;
        gkey: number;
        vessel_name: string;
    };
    summary: {
        total_units: number;
        discharge: {
            to_discharge: number;
            discharged: number;
            total: number;
        };
        load: {
            not_arrived: number;
            to_load: number;
            loaded: number;
            total: number;
        };
        restow: {
            pending: number;
            on_yard: number;
            completed: number;
            total: number;
        };
    };
    pending_by_bay: {
        discharge: BayPendingCount[];
        load: BayPendingCount[];
        not_arrived: BayPendingCount[];
        restow: BayPendingCount[];
    };
    containers: ContainerMonitoringItem[];
    last_update: string;
}

export interface MonitoredContainerVessel {
    id: string;
    gkey: number;
    vessel_name: string;
}

export interface ContainerOperationReportRow {
    start: string;
    end: string;
    total_movements: number;
    current_movements: number;
    pending_movements: number;
}

export interface ContainerOperationsReport {
    manifest_id: string;
    vessel_name: string;
    voyage: string;
    loading: ContainerOperationReportRow;
    discharge: ContainerOperationReportRow;
    restow: ContainerOperationReportRow;
    generated_at: string;
}
