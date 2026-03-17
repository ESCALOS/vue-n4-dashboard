import { useAuthStore } from '../stores/auth';
import router from '../router';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const HEARTBEAT_TIMEOUT_MS = 30_000;
const WATCHDOG_INTERVAL_MS = 5_000;
const CONNECT_TIMEOUT_MS = 8_000;
const RECONNECT_BASE_DELAY_MS = 2_000;
const RECONNECT_MAX_DELAY_MS = 10_000;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

function normalizeToken(token: string | null): string | null {
    if (!token) return null;
    const trimmed = token.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return null;
    }
    return trimmed;
}

async function refreshSession(authStore: ReturnType<typeof useAuthStore>): Promise<boolean> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = authStore.refresh();
    }

    const refreshed = await (refreshPromise ?? authStore.refresh());
    isRefreshing = false;
    refreshPromise = null;
    return refreshed;
}

async function checkBackendHealth(): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
        });

        return response.ok;
    } catch {
        return false;
    } finally {
        clearTimeout(timeout);
    }
}

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
    const currentAccessToken = normalizeToken(authStore.accessToken);

    const headers = new Headers(init.headers);

    if (currentAccessToken) {
        headers.set('Authorization', `Bearer ${currentAccessToken}`);
    }

    if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(input, { ...init, headers });

    if (response.status === 401 && normalizeToken(authStore.refreshToken)) {
        const refreshed = await refreshSession(authStore);

        if (refreshed) {
            // Retry the original request with the new token
            const refreshedToken = normalizeToken(authStore.accessToken);
            if (!refreshedToken) {
                router.push('/login');
                throw new Error('Session expired');
            }

            headers.set('Authorization', `Bearer ${refreshedToken}`);
            return fetch(input, { ...init, headers });
        }

        const hasRefreshToken = !!normalizeToken(authStore.refreshToken);
        if (hasRefreshToken) {
            throw new Error('Servidor no disponible temporalmente');
        }

        router.push('/login');
        throw new Error('Session expired');
    }

    if (response.status === 401) {
        await authStore.logout();
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
    onstatuschange: ((status: SSEConnectionStatus) => void) | null;
    close(): void;
}

export type SSEConnectionStatus =
    | 'connected'
    | 'degraded'
    | 'reconnecting'
    | 'backend-down'
    | 'unauthorized'
    | 'closed';

export function createAuthSSE(path: string): SSEConnection {
    const authStore = useAuthStore();

    let currentES: EventSource | null = null;
    let closed = false;
    let connectTimeout: ReturnType<typeof setTimeout> | null = null;
    let watchdogInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let lastEventAt = Date.now();
    let reconnectAttempts = 0;
    let reconnecting = false;
    let lastStatus: SSEConnectionStatus | null = null;

    const connection: SSEConnection = {
        onmessage: null,
        onerror: null,
        onstatuschange: null,
        close() {
            closed = true;
            emitStatus('closed');
            cleanupTimers();
            currentES?.close();
            currentES = null;
        },
    };

    function emitStatus(status: SSEConnectionStatus) {
        if (lastStatus === status) return;
        lastStatus = status;
        connection.onstatuschange?.(status);
    }

    function emitError(reason: string) {
        connection.onerror?.(
            new CustomEvent('sse-error', {
                detail: { reason },
            }),
        );
    }

    function touchEventTimestamp() {
        lastEventAt = Date.now();
    }

    function cleanupTimers() {
        if (connectTimeout) {
            clearTimeout(connectTimeout);
            connectTimeout = null;
        }

        if (watchdogInterval) {
            clearInterval(watchdogInterval);
            watchdogInterval = null;
        }

        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    }

    function closeCurrentES() {
        if (currentES) {
            currentES.close();
            currentES = null;
        }
    }

    function startWatchdog() {
        if (watchdogInterval) {
            clearInterval(watchdogInterval);
        }

        watchdogInterval = setInterval(() => {
            if (closed || reconnecting) return;

            const silentForMs = Date.now() - lastEventAt;
            if (silentForMs < HEARTBEAT_TIMEOUT_MS) {
                return;
            }

            emitStatus('degraded');
            emitError('watchdog-timeout');
            reconnect('watchdog-timeout');
        }, WATCHDOG_INTERVAL_MS);
    }

    async function onReconnectFailed(reason: string) {
        if (closed) return;

        reconnecting = false;
        emitError(reason);

        const isHealthy = await checkBackendHealth();
        if (!isHealthy) {
            emitStatus('backend-down');
            emitError('backend-down');
        }

        const delay = Math.min(
            RECONNECT_BASE_DELAY_MS * Math.max(1, reconnectAttempts),
            RECONNECT_MAX_DELAY_MS,
        );

        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
        }

        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            reconnect('scheduled-retry');
        }, delay);
    }

    function reconnect(reason: string) {
        if (closed || reconnecting) return;

        reconnecting = true;
        reconnectAttempts += 1;
        emitStatus('reconnecting');

        closeCurrentES();
        connect(reason);
    }

    function connect(reason = 'initial') {
        if (closed) return;

        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        const accessToken = normalizeToken(authStore.accessToken);
        if (!accessToken) {
            authStore.logout().finally(() => {
                if (!closed) {
                    emitStatus('unauthorized');
                    emitError('missing-token');
                    router.push('/login');
                }
            });
            return;
        }

        const separator = path.includes('?') ? '&' : '?';
        const fullUrl = `${API_BASE_URL}${path}${separator}token=${encodeURIComponent(accessToken)}`;
        currentES = new EventSource(fullUrl);
        touchEventTimestamp();

        connectTimeout = setTimeout(() => {
            if (closed || !currentES || currentES.readyState === EventSource.OPEN) {
                return;
            }

            closeCurrentES();
            onReconnectFailed(`${reason}-connect-timeout`);
        }, CONNECT_TIMEOUT_MS);

        currentES.onopen = () => {
            if (connectTimeout) {
                clearTimeout(connectTimeout);
                connectTimeout = null;
            }

            reconnecting = false;
            reconnectAttempts = 0;
            touchEventTimestamp();
            emitStatus('connected');
        };

        currentES.onmessage = (event) => {
            touchEventTimestamp();
            connection.onmessage?.(event);
        };

        currentES.addEventListener('heartbeat', () => {
            touchEventTimestamp();
        });

        currentES.onerror = async () => {
            if (closed) return;

            emitStatus('degraded');
            emitError('sse-error');

            if (connectTimeout) {
                clearTimeout(connectTimeout);
                connectTimeout = null;
            }

            // readyState CLOSED = permanent failure (HTTP 401, etc.)
            if (currentES?.readyState === EventSource.CLOSED) {
                closeCurrentES();

                if (closed) return;

                // Attempt to refresh the token and reconnect
                const refreshed = await refreshSession(authStore);
                if (refreshed && !closed) {
                    reconnect('refresh-ok');
                    return;
                }

                const hasRefreshToken = !!normalizeToken(authStore.refreshToken);
                if (!hasRefreshToken && !closed) {
                    emitStatus('unauthorized');
                    emitError('unauthorized');
                    router.push('/login');
                    return;
                }

                onReconnectFailed('refresh-failed');
                return;
            }

            // readyState CONNECTING = transiente. Activamos fallback de reconexión.
            reconnect('eventsource-connecting');
        };

        startWatchdog();
    }

    connect();
    return connection;
}
