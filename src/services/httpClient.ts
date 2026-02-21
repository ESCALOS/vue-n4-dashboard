import { useAuthStore } from '../stores/auth';
import router from '../router';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Authenticated fetch wrapper.
 * - Injects Authorization header automatically.
 * - On 401, attempts token refresh and retries once.
 * - On refresh failure, redirects to /login.
 */
async function authFetch(
    input: string,
    init: RequestInit = {},
): Promise<Response> {
    const authStore = useAuthStore();

    const headers = new Headers(init.headers);

    if (authStore.accessToken) {
        headers.set('Authorization', `Bearer ${authStore.accessToken}`);
    }

    if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(input, { ...init, headers });

    if (response.status === 401 && authStore.refreshToken) {
        // Avoid multiple simultaneous refresh attempts
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = authStore.refresh();
        }

        const refreshed = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        if (refreshed) {
            // Retry the original request with the new token
            headers.set('Authorization', `Bearer ${authStore.accessToken}`);
            return fetch(input, { ...init, headers });
        }

        // Refresh failed — redirect to login
        router.push('/login');
        throw new Error('Session expired');
    }

    return response;
}

/**
 * Build a full URL from a relative path.
 */
function url(path: string): string {
    return `${API_BASE_URL}${path}`;
}

/**
 * GET request with auth.
 */
export async function get(path: string): Promise<Response> {
    return authFetch(url(path));
}

/**
 * POST request with auth.
 */
export async function post(path: string, body?: unknown): Promise<Response> {
    return authFetch(url(path), {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * PATCH request with auth.
 */
export async function patch(path: string, body?: unknown): Promise<Response> {
    return authFetch(url(path), {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * DELETE request with auth.
 */
export async function del(path: string, body?: unknown): Promise<Response> {
    return authFetch(url(path), {
        method: 'DELETE',
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * Create an authenticated EventSource connection (token via query param).
 */
export function createAuthSSE(path: string): EventSource {
    const authStore = useAuthStore();
    const separator = path.includes('?') ? '&' : '?';
    const fullUrl = `${API_BASE_URL}${path}${separator}token=${authStore.accessToken}`;
    return new EventSource(fullUrl);
}
