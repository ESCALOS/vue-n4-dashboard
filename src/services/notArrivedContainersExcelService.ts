import type { NotArrivedContainerItem } from '../interfaces/monitoring/ContainerMonitoring';

let XLSX: any = null;

const getXLSX = async () => {
    if (!XLSX) {
        XLSX = await import('xlsx-js-style');
    }
    return XLSX;
};

export const exportNotArrivedContainersExcel = async (
    manifestId: string,
    vesselName: string,
    rows: NotArrivedContainerItem[],
): Promise<void> => {
    const XLSXModule = await getXLSX();

    const data = rows.map((row) => ({
        Contenedor: row.container_number,
        Booking: row.booking,
        Operador: row.operator,
        POD: row.pod,
        Shipper: row.shipper_name,
        'Tec.': row.technology,
        Producto: row.commodity,
    }));

    const worksheet = XLSXModule.utils.json_to_sheet(data);
    const workbook = XLSXModule.utils.book_new();

    worksheet['!cols'] = [
        { wch: 16 },
        { wch: 16 },
        { wch: 28 },
        { wch: 12 },
        { wch: 28 },
        { wch: 18 },
        { wch: 20 },
    ];

    XLSXModule.utils.book_append_sheet(workbook, worksheet, 'Faltan llegar');

    const safeVessel = vesselName.replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSXModule.writeFile(workbook, `containers-not-arrived-${manifestId}-${safeVessel}.xlsx`);
};
