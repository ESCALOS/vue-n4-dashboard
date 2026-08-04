import { describe, expect, it } from 'vitest';
import {
    PRIVILEGES,
    VIEW_DEFINITIONS,
    canAccessPrivilege,
    getFirstAccessiblePath,
} from './viewPrivileges';

describe('view privilege catalog', () => {
    it('defines one unique privilege for each of the six views', () => {
        expect(VIEW_DEFINITIONS).toHaveLength(6);
        expect(new Set(VIEW_DEFINITIONS.map((view) => view.privilege)).size).toBe(6);
    });

    it('allows administrators to access every view', () => {
        expect(canAccessPrivilege('ADMIN', [], PRIVILEGES.TPR_REPORT)).toBe(true);
    });

    it('only allows users to access explicitly assigned views', () => {
        const privileges = [PRIVILEGES.PENDING_APPOINTMENTS];
        expect(canAccessPrivilege('USER', privileges, PRIVILEGES.PENDING_APPOINTMENTS)).toBe(true);
        expect(canAccessPrivilege('USER', privileges, PRIVILEGES.CONTAINER_MONITORING)).toBe(false);
    });

    it('redirects users without privileges to the no-access page', () => {
        expect(getFirstAccessiblePath('USER', [])).toBe('/sin-acceso');
    });

    it('returns the first permitted view as the landing page', () => {
        expect(getFirstAccessiblePath('USER', [PRIVILEGES.IN_PROGRESS_APPOINTMENTS]))
            .toBe('/citas/en-proceso');
    });
});
