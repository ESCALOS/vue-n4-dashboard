import { ref, computed, onMounted, onUnmounted } from 'vue';
import type {
    GeneralCargoAppointmentInProgress,
    GeneralCargoAppointmentsResponse,
} from '../../types/appointments/GeneralCargoAppointmentInProgress';
import { GENERAL_CARGO_STAGE_LABELS } from '../../types/appointments/GeneralCargoAppointmentInProgress';
import { createGeneralCargoAppointmentsSSEConnection } from '../../services/appointmentsService';
import type { SSEConnection, SSEConnectionStatus } from '../../services/httpClient';
import { getTimeAtencionClass, getTimeStageClass } from '../../utils/appointments/timeCalculations';

export function useGeneralCargoAppointmentsInProgress() {
    const appointments = ref<GeneralCargoAppointmentInProgress[]>([]);
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

    const searchQuery = ref('');
    const filterStage = ref('');
    const filterTipoOperativa = ref('');
    const filterCliente = ref('');
    const filterProducto = ref('');
    const filterNave = ref('');

    let eventSource: SSEConnection | null = null;

    const stageOptions = computed(() => {
        const raw = [...new Set(appointments.value.map((a) => a.stage).filter(Boolean))];
        return raw.map((value) => ({ value, label: GENERAL_CARGO_STAGE_LABELS[value] || value }));
    });

    const tipoOperativaOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.tipoOperativa).filter(Boolean))].sort(),
    );

    const clienteOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.cliente).filter(Boolean))].sort(),
    );

    const productoOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.producto).filter(Boolean))].sort(),
    );

    const naveOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.nave).filter(Boolean))].sort(),
    );

    const filteredAppointments = computed(() => {
        let data = appointments.value;

        if (filterStage.value) {
            data = data.filter((a) => a.stage === filterStage.value);
        }
        if (filterTipoOperativa.value) {
            data = data.filter((a) => a.tipoOperativa === filterTipoOperativa.value);
        }
        if (filterCliente.value) {
            data = data.filter((a) => a.cliente === filterCliente.value);
        }
        if (filterProducto.value) {
            data = data.filter((a) => a.producto === filterProducto.value);
        }
        if (filterNave.value) {
            data = data.filter((a) => a.nave === filterNave.value);
        }
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            data = data.filter((a) =>
                a.permiso?.toLowerCase().includes(query) ||
                a.tracto?.toLowerCase().includes(query) ||
                a.chassis?.toLowerCase().includes(query) ||
                a.cliente?.toLowerCase().includes(query),
            );
        }

        return data;
    });

    const hasActiveFilters = computed(() =>
        !!(
            searchQuery.value ||
            filterStage.value ||
            filterTipoOperativa.value ||
            filterCliente.value ||
            filterProducto.value ||
            filterNave.value
        ),
    );

    function clearFilters() {
        searchQuery.value = '';
        filterStage.value = '';
        filterTipoOperativa.value = '';
        filterCliente.value = '';
        filterProducto.value = '';
        filterNave.value = '';
    }

    function handleSSEData(response: GeneralCargoAppointmentsResponse) {
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
            connectionNotice.value = 'Backend no disponible. Mostrando últimos datos.';
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
        eventSource = createGeneralCargoAppointmentsSSEConnection(
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

    function formatTiempo(minutos: number | null): string {
        if (minutos === null || minutos === undefined || minutos < 0) return '—';
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    }

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

    function getStageLabel(stage: string): string {
        return GENERAL_CARGO_STAGE_LABELS[stage] || stage;
    }

    function getStageClass(stage: string): string {
        switch (stage) {
            case 'tranquera':
                return 'stage-tranquera';
            case 'pre_gate':
                return 'stage-pregate';
            case 'gate_in':
                return 'stage-gatein';
            case 'zona_de_espera':
                return 'stage-zonaespera';
            case 'inicio_de_carguio':
                return 'stage-iniciocarguio';
            case 'yard':
                return 'stage-yard';
            case 'gate_out':
                return 'stage-gateout';
            default:
                return '';
        }
    }

    function getTiempoClass(minutos: number | null): string {
        return getTimeAtencionClass(minutos);
    }

    function getTiempoStageClass(minutos: number | null): string {
        return getTimeStageClass(minutos);
    }

    onMounted(() => connect());
    onUnmounted(() => disconnect());

    return {
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
        searchQuery,
        filterStage,
        filterTipoOperativa,
        filterCliente,
        filterProducto,
        filterNave,
        hasActiveFilters,
        stageOptions,
        tipoOperativaOptions,
        clienteOptions,
        productoOptions,
        naveOptions,
        clearFilters,
        connect,
        formatTiempo,
        formatFecha,
        getStageLabel,
        getStageClass,
        getTiempoClass,
        getTiempoStageClass,
    };
}
