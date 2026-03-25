import type { SSEConnection, SSEConnectionStatus } from './httpClient';

export const createMockSSEConnection = <T>(
    getData: () => T,
    onData: (data: T) => void,
    onError?: (error: Error) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void,
    intervalMs = 0,
): SSEConnection => {
    let closed = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const emitData = () => {
        if (closed) return;

        try {
            onData(getData());
        } catch (error) {
            onError?.(error instanceof Error ? error : new Error('Error en stream mock'));
        }
    };

    const connectTimer = setTimeout(() => {
        if (closed) return;
        onStatusChange?.('connected');
        emitData();

        if (intervalMs > 0) {
            interval = setInterval(() => {
                emitData();
            }, intervalMs);
        }
    }, 0);

    return {
        onmessage: null,
        onerror: null,
        onstatuschange: null,
        close() {
            if (closed) return;
            closed = true;
            clearTimeout(connectTimer);
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            onStatusChange?.('closed');
        },
    };
};
