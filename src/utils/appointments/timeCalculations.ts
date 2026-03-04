/**
 * Time calculation utilities for appointment monitoring
 * 
 * Implements three types of time calculations for containers in progress:
 * 1. Attention Time (Tiempo de Atención)
 * 2. Stage Time (Tiempo Stage)
 * 3. Effective Time (Tiempo Efectivo)
 */

export interface TimeCalculations {
    tiempoAtencion: number | null;  // Time from PreGate to now
    tiempoStage: number | null;      // Time from current stage to now
    tiempoEfectivo: number | null;   // Effective time excluding inspection
}

/**
 * Calculate Tiempo de Atención (Attention Time)
 * Duration from when the container entered pre-gate until now
 * 
 * Formula: Now - PreGate (in minutes)
 * 
 * @param preGateDate - Timestamp when container reached pre-gate stage
 * @returns Duration in minutes, or null if preGateDate is not available
 */
export function calculateTiempoAtencion(preGateDate: string | null | undefined): number | null {
    if (!preGateDate) return null;

    try {
        const preGateTime = new Date(preGateDate).getTime();
        const now = new Date().getTime();
        const diffMs = now - preGateTime;

        if (diffMs < 0) return null; // Invalid date in future

        return Math.floor(diffMs / 60000); // Convert to minutes
    } catch {
        return null;
    }
}

/**
 * Calculate Tiempo Stage (Stage Time)
 * Duration from when the container entered the current stage until now
 * 
 * Formula: Now - [current stage timestamp] (in minutes)
 * 
 * @param stageDate - Timestamp of the current stage
 * @returns Duration in minutes, or null if stageDate is not available
 */
export function calculateTiempoStage(stageDate: string | null | undefined): number | null {
    if (!stageDate) return null;

    try {
        const stageDateTime = new Date(stageDate).getTime();
        const now = new Date().getTime();
        const diffMs = now - stageDateTime;

        if (diffMs < 0) return null; // Invalid date in future

        return Math.floor(diffMs / 60000); // Convert to minutes
    } catch {
        return null;
    }
}

/**
 * Calculate Tiempo Efectivo (Effective Time)
 * Net handling time excluding inspection duration
 * 
 * Formula: (Now - GateIn) - tiempo_eir
 * Only calculated when tiempo_eir is available (inspection was recorded)
 * If tiempo_eir is null/undefined, begins counting only after inspection is completed
 * 
 * @param gateInDate - Timestamp when container entered gate
 * @param tiempoEir - Inspection duration in minutes (must exist to calculate)
 * @returns Duration in minutes excluding inspection, or null if inspection data not available
 */
export function calculateTiempoEfectivo(
    gateInDate: string | null | undefined,
    tiempoEir: number | null | undefined
): number | null {
    // Only calculate if inspection time exists
    if (!tiempoEir || tiempoEir <= 0) {
        return null; // No inspection data available yet
    }

    if (!gateInDate) return null;

    try {
        const gateInTime = new Date(gateInDate).getTime();
        const now = new Date().getTime();
        const diffMs = now - gateInTime;

        if (diffMs < 0) return null; // Invalid date in future

        const totalMinutes = Math.floor(diffMs / 60000);

        // Calculate effective time: total time minus inspection time
        return Math.max(0, totalMinutes - tiempoEir); // Don't go below 0
    } catch {
        return null;
    }
}

/**
 * Calculate all three time metrics at once
 * 
 * @param appointment - Appointment object with timestamp fields
 * @returns Object containing all three time calculations
 */
export function calculateAllTimes(appointment: {
    PreGate?: string | null;
    GateIn?: string | null;
    fechaStage?: string | null;
    tiempo_eir?: number | null;
}): TimeCalculations {
    return {
        tiempoAtencion: calculateTiempoAtencion(appointment.PreGate),
        tiempoStage: calculateTiempoStage(appointment.fechaStage),
        tiempoEfectivo: calculateTiempoEfectivo(appointment.GateIn, appointment.tiempo_eir),
    };
}

/**
 * Format time in minutes to a readable string
 * 
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "2h 30m" or "45m")
 */
export function formatTime(minutes: number | null): string {
    if (minutes === null || minutes < 0) return '-';

    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
}

/**
 * Get CSS class for time duration indicator
 * Used for visual feedback on time spent
 * 
 * @param minutes - Duration in minutes
 * @returns CSS class name for styling
 */
export function getTimeClass(minutes: number | null): string {
    if (minutes === null) return 'time-neutral';

    if (minutes <= 15) return 'time-fast';      // <= 15 min: green
    if (minutes <= 60) return 'time-normal';    // 15-60 min: yellow
    if (minutes <= 180) return 'time-slow';     // 1-3 hours: orange

    return 'time-critical';                     // > 3 hours: red
}
/**
 * Get CSS class for Tiempo de Atención (Attention Time)
 * Coloring:
 * - Green: < 1 hour
 * - Orange: 1 to 1.5 hours (60-90 min)
 * - Red: > 1.5 hours (> 90 min)
 * 
 * @param minutes - Duration in minutes
 * @returns CSS class name for styling
 */
export function getTimeAtencionClass(minutes: number | null): string {
    if (minutes === null) return 'time-neutral';

    if (minutes < 60) return 'time-atencion-ok';      // < 1h: green
    if (minutes <= 90) return 'time-atencion-warning'; // 1-1.5h: orange

    return 'time-atencion-critical';                  // > 1.5h: red
}

/**
 * Get CSS class for Tiempo Stage and Tiempo Efectivo
 * Coloring:
 * - Green: < 10 minutes
 * - Orange: 10 to 25 minutes
 * - Red: > 25 minutes
 * 
 * @param minutes - Duration in minutes
 * @returns CSS class name for styling
 */
export function getTimeStageEffectiveClass(minutes: number | null): string {
    if (minutes === null) return 'time-neutral';

    if (minutes < 10) return 'time-stage-ok';      // < 10m: green
    if (minutes <= 25) return 'time-stage-warning'; // 10-25m: orange

    return 'time-stage-critical';                  // > 25m: red
}