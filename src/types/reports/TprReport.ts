export type TprReportType = 'ALL' | 'CONTAINER_VESSEL' | 'TRUCK_IN_OUT' | 'PERFORMANCE_EQUIPMENT';
export type TprDetailReportType = Exclude<TprReportType, 'ALL'>;
export type TprDetailKind = 'MOVEMENTS' | 'VESSEL_CALLS' | 'EQUIPMENT_MOVES';
export type TprEquipmentOwnership = 'ALL' | 'INTERNAL' | 'RENTED';

export interface TprSummaryRow {
  uniqueId: string;
  accountDescription: string;
  total: number;
  reportType: TprDetailReportType | null;
  hasDetails: boolean;
}

export interface TprSummaryResponse {
  period: string;
  generatedAt: string;
  cached: boolean;
  rows: TprSummaryRow[];
}

export interface TprDetailRow {
  movementDate: string;
  container: string;
  operation: string;
  status: string;
  equipment: string;
  size: string;
  iso: string;
  containerType: string;
  category: string;
  shippingLine: string | null;
  shippingLineName: string | null;
  manifest: string | null;
  vessel: string | null;
}

export interface TprVesselCallDetailRow {
  atd: string;
  manifest: string;
  vessel: string | null;
}

export interface TprEquipmentDetailRow {
  equipment: string;
  ownership: Exclude<TprEquipmentOwnership, 'ALL'>;
  total: number;
}

export interface TprDetailResponse {
  period: string;
  reportType: TprDetailReportType;
  uniqueId: string;
  accountDescription: string;
  generatedAt: string;
  cached: boolean;
  detailKind: TprDetailKind;
  filteredTotal: number;
  rows: Array<TprDetailRow | TprVesselCallDetailRow | TprEquipmentDetailRow>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
