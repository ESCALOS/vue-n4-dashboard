import type { AppointmentsResponse } from '../types/appointments/AppointmentInProgress';
import type { PendingAppointmentsResponse } from '../types/appointments/PendingAppointment';
import { get, createAuthSSE } from './httpClient';
import type { SSEConnection } from './httpClient';
import type { SSEConnectionStatus } from './httpClient';
import { USE_MOCK_DATA } from '../config/mockMode';
import { createMockSSEConnection } from './mockSSE';
import inProgressMock from '../mocks/appointments/in-progress.json';
import pendingMock from '../mocks/appointments/pending.json';

const APPOINTMENTS_IN_PROGRESS_MOCK = inProgressMock as AppointmentsResponse;
const APPOINTMENTS_PENDING_MOCK = pendingMock as PendingAppointmentsResponse;

/**
 * Crear conexión SSE para recibir citas en progreso en tiempo real
 */
export const createAppointmentsSSEConnection = (
    onData: (data: AppointmentsResponse) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    if (USE_MOCK_DATA) {
        return createMockSSEConnection(
            () => ({
                ...APPOINTMENTS_IN_PROGRESS_MOCK,
                timestamp: new Date().toISOString(),
            }),
            onData,
            onError,
            onStatusChange,
        );
    }

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

    eventSource.onstatuschange = (status) => {
        onStatusChange?.(status);
    };

    return eventSource;
};

/**
 * Obtener citas en progreso (llamada única REST)
 */
export const getAppointmentsInProgress = async (): Promise<AppointmentsResponse> => {
    if (USE_MOCK_DATA) {
        return {
            ...APPOINTMENTS_IN_PROGRESS_MOCK,
            timestamp: new Date().toISOString(),
        };
    }

    const response = await get('/appointments/in-progress');

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener citas en progreso');
    }

    return response.json();
};

/**
 * Crear conexión SSE para recibir citas pendientes en tiempo real
 */
export const createPendingAppointmentsSSEConnection = (
    onData: (data: PendingAppointmentsResponse) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    if (USE_MOCK_DATA) {
        return createMockSSEConnection(
            () => ({
                ...APPOINTMENTS_PENDING_MOCK,
                timestamp: new Date().toISOString(),
            }),
            onData,
            onError,
            onStatusChange,
        );
    }

    const eventSource = createAuthSSE('/appointments/pending/stream');

    eventSource.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            onData(parsed);
        } catch (error) {
            console.error('Error parseando datos SSE citas pendientes:', error);
            onError?.(new Error('Error al procesar datos de citas pendientes'));
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error en conexión SSE citas pendientes:', error);
        onError?.(new Error('Error en conexión de citas pendientes'));
    };

    eventSource.onstatuschange = (status) => {
        onStatusChange?.(status);
    };

    return eventSource;
};

/**
 * Obtener citas pendientes (llamada única REST)
 */
export const getPendingAppointments = async (): Promise<PendingAppointmentsResponse> => {
    if (USE_MOCK_DATA) {
        return {
            ...APPOINTMENTS_PENDING_MOCK,
            timestamp: new Date().toISOString(),
        };
    }

    const response = await get('/appointments/pending');

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener citas pendientes');
    }

    return response.json();
};
