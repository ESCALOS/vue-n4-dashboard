import { get, post } from './httpClient';
import type {
  TprDetailReportType,
  TprDetailResponse,
  TprEquipmentOwnership,
  TprReportType,
  TprSummaryResponse,
} from '../types/reports/TprReport';

async function requireOk(response: Response, fallback: string): Promise<Response> {
  if (response.ok) return response;

  let message = fallback;
  try {
    const data = await response.json() as { message?: string | string[] };
    if (Array.isArray(data.message)) {
      message = data.message.join(', ');
    } else if (data.message) {
      message = data.message;
    }
  } catch {
    // Keep the user-facing fallback when the response is not JSON.
  }
  throw new Error(message);
}

function queryString(values: Record<string, string | number>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => params.set(key, String(value)));
  return params.toString();
}

async function download(response: Response, fallbackFilename: string): Promise<void> {
  await requireOk(response, 'No se pudo generar el archivo Excel');
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackFilename;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export const tprReportService = {
  async getSummary(period: string, type: TprReportType): Promise<TprSummaryResponse> {
    const response = await get(`/tpr-reports/summary?${queryString({ period, type })}`);
    await requireOk(response, 'No se pudo consultar el Reporte TPR');
    return response.json();
  },

  async getDetails(
    period: string,
    reportType: TprDetailReportType,
    uniqueId: string,
    page: number,
    limit: number,
    ownership: TprEquipmentOwnership = 'ALL',
  ): Promise<TprDetailResponse> {
    const response = await get(`/tpr-reports/details?${queryString({
      period,
      reportType,
      uniqueId,
      page,
      limit,
      ownership,
    })}`);
    await requireOk(response, 'No se pudo consultar el detalle TPR');
    return response.json();
  },

  async regenerate(period: string): Promise<TprSummaryResponse> {
    const response = await post('/tpr-reports/regenerate', { period });
    await requireOk(response, 'No se pudo regenerar el Reporte TPR');
    return response.json();
  },

  async exportSummary(period: string, type: TprReportType): Promise<void> {
    const response = await get(`/tpr-reports/summary/export?${queryString({ period, type })}`);
    await download(response, `Reporte_TPR_${period}.xlsx`);
  },

  async exportDetails(
    period: string,
    reportType: TprDetailReportType,
    uniqueId: string,
    ownership: TprEquipmentOwnership = 'ALL',
  ): Promise<void> {
    const response = await get(`/tpr-reports/details/export?${queryString({
      period,
      reportType,
      uniqueId,
      ownership,
    })}`);
    await download(response, `Reporte_TPR_Detalle_${uniqueId}_${period}.xlsx`);
  },
};

