import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../services/authService';
import type { AuthUser } from '../services/authService';

const TOKEN_KEY = 'n4_access_token';
const REFRESH_KEY = 'n4_refresh_token';
const USER_KEY = 'n4_user';

export const useAuthStore = defineStore('auth', () => {
    // State
    const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY));
    const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_KEY));
    const user = ref<AuthUser | null>(loadUser());

    // Getters
    const isAuthenticated = computed(() => !!accessToken.value);
    const isAdmin = computed(() => user.value?.role === 'ADMIN');

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
        accessToken.value = access;
        refreshToken.value = refresh;
        localStorage.setItem(TOKEN_KEY, access);
        localStorage.setItem(REFRESH_KEY, refresh);
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
        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        return response;
    }

    async function refresh(): Promise<boolean> {
        if (!refreshToken.value) {
            clearAuth();
            return false;
        }

        try {
            const response = await authService.refresh(refreshToken.value);
            setTokens(response.accessToken, response.refreshToken);
            return true;
        } catch {
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
