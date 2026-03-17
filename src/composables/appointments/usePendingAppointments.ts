import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { PendingAppointment, PendingAppointmentsResponse, AppointmentEstado } from '../../types/appointments/PendingAppointment';
import { ESTADO_LABELS } from '../../types/appointments/PendingAppointment';
import { createPendingAppointmentsSSEConnection } from '../../services/appointmentsService';
import type { SSEConnection } from '../../services/httpClient';
import type { SSEConnectionStatus } from '../../services/httpClient';

export function usePendingAppointments() {
    // ============================================
    // STATE
    // ============================================
    const appointments = ref<PendingAppointment[]>([]);
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
    const filterTipo = ref('');
    const filterEstado = ref('');
    const searchQuery = ref('');
    const hideExpired = ref(false);

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
    const tipoOptions = computed(() =>
        [...new Set(appointments.value.map((a) => a.tipo).filter(Boolean))].sort(),
    );
    const estadoOptions = computed(() => {
        const raw = [...new Set(appointments.value.map((a) => a.estado).filter(Boolean))];
        return raw.map((e) => ({ value: e, label: ESTADO_LABELS[e] || e }));
    });

    // ============================================
    // COMPUTED - FILTERED DATA
    // ============================================
    const filteredAppointments = computed(() => {
        let data = appointments.value;

        // Toggle: ocultar vencidas
        if (hideExpired.value) {
            data = data.filter((a) => a.estado !== 'vencida');
        }

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
        if (filterTipo.value) {
            data = data.filter((a) => a.tipo === filterTipo.value);
        }
        if (filterEstado.value) {
            data = data.filter((a) => a.estado === filterEstado.value);
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
            filterTecnologia.value || filterProducto.value ||
            filterTipo.value || filterEstado.value || searchQuery.value || hideExpired.value),
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
        filterTipo.value = '';
        filterEstado.value = '';
        searchQuery.value = '';
        hideExpired.value = false;
    }

    function handleSSEData(response: PendingAppointmentsResponse) {
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
        eventSource = createPendingAppointmentsSSEConnection(
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

    /** Obtener label legible del estado */
    function getEstadoLabel(estado: AppointmentEstado): string {
        return ESTADO_LABELS[estado] || estado;
    }

    /** Clase CSS para el badge de estado */
    function getEstadoClass(estado: AppointmentEstado): string {
        switch (estado) {
            case 'vencida':
                return 'estado-vencida';
            case 'activa':
                return 'estado-activa';
            case 'pendiente':
                return 'estado-pendiente';
            default:
                return '';
        }
    }

    /** Clase CSS para la fila según el estado */
    function getRowClass(estado: AppointmentEstado): string {
        switch (estado) {
            case 'vencida':
                return 'row-vencida';
            case 'activa':
                return 'row-activa';
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
        filterTipo,
        filterEstado,
        searchQuery,
        hideExpired,
        hasActiveFilters,

        // Filter options
        naveOptions,
        lineaOptions,
        clienteOptions,
        tecnologiaOptions,
        productoOptions,
        tipoOptions,
        estadoOptions,

        // Methods
        clearFilters,
        connect,
        disconnect,
        formatFecha,
        getEstadoLabel,
        getEstadoClass,
        getRowClass,
    };
}
