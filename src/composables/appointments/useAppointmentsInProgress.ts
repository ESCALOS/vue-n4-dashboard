import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { AppointmentInProgress, AppointmentsResponse } from '../../types/appointments/AppointmentInProgress';
import { STAGE_LABELS } from '../../types/appointments/AppointmentInProgress';
import { createAppointmentsSSEConnection } from '../../services/appointmentsService';
import type { SSEConnection } from '../../services/httpClient';
import type { SSEConnectionStatus } from '../../services/httpClient';
import {
    calculateTiempoAtencion,
    calculateTiempoStage,
    getTimeAtencionClass,
    getTimeStageClass
} from '../../utils/appointments/timeCalculations';

export function useAppointmentsInProgress() {
    // ============================================
    // STATE
    // ============================================
    const appointments = ref<AppointmentInProgress[]>([]);
    const count = ref(0);
    const lastUpdate = ref<string | null>(null);
    const isLoading = ref(true);
    const isConnected = ref(false);
    const isDegraded = ref(false);
    const error = ref<string | null>(null);
    const connectionNotice = ref<string | null>(null);
    const connectionLabel = computed(() => {
        if (isConnected.value) return 'Conectado';
        if (isDegraded.value) return 'Degradado';
        return 'Desconectado';
    });

    // Filters
    const filterNave = ref('');
    const filterLinea = ref('');
    const filterCliente = ref('');
    const filterTecnologia = ref('');
    const filterProducto = ref('');
    const filterStage = ref('');
    const filterTipo = ref('');
    const searchQuery = ref('');

    let eventSource: SSEConnection | null = null;

    // ============================================
    // COMPUTED - FILTER OPTIONS (dinámicos)
    // ============================================
    const naveOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.nave).filter(Boolean))].sort(),
    );
    const lineaOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.linea).filter(Boolean))].sort(),
    );
    const clienteOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.cliente).filter(Boolean))].sort(),
    );
    const tecnologiaOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.tecnologia).filter(Boolean))].sort(),
    );
    const productoOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.producto).filter(Boolean))].sort(),
    );
    const stageOptions = computed(() => {
        const raw = [...new Set(appointments.value.map((a) => a.stage).filter(Boolean))];
        return raw.map((s) => ({ value: s, label: STAGE_LABELS[s] || s }));
    });
    const tipoOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.tipo).filter(Boolean))].sort(),
    );

    // ============================================
    // COMPUTED - FILTERED DATA
    // ============================================
    const filteredAppointments = computed(() => {
        let data = appointments.value;

        if (filterNave.value) {
            data = data.filter((a) => a.nave === filterNave.value);
        }
        if (filterLinea.value) {
            data = data.filter((a) => a.linea === filterLinea.value);
        }
        if (filterCliente.value) {
            data = data.filter((a) => a.cliente === filterCliente.value);
        }
        if (filterTecnologia.value) {
            data = data.filter((a) => a.tecnologia === filterTecnologia.value);
        }
        if (filterProducto.value) {
            data = data.filter((a) => a.producto === filterProducto.value);
        }
        if (filterStage.value) {
            data = data.filter((a) => a.stage === filterStage.value);
        }
        if (filterTipo.value) {
            data = data.filter((a) => a.tipo === filterTipo.value);
        }
        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase();
            data = data.filter(
                (a) =>
                    a.cita?.toLowerCase().includes(q) ||
                    a.contenedor?.toLowerCase().includes(q) ||
                    a.booking?.toLowerCase().includes(q) ||
                    a.placa?.toLowerCase().includes(q),
            );
        }

        return data;
    });

    const hasActiveFilters = computed(() =>
        !!(filterNave.value || filterLinea.value || filterCliente.value ||
            filterTecnologia.value || filterProducto.value || filterStage.value ||
            filterTipo.value || searchQuery.value),
    );

    // ============================================
    // METHODS
    // ============================================
    function clearFilters() {
        filterNave.value = '';
        filterLinea.value = '';
        filterCliente.value = '';
        filterTecnologia.value = '';
        filterProducto.value = '';
        filterStage.value = '';
        filterTipo.value = '';
        searchQuery.value = '';
    }

    function handleSSEData(response: AppointmentsResponse) {
        appointments.value = response.data;
        count.value = response.count;
        lastUpdate.value = response.timestamp;
        isLoading.value = false;
        isConnected.value = true;
        isDegraded.value = false;
        connectionNotice.value = null;
        error.value = null;
    }

    function handleSSEError(err: Error) {
        if (!lastUpdate.value) {
            error.value = err.message;
        } else {
            connectionNotice.value = 'Conexión inestable. Reintentando automáticamente...';
        }
        isConnected.value = false;
    }

    function handleSSEStatus(status: SSEConnectionStatus) {
        if (status === 'connected') {
            isConnected.value = true;
            isDegraded.value = false;
            connectionNotice.value = null;
            error.value = null;
            return;
        }

        if (status === 'degraded') {
            isConnected.value = false;
            isDegraded.value = true;
            connectionNotice.value = 'Sin eventos recientes. Activando modo degradado...';
            return;
        }

        if (status === 'reconnecting') {
            isConnected.value = false;
            isDegraded.value = true;
            connectionNotice.value = 'Reconectando stream en segundo plano...';
            return;
        }

        if (status === 'backend-down') {
            isConnected.value = false;
            isDegraded.value = true;
            connectionNotice.value = 'Backend no disponible (health falló). Mostrando últimos datos.';
            return;
        }

        if (status === 'unauthorized') {
            isConnected.value = false;
            isDegraded.value = false;
            connectionNotice.value = null;
            error.value = 'Sesión expirada. Vuelva a iniciar sesión.';
        }
    }

    function connect() {
        disconnect();
        isLoading.value = true;
        error.value = null;
        connectionNotice.value = 'Conectando al stream...';
        eventSource = createAppointmentsSSEConnection(
            handleSSEData,
            handleSSEError,
            handleSSEStatus,
        );
    }

    function disconnect() {
        if (eventSource) {
            eventSource.close();
            eventSource = null;
            isConnected.value = false;
            isDegraded.value = false;
            connectionNotice.value = null;
        }
    }

    /** Formatear tiempo en minutos a texto legible */
    function formatTiempo(minutos: number | null): string {
        if (minutos === null || minutos === undefined) return '—';
        if (minutos < 0) return '—';
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    }

    /**
     * Calculate Tiempo de Atención (attention time) for an appointment
     * Time elapsed from PreGate to now
     */
    function getTiempoAtencion(appointment: AppointmentInProgress): number | null {
        return calculateTiempoAtencion(appointment.fechaPreGate);
    }

    /**
     * Calculate Tiempo Stage (stage time) for an appointment
     * Time elapsed from current stage to now
     */
    function getTiempoStage(appointment: AppointmentInProgress): number | null {
        return calculateTiempoStage(appointment.fechaStage);
    }

    /**
     * Get CSS class for time duration indicator based on Tiempo de Atención
     */
    function getTiempoClass(minutos: number | null): string {
        return getTimeAtencionClass(minutos);
    }

    /**
     * Get CSS class for Tiempo Stage or Tiempo Efectivo
     */
    function getTiempoStageClass(minutos: number | null): string {
        return getTimeStageClass(minutos);
    }

    /** Formatear fecha */
    function formatFecha(fecha: string | null): string {
        if (!fecha) return '—';
        const d = new Date(fecha);
        return d.toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }

    /** Obtener label legible del stage */
    function getStageLabel(stage: string): string {
        return STAGE_LABELS[stage] || stage;
    }

    /** Clase CSS según el stage */
    function getStageClass(stage: string): string {
        switch (stage) {
            case 'tranquera':
                return 'stage-tranquera';
            case 'pre_gate':
                return 'stage-pregate';
            case 'gate_in':
            case 'ingate':
                return 'stage-gatein';
            case 'yard':
                return 'stage-yard';
            default:
                return '';
        }
    }

    // ============================================
    // LIFECYCLE
    // ============================================
    onMounted(() => {
        connect();
    });

    onUnmounted(() => {
        disconnect();
    });

    return {
        // State
        appointments,
        filteredAppointments,
        count,
        lastUpdate,
        isLoading,
        isConnected,
        isDegraded,
        error,
        connectionNotice,
        connectionLabel,

        // Filters
        filterNave,
        filterLinea,
        filterCliente,
        filterTecnologia,
        filterProducto,
        filterStage,
        filterTipo,
        searchQuery,
        hasActiveFilters,

        // Filter options
        naveOptions,
        lineaOptions,
        clienteOptions,
        tecnologiaOptions,
        productoOptions,
        stageOptions,
        tipoOptions,

        // Methods
        clearFilters,
        connect,
        disconnect,
        formatTiempo,
        formatFecha,
        getStageLabel,
        getTiempoClass,
        getTiempoStageClass,
        getStageClass,
        // New time calculation methods
        getTiempoAtencion,
        getTiempoStage,
    };
}
