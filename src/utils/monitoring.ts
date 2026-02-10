import type { OperationType } from "../types/monitoring/OperationType";

// Clase para progreso
export const getProgressClass = (percentage: number): string => {
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
        'DESPACHO': '📦 Despacho',
        'EMBARQUE_INDIRECTO': '🚢 Embarque Ind.',
        'ACOPIO': '📥 Acopio',
        'EMBARQUE_DIRECTO': '🚢 Embarque Dir.'
    };
    return labels[tipo] || tipo;
};

// Obtener clases de badge por tipo de operación
export const getOperationBadge = (tipo: OperationType): string => {
    const badges: Record<OperationType, string> = {
        'DESPACHO': 'bg-blue-500/15 text-blue-500 border border-blue-500/30',
        'EMBARQUE_INDIRECTO': 'bg-green-500/15 text-green-500 border border-green-500/30',
        'ACOPIO': 'bg-purple-500/15 text-purple-500 border border-purple-500/30',
        'EMBARQUE_DIRECTO': 'bg-pink-500/15 text-pink-500 border border-pink-500/30'
    };
    return badges[tipo] || 'bg-gray-500/15 text-gray-500 border border-gray-500/30';
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