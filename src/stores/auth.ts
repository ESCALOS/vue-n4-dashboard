import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../services/authService';
import { AuthServiceError } from '../services/authService';
import type { AuthUser } from '../services/authService';
import { USE_MOCK_DATA } from '../config/mockMode';

const TOKEN_KEY = 'n4_access_token';
const REFRESH_KEY = 'n4_refresh_token';
const USER_KEY = 'n4_user';
const MOCK_ACCESS_TOKEN = 'mock-access-token';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token';

const MOCK_USER: AuthUser = {
    id: 'usr-admin-1',
    email: 'admin@n4.local',
    name: 'Administrador Demo',
    role: 'ADMIN',
};

function normalizeToken(value: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return null;
    }
    return trimmed;
}

function hasValidTokens(access: string | null, refresh: string | null): access is string {
    return !!normalizeToken(access) && !!normalizeToken(refresh);
}

export const useAuthStore = defineStore('auth', () => {
    // State
    const accessToken = ref<string | null>(normalizeToken(localStorage.getItem(TOKEN_KEY)));
    const refreshToken = ref<string | null>(normalizeToken(localStorage.getItem(REFRESH_KEY)));
    const user = ref<AuthUser | null>(loadUser());

    if (USE_MOCK_DATA) {
        if (!accessToken.value) {
            accessToken.value = MOCK_ACCESS_TOKEN;
            localStorage.setItem(TOKEN_KEY, MOCK_ACCESS_TOKEN);
        }

        if (!refreshToken.value) {
            refreshToken.value = MOCK_REFRESH_TOKEN;
            localStorage.setItem(REFRESH_KEY, MOCK_REFRESH_TOKEN);
        }

        if (!user.value) {
            user.value = MOCK_USER;
            localStorage.setItem(USER_KEY, JSON.stringify(MOCK_USER));
        }
    }

    // Getters
    const isAuthenticated = computed(() => {
        if (USE_MOCK_DATA) return true;
        return hasValidTokens(accessToken.value, refreshToken.value);
    });

    const isAdmin = computed(() => {
        if (USE_MOCK_DATA) return true;
        return user.value?.role === 'ADMIN';
    });

    // Helpers
    function loadUser(): AuthUser | null {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function setTokens(access: string, refresh: string) {
        const normalizedAccess = normalizeToken(access);
        const normalizedRefresh = normalizeToken(refresh);

        if (!normalizedAccess || !normalizedRefresh) {
            clearAuth();
            return;
        }

        accessToken.value = normalizedAccess;
        refreshToken.value = normalizedRefresh;
        localStorage.setItem(TOKEN_KEY, normalizedAccess);
        localStorage.setItem(REFRESH_KEY, normalizedRefresh);
    }

    function setUser(u: AuthUser) {
        user.value = u;
        localStorage.setItem(USER_KEY, JSON.stringify(u));
    }

    function clearAuth() {
        accessToken.value = null;
        refreshToken.value = null;
        user.value = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
    }

    // Actions
    async function login(email: string, password: string) {
        const response = await authService.login(email, password);
        if (!response.accessToken || !response.refreshToken) {
            clearAuth();
            throw new Error('Sesión inválida. Vuelva a iniciar sesión.');
        }

        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        return response;
    }

    async function refresh(): Promise<boolean> {
        const normalizedRefreshToken = normalizeToken(refreshToken.value);

        if (!normalizedRefreshToken) {
            clearAuth();
            return false;
        }

        try {
            const response = await authService.refresh(normalizedRefreshToken);
            if (!response.accessToken || !response.refreshToken) {
                clearAuth();
                return false;
            }
            setTokens(response.accessToken, response.refreshToken);
            return true;
        } catch (error) {
            if (error instanceof AuthServiceError && error.type !== 'auth') {
                // Backend caído o error transiente: mantener sesión en modo degradado
                return false;
            }

            clearAuth();
            return false;
        }
    }

    async function logout() {
        try {
            if (accessToken.value) {
                await authService.logout(accessToken.value);
            }
        } catch {
            // Silently fail — we clear local state regardless
        } finally {
            clearAuth();
        }
    }

    return {
        // State
        accessToken,
        refreshToken,
        user,
        // Getters
        isAuthenticated,
        isAdmin,
        // Actions
        login,
        refresh,
        logout,
    };
});
