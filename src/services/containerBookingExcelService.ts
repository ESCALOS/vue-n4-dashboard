import type { ContainerBookingExportItem } from '../interfaces/monitoring/ContainerMonitoring';

let XLSX: any = null;

const getXLSX = async () => {
    if (!XLSX) XLSX = await import('xlsx-js-style');
    return XLSX;
};

const HEADERS = [
    'LINEA', 'MANIFIESTO', 'NAVE', 'POO', 'POL', 'POD', 'FDS', 'CITA', 'OPERADOR',
    'BOOKING NBR', 'CONTAINER NBR', 'ISOCODE', 'TYPE', 'TOTAL', 'STATUS',
    'STATUS2', 'COMMODITY', 'TEMPERATURE', 'Tec. Reefer', 'SHIPPER',
];

export const exportContainerBookingExcel = async (
    items: ContainerBookingExportItem[],
    manifestId: string,
): Promise<void> => {
    const XLSXModule = await getXLSX();
    const rows = items.map((item) => [
        item.line, item.manifest, item.vessel, item.poo, item.pol, item.pod, item.fds,
        item.appointment, item.operator, item.booking, item.container_number, item.iso_code, item.type,
        item.total, item.status, item.status2, item.commodity, item.temperature,
        item.reefer_technology, item.shipper,
    ]);
    const worksheet = XLSXModule.utils.aoa_to_sheet([HEADERS, ...rows]);
    const workbook = XLSXModule.utils.book_new();

    const border = {
        top: { style: 'thin', color: { rgb: 'B7C9E2' } },
        bottom: { style: 'thin', color: { rgb: 'B7C9E2' } },
        left: { style: 'thin', color: { rgb: 'B7C9E2' } },
        right: { style: 'thin', color: { rgb: 'B7C9E2' } },
    };
    for (let row = 0; row <= rows.length; row++) {
        for (let col = 0; col < HEADERS.length; col++) {
            const address = XLSXModule.utils.encode_cell({ r: row, c: col });
            if (!worksheet[address]) continue;
            worksheet[address].s = row === 0
                ? {
                    fill: { fgColor: { rgb: '1E3A5F' } },
                    font: { bold: true, color: { rgb: 'FFFFFF' } },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border,
                }
                : { border, alignment: { vertical: 'center' } };
        }
    }

    worksheet['!cols'] = HEADERS.map((header) => ({
        wch: Math.max(12, Math.min(28, header.length + 4)),
    }));
    const lastColumn = XLSXModule.utils.encode_col(HEADERS.length - 1);
    worksheet['!autofilter'] = { ref: `A1:${lastColumn}${rows.length + 1}` };
    XLSXModule.utils.book_append_sheet(workbook, worksheet, 'Reservas Embarque');

    const date = new Date().toISOString().slice(0, 10);
    const safeManifest = manifestId.replace(/[^a-zA-Z0-9_.-]/g, '_');
    XLSXModule.writeFile(workbook, `reservas-embarque-${safeManifest}-${date}.xlsx`);
};
