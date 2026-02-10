import { computed, type Ref } from 'vue';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import type { Summary } from '../../interfaces/monitoring/Summary';

export function useTablePivot(
    selectedVesselData: Ref<VesselData | null>,
    activeTab: Ref<'holds' | 'goods'>
) {
    const pivotedData = computed(() => {
        if (!selectedVesselData.value) return { shifts: [], columns: [] };

        const isBodyView = activeTab.value === 'holds';
        const items = isBodyView
            ? selectedVesselData.value.summary.holds
            : selectedVesselData.value.summary.services;

        // Obtener todas las jornadas únicas
        const shiftsSet = new Set<string>();
        items.forEach((item: Summary) => {
            Object.keys(item.shifts).forEach((shift) => shiftsSet.add(shift));
        });

        // Ordenar jornadas por fecha y hora (descendente)
        const shifts = Array.from(shiftsSet).sort((b, a) => {
            const partsA = a.split(' ');
            const partsB = b.split(' ');

            const dateA = partsA[0] || '';
            const dateB = partsB[0] || '';
            const hourA = partsA[1] || '00:00';
            const hourB = partsB[1] || '00:00';

            const [dayA, monthA, yearA] = dateA.split('-');
            const [dayB, monthB, yearB] = dateB.split('-');
            const dateStrA = `${yearA}-${monthA}-${dayA} ${hourA}`;
            const dateStrB = `${yearB}-${monthB}-${dayB} ${hourB}`;

            return dateStrB.localeCompare(dateStrA);
        });

        // Obtener columnas (bodegas o BLs)
        const columns = items.map((item) => ({
            key: item.nbr,
            manifest_weight: item.manifest_weight,
            manifest_goods: item.manifest_goods,
        }));

        // Crear matriz de datos por jornada
        const shiftData = shifts.map((shift) => {
            const rowData = {
                shift,
                columns: columns.map((col) => {
                    const item = items.find((i) => i.nbr === col.key);
                    const shiftData = item?.shifts[shift];
                    return {
                        weight: shiftData?.weight || 0,
                        goods: shiftData?.goods || 0,
                    };
                }),
                totalWeight: 0,
                totalGoods: 0,
            };

            // Calcular totales de la jornada
            rowData.totalWeight = rowData.columns.reduce((sum: number, col) => sum + col.weight, 0);
            rowData.totalGoods = rowData.columns.reduce((sum: number, col) => sum + col.goods, 0);

            return rowData;
        });

        return { shifts: shiftData, columns };
    });

    const columnTotals = computed(() => {
        if (!selectedVesselData.value)
            return {
                manifested: [],
                processed: [],
                difference: [],
                manifestedGoods: [],
                processedGoods: [],
                differenceGoods: [],
            };

        const isBodyView = activeTab.value === 'holds';
        const items = isBodyView
            ? selectedVesselData.value.summary.holds
            : selectedVesselData.value.summary.services;

        return {
            manifested: items.map((item) => item.manifest_weight),
            processed: items.map((item) => item.processed_weight),
            difference: items.map((_item, idx) => {
                const manifestado = items[idx]?.manifest_weight || 0;
                const descargado = items[idx]?.processed_weight || 0;
                return manifestado - descargado;
            }),
            manifestedGoods: items.map((item) => item.manifest_goods),
            processedGoods: items.map((item) => item.processed_goods),
            differenceGoods: items.map((_item, idx) => {
                const manifestado = items[idx]?.manifest_goods || 0;
                const descargado = items[idx]?.processed_goods || 0;
                return manifestado - descargado;
            }),
        };
    });

    return {
        pivotedData,
        columnTotals,
    };
}