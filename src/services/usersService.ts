import { get, post, patch, del } from './httpClient';
import { USE_MOCK_DATA } from '../config/mockMode';
import usersMock from '../mocks/users/users.json';

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'USER';
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateUserPayload {
    email: string;
    password: string;
    name?: string;
    role?: 'ADMIN' | 'USER';
}

export interface UpdateUserPayload {
    name?: string;
    password?: string;
    role?: 'ADMIN' | 'USER';
    isActive?: boolean;
}

const usersMockSeed = usersMock as User[];
const usersState: User[] = usersMockSeed.map((user) => ({ ...user }));

const createId = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `usr-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

const findUserIndexById = (id: string): number => usersState.findIndex((user) => user.id === id);

export const usersService = {
    async getAll(): Promise<User[]> {
        if (USE_MOCK_DATA) {
            return usersState.map((user) => ({ ...user }));
        }

        const response = await get('/users');
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al obtener usuarios');
        }
        return response.json();
    },

    async create(payload: CreateUserPayload): Promise<User> {
        if (USE_MOCK_DATA) {
            const email = payload.email.trim().toLowerCase();
            const alreadyExists = usersState.some((user) => user.email.toLowerCase() === email);

            if (alreadyExists) {
                throw new Error('Ya existe un usuario con ese correo');
            }

            const now = new Date().toISOString();
            const newUser: User = {
                id: createId(),
                email,
                name: payload.name ?? null,
                role: payload.role ?? 'USER',
                isActive: true,
                createdAt: now,
                updatedAt: now,
            };

            usersState.push(newUser);
            return { ...newUser };
        }

        const response = await post('/users', payload);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al crear usuario');
        }
        return response.json();
    },

    async update(id: string, payload: UpdateUserPayload): Promise<User> {
        if (USE_MOCK_DATA) {
            const userIndex = findUserIndexById(id);
            if (userIndex < 0) {
                throw new Error('Usuario no encontrado');
            }

            const currentUser = usersState[userIndex];
            const updatedUser: User = {
                ...currentUser,
                ...payload,
                updatedAt: new Date().toISOString(),
            };

            usersState[userIndex] = updatedUser;
            return { ...updatedUser };
        }

        const response = await patch(`/users/${id}`, payload);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al actualizar usuario');
        }
        return response.json();
    },

    async remove(id: string): Promise<void> {
        if (USE_MOCK_DATA) {
            const userIndex = findUserIndexById(id);
            if (userIndex < 0) {
                throw new Error('Usuario no encontrado');
            }

            usersState.splice(userIndex, 1);
            return;
        }

        const response = await del(`/users/${id}`);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al eliminar usuario');
        }
    },
};
