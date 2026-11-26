import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AppointmentTable from './AppointmentTable.vue';
import type { AppointmentInProgress } from '../../../types/appointments/AppointmentInProgress';

const appointment = (cita: string, overrides = {}) => ({ cita, stage: 'yard', ...overrides } as AppointmentInProgress);
const mountTable = (appointments: AppointmentInProgress[]) => mount(AppointmentTable, {
  props: {
    appointments,
    formatFecha: value => value ?? '-', formatTiempo: value => String(value ?? '-'),
    getStageLabel: value => value, getStageClass: () => '', getTiempoClass: () => '',
    getTiempoStageClass: () => '', getTiempoAtencion: value => value.tiempo,
    getTiempoStage: value => value.tiempo, onPrintEir: () => {}, printingAppointmentId: null,
  },
});
const ids = (wrapper: ReturnType<typeof mountTable>) => wrapper.findAll('.cell-cita').map(cell => cell.text());

describe('appointment table local sorting', () => {
  it('uses the existing stage and duration formatters in mobile cards and omits dispatch containers', () => {
    const wrapper = mountTable([appointment('1', {
      tipo: 'Despacho', placa: 'ABC-123', contenedor: 'MSKU1234567', tiempo: 52,
      fechaCita: '2026-11-25', fechaStage: '2026-11-25T15:00:00',
    })]);
    const card = wrapper.get('article');
    expect(card.get('.card-status').text()).toBe('yard');
    expect(card.findAll('.time-data dd').map(value => value.text())).toEqual(['52', '52']);
    expect(card.text()).not.toContain('MSKU1234567');
    expect(card.get('.detail-data').text()).toContain('Ingreso a etapa');
    expect(card.get('.detail-data').text()).toContain('2026-11-25T15:00:00');
  });

  it('cycles natural ordering and preserves sorting when the stream updates without mutating input', async () => {
    const data = [appointment('10'), appointment('2')];
    const wrapper = mountTable(data);
    const button = wrapper.findAll('th button')[0]!;
    await button.trigger('click');
    expect(ids(wrapper)).toEqual(['2', '10']);
    expect(data.map(row => row.cita)).toEqual(['10', '2']);
    await wrapper.setProps({ appointments: [...data, appointment('1')] });
    expect(ids(wrapper)).toEqual(['1', '2', '10']);
    await button.trigger('click');
    expect(ids(wrapper)).toEqual(['10', '2', '1']);
    await button.trigger('click');
    expect(ids(wrapper)).toEqual(['10', '2', '1']);
    expect(wrapper.find('th').attributes('aria-sort')).toBe('none');
  });

  it('sorts dates, process stages and durations by their values, keeping missing values last', async () => {
    const wrapper = mountTable([
      appointment('A', { fechaCita: '2026-02-01', stage: 'yard', tiempo: 120 }),
      appointment('B', { fechaCita: '2026-01-02', stage: 'tranquera', tiempo: 9 }),
      appointment('C', { fechaCita: null, stage: 'pre_gate', tiempo: null }),
    ]);
    const buttons = wrapper.findAll('th button');
    await buttons[1]!.trigger('click');
    expect(ids(wrapper)).toEqual(['B', 'A', 'C']);
    await buttons[1]!.trigger('click');
    expect(ids(wrapper)).toEqual(['A', 'B', 'C']);
    await buttons[3]!.trigger('click');
    expect(ids(wrapper)).toEqual(['B', 'C', 'A']);
    await buttons[4]!.trigger('click');
    expect(ids(wrapper)).toEqual(['B', 'A', 'C']);
    await buttons[4]!.trigger('click');
    expect(ids(wrapper)).toEqual(['A', 'B', 'C']);
  });
});
