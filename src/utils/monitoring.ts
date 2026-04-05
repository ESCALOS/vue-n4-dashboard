import type { OperationType } from "../types/monitoring/OperationType";

// Clase para progreso
export const getProgressClass = (percentage: number): string => {
    if (percentage > 100) return "progress-over";
    if (percentage >= 90) return "progress-high";
    if (percentage >= 50) return "progress-medium";
    return "progress-low";
};

// Clase para jornada
export const getShiftClass = (shift: string): string => {
    // Extraer la hora de la jornada (formato: "dd-MM-yyyy HH:mm - HH:mm")
    const horaParte = shift.split(' ')[1]; // "HH:mm"

    if (horaParte === '00:00') return "shift-night";
    if (horaParte === '08:00') return "shift-day";
    return "shift-evening";
};

// Obtener etiqueta de tipo de operación
export const getOperationLabel = (tipo: OperationType): string => {
    const labels: Record<OperationType, string> = {
        'DISPATCHING': 'Despacho',
        'INDIRECT_LOADING': 'Embarque Ind.',
        'STOCKPILING': 'Acopio',
        'DIRECT_LOADING': 'Embarque Dir.'
    };
    return labels[tipo] || tipo;
};


// Formatear números
export const formatNumber = (num: number): string => {
    return num.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// Formatear jornada para mostrar fecha y hora por separado
export const formatShiftBadge = (shift: string): { date: string; time: string } => {
    // Formato esperado: "dd-MM-yyyy HH:mm - HH:mm"
    const parts = shift.split(' ');
    // Esperamos al menos 4 partes: [date, timeStart, '-', timeEnd]
    if (parts.length >= 4) {
        return {
            date: parts[0] ?? shift, // "dd-MM-yyyy"
            time: `${parts[1] ?? ''} - ${parts[3] ?? ''}`  // "HH:mm - HH:mm"
        };
    }
    return { date: shift, time: '' };
};