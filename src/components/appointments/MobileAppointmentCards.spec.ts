import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MobileAppointmentCards from './MobileAppointmentCards.vue';
import PendingAppointmentTable from './pending/PendingAppointmentTable.vue';
import type { PendingAppointment } from '../../types/appointments/PendingAppointment';

const appointment = (cita: string, tipo: string): PendingAppointment => ({
  cita, tipo, fechaCita: '2026-11-25T14:30:00', linea: 'MSC', booking: 'BK123',
  placa: 'ABC-123', carreta: 'CRT-456', cliente: 'Cliente con nombre largo',
  tecnologia: 'Reefer', producto: 'Uva fresca', contenedor: 'MSKU1234567',
  puertoDescarga: 'RTM', nave: 'MSC Serena', estado: 'activa',
});
const formatFecha = (value: string | null) => value || '—';

describe('mobile appointment cards', () => {
  it('omits the container entirely for dispatch, even if the source contains one', () => {
    const wrapper = mount(MobileAppointmentCards, {
      props: { appointments: [appointment('1', 'Despacho')], mode: 'pending', formatFecha },
    });
    expect(wrapper.text()).not.toContain('Contenedor');
    expect(wrapper.text()).not.toContain('MSKU1234567');
    expect(wrapper.get('.priority-data .full-width').text()).toContain('ABC-123');
    expect(wrapper.get('.priority-data').text()).toContain('BK123');
    expect(wrapper.get('.priority-data').text()).toContain('Reefer');
    expect(wrapper.get('.detail-data').text()).not.toMatch(/Booking|BK123|Tecnología|Reefer/);
  });

  it.each(['pending', 'in-progress'] as const)('omits inapplicable return details in %s, preserving identification and line', (mode) => {
    const wrapper = mount(MobileAppointmentCards, {
      props: { appointments: [appointment('1', 'Devolución')], mode, formatFecha },
    });
    expect(wrapper.get('.line-code').text()).toBe('MSC');
    expect(wrapper.get('.priority-data').text()).toContain('MSKU1234567');
    expect(wrapper.get('.priority-data').text()).not.toMatch(/Booking|BK123|Tecnología|Reefer/);
    expect(wrapper.get('.detail-data').text()).not.toMatch(/Booking|BK123|Nave|MSC Serena|Producto|Uva fresca|Tecnología|Reefer|Puerto de descarga|RTM/);
    expect(wrapper.get('.detail-data').text()).toContain('Cliente con nombre largo');
    expect(wrapper.get('.detail-data').text()).toContain('CRT-456');
  });

  it('keeps multiple native disclosures open across stream updates and reordering', async () => {
    const rows = [appointment('1', 'Recepción Full'), appointment('2', 'Devolución')];
    const wrapper = mount(MobileAppointmentCards, {
      props: { appointments: rows, mode: 'pending', formatFecha },
    });
    wrapper.findAll('details').forEach(detail => { (detail.element as HTMLDetailsElement).open = true; });
    await wrapper.setProps({ appointments: [...rows].reverse().map(row => ({ ...row, placa: 'NEW-123' })) });
    expect(wrapper.findAll('details').every(detail => (detail.element as HTMLDetailsElement).open)).toBe(true);
    expect(wrapper.findAll('article')[0]!.text()).toContain('Cita 2');
    expect(wrapper.findAll('article')[0]!.text()).toContain('NEW-123');
    expect(wrapper.get('summary').text()).toContain('de cita 2');
  });

  it('keeps the unfiltered legend and uses a neutral indicator for unknown types', async () => {
    const wrapper = mount(MobileAppointmentCards, {
      props: {
        appointments: [appointment('1', 'Tipo nuevo')], mode: 'pending', formatFecha,
        legendTypes: ['Despacho', 'Devolución', 'Tipo nuevo'],
      },
    });
    expect(wrapper.findAll('.type-legend li')).toHaveLength(3);
    expect(wrapper.get('.appointment-type').classes()).toContain('type-other');
    await wrapper.setProps({ appointments: [] });
    expect(wrapper.findAll('.type-legend li')).toHaveLength(3);
    expect(wrapper.text()).toContain('No hay citas pendientes');
  });

  it('retains all original desktop columns and values, including dispatch container', () => {
    const wrapper = mount(PendingAppointmentTable, {
      props: {
        appointments: [appointment('1', 'Despacho')], formatFecha,
        getEstadoLabel: value => value, getEstadoClass: () => '', getRowClass: () => '',
      },
    });
    expect(wrapper.findAll('th')).toHaveLength(14);
    expect(wrapper.get('.table-container .cell-contenedor').text()).toBe('MSKU1234567');
    expect(wrapper.get('article').text()).not.toContain('Contenedor');
  });
});
