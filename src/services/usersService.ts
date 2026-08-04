import { get, post, patch, del } from './httpClient';
import type { Privilege } from '../config/viewPrivileges';

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'USER';
    privileges: Privilege[];
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateUserPayload {
    email: string;
    password: string;
    name?: string;
    role?: 'ADMIN' | 'USER';
    privileges?: Privilege[];
}

export interface UpdateUserPayload {
    name?: string;
    password?: string;
    role?: 'ADMIN' | 'USER';
    isActive?: boolean;
    privileges?: Privilege[];
}

export const usersService = {
    async getAll(): Promise<User[]> {
        const response = await get('/users');
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al obtener usuarios');
        }
        return response.json();
    },

    async create(payload: CreateUserPayload): Promise<User> {
        const response = await post('/users', payload);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al crear usuario');
        }
        return response.json();
    },

    async update(id: string, payload: UpdateUserPayload): Promise<User> {
        const response = await patch(`/users/${id}`, payload);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al actualizar usuario');
        }
        return response.json();
    },

    async remove(id: string): Promise<void> {
        const response = await del(`/users/${id}`);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al eliminar usuario');
        }
    },
};
