export const PRIVILEGES = {
    GENERAL_CARGO_MONITORING: 'VIEW_GENERAL_CARGO_MONITORING',
    CONTAINER_MONITORING: 'VIEW_CONTAINER_MONITORING',
    PENDING_APPOINTMENTS: 'VIEW_PENDING_APPOINTMENTS',
    IN_PROGRESS_APPOINTMENTS: 'VIEW_IN_PROGRESS_APPOINTMENTS',
    GENERAL_CARGO_IN_PROGRESS_APPOINTMENTS: 'VIEW_GENERAL_CARGO_IN_PROGRESS_APPOINTMENTS',
    TPR_REPORT: 'VIEW_TPR_REPORT',
} as const;

export type Privilege = typeof PRIVILEGES[keyof typeof PRIVILEGES];
export type ViewSection = 'monitoring' | 'appointments' | 'reports';

export interface ViewDefinition {
    id: string;
    label: string;
    path: string;
    routeName: string;
    section: ViewSection;
    privilege: Privilege;
}

export const VIEW_SECTIONS: ReadonlyArray<{ id: ViewSection; label: string }> = [
    { id: 'monitoring', label: 'Monitoreo de Naves' },
    { id: 'appointments', label: 'Citas' },
    { id: 'reports', label: 'Reportes' },
];

export const VIEW_DEFINITIONS: ReadonlyArray<ViewDefinition> = [
    {
        id: 'general-cargo',
        label: 'Carga General',
        path: '/monitoreo/carga-general',
        routeName: 'general-cargo',
        section: 'monitoring',
        privilege: PRIVILEGES.GENERAL_CARGO_MONITORING,
    },
    {
        id: 'containers',
        label: 'Contenedores',
        path: '/monitoreo/contenedores',
        routeName: 'containers',
        section: 'monitoring',
        privilege: PRIVILEGES.CONTAINER_MONITORING,
    },
    {
        id: 'pending-appointments',
        label: 'Pendientes',
        path: '/citas/pendientes',
        routeName: 'pending-appointments',
        section: 'appointments',
        privilege: PRIVILEGES.PENDING_APPOINTMENTS,
    },
    {
        id: 'in-progress-appointments',
        label: 'En Proceso',
        path: '/citas/en-proceso',
        routeName: 'in-progress-appointments',
        section: 'appointments',
        privilege: PRIVILEGES.IN_PROGRESS_APPOINTMENTS,
    },
    {
        id: 'general-cargo-in-progress-appointments',
        label: 'En Proceso CG',
        path: '/citas/en-proceso/carga-general',
        routeName: 'general-cargo-in-progress-appointments',
        section: 'appointments',
        privilege: PRIVILEGES.GENERAL_CARGO_IN_PROGRESS_APPOINTMENTS,
    },
    {
        id: 'tpr-report',
        label: 'Reporte TPR',
        path: '/reportes/tpr',
        routeName: 'tpr-report',
        section: 'reports',
        privilege: PRIVILEGES.TPR_REPORT,
    },
];

export function canAccessPrivilege(
    role: 'ADMIN' | 'USER' | undefined,
    privileges: readonly Privilege[] | undefined,
    privilege: Privilege,
): boolean {
    return role === 'ADMIN' || !!privileges?.includes(privilege);
}

export function getFirstAccessiblePath(
    role: 'ADMIN' | 'USER' | undefined,
    privileges: readonly Privilege[] | undefined,
): string {
    return VIEW_DEFINITIONS.find((view) =>
        canAccessPrivilege(role, privileges, view.privilege),
    )?.path ?? '/sin-acceso';
}
