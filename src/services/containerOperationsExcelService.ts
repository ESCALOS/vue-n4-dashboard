import type { ContainerOperationsReport } from '../interfaces/monitoring/ContainerMonitoring';

let XLSX: any = null;

const getXLSX = async () => {
    if (!XLSX) {
        XLSX = await import('xlsx-js-style');
    }
    return XLSX;
};

const BORDER_THIN = {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } },
};

const applyCellStyle = (worksheet: any, addr: string, style: Record<string, unknown>) => {
    if (!worksheet[addr]) return;
    worksheet[addr].s = {
        ...(worksheet[addr].s ?? {}),
        ...style,
    };
};

const styleRow = (
    XLSXModule: any,
    worksheet: any,
    row: number,
    cols: number,
    style: Record<string, unknown>,
) => {
    for (let col = 0; col < cols; col++) {
        const addr = XLSXModule.utils.encode_cell({ r: row, c: col });
        applyCellStyle(worksheet, addr, style);
    }
};

const styleRangeBorders = (
    XLSXModule: any,
    worksheet: any,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
) => {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const addr = XLSXModule.utils.encode_cell({ r: row, c: col });
            applyCellStyle(worksheet, addr, { border: BORDER_THIN });
        }
    }
};

export const exportContainerOperationsExcel = async (report: ContainerOperationsReport): Promise<void> => {
    const XLSXModule = await getXLSX();

    const rows: Array<[string, string | number]> = [
        [`${report.vessel_name} ${report.voyage} - Mnft: ${report.manifest_id}`, ''],
        ['START LOADING OPERATIONS', report.loading.start],
        ['FINISH LOADING OPERATIONS', report.loading.end],
        ['START DISCHARGE OPERATIONS', report.discharge.start],
        ['FINISH DISCHARGE OPERATIONS', report.discharge.end],
        ['START RESTOW', report.restow.start],
        ['FINISH RESTOW', report.restow.end],
        ['', ''],
        ['TOTAL LOADING MOVEMENTS', report.loading.total_movements],
        ['CURRENT MOVEMENTS', report.loading.current_movements],
        ['PEND. MOVEMENTS', report.loading.pending_movements],
        ['', ''],
        ['TOTAL DISCHARGE MOVEMENTS', report.discharge.total_movements],
        ['CURRENT MOVEMENTS', report.discharge.current_movements],
        ['PEND. MOVEMENTS', report.discharge.pending_movements],
        ['', ''],
        ['TOTAL RESTOW MOVEMENTS', report.restow.total_movements],
        ['CURRENT MOVEMENTS', report.restow.current_movements],
        ['PEND. MOVEMENTS', report.restow.pending_movements],
    ];

    const worksheet = XLSXModule.utils.aoa_to_sheet(rows);
    const workbook = XLSXModule.utils.book_new();

    worksheet['!cols'] = [{ wch: 34 }, { wch: 24 }];

    // Header row
    styleRow(XLSXModule, worksheet, 0, 2, {
        fill: { fgColor: { rgb: 'C00000' } },
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: BORDER_THIN,
    });

    // Merge title across 2 columns
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    // Operation labels and values
    for (let row = 1; row <= 6; row++) {
        styleRow(XLSXModule, worksheet, row, 2, {
            border: BORDER_THIN,
            alignment: { horizontal: row % 2 === 1 ? 'left' : 'left', vertical: 'center' },
            font: { bold: row % 2 === 0, color: row % 2 === 0 ? { rgb: 'C00000' } : undefined },
        });
    }

    // Summary section labels
    const summaryHeaderRows = [8, 12, 16];
    for (const row of summaryHeaderRows) {
        styleRow(XLSXModule, worksheet, row, 2, {
            border: BORDER_THIN,
            font: { bold: true },
            alignment: { horizontal: 'left', vertical: 'center' },
        });
    }

    const summaryDetailRows = [9, 10, 13, 14, 17, 18];
    for (const row of summaryDetailRows) {
        styleRow(XLSXModule, worksheet, row, 2, {
            border: BORDER_THIN,
            alignment: { horizontal: 'left', vertical: 'center' },
        });
    }

    // Right column centered and bold for key values
    for (let row = 1; row <= 18; row++) {
        const addr = XLSXModule.utils.encode_cell({ r: row, c: 1 });
        if (worksheet[addr]) {
            applyCellStyle(worksheet, addr, {
                alignment: { horizontal: 'center', vertical: 'center' },
                font: {
                    ...(worksheet[addr].s?.font ?? {}),
                    bold: [2, 4, 6, 8, 12, 16].includes(row),
                    color: [2, 4, 6].includes(row) ? { rgb: 'C00000' } : undefined,
                },
            });
        }
    }

    // Whole table borders (excluding blank separators still bounded for visual consistency)
    styleRangeBorders(XLSXModule, worksheet, 0, 18, 0, 1);

    XLSXModule.utils.book_append_sheet(workbook, worksheet, 'Resumen Operaciones');
    XLSXModule.writeFile(workbook, `containers-operations-${report.manifest_id}.xlsx`);
};
