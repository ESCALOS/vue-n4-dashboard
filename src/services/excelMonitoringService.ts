import * as XLSX from 'xlsx-js-style';
import { ref, computed } from 'vue';
import type { VesselData } from '../interfaces/monitoring/VesselData';
import { useTablePivot } from '../composables/monitoring/useTablePivot';

interface ExportData {
    vesselData: VesselData;
}

export class MonitoringExcelExporter {
    private workbook: XLSX.WorkBook;
    private data: ExportData;

    constructor(data: ExportData) {
        this.workbook = XLSX.utils.book_new();
        this.data = data;
    }

    /**
     * Aplica estilos a una celda específica
     */
    private applyCellStyle(
        worksheet: XLSX.WorkSheet,
        cellAddress: string,
        style: {
            fill?: { fgColor: { rgb: string } };
            font?: { bold?: boolean; color?: { rgb: string }; sz?: number };
            border?: any;
            alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean };
        }
    ): void {
        if (!worksheet[cellAddress]) return;

        worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            ...style,
        };
    }

    // /**
    //  * Aplica alineación centrada a todas las celdas de un rango
    //  */
    // private applyAlignmentToRange(
    //     worksheet: XLSX.WorkSheet,
    //     startRow: number,
    //     endRow: number,
    //     startCol: number,
    //     endCol: number,
    //     horizontal: string = 'center',
    //     vertical: string = 'center'
    // ): void {
    //     for (let row = startRow; row <= endRow; row++) {
    //         for (let col = startCol; col <= endCol; col++) {
    //             const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
    //             this.applyCellStyle(worksheet, cellAddress, {
    //                 alignment: { horizontal, vertical },
    //             });
    //         }
    //     }
    // }

    /**
     * Aplica bordes a todas las celdas de un rango
     */
    private applyBordersToRange(
        worksheet: XLSX.WorkSheet,
        startRow: number,
        endRow: number,
        startCol: number,
        endCol: number
    ): void {
        const border = {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
        };

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (worksheet[cellAddress]) {
                    worksheet[cellAddress].s = {
                        ...worksheet[cellAddress].s,
                        border,
                    };
                }
            }
        }
    }

    /**
     * Aplica estilos a una fila completa
     */
    private applyRowStyle(
        worksheet: XLSX.WorkSheet,
        row: number,
        numCols: number,
        backgroundColor: string,
        isBold: boolean = true
    ): void {
        for (let col = 0; col < numCols; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            this.applyCellStyle(worksheet, cellAddress, {
                fill: { fgColor: { rgb: backgroundColor } },
                font: { bold: isBold, sz: 11 },
                border: {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } },
                },
                alignment: { horizontal: 'center', vertical: 'center' },
            });
        }
    }

    /**
     * Crea una tabla de datos (peso o bultos) usando la misma estructura que MonitoreoTable
     */
    private createTableData(
        jornadas: any[],
        columns: any[],
        columnTotals: any,
        useBultos: boolean = false
    ): any[][] {
        const result: any[][] = [];

        // Header - Títulos de columnas
        const headers = ['JORNADAS', ...columns.map(col => col.key), 'TOTAL'];
        result.push(headers);

        // Filas de jornadas - Usar exactamente la misma estructura que MonitoreoTable
        jornadas.forEach(jornadaRow => {
            const row: Array<string | number> = [jornadaRow.jornada];

            // Iterar por cada columna
            jornadaRow.columns.forEach((col: any) => {
                const value = useBultos ? col.bultos : col.peso;
                row.push(value);
            });

            // Total de la fila
            const total = useBultos ? jornadaRow.totalBultos : jornadaRow.totalPeso;
            row.push(total);

            result.push(row);
        });

        // Fila TOTAL (descargado)
        const totalRow: Array<string | number> = ['TOTAL'];
        const totals = useBultos
            ? columnTotals.bultosDescargados
            : columnTotals.descargado;

        totals.forEach((value: number) => {
            totalRow.push(value);
        });

        const grandTotal = totals.reduce((acc: number, val: number) => acc + val, 0);
        totalRow.push(grandTotal);
        result.push(totalRow);

        // Fila MANIFESTADO
        const manifestadoRow: Array<string | number> = ['MANIFESTADO'];
        const manifestados = useBultos
            ? columnTotals.bultosManifestados
            : columnTotals.manifestado;

        manifestados.forEach((value: number) => {
            manifestadoRow.push(value);
        });

        const totalManifestado = manifestados.reduce((acc: number, val: number) => acc + val, 0);
        manifestadoRow.push(totalManifestado);
        result.push(manifestadoRow);

        // Fila DIFERENCIA
        const diferenciaRow: Array<string | number> = ['DIFERENCIA'];
        const diferencias = useBultos
            ? columnTotals.diferenciaBultos
            : columnTotals.diferencia;

        diferencias.forEach((value: number) => {
            diferenciaRow.push(value);
        });

        const totalDiferencia = diferencias.reduce((acc: number, val: number) => acc + val, 0);
        diferenciaRow.push(totalDiferencia);
        result.push(diferenciaRow);

        return result;
    }

    /**
     * Aplica estilos a una tabla (bordes, colores de fondo, alineación)
     */
    private applyTableStyles(
        worksheet: XLSX.WorkSheet,
        startRow: number,
        numRows: number,
        numCols: number
    ): void {
        // Aplicar bordes a toda la tabla
        this.applyBordersToRange(worksheet, startRow, startRow + numRows - 1, 0, numCols - 1);

        // Aplicar negrita, tamaño 11 y centrado al header
        for (let col = 0; col < numCols; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: startRow, c: col });
            this.applyCellStyle(worksheet, cellAddress, {
                font: { bold: true, sz: 11 },
                alignment: { horizontal: 'center', vertical: 'center' },
            });
        }

        // Aplicar centrado a todas las celdas de datos (filas de jornadas y números)
        // Las filas de datos van desde startRow + 1 hasta numRows - 4 (antes de TOTAL, MANIFESTADO, DIFERENCIA)
        // const dataRowsEnd = startRow + numRows - 4;
        // this.applyAlignmentToRange(worksheet, startRow + 1, dataRowsEnd, 0, numCols - 1, 'center', 'center');

        // Aplicar centrado y formato de número a todas las celdas de datos
        const dataRowsEnd = startRow + numRows - 4;
        for (let row = startRow + 1; row <= dataRowsEnd; row++) {
            for (let col = 0; col < numCols; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = worksheet[cellAddress];

                if (cell && typeof cell.v === 'number') {
                    // Aplicar formato de número con 2 decimales
                    cell.z = '#,##0.00';
                }

                this.applyCellStyle(worksheet, cellAddress, {
                    alignment: { horizontal: 'center', vertical: 'center' },
                });
            }
        }

        // Las últimas 3 filas son TOTAL, MANIFESTADO y DIFERENCIA
        const totalRow = startRow + numRows - 3;
        const manifestadoRow = startRow + numRows - 2;
        const diferenciaRow = startRow + numRows - 1;

        // Aplicar formato de número a las filas de totales
        [totalRow, manifestadoRow, diferenciaRow].forEach(row => {
            for (let col = 1; col < numCols; col++) { // Desde col 1 (después de la etiqueta)
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = worksheet[cellAddress];

                if (cell && typeof cell.v === 'number') {
                    cell.z = '#,##0.00';
                }
            }
        });

        // TOTAL - fondo azul claro (d9edf7)
        this.applyRowStyle(worksheet, totalRow, numCols, 'd9edf7', true);

        // MANIFESTADO - fondo amarillo claro (fcf8e3)
        this.applyRowStyle(worksheet, manifestadoRow, numCols, 'fcf8e3', true);

        // DIFERENCIA - fondo rojo claro (f2dede)
        this.applyRowStyle(worksheet, diferenciaRow, numCols, 'f2dede', true);
    }

    /**
     * Agrega una sección de reporte (Bodegas o BL Items) con sus tablas
     */
    private addReportSection(
        sheetData: any[][],
        title: string,
        activeTab: 'holds' | 'goods'
    ): { data: any[][]; tableRanges: Array<{ start: number; rows: number; cols: number }> } {
        const result = [...sheetData];
        const tableRanges: Array<{ start: number; rows: number; cols: number }> = [];

        // Usar useMonitoreoPivot para obtener los datos pivotados
        const selectedVesselData = ref(this.data.vesselData);
        const activeTabRef = ref(activeTab);

        const { pivotedData, columnTotals } = useTablePivot(selectedVesselData, activeTabRef);

        const shifts = computed(() => pivotedData.value.shifts);
        const columns = computed(() => pivotedData.value.columns);

        // Verificar si hay bultos manifestados
        const totalBultosManifestados = columnTotals.value.manifestedGoods.reduce(
            (acc: number, val: number) => acc + val,
            0
        );

        // Título de la sección
        result.push([title]);

        // Tabla de PESO
        const pesoTableStart = result.length;
        const pesoTable = this.createTableData(
            shifts.value,
            columns.value,
            columnTotals.value,
            false
        );
        result.push(...pesoTable);
        tableRanges.push({
            start: pesoTableStart,
            rows: pesoTable.length,
            cols: columns.value.length + 2, // +2 por JORNADAS y TOTAL
        });
        result.push([]); // Espacio en blanco

        // Tabla de BULTOS (solo si hay bultos manifestados)
        if (totalBultosManifestados > 0) {
            result.push([`${title} BULTOS`]);

            const bultosTableStart = result.length;
            const bultosTable = this.createTableData(
                shifts.value,
                columns.value,
                columnTotals.value,
                true
            );
            result.push(...bultosTable);
            tableRanges.push({
                start: bultosTableStart,
                rows: bultosTable.length,
                cols: columns.value.length + 2,
            });
            result.push([]); // Espacio en blanco
        }

        return { data: result, tableRanges };
    }

    /**
     * Genera el archivo Excel completo con ambas secciones
     */
    public generateExcel(): void {
        const { vesselData } = this.data;

        // Título principal: ${Manifiesto} - ${Nombre de la Nave}
        const title = `${vesselData.manifest.id} - ${vesselData.manifest.name}`;
        let sheetData: any[][] = [[title]];
        const allTableRanges: Array<{ start: number; rows: number; cols: number }> = [];
        const sectionTitles: Array<{ row: number; text: string }> = [];

        // SECCIÓN 1: REPORTE DE BODEGAS
        const bodegasResult = this.addReportSection(sheetData, 'REPORTE DE BODEGAS', 'holds');
        sheetData = bodegasResult.data;
        allTableRanges.push(...bodegasResult.tableRanges);
        // El título de BODEGAS está en la fila 1 (después del título principal)
        sectionTitles.push({ row: 1, text: 'REPORTE DE BODEGAS' });

        // SECCIÓN 2: REPORTE DE BL ITEMS
        const blsResult = this.addReportSection(sheetData, 'REPORTE DE BL ITEMS', 'goods');
        sheetData = blsResult.data;
        allTableRanges.push(...blsResult.tableRanges);
        // El título de BL ITEMS está en la última posición antes de sus tablas
        // Calculamos la posición basada en la longitud actual
        const blTitleRow = sheetData.length - (blsResult.tableRanges.reduce((acc, r) => acc + r.rows + 2, 0)) - 1;
        sectionTitles.push({ row: blTitleRow, text: 'REPORTE DE BL ITEMS' });

        // Crear worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

        // Aplicar estilos al título principal (fila 0)
        const mainTitleAddress = XLSX.utils.encode_cell({ r: 0, c: 0 });
        this.applyCellStyle(worksheet, mainTitleAddress, {
            font: { bold: true, sz: 12 },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        // Aplicar estilos a todas las tablas
        allTableRanges.forEach(range => {
            this.applyTableStyles(worksheet, range.start, range.rows, range.cols);
        });

        // Configurar alturas de fila
        const rowHeights: { [key: number]: number } = {};

        // Título principal: altura 60
        rowHeights[0] = 60;

        // Títulos de secciones: altura 30
        sectionTitles.forEach(({ row }) => {
            rowHeights[row] = 30;
        });

        // Primero: Configurar alturas de filas de tabla (incluyendo footer) a 30
        allTableRanges.forEach(range => {
            for (let row = range.start; row < range.start + range.rows + 2; row++) {
                rowHeights[row] = 30;
            }
        });

        // Segundo: Configurar alturas de filas de espacio en blanco a 11
        for (let row = 0; row < sheetData.length; row++) {
            if (sheetData[row]?.length === 0) {
                rowHeights[row] = 11;
            }
        }

        worksheet['!rows'] = Object.entries(rowHeights).map(([_, height]) => ({
            hpt: height,
            hidden: false,
        }));

        // Calcular anchos de columna dinámicamente
        const selectedVesselData = ref(vesselData);
        const bodegasTab = ref<'holds' | 'goods'>('holds');
        const blsTab = ref<'holds' | 'goods'>('goods');

        const { pivotedData: bodegasData } = useTablePivot(selectedVesselData, bodegasTab);
        const { pivotedData: blsData } = useTablePivot(selectedVesselData, blsTab);

        const maxColumns = Math.max(
            bodegasData.value.columns.length,
            blsData.value.columns.length
        );

        const columnWidths = [
            { wch: 35 }, // JORNADAS (columna más ancha)
            ...Array(maxColumns).fill({ wch: 15 }), // Columnas de datos
            { wch: 15 }, // TOTAL
        ];
        worksheet['!cols'] = columnWidths;

        // Agregar al workbook
        XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Monitoreo Completo');

        // Generar nombre del archivo con fecha de exportación (día mes año hora minuto: DDMMYYYY_HHMM)
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const fecha = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}${pad(now.getMinutes())}`;

        const fileName = `${vesselData.manifest.id}_${vesselData.manifest.name}_${fecha}.xlsx`
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_.-]/g, '');

        // Descargar archivo
        XLSX.writeFile(this.workbook, fileName);
    }

    /**
     * Método estático para exportar directamente
     */
    public static export(data: ExportData): void {
        const exporter = new MonitoringExcelExporter(data);
        exporter.generateExcel();
    }
}
