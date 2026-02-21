<script setup lang="ts">
import { ref } from 'vue';
import { patch } from '../services/httpClient';

const emit = defineEmits<{ close: [] }>();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref(false);
const isSaving = ref(false);

async function handleSubmit() {
    error.value = '';

    if (newPassword.value.length < 6) {
        error.value = 'La nueva contraseña debe tener al menos 6 caracteres.';
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        error.value = 'Las contraseñas no coinciden.';
        return;
    }

    isSaving.value = true;
    try {
        const response = await patch('/auth/me/password', {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al cambiar la contraseña');
        }

        success.value = true;
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    } catch (e: any) {
        error.value = e.message;
    } finally {
        isSaving.value = false;
    }
}
</script>

<template>
    <Teleport to="body">
        <div class="modal-backdrop" @click.self="emit('close')">
            <div class="modal-card">
                <div class="modal-header">
                    <h2 class="modal-title">Cambiar contraseña</h2>
                    <button class="modal-close" @click="emit('close')">✕</button>
                </div>

                <div v-if="success" class="modal-success">
                    <svg viewBox="0 0 20 20" fill="currentColor" class="success-icon">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                    </svg>
                    <p>Contraseña actualizada correctamente.</p>
                    <button class="btn btn-primary" @click="emit('close')">Cerrar</button>
                </div>

                <form v-else @submit.prevent="handleSubmit" class="modal-form">
                    <div v-if="error" class="modal-error">{{ error }}</div>

                    <div class="form-group">
                        <label class="form-label">Contraseña actual</label>
                        <input
                            v-model="currentPassword"
                            type="password"
                            class="form-input"
                            required
                            :disabled="isSaving"
                            placeholder="••••••••"
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Nueva contraseña</label>
                        <input
                            v-model="newPassword"
                            type="password"
                            class="form-input"
                            required
                            :disabled="isSaving"
                            placeholder="••••••••"
                            minlength="6"
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Confirmar nueva contraseña</label>
                        <input
                            v-model="confirmPassword"
                            type="password"
                            class="form-input"
                            required
                            :disabled="isSaving"
                            placeholder="••••••••"
                        />
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" @click="emit('close')" :disabled="isSaving">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="isSaving">
                            <span v-if="isSaving" class="btn-spinner"></span>
                            <span v-else>Guardar</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
}

.modal-card {
    width: 100%;
    max-width: 24rem;
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 0.75rem;
    padding: 1.5rem;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
}

.modal-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #f9fafb;
}

.modal-close {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0.25rem;
    line-height: 1;
}

.modal-close:hover {
    color: #d1d5db;
}

.modal-error {
    padding: 0.625rem 0.875rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    color: #fca5a5;
    font-size: 0.8rem;
    margin-bottom: 1rem;
}

.modal-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 0;
    text-align: center;
    color: #86efac;
}

.success-icon {
    width: 3rem;
    height: 3rem;
}

.modal-success p {
    margin: 0;
    color: #d1d5db;
    font-size: 0.9rem;
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    padding: 0.5rem 0.75rem;
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

.form-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.form-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.25rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #4f46e5;
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #4338ca;
}

.btn-secondary {
    background: #374151;
    color: #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
    background: #4b5563;
}

.btn-spinner {
    width: 1.125rem;
    height: 1.125rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
