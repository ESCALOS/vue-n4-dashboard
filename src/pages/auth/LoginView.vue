<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleLogin() {
    error.value = '';
    isLoading.value = true;

    try {
        await authStore.login(email.value, password.value);
        router.push('/');
    } catch (e: any) {
        error.value = e.message || 'Error al iniciar sesión';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <!-- Logo / Brand -->
            <div class="login-header">
                <div class="login-logo">
                    <img src="/amagi.gif" alt="logo" />
                </div>
                <h1 class="login-title">A.M.A.G.I</h1>
                <p class="login-subtitle">Inicia sesión para continuar</p>
            </div>

            <!-- Error message -->
            <div v-if="error" class="login-error">
                <svg viewBox="0 0 20 20" fill="currentColor" class="login-error-icon">
                    <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clip-rule="evenodd"
                    />
                </svg>
                <span>{{ error }}</span>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label for="email" class="form-label">Correo electrónico</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        required
                        autocomplete="email"
                        placeholder="admin@navis.com"
                        class="form-input"
                        :disabled="isLoading"
                    />
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Contraseña</label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        required
                        autocomplete="current-password"
                        placeholder="••••••••"
                        class="form-input"
                        :disabled="isLoading"
                    />
                </div>

                <button type="submit" class="login-btn" :disabled="isLoading">
                    <span v-if="isLoading" class="login-spinner"></span>
                    <span v-else>Iniciar Sesión</span>
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #030712;
    padding: 1rem;
}

.login-card {
    width: 100%;
    max-width: 24rem;
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 1rem;
    padding: 2.5rem 2rem;
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-logo {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
    color: #818cf8;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.login-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    -webkit-user-drag: none;
    user-select: none;
}


.login-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f9fafb;
    margin: 0 0 0.25rem;
}

.login-subtitle {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0;
}

.login-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    color: #fca5a5;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
}

.login-error-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    color: #ef4444;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #d1d5db;
}

.form-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    color: #f9fafb;
    font-size: 0.875rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
}

.form-input::placeholder {
    color: #6b7280;
}

.form-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.form-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.login-btn {
    width: 100%;
    padding: 0.75rem;
    background: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    margin-top: 0.5rem;
}

.login-btn:hover:not(:disabled) {
    background: #4338ca;
}

.login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.login-spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
