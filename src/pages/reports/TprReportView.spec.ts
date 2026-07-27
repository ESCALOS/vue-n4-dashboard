import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TprReportView from './TprReportView.vue';

const { getDetails, getSummary } = vi.hoisted(() => ({
  getDetails: vi.fn(),
  getSummary: vi.fn(),
}));

vi.mock('../../services/tprReportService', () => ({
  tprReportService: {
    getSummary,
    regenerate: vi.fn(),
    exportSummary: vi.fn(),
    getDetails,
    exportDetails: vi.fn(),
  },
}));

describe('TprReportView', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    setActivePinia(createPinia());
    localStorage.clear();
    getSummary.mockReset();
    getDetails.mockReset();
    getDetails.mockResolvedValue({
      period: '2026-07',
      reportType: 'CONTAINER_VESSEL',
      uniqueId: '5X101000BDUMSDUM',
      accountDescription: 'Container Vessel calls',
      generatedAt: '2026-07-24T12:00:00.000Z',
      cached: true,
      detailKind: 'VESSEL_CALLS',
      rows: [
        {
          atd: '2026-07-10T15:00:00.000Z',
          manifest: '2026-100',
          vessel: 'TEST VESSEL',
        },
      ],
      pagination: {
        page: 1,
        limit: 100,
        total: 1,
        totalPages: 1,
      },
    });
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
          uniqueId: '5X101000BDUMSDUM',
          accountDescription: 'Container Vessel calls',
          total: 10,
          reportType: 'CONTAINER_VESSEL',
          hasDetails: true,
        },
        {
          uniqueId: '5X321120BDRY40FT',
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

  it('keeps Vessel calls interactive and disables zero-total and default rows', async () => {
    const wrapper = mount(TprReportView);

    await wrapper.get('.button-primary').trigger('click');
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(4);
    const [positiveRow, vesselCallsRow, zeroRow, defaultRow] = rows;
    if (!positiveRow || !vesselCallsRow || !zeroRow || !defaultRow) {
      throw new Error(
        'Expected positive, Vessel calls, zero-total and default rows',
      );
    }
    expect(positiveRow.classes()).toContain('interactive');
    expect(positiveRow.attributes('tabindex')).toBe('0');
    expect(vesselCallsRow.classes()).toContain('interactive');
    expect(vesselCallsRow.attributes('tabindex')).toBe('0');
    expect(zeroRow.classes()).toContain('non-interactive');
    expect(zeroRow.attributes('tabindex')).toBeUndefined();
    expect(defaultRow.classes()).toContain('non-interactive');
    expect(defaultRow.attributes('title')).toBe('Sin registros para mostrar');

    await zeroRow.trigger('click');
    await defaultRow.trigger('click');
    expect(wrapper.find('dialog').exists()).toBe(false);
  });

  it('opens Vessel calls with ATD, manifest and vessel columns', async () => {
    const wrapper = mount(TprReportView);

    await wrapper.get('.button-primary').trigger('click');
    await flushPromises();
    await wrapper.findAll('tbody tr')[1]?.trigger('click');
    await flushPromises();

    expect(wrapper.findAll('dialog th').map((header) => header.text())).toEqual([
      'ATD',
      'MANIFIESTO',
      'NAVE',
    ]);
    expect(wrapper.text()).toContain('2026-100');
    expect(wrapper.text()).toContain('TEST VESSEL');
  });

  it('preserves the row order received from the backend', async () => {
    const wrapper = mount(TprReportView);

    await wrapper.get('.button-primary').trigger('click');
    await flushPromises();

    expect(
      wrapper
        .findAll('tbody .unique-id')
        .map((cell) => cell.text()),
    ).toEqual([
      '5X111110BDRY20FT',
      '5X101000BDUMSDUM',
      '5X321120BDRY40FT',
      '71010001',
    ]);
  });
});
