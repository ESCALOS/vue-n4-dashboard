import { describe, expect, it } from 'vitest';
import { getOperationLabel } from './monitoring';

describe('monitoring operation labels', () => {
    it('shows discharge independently from dispatching', () => {
        expect(getOperationLabel('DISPATCHING')).toBe('Despacho');
        expect(getOperationLabel('DISCHARGING')).toBe('Descarga');
    });
});
