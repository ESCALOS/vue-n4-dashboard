import { createRouter, createWebHistory } from 'vue-router';
import GeneralCargoView from './pages/monitoring/GeneralCargoView.vue';
import ContainersView from './pages/monitoring/ContainersView.vue';
import PendingAppointmentsView from './pages/appointments/PendingAppointmentsView.vue';
import InProgressAppointmentsView from './pages/appointments/InProgressAppointmentsView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
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
        }
    ]
});

export default router;
