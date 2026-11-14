import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import AppointmentMultiSelect from '../../components/appointments/AppointmentMultiSelect.vue';
import { useAppointmentsInProgress } from './useAppointmentsInProgress';
import { usePendingAppointments } from './usePendingAppointments';
import type { AppointmentInProgress } from '../../types/appointments/AppointmentInProgress';
import type { PendingAppointment } from '../../types/appointments/PendingAppointment';

vi.mock('../../services/appointmentsService', () => ({
  createAppointmentsSSEConnection: () => ({ close: vi.fn() }),
  createPendingAppointmentsSSEConnection: () => ({ close: vi.fn() }),
}));

for (const [name, useAppointments] of [
  ['in progress', useAppointmentsInProgress], ['pending', usePendingAppointments],
] as const) {
  describe(name + ' multiple filters', () => {
    it('accepts any selected value within a filter, combines filters and resets', () => {
      let state!: ReturnType<typeof useAppointments>;
      const wrapper = mount(defineComponent({ setup() { state = useAppointments(); return () => null; } }));
      const rows = [
        { cita: '1', linea: 'A', tipo: 'X', stage: 'yard', estado: 'vigente' },
        { cita: '2', linea: 'B', tipo: 'X', stage: 'yard', estado: 'vigente' },
        { cita: '3', linea: 'C', tipo: 'X', stage: 'yard', estado: 'vigente' },
        { cita: '4', linea: 'A', tipo: 'Y', stage: 'yard', estado: 'vigente' },
      ];
      state.appointments.value = rows as unknown as AppointmentInProgress[] & PendingAppointment[];
      expect(state.hasActiveFilters.value).toBe(false);
      state.filterLinea.value = ['A', 'B'];
      state.filterTipo.value = ['X'];
      expect(state.filteredAppointments.value.map(row => row.cita)).toEqual(['1', '2']);
      expect(state.hasActiveFilters.value).toBe(true);
      state.appointments.value = [...rows, { ...rows[1], cita: '5' }] as unknown as AppointmentInProgress[] & PendingAppointment[];
      expect(state.filteredAppointments.value.map(row => row.cita)).toEqual(['1', '2', '5']);
      state.clearFilters();
      expect(state.filterLinea.value).toEqual([]);
      expect(state.filteredAppointments.value).toHaveLength(5);
      expect(state.hasActiveFilters.value).toBe(false);
      wrapper.unmount();
    });
  });
}

it('emits multiple checkbox selections and clears them without changing the supplied array', async () => {
  const selected = ['A'];
  const wrapper = mount(AppointmentMultiSelect, { props: { modelValue: selected, label: 'Lineas', options: ['A', 'B'] } });
  await wrapper.findAll('input')[1]!.setValue(true);
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['A', 'B']]);
  expect(selected).toEqual(['A']);
  await wrapper.setProps({ modelValue: ['A', 'B'] });
  await wrapper.findAll('input')[0]!.setValue(false);
  expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['B']]);
  await wrapper.find('button').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([[]]);
  wrapper.unmount();
});
