import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';
import LoginView from './pages/auth/LoginView.vue';
import NoAccessView from './pages/NoAccessView.vue';
import {
    VIEW_DEFINITIONS,
    getFirstAccessiblePath,
} from './config/viewPrivileges';
import type { Privilege } from './config/viewPrivileges';

const view = (id: string) => VIEW_DEFINITIONS.find((item) => item.id === id)!;

// Lazy-load rutas para optimizar bundle inicial
const GeneralCargoView = () => import('./pages/monitoring/GeneralCargoView.vue');
const ContainersView = () => import('./pages/monitoring/ContainersView.vue');
const PendingAppointmentsView = () => import('./pages/appointments/PendingAppointmentsView.vue');
const InProgressAppointmentsView = () => import('./pages/appointments/InProgressAppointmentsView.vue');
const GeneralCargoInProgressAppointmentsView = () => import('./pages/appointments/GeneralCargoInProgressAppointmentsView.vue');
const UsersView = () => import('./pages/admin/UsersView.vue');
const TprReportView = () => import('./pages/reports/TprReportView.vue');

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
            name: 'home',
            component: NoAccessView,
        },
        {
            path: view('general-cargo').path,
            name: view('general-cargo').routeName,
            component: GeneralCargoView,
            meta: { requiredPrivilege: view('general-cargo').privilege },
        },
        {
            path: view('containers').path,
            name: view('containers').routeName,
            component: ContainersView,
            meta: { requiredPrivilege: view('containers').privilege },
        },
        {
            path: view('pending-appointments').path,
            name: view('pending-appointments').routeName,
            component: PendingAppointmentsView,
            meta: { requiredPrivilege: view('pending-appointments').privilege },
        },
        {
            path: view('in-progress-appointments').path,
            name: view('in-progress-appointments').routeName,
            component: InProgressAppointmentsView,
            meta: { requiredPrivilege: view('in-progress-appointments').privilege },
        },
        {
            path: view('general-cargo-in-progress-appointments').path,
            name: view('general-cargo-in-progress-appointments').routeName,
            component: GeneralCargoInProgressAppointmentsView,
            meta: { requiredPrivilege: view('general-cargo-in-progress-appointments').privilege },
        },
        {
            path: view('tpr-report').path,
            name: view('tpr-report').routeName,
            component: TprReportView,
            meta: { requiredPrivilege: view('tpr-report').privilege },
        },
        {
            path: '/sin-acceso',
            name: 'no-access',
            component: NoAccessView,
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
        if (authStore.canAccess(view('general-cargo').privilege)) {
            import('./pages/monitoring/GeneralCargoView.vue').catch(() => { });
        }
        if (authStore.canAccess(view('pending-appointments').privilege)) {
            import('./pages/appointments/PendingAppointmentsView.vue').catch(() => { });
        }
        if (authStore.canAccess(view('general-cargo-in-progress-appointments').privilege)) {
            import('./pages/appointments/GeneralCargoInProgressAppointmentsView.vue').catch(() => { });
        }
    }
});

router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    if (to.meta.public) {
        // If already authenticated and going to login, redirect to home
        if (to.name === 'login' && authStore.isAuthenticated) {
            await authStore.syncUser();
            return getFirstAccessiblePath(authStore.user?.role, authStore.user?.privileges);
        }
        return true;
    }

    // Protected routes: require authentication
    if (!authStore.isAuthenticated) {
        return { name: 'login' };
    }

    await authStore.syncUser();

    if (!authStore.isAuthenticated) {
        return { name: 'login' };
    }

    if (to.name === 'home') {
        return getFirstAccessiblePath(authStore.user?.role, authStore.user?.privileges);
    }

    // Admin-only routes
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return getFirstAccessiblePath(authStore.user?.role, authStore.user?.privileges);
    }

    const requiredPrivilege = to.meta.requiredPrivilege as Privilege | undefined;
    if (requiredPrivilege && !authStore.canAccess(requiredPrivilege)) {
        return getFirstAccessiblePath(authStore.user?.role, authStore.user?.privileges);
    }

    return true;
});

export default router;
