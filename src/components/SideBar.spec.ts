import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import SideBar from './SideBar.vue';
import { useAuthStore } from '../stores/auth';
import { PRIVILEGES } from '../config/viewPrivileges';

vi.mock('./ChangePasswordModal.vue', () => ({
    default: { template: '<div />' },
}));

describe('SideBar view privileges', () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
    });

    it('shows only the views assigned to a regular user', async () => {
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
        });
        await router.push('/');
        await router.isReady();

        const authStore = useAuthStore();
        authStore.user = {
            id: 'user-id',
            email: 'user@example.com',
            name: 'User',
            role: 'USER',
            privileges: [PRIVILEGES.CONTAINER_MONITORING],
        };

        const wrapper = mount(SideBar, { global: { plugins: [router] } });

        expect(wrapper.text()).toContain('Contenedores');
        expect(wrapper.text()).not.toContain('Carga General');
        expect(wrapper.text()).not.toContain('Pendientes');
        expect(wrapper.text()).not.toContain('Reporte TPR');
    });
});
