import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';
import LoginView from './pages/auth/LoginView.vue';
import GeneralCargoView from './pages/monitoring/GeneralCargoView.vue';
import ContainersView from './pages/monitoring/ContainersView.vue';
import PendingAppointmentsView from './pages/appointments/PendingAppointmentsView.vue';
import InProgressAppointmentsView from './pages/appointments/InProgressAppointmentsView.vue';
import UsersView from './pages/admin/UsersView.vue';

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

router.beforeEach((to) => {
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
