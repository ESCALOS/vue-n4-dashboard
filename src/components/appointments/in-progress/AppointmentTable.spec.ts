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
  it('shows appointment date in mobile headings and moves its number into details', () => {
    const wrapper = mountTable([
      appointment('123', { fechaCita: '2026-11-25T14:30:00' }),
      appointment('456', { fechaCita: null }),
    ]);
    const cards = wrapper.findAll('article');
    expect(cards[0]!.get('h3').text()).toBe('2026-11-25T14:30:00');
    expect(cards[0]!.get('.detail-data').text()).toContain('Número de cita123');
    expect(cards[0]!.get('.detail-data').text()).not.toContain('Fecha de cita');
    expect(cards[1]!.get('h3').text()).toBe('Sin fecha de cita');
    expect(ids(wrapper)).toEqual(['123', '456']);
  });

  it('sorts mobile dates independently, retains ties and missing values last, and persists across updates', async () => {
    const data = [
      appointment('A', { fechaCita: '2026-11-25T14:30:00' }),
      appointment('B', { fechaCita: '2026-11-24T14:30:00' }),
      appointment('C', { fechaCita: null }),
      appointment('D', { fechaCita: 'invalid' }),
      appointment('E', { fechaCita: '2026-11-24T14:30:00' }),
    ];
    const wrapper = mountTable(data);
    const mobileIds = () => wrapper.findAll('article .detail-data').map(detail =>
      detail.findAll('div').find(field => field.find('dt').text() === 'Número de cita')!.get('dd').text());
    const select = wrapper.get('select');
    expect(select.element.value).toBe('original');
    expect(mobileIds()).toEqual(['A', 'B', 'C', 'D', 'E']);
    const detail = wrapper.findAll('details')[1]!.element as HTMLDetailsElement;
    detail.open = true;
    await select.setValue('asc');
    expect(mobileIds()).toEqual(['B', 'E', 'A', 'C', 'D']);
    expect(detail.open).toBe(true);
    expect(ids(wrapper)).toEqual(['A', 'B', 'C', 'D', 'E']);
    await select.setValue('desc');
    expect(mobileIds()).toEqual(['A', 'B', 'E', 'C', 'D']);
    await wrapper.setProps({ appointments: [...data, appointment('F', { fechaCita: '2026-11-26' })] });
    expect(mobileIds()).toEqual(['F', 'A', 'B', 'E', 'C', 'D']);
    expect(select.element.value).toBe('desc');
    await wrapper.findAll('th button')[0]!.trigger('click');
    expect(mobileIds()).toEqual(['F', 'A', 'B', 'E', 'C', 'D']);
    await select.setValue('original');
    expect(mobileIds()).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(data.map(row => row.cita)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

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
