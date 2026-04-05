<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { usersService } from '../../services/usersService';
import type { User, CreateUserPayload, UpdateUserPayload } from '../../services/usersService';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

// State
const users = ref<User[]>([]);
const isLoading = ref(false);
const error = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// Modal state
const showModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref<string | null>(null);
const modalError = ref('');
const isSaving = ref(false);

// Form
const form = ref({
    email: '',
    password: '',
    name: '',
    role: 'USER' as 'ADMIN' | 'USER',
    isActive: true,
});

// Delete confirmation
const showDeleteConfirm = ref(false);
const deletingUser = ref<User | null>(null);
const isDeleting = ref(false);

const currentUserId = computed(() => authStore.user?.id);
const filteredUsers = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    if (!query) return users.value;

    return users.value.filter((user) => {
        const searchableFields = [
            user.name || '',
            user.email,
            user.role,
            user.isActive ? 'activo' : 'inactivo',
        ];

        return searchableFields.some((field) => field.toLowerCase().includes(query));
    });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize.value)));
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredUsers.value.slice(start, start + pageSize.value);
});
const paginationStart = computed(() => (filteredUsers.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1));
const paginationEnd = computed(() => Math.min(currentPage.value * pageSize.value, filteredUsers.value.length));

watch([searchQuery, pageSize], () => {
    currentPage.value = 1;
});

watch(filteredUsers, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
    }
});

// Load users
async function loadUsers() {
    isLoading.value = true;
    error.value = '';
    try {
        users.value = await usersService.getAll();
    } catch (e: any) {
        error.value = e.message;
    } finally {
        isLoading.value = false;
    }
}

// Open create modal
function openCreate() {
    isEditing.value = false;
    editingUserId.value = null;
    modalError.value = '';
    form.value = { email: '', password: '', name: '', role: 'USER', isActive: true };
    showModal.value = true;
}

// Open edit modal
function openEdit(user: User) {
    isEditing.value = true;
    editingUserId.value = user.id;
    modalError.value = '';
    form.value = {
        email: user.email,
        password: '',
        name: user.name || '',
        role: user.role,
        isActive: user.isActive,
    };
    showModal.value = true;
}

// Save user (create or update)
async function handleSave() {
    modalError.value = '';
    isSaving.value = true;

    try {
        if (isEditing.value && editingUserId.value) {
            const payload: UpdateUserPayload = {};
            if (form.value.name) payload.name = form.value.name;
            if (form.value.password) payload.password = form.value.password;
            payload.role = form.value.role;
            payload.isActive = form.value.isActive;

            await usersService.update(editingUserId.value, payload);
        } else {
            const payload: CreateUserPayload = {
                email: form.value.email,
                password: form.value.password,
                role: form.value.role,
            };
            if (form.value.name) payload.name = form.value.name;

            await usersService.create(payload);
        }

        showModal.value = false;
        await loadUsers();
    } catch (e: any) {
        modalError.value = e.message;
    } finally {
        isSaving.value = false;
    }
}

// Delete user
function confirmDelete(user: User) {
    deletingUser.value = user;
    showDeleteConfirm.value = true;
}

async function handleDelete() {
    if (!deletingUser.value) return;
    isDeleting.value = true;

    try {
        await usersService.remove(deletingUser.value.id);
        showDeleteConfirm.value = false;
        deletingUser.value = null;
        await loadUsers();
    } catch (e: any) {
        error.value = e.message;
    } finally {
        isDeleting.value = false;
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

onMounted(loadUsers);
</script>

<template>
    <div class="users-page">
        <!-- Header -->
        <div class="users-header">
            <div>
                <h1 class="users-title">Gestión de Usuarios</h1>
                <p class="users-subtitle">Administra los usuarios del sistema</p>
            </div>
            <button class="btn btn-primary" @click="openCreate">
                <svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                Nuevo Usuario
            </button>
        </div>

        <!-- Error -->
        <div v-if="error" class="users-error">
            <span>{{ error }}</span>
            <button class="users-error-dismiss" @click="error = ''">✕</button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="users-loading">
            <div class="spinner"></div>
            <span>Cargando usuarios...</span>
        </div>

        <!-- Filters + Table -->
        <div v-else>
            <div class="users-toolbar">
                <div class="search-box">
                    <svg viewBox="0 0 20 20" fill="currentColor" class="search-icon">
                        <path fill-rule="evenodd" d="M8.5 3a5.5 5.5 0 014.473 8.698l3.664 3.665a1 1 0 01-1.414 1.414l-3.665-3.664A5.5 5.5 0 118.5 3zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" clip-rule="evenodd" />
                    </svg>
                    <input
                        v-model="searchQuery"
                        type="text"
                        class="search-input"
                        placeholder="Buscar por nombre, correo, rol o estado"
                    />
                </div>

                <div class="toolbar-meta">
                    <label class="page-size-control">
                        <span>Filas</span>
                        <select v-model.number="pageSize" class="form-input page-size-select">
                            <option :value="5">5</option>
                            <option :value="10">10</option>
                            <option :value="20">20</option>
                        </select>
                    </label>
                </div>
            </div>

            <div class="users-table-wrapper">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Creado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in paginatedUsers" :key="user.id">
                            <td>
                                <div class="user-cell">
                                    <div class="user-avatar" :class="user.role === 'ADMIN' ? 'avatar-admin' : 'avatar-user'">
                                        {{ (user.name || user.email).charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <div class="user-name">{{ user.name || '—' }}</div>
                                        <div class="user-email">{{ user.email }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="role-badge" :class="user.role === 'ADMIN' ? 'role-admin' : 'role-user'">
                                    {{ user.role }}
                                </span>
                            </td>
                            <td>
                                <span class="status-badge" :class="user.isActive ? 'status-active' : 'status-inactive'">
                                    {{ user.isActive ? 'Activo' : 'Inactivo' }}
                                </span>
                            </td>
                            <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-action btn-edit" @click="openEdit(user)" title="Editar">
                                        <svg viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button 
                                        class="btn-action btn-delete" 
                                        @click="confirmDelete(user)" 
                                        title="Eliminar"
                                        :disabled="user.id === currentUserId"
                                    >
                                        <svg viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="filteredUsers.length === 0 && !isLoading" class="users-empty">
                    {{ searchQuery ? 'No se encontraron usuarios con ese criterio.' : 'No hay usuarios registrados.' }}
                </div>
            </div>

            <div class="pagination-bar">
                <span class="pagination-summary">
                    Mostrando {{ paginationStart }}-{{ paginationEnd }} de {{ filteredUsers.length }} usuarios
                </span>

                <div class="pagination-controls">
                    <button class="btn btn-secondary" @click="currentPage--" :disabled="currentPage === 1">
                        Anterior
                    </button>
                    <span class="pagination-page">Página {{ currentPage }} de {{ totalPages }}</span>
                    <button class="btn btn-secondary" @click="currentPage++" :disabled="currentPage === totalPages">
                        Siguiente
                    </button>
                </div>
            </div>
        </div>

        <!-- Create / Edit Modal -->
        <Teleport to="body">
            <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2 class="modal-title">{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
                        <button class="modal-close" @click="showModal = false">✕</button>
                    </div>

                    <div v-if="modalError" class="modal-error">{{ modalError }}</div>

                    <form @submit.prevent="handleSave" class="modal-form">
                        <div class="form-group">
                            <label class="form-label">Correo electrónico</label>
                            <input
                                v-model="form.email"
                                type="email"
                                class="form-input"
                                :disabled="isEditing || isSaving"
                                required
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                Contraseña
                                <span v-if="isEditing" class="form-hint">(dejar vacío para no cambiar)</span>
                            </label>
                            <input
                                v-model="form.password"
                                type="password"
                                class="form-input"
                                :required="!isEditing"
                                :disabled="isSaving"
                                placeholder="••••••••"
                                minlength="6"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Nombre</label>
                            <input
                                v-model="form.name"
                                type="text"
                                class="form-input"
                                :disabled="isSaving"
                                placeholder="Nombre completo"
                            />
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Rol</label>
                                <select v-model="form.role" class="form-input" :disabled="isSaving">
                                    <option value="USER">Usuario</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            <div v-if="isEditing" class="form-group">
                                <label class="form-label">Estado</label>
                                <select v-model="form.isActive" class="form-input" :disabled="isSaving">
                                    <option :value="true">Activo</option>
                                    <option :value="false">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" @click="showModal = false" :disabled="isSaving">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="isSaving">
                                <span v-if="isSaving" class="btn-spinner"></span>
                                <span v-else>{{ isEditing ? 'Guardar' : 'Crear' }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Delete Confirmation Modal -->
        <Teleport to="body">
            <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
                <div class="modal-card modal-sm">
                    <div class="modal-header">
                        <h2 class="modal-title">Confirmar Eliminación</h2>
                    </div>
                    <p class="delete-msg">
                        ¿Estás seguro de eliminar a <strong>{{ deletingUser?.name || deletingUser?.email }}</strong>?
                        Esta acción no se puede deshacer.
                    </p>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" @click="showDeleteConfirm = false" :disabled="isDeleting">
                            Cancelar
                        </button>
                        <button class="btn btn-danger" @click="handleDelete" :disabled="isDeleting">
                            <span v-if="isDeleting" class="btn-spinner"></span>
                            <span v-else>Eliminar</span>
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.users-page {
    max-width: 72rem;
    margin: 0 auto;
}

.users-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;
}

.users-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #f9fafb;
}

.users-subtitle {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: #9ca3af;
}

.users-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 16rem;
}

.search-icon {
    position: absolute;
    top: 50%;
    left: 0.875rem;
    width: 1rem;
    height: 1rem;
    color: #6b7280;
    transform: translateY(-50%);
}

.search-input {
    width: 100%;
    padding: 0.625rem 0.875rem 0.625rem 2.5rem;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    color: #f9fafb;
    font-size: 0.875rem;
    outline: none;
    box-sizing: border-box;
}

.search-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.toolbar-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.page-size-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #d1d5db;
    font-size: 0.875rem;
}

.page-size-select {
    min-width: 4.5rem;
}

/* Buttons */
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
    transition: background 0.15s, opacity 0.15s;
    white-space: nowrap;
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

.btn-danger {
    background: #dc2626;
    color: #fff;
}

.btn-danger:hover:not(:disabled) {
    background: #b91c1c;
}

.btn-icon {
    width: 1.125rem;
    height: 1.125rem;
}

.users-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    color: #fca5a5;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.users-error-dismiss {
    background: none;
    border: none;
    color: #fca5a5;
    cursor: pointer;
    font-size: 1rem;
    padding: 0 0.25rem;
}

.users-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 3rem;
    color: #9ca3af;
}

.spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid #374151;
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

/* Table */
.users-table-wrapper {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 0.75rem;
    overflow: hidden;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.users-table thead {
    background: #0d1117;
}

.users-table th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #9ca3af;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #1f2937;
}

.users-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #1f2937;
    color: #d1d5db;
}

.users-table tbody tr:last-child td {
    border-bottom: none;
}

.users-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.avatar-admin {
    background: rgba(99, 102, 241, 0.2);
    color: #818cf8;
}

.avatar-user {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
}

.user-name {
    font-weight: 500;
    color: #f9fafb;
}

.user-email {
    font-size: 0.8rem;
    color: #6b7280;
}

.role-badge, .status-badge {
    display: inline-block;
    padding: 0.2rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
}

.role-admin {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
}

.role-user {
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
}

.status-active {
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
}

.status-inactive {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
}

.date-cell {
    font-size: 0.8rem;
    color: #6b7280;
    white-space: nowrap;
}

.action-buttons {
    display: flex;
    gap: 0.375rem;
}

.btn-action {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.15s;
    padding: 0;
}

.btn-action svg {
    width: 1rem;
    height: 1rem;
}

.btn-edit {
    background: rgba(59, 130, 246, 0.1);
    color: #93c5fd;
}

.btn-edit:hover {
    background: rgba(59, 130, 246, 0.25);
}

.btn-delete {
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
}

.btn-delete:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
}

.btn-delete:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.users-empty {
    padding: 3rem;
    text-align: center;
    color: #6b7280;
}

.pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
}

.pagination-summary {
    color: #9ca3af;
    font-size: 0.875rem;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.pagination-page {
    color: #d1d5db;
    font-size: 0.875rem;
}

/* Modal */
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
    max-width: 28rem;
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 0.75rem;
    padding: 1.5rem;
}

.modal-sm {
    max-width: 24rem;
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

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    flex: 1;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #d1d5db;
}

.form-hint {
    font-weight: 400;
    color: #6b7280;
    font-size: 0.75rem;
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

.form-row {
    display: flex;
    gap: 1rem;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.delete-msg {
    color: #d1d5db;
    font-size: 0.875rem;
    margin: 0 0 1.5rem;
    line-height: 1.5;
}

.delete-msg strong {
    color: #f9fafb;
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

/* Responsive */
@media (max-width: 768px) {
    .users-table th:nth-child(4),
    .users-table td:nth-child(4) {
        display: none;
    }

    .users-header,
    .users-toolbar,
    .pagination-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .toolbar-meta,
    .pagination-controls {
        justify-content: space-between;
    }
}

@media (max-width: 640px) {
    .users-table th:nth-child(3),
    .users-table td:nth-child(3) {
        display: none;
    }

    .form-row {
        flex-direction: column;
    }

    .pagination-controls {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
