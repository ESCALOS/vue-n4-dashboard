import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TprReportView from './TprReportView.vue';

const { getSummary } = vi.hoisted(() => ({
  getSummary: vi.fn(),
}));

vi.mock('../../services/tprReportService', () => ({
  tprReportService: {
    getSummary,
    regenerate: vi.fn(),
    exportSummary: vi.fn(),
    getDetails: vi.fn(),
    exportDetails: vi.fn(),
  },
}));

describe('TprReportView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    getSummary.mockReset();
    getSummary.mockResolvedValue({
      period: '2026-07',
      generatedAt: '2026-07-24T12:00:00.000Z',
      cached: true,
      rows: [
        {
          uniqueId: '5X111110BDRY20FT',
          accountDescription: 'Container Vessel Discharge Local Full Dry 20',
          total: 3,
          reportType: 'CONTAINER_VESSEL',
          hasDetails: true,
        },
        {
          uniqueId: '5X321220BDRY40FT',
          accountDescription: "Truck OUT Local Empty Dry 40'",
          total: 0,
          reportType: 'TRUCK_IN_OUT',
          hasDetails: false,
        },
        {
          uniqueId: '71010001',
          accountDescription: 'Terminal area (ha)',
          total: 44.62,
          reportType: null,
          hasDetails: false,
        },
      ],
    });
  });

  it('renders exactly the three requested summary columns after consulting', async () => {
    const wrapper = mount(TprReportView);

    await wrapper.get('.button-primary').trigger('click');
    await flushPromises();

    expect(wrapper.findAll('th').map((header) => header.text())).toEqual([
      'UNIQUE ID',
      'ACCOUNT DESCRIPTION',
      'TOTAL',
    ]);
    expect(wrapper.text()).toContain('5X111110BDRY20FT');
    expect(wrapper.text()).toContain('Container Vessel Discharge Local Full Dry 20');
  });

  it('does not make zero-total or default rows interactive', async () => {
    const wrapper = mount(TprReportView);

    await wrapper.get('.button-primary').trigger('click');
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(3);
    const [positiveRow, zeroRow, defaultRow] = rows;
    if (!positiveRow || !zeroRow || !defaultRow) {
      throw new Error('Expected positive, zero-total and default rows');
    }
    expect(positiveRow.classes()).toContain('interactive');
    expect(positiveRow.attributes('tabindex')).toBe('0');
    expect(zeroRow.classes()).toContain('non-interactive');
    expect(zeroRow.attributes('tabindex')).toBeUndefined();
    expect(defaultRow.classes()).toContain('non-interactive');
    expect(defaultRow.attributes('title')).toBe('Sin registros para mostrar');

    await zeroRow.trigger('click');
    await defaultRow.trigger('click');
    expect(wrapper.find('dialog').exists()).toBe(false);
  });
});
