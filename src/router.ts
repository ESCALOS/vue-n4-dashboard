import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';
import LoginView from './pages/auth/LoginView.vue';
import { USE_MOCK_DATA } from './config/mockMode';

// Lazy-load rutas para optimizar bundle inicial
const GeneralCargoView = () => import('./pages/monitoring/GeneralCargoView.vue');
const ContainersView = () => import('./pages/monitoring/ContainersView.vue');
const PendingAppointmentsView = () => import('./pages/appointments/PendingAppointmentsView.vue');
const InProgressAppointmentsView = () => import('./pages/appointments/InProgressAppointmentsView.vue');
const UsersView = () => import('./pages/admin/UsersView.vue');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { public: true },
        },
        {
            path: '/',
            redirect: '/monitoreo/carga-general'
        },
        {
            path: '/monitoreo/carga-general',
            name: 'general-cargo',
            component: GeneralCargoView
        },
        {
            path: '/monitoreo/contenedores',
            name: 'containers',
            component: ContainersView
        },
        {
            path: '/citas/pendientes',
            name: 'pending-appointments',
            component: PendingAppointmentsView
        },
        {
            path: '/citas/en-proceso',
            name: 'in-progress-appointments',
            component: InProgressAppointmentsView
        },
        {
            path: '/admin/usuarios',
            name: 'admin-users',
            component: UsersView,
            meta: { requiresAdmin: true },
        },
    ]
});

// Precarga anticipada de rutas comunes después del login para mejor UX
router.afterEach(() => {
    const authStore = useAuthStore();

    // Si está autenticado, precarga monitoreo en background
    if (authStore.isAuthenticated) {
        import('./pages/monitoring/GeneralCargoView.vue').catch(() => { });
        import('./pages/appointments/PendingAppointmentsView.vue').catch(() => { });
    }
});

router.beforeEach((to) => {
    if (USE_MOCK_DATA) {
        if (to.name === 'login') {
            return '/';
        }

        return true;
    }

    const authStore = useAuthStore();

    if (to.meta.public) {
        // If already authenticated and going to login, redirect to home
        if (to.name === 'login' && authStore.isAuthenticated) {
            return '/';
        }
        return true;
    }

    // Protected routes: require authentication
    if (!authStore.isAuthenticated) {
        return { name: 'login' };
    }

    // Admin-only routes
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return '/';
    }

    return true;
});

export default router;
