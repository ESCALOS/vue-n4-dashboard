import type { AppointmentsResponse } from '../types/appointments/AppointmentInProgress';
import type { UpcomingAppointmentsResponse } from '../types/appointments/UpcomingAppointment';
import { get, createAuthSSE } from './httpClient';
import type { SSEConnection } from './httpClient';

/**
 * Crear conexión SSE para recibir citas en progreso en tiempo real
 */
export const createAppointmentsSSEConnection = (
    onData: (data: AppointmentsResponse) => void,
    onError?: (error: Error) => void,
): SSEConnection => {
    const eventSource = createAuthSSE('/appointments/in-progress/stream');

    eventSource.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            onData(parsed);
        } catch (error) {
            console.error('Error parseando datos SSE citas:', error);
            onError?.(new Error('Error al procesar datos de citas'));
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error en conexión SSE citas:', error);
        onError?.(new Error('Error en conexión de citas en progreso'));
    };

    return eventSource;
};

/**
 * Obtener citas en progreso (llamada única REST)
 */
export const getAppointmentsInProgress = async (): Promise<AppointmentsResponse> => {
    const response = await get('/appointments/in-progress');

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener citas en progreso');
    }

    return response.json();
};

/**
 * Crear conexión SSE para recibir citas próximas en tiempo real
 */
export const createUpcomingAppointmentsSSEConnection = (
    onData: (data: UpcomingAppointmentsResponse) => void,
    onError?: (error: Error) => void,
): SSEConnection => {
    const eventSource = createAuthSSE('/appointments/upcoming/stream');

    eventSource.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            onData(parsed);
        } catch (error) {
            console.error('Error parseando datos SSE citas próximas:', error);
            onError?.(new Error('Error al procesar datos de citas próximas'));
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error en conexión SSE citas próximas:', error);
        onError?.(new Error('Error en conexión de citas próximas'));
    };

    return eventSource;
};

/**
 * Obtener citas próximas (llamada única REST)
 */
export const getUpcomingAppointments = async (): Promise<UpcomingAppointmentsResponse> => {
    const response = await get('/appointments/upcoming');

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener citas próximas');
    }

    return response.json();
};
