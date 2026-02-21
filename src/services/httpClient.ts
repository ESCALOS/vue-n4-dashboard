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
 * Lightweight wrapper around EventSource that handles token refresh.
 * When the connection drops due to an expired token (401 → readyState CLOSED),
 * it automatically refreshes the token and reconnects.
 */
export interface SSEConnection {
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    close(): void;
}

export function createAuthSSE(path: string): SSEConnection {
    const authStore = useAuthStore();

    let currentES: EventSource | null = null;
    let closed = false;

    const connection: SSEConnection = {
        onmessage: null,
        onerror: null,
        close() {
            closed = true;
            currentES?.close();
            currentES = null;
        },
    };

    function connect() {
        if (closed) return;

        const separator = path.includes('?') ? '&' : '?';
        const fullUrl = `${API_BASE_URL}${path}${separator}token=${authStore.accessToken}`;
        currentES = new EventSource(fullUrl);

        currentES.onmessage = (event) => {
            connection.onmessage?.(event);
        };

        currentES.onerror = async () => {
            // readyState CLOSED = permanent failure (HTTP 401, etc.)
            if (currentES?.readyState === EventSource.CLOSED) {
                currentES.close();
                currentES = null;

                if (closed) return;

                // Attempt to refresh the token and reconnect
                const refreshed = await authStore.refresh();
                if (refreshed && !closed) {
                    connect();
                } else if (!closed) {
                    connection.onerror?.(new Event('error'));
                    router.push('/login');
                }
            }
            // readyState CONNECTING = transient error, browser auto-retries
            // (shouldn't happen with expired token since server returns 401)
        };
    }

    connect();
    return connection;
}
