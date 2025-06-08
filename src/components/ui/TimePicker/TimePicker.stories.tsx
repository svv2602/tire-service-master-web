import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { TimePicker } from './TimePicker';
import { TimePickerProps } from './types';

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryFn<TimePickerProps>;

// Компонент-обертка для демонстрации
const TimePickerDemo: React.FC<{ args: TimePickerProps }> = ({ args }) => {
  const [value, setValue] = React.useState<Date | null>(args.value ?? null);

  const handleChange = (newValue: Date | null) => {
    setValue(newValue);
  };

  return (
    <div style={{ width: 300, padding: 20 }}>
      <TimePicker {...args} value={value} onChange={handleChange} />
    </div>
  );
};

/**
 * Базовый пример использования TimePicker
 */
export const Basic: Story = (args) => <TimePickerDemo args={args} />;
Basic.args = {
  label: 'Выберите время',
  value: null,
  onChange: () => {},
};

/**
 * TimePicker с отображением секунд
 */
export const WithSeconds: Story = (args) => <TimePickerDemo args={args} />;
WithSeconds.args = {
  label: 'Время с секундами',
  showSeconds: true,
  format: 'HH:mm:ss',
  value: null,
  onChange: () => {},
};

/**
 * TimePicker в 12-часовом формате
 */
export const WithAMPM: Story = (args) => <TimePickerDemo args={args} />;
WithAMPM.args = {
  label: '12-часовой формат',
  ampm: true,
  format: 'hh:mm a',
  value: null,
  onChange: () => {},
};

/**
 * TimePicker с шагом в 5 минут
 */
export const WithStep: Story = (args) => <TimePickerDemo args={args} />;
WithStep.args = {
  label: 'Шаг 5 минут',
  minutesStep: 5,
  value: null,
  onChange: () => {},
};

/**
 * TimePicker с ограничением времени
 */
export const WithMinMax: Story = (args) => <TimePickerDemo args={args} />;
WithMinMax.args = {
  label: 'Рабочие часы',
  minTime: new Date(2024, 0, 1, 9, 0), // 9:00
  maxTime: new Date(2024, 0, 1, 18, 0), // 18:00
  helperText: 'Доступно с 9:00 до 18:00',
  value: null,
  onChange: () => {},
};

/**
 * TimePicker в состоянии ошибки
 */
export const WithError: Story = (args) => <TimePickerDemo args={args} />;
WithError.args = {
  label: 'Время с ошибкой',
  error: true,
  helperText: 'Обязательное поле',
  value: null,
  onChange: () => {},
};

/**
 * Отключенный TimePicker
 */
export const Disabled: Story = (args) => <TimePickerDemo args={args} />;
Disabled.args = {
  label: 'Недоступно',
  disabled: true,
  value: new Date(2024, 0, 1, 12, 0), // 12:00
  onChange: () => {},
}; 