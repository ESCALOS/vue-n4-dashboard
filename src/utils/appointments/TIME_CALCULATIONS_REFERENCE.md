/**
 * TIME CALCULATIONS IMPLEMENTATION - FRONTEND REFERENCE
 * 
 * This document describes the three types of time calculations implemented
 * for appointment monitoring in the InProgressAppointmentsView.
 * 
 * ============================================================================
 * 1. TIEMPO DE ATENCIÓN (Attention Time)
 * ============================================================================
 * 
 * Description:
 *   Total duration from when the container entered the pre-gate stage until now.
 *   Represents the total time the container has been in the facility.
 * 
 * Formula:
 *   Tiempo de Atención = Now - PreGate (in minutes)
 * 
 * Usage:
 *   const tiempoAtencion = getTiempoAtencion(appointment);
 *   // Example output: 45 minutes = "45m", 90 minutes = "1h 30m"
 * 
 * Display:
 *   - Color coded with CSS classes based on duration:
 *     • time-fast (≤15 min): Green - Quick processing
 *     • time-normal (16-60 min): Yellow - Normal processing
 *     • time-slow (61-180 min): Orange - Slow processing
 *     • time-critical (>180 min): Red - Critical/Delayed
 * 
 * ============================================================================
 * 2. TIEMPO STAGE (Stage Time)
 * ============================================================================
 * 
 * Description:
 *   Duration from when the container entered the current stage until now.
 *   Helps identify where the container is stuck in the process.
 * 
 * Formula:
 *   Tiempo Stage = Now - [current stage timestamp] (in minutes)
 *   Stages: tranquera → pre_gate → gate_in → yard
 * 
 * Usage:
 *   const tiempoStage = getTiempoStage(appointment);
 *   // Example: Container in "gate_in" stage for 30 minutes
 * 
 * Display:
 *   - Displayed without specific coloring to show relative progress
 *   - Helps track container movement through stages
 * 
 * ============================================================================
 * 3. TIEMPO EFECTIVO (Effective Time)
 * ============================================================================
 * 
 * Description:
 *   Net handling time after subtracting inspection duration.
 *   Represents actual operational time excluding non-productive inspection time.
 * 
 * Formula:
 *   Tiempo Efectivo = (Now - GateIn) - tiempo_eir (in minutes)
 *   
 *   Where:
 *   - GateIn: Timestamp when container entered gate_in stage
 *   - tiempo_eir: Inspection duration from CUSTOM_INSPEIR table (in minutes)
 *   
 *   Only calculated when tiempo_eir is available (not NULL).
 *   If inspection time > total time, result is clamped to 0.
 * 
 * Usage:
 *   const tiempoEfectivo = getTiempoEfectivo(appointment);
 *   // Example: Total 60 min - Inspection 15 min = 45 min effective
 * 
 * Display:
 *   - Shows with green highlight (tiempo-efectivo-calculated) when calculated
 *   - Asterisk (*) indicator when inspection time was subtracted
 *   - Tooltip shows inspection duration on hover: "Inspección: 15m"
 * 
 * ============================================================================
 * TECHNICAL IMPLEMENTATION
 * ============================================================================
 * 
 * Files Involved:
 * 
 * 1. /src/utils/appointments/timeCalculations.ts
 *    - Core calculation functions
 *    - formatTime() helper for readable output
 *    - getTimeClass() for visual feedback
 * 
 * 2. /src/composables/appointments/useAppointmentsInProgress.ts
 *    - Wrapper functions: getTiempoAtencion(), getTiempoStage(), getTiempoEfectivo()
 *    - Integrated with SSE real-time updates
 *    - Exposed for use in Vue components
 * 
 * 3. /src/components/appointments/in-progress/AppointmentTable.vue
 *    - Displays three new columns for each time type
 *    - Uses getTiempoClass() for dynamic styling
 *    - Shows inspection indicator with asterisk
 * 
 * 4. /src/pages/appointments/InProgressAppointmentsView.vue
 *    - Passes new calculation functions to AppointmentTable
 *    - Connected to real-time SSE stream
 *    - Data is updated every refresh from backend
 * 
 * 5. /src/types/appointments/AppointmentInProgress.ts
 *    - Added tiempo_eir?: number | null field
 *    - Represents inspection duration in minutes
 *    - Null if no inspection records exist for container
 * 
 * ============================================================================
 * REAL-TIME UPDATES
 * ============================================================================
 * 
 * - Data refreshes via SSE (Server-Sent Events) connection
 * - Backend updates every 30 seconds from N4 database
 * - Time calculations re-compute on each refresh automatically
 * - No additional queries needed - all data included in SSE payload
 * 
 * Backend Cache Strategy:
 * - Redis caches appointment data with TTL
 * - User can manually clear cache as needed
 * - Fresh data reloaded on cache miss
 * 
 * ============================================================================
 * EXAMPLE OUTPUT
 * ============================================================================
 * 
 * Container CNTXYZ-001 with the following:
 * 
 *   Stage Timeline:
 *   - Tranquera: 10:00 AM
 *   - PreGate:  10:05 AM
 *   - GateIn:   10:10 AM
 *   - Yard:     10:40 AM (current stage)
 *   
 *   Inspection:
 *   - Duration: 15 minutes
 * 
 *   Calculated Times (at 10:50 AM):
 *   - Tiempo de Atención: 45 minutes (10:50 - 10:05) → "45m" [Yellow badge]
 *   - Tiempo Stage:       10 minutes (10:50 - 10:40) → "10m" [Neutral]
 *   - Tiempo Efectivo:    25 minutes ((10:50 - 10:10) - 15) → "25m*" [Green with asterisk]
 * 
 * ============================================================================
 * CSS STYLING REFERENCE
 * ============================================================================
 * 
 * .time-fast             Green background      (≤15 min)
 * .time-normal           Yellow background     (16-60 min)
 * .time-slow             Orange background     (61-180 min)
 * .time-critical         Red background        (>180 min)
 * 
 * .tiempo-efectivo-calculated   Green border + highlight (when calculated)
 * .tiempo-eir-note              Small asterisk indicator
 * 
 */

// Example usage in a component:
/*
import { useAppointmentsInProgress } from '@/composables/appointments/useAppointmentsInProgress';

const { getTiempoAtencion, getTiempoStage, getTiempoEfectivo, formatTiempo } = useAppointmentsInProgress();

// In template:
<div>
  <p>Atención: {{ formatTiempo(getTiempoAtencion(appointment)) }}</p>
  <p>Stage: {{ formatTiempo(getTiempoStage(appointment)) }}</p>
  <p>Efectivo: {{ formatTiempo(getTiempoEfectivo(appointment)) }}</p>
</div>
*/
