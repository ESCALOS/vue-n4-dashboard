export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'USER';
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

export type AuthServiceErrorType = 'network' | 'auth' | 'server';

export class AuthServiceError extends Error {
    public readonly type: AuthServiceErrorType;
    public readonly status?: number;

    constructor(message: string, type: AuthServiceErrorType, status?: number) {
        super(message);
        this.type = type;
        this.status = status;
        this.name = 'AuthServiceError';
    }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function parseJsonSafely<T>(response: Response): Promise<T | null> {
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.includes('application/json')) {
        return null;
    }

    const raw = await response.text();
    if (!raw.trim()) {
        return null;
    }

    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
        } catch {
            throw new AuthServiceError('No hay conexión con el servidor', 'network');
        }

        const data = await parseJsonSafely<LoginResponse & { message?: string }>(response);

        if (!response.ok) {
            if (response.status === 401) {
                throw new AuthServiceError(
                    data?.message || 'Credenciales inválidas',
                    'auth',
                    response.status,
                );
            }

            throw new AuthServiceError(
                data?.message || 'Servidor no disponible',
                'server',
                response.status,
            );
        }

        if (!data?.accessToken || !data?.refreshToken || !data?.user) {
            throw new AuthServiceError('Respuesta inválida del servidor', 'server', response.status);
        }

        return data;
    },

    async refresh(refreshToken: string): Promise<RefreshResponse> {
        let response: Response;
        try {
            response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
        } catch {
            throw new AuthServiceError('No hay conexión con el servidor', 'network');
        }

        const data = await parseJsonSafely<RefreshResponse & { message?: string }>(response);

        if (!response.ok) {
            if (response.status === 401) {
                throw new AuthServiceError(
                    data?.message || 'Token expirado',
                    'auth',
                    response.status,
                );
            }

            throw new AuthServiceError(
                data?.message || 'Servidor no disponible',
                'server',
                response.status,
            );
        }

        if (!data?.accessToken || !data?.refreshToken) {
            throw new AuthServiceError('Respuesta inválida del servidor', 'server', response.status);
        }

        return data;
    },

    async logout(accessToken: string): Promise<void> {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
    },
};
