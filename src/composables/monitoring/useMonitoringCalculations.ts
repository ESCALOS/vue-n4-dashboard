import { computed, type ComputedRef } from 'vue';
import type { VesselData } from '../../interfaces/monitoring/VesselData';
import type { Summary } from '../../interfaces/monitoring/Summary';

// ============================================
// Tipos para Resúmenes
// ============================================

export interface SummaryData {
    weight: {
        manifested: ComputedRef<number>;
        processed: ComputedRef<number>;
        percentage: ComputedRef<number>;
    };
    goods: {
        manifested: ComputedRef<number>;
        processed: ComputedRef<number>;
        percentage: ComputedRef<number>;
    };
}

// ============================================
// Funciones Helper para Cálculos
// ============================================

/**
 * Genera todos los computed para un resumen basado en la propiedad
 */
function createSummaryComputeds(
    items: Summary[]
): SummaryData {
    return {
        weight: {
            manifested: computed(() => items.reduce((sum, item) => sum + (item.weight.manifested || 0), 0)),
            processed: computed(() => items.reduce((sum, item) => sum + (item.weight.processed || 0), 0)),
            percentage: computed(() => {
                const totalManifested = items.reduce((sum, item) => sum + (item.weight.manifested || 0), 0);
                const totalProcessed = items.reduce((sum, item) => sum + (item.weight.processed || 0), 0);
                return totalManifested > 0 ? (totalProcessed / totalManifested) * 100 : 0;
            }),
        },
        goods: {
            manifested: computed(() => items.reduce((sum, item) => sum + (item.goods.manifested || 0), 0)),
            processed: computed(() => items.reduce((sum, item) => sum + (item.goods.processed || 0), 0)),
            percentage: computed(() => {
                const totalManifested = items.reduce((sum, item) => sum + (item.goods.manifested || 0), 0);
                const totalProcessed = items.reduce((sum, item) => sum + (item.goods.processed || 0), 0);
                return totalManifested > 0 ? (totalProcessed / totalManifested) * 100 : 0;
            }),
        },
    };
}

/**
 * Calcula el total de una propiedad de jornada
 */
function sumShiftProperty(
    items: Array<{ shifts: Record<string, { weight?: number; goods?: number }> }>,
    shiftKey: string,
    property: 'weight' | 'goods'
): number {
    return items.reduce((sum, item) => {
        const shiftData = item.shifts[shiftKey];
        return sum + (shiftData?.[property] || 0);
    }, 0);
}

/**
 * Obtiene la jornada actual basada en la hora
 */
function getCurrentShiftKey(): string {
    const now = new Date();
    const hour = now.getHours();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    if (hour >= 0 && hour < 8) return `${dateStr} 00:00 - 07:59`;
    if (hour >= 8 && hour < 16) return `${dateStr} 08:00 - 15:59`;
    return `${dateStr} 16:00 - 23:59`;
}

// ============================================
// Composable Principal
// ============================================

export function useMonitoringCalculations(selectedVesselData: { value: VesselData | null }) {
    // Resumen de Bodegas
    const holdSummary = computed<SummaryData>(() => {
        if (!selectedVesselData.value?.summary?.holds) {
            return createSummaryComputeds([]);
        }
        return createSummaryComputeds(selectedVesselData.value.summary.holds);
    });

    // Resumen de BLs
    const serviceSummary = computed<SummaryData>(() => {
        if (!selectedVesselData.value?.summary?.services) {
            return createSummaryComputeds([]);
        }
        return createSummaryComputeds(selectedVesselData.value.summary.services);
    });

    // Total peso en jornada actual
    const totalWeightCurrentShift = computed(() => {
        if (!selectedVesselData.value?.summary?.services) return 0;
        const shiftKey = getCurrentShiftKey();
        return sumShiftProperty(selectedVesselData.value.summary.services, shiftKey, 'weight');
    });

    // Total bultos en jornada actual
    const totalGoodsCurrentShift = computed(() => {
        if (!selectedVesselData.value?.summary?.services) return 0;
        const shiftKey = getCurrentShiftKey();
        return sumShiftProperty(selectedVesselData.value.summary.services, shiftKey, 'goods');
    });

    // Obtener jornada actual formateada
    const currentShift = computed(() => getCurrentShiftKey());

    return {
        holdSummary,
        serviceSummary,
        totalWeightCurrentShift,
        totalGoodsCurrentShift,
        currentShift,
    };
}