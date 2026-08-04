import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { PRIVILEGES, VIEW_DEFINITIONS } from '../../config/viewPrivileges';
import UsersView from './UsersView.vue';
import { usersService } from '../../services/usersService';

vi.mock('../../services/usersService', () => ({
    usersService: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
    },
}));

describe('UsersView privilege assignment', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.mocked(usersService.getAll).mockResolvedValue([]);
        vi.mocked(usersService.create).mockResolvedValue({
            id: 'new-user',
            email: 'new@example.com',
            name: null,
            role: 'USER',
            privileges: [],
            isActive: true,
            createdAt: new Date().toISOString(),
        });
    });

    it('renders all views and sends selected privileges when creating a user', async () => {
        const wrapper = mount(UsersView, {
            global: { stubs: { Teleport: true } },
        });
        await flushPromises();

        await wrapper.get('.btn-primary').trigger('click');
        expect(wrapper.findAll('.privilege-option')).toHaveLength(VIEW_DEFINITIONS.length);

        await wrapper.get('input[type="email"]').setValue('new@example.com');
        await wrapper.get('input[type="password"]').setValue('secret12');
        await wrapper.get('.privilege-option input').setValue(true);
        await wrapper.get('form').trigger('submit');
        await flushPromises();

        expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({
            privileges: [PRIVILEGES.GENERAL_CARGO_MONITORING],
        }));
    });
});
