import type { AppointmentsResponse } from '../types/appointments/AppointmentInProgress';
import type { GeneralCargoAppointmentsResponse } from '../types/appointments/GeneralCargoAppointmentInProgress';
import type { PendingAppointmentsResponse } from '../types/appointments/PendingAppointment';
import type { AppointmentEirPrintData } from '../types/appointments/AppointmentEirPrint';
import type { EIRData } from '../types/monitoring/Eir';
import { createApp, h } from 'vue';
import EIRPrint from '../components/eir/EIRPrint.vue';
import { get, createAuthSSE } from './httpClient';
import type { SSEConnection } from './httpClient';
import type { SSEConnectionStatus } from './httpClient';

/**
 * Crear conexión SSE para recibir citas en progreso en tiempo real
 */
export const createAppointmentsSSEConnection = (
    onData: (data: AppointmentsResponse) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
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

    eventSource.onstatuschange = (status) => {
        onStatusChange?.(status);
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
 * Crear conexión SSE para recibir citas en progreso de carga general
 */
export const createGeneralCargoAppointmentsSSEConnection = (
    onData: (data: GeneralCargoAppointmentsResponse) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
): SSEConnection => {
    const eventSource = createAuthSSE('/appointments/in-progress/general-cargo/stream');

    eventSource.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            onData(parsed);
        } catch (error) {
            console.error('Error parseando datos SSE citas carga general:', error);
            onError?.(new Error('Error al procesar datos de citas de carga general'));
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error en conexión SSE citas carga general:', error);
        onError?.(new Error('Error en conexión de citas en progreso de carga general'));
    };

    eventSource.onstatuschange = (status) => {
        onStatusChange?.(status);
    };

    return eventSource;
};

/**
 * Obtener citas en progreso de carga general (llamada única REST)
 */
export const getGeneralCargoAppointmentsInProgress = async (): Promise<GeneralCargoAppointmentsResponse> => {
    const response = await get('/appointments/in-progress/general-cargo');

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener citas en progreso de carga general');
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
    const response = await get('/appointments/pending');

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener citas pendientes');
    }

    return response.json();
};

/**
 * Obtener datos de impresión EIR por id de cita.
 */
export const getAppointmentEirPrintData = async (
    appointmentId: string,
): Promise<AppointmentEirPrintData> => {
    const response = await get(`/appointments/in-progress/${encodeURIComponent(appointmentId)}/eir-print-data`);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener datos para impresión EIR');
    }

    return response.json();
};

/**
 * Obtener datos de impresión EIR por id de cita (modo pruebas).
 * Consulta directa en backend, sin depender del listado en progreso.
 */
export const getAppointmentEirPrintDataTest = async (
    appointmentId: string,
): Promise<AppointmentEirPrintData> => {
    const response = await get(`/appointments/test/${encodeURIComponent(appointmentId)}/eir-print-data`);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al obtener datos para impresión EIR (test)');
    }

    return response.json();
};

const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const numberOrDash = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return String(value);
};

/**
 * Abre nueva ventana A4 e imprime EIR.
 */
export const openEirPrintWindow = (
    data: AppointmentEirPrintData,
    options?: { autoPrint?: boolean },
): void => {
    if (!data.hasEir || !data.eir) {
        alert('No existe EIR para esta cita.');
        return;
    }

    const autoPrint = options?.autoPrint ?? true;

    const splitLines = (value: string | null | undefined): string[] => {
        if (!value || value === '-') return [];
        return value
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    };

    const toText = (value: unknown): string => {
        if (value === null || value === undefined) return '-';
        const asString = String(value).trim();
        return asString || '-';
    };

    const mapToEirComponentData = (payload: AppointmentEirPrintData): EIRData => {
        const eir = payload.eir!;
        const now = new Date();

        const printDate = now.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const printTime = now.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        return {
            printDate,
            printTime,
            eirNumber: toText(eir.codigo),

            manifest: toText(payload.bookingInfo.manifiesto),
            voyage: toText(payload.bookingInfo.viaje),
            vesselName: toText(payload.bookingInfo.nave),
            shippingLine: toText(eir.lineaNaviera),
            startDate: formatDateTime(eir.inicio),
            finishedDate: formatDateTime(eir.fin),
            technician: toText(eir.tecnico),

            gate: toText(eir.gate),

            container: toText(eir.contenedor),
            iso: toText(eir.iso),
            kind: toText(eir.tipo),
            tare: numberOrDash(eir.tara),
            maxNet: numberOrDash(eir.pesoMaximo),
            maxGross: numberOrDash(eir.pesoBruto),
            state: toText(eir.estado),
            outcome: toText(eir.resultado),
            classification: toText(eir.clasificacion),
            manufacturing: toText(eir.fabricacion),
            condition: toText(eir.condicion),
            precincts: toText(eir.precintos),

            booking: toText(payload.bookingInfo.booking || eir.booking),
            licencePlate: toText(eir.placa),
            fullName: toText(eir.chofer),
            merchandise: toText(payload.bookingInfo.mercaderia),

            humidity: toText(eir.humedad),
            ventilation: toText(eir.ventilacion),
            technology: toText(eir.tecnologia),
            tempBooking: toText(eir.temperaturaBooking || payload.bookingInfo.tempRequerida),
            tempAdjust: '-',
            tempLoad: toText(eir.temperatura),
            o2: toText(eir.o2),
            co2: toText(eir.co2),

            locationObservations: [
                { location: 'Door', observations: splitLines(eir.door) },
                { location: 'Front', observations: splitLines(eir.front) },
                { location: 'Left Side', observations: splitLines(eir.leftSide) },
                { location: 'Right Side', observations: splitLines(eir.rightSide) },
                { location: 'Top(Roof)', observations: splitLines(eir.topRoof) },
                { location: 'Inner', observations: splitLines(eir.inner) },
                { location: 'Understructure', observations: splitLines(eir.understructure) },
            ],
            generalObservations: eir.observaciones,

            technicianName: toText(eir.tecnico),

            damages: payload.damages.map((damage) => ({
                location: toText(damage.location),
                damageType: toText(damage.damageType),
                component: toText(damage.component),
                repairMethod: toText(damage.repairMethod),
                responsible: toText(damage.responsible),
                quantity: numberOrDash(damage.quantity),
                eirInspectionNbr: toText(damage.eirNbr),
                length: numberOrDash(damage.length),
                width: numberOrDash(damage.width),
                area: numberOrDash(damage.area),
            })),
        };
    };

    const copyStylesToPrintWindow = (printWindow: Window): void => {
        const sourceNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
        sourceNodes.forEach((node) => {
            printWindow.document.head.appendChild(node.cloneNode(true));
        });
    };

    const printWindow = window.open('', '_blank', 'width=1024,height=900');

    if (!printWindow) {
        alert('No se pudo abrir la ventana de impresión. Verifique el bloqueador de pop-ups.');
        return;
    }

    const componentData = mapToEirComponentData(data);

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EIR ${componentData.eirNumber}</title>
  <style>
    @page { size: A4; margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; }
  </style>
</head>
<body>
  <div id="eir-print-root"></div>
</body>
</html>`);
    printWindow.document.close();

    copyStylesToPrintWindow(printWindow);

    const root = printWindow.document.getElementById('eir-print-root');
    if (!root) {
        alert('No se pudo inicializar la vista de impresión del EIR.');
        return;
    }

    const app = createApp({
        render: () => h(EIRPrint, { data: componentData, logoUrl: '/logo_tpp.png' }),
    });

    app.mount(root);

    if (autoPrint) {
        printWindow.setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 350);
    }

    printWindow.addEventListener('beforeunload', () => {
        app.unmount();
    });
};
