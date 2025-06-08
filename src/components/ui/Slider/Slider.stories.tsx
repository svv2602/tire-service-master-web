import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Slider } from './Slider';
import { SliderProps } from './types';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryFn<SliderProps>;

// Компонент-обертка для демонстрации
const SliderDemo: React.FC<{ args: SliderProps }> = ({ args }) => {
  const [value, setValue] = React.useState<number | number[]>(args.value ?? 50);

  const handleChange = (newValue: number | number[]) => {
    setValue(newValue);
  };

  return (
    <div style={{ width: 300, padding: 20 }}>
      <Slider {...args} value={value} onChange={handleChange} />
    </div>
  );
};

/**
 * Базовый пример использования слайдера
 */
export const Basic: Story = (args) => <SliderDemo args={args} />;
Basic.args = {
  value: 50,
};

/**
 * Слайдер с метками
 */
export const WithMarks: Story = (args) => <SliderDemo args={args} />;
WithMarks.args = {
  value: 50,
  showMarks: true,
  step: 20,
};

/**
 * Слайдер с кастомными метками
 */
export const WithCustomMarks: Story = (args) => <SliderDemo args={args} />;
WithCustomMarks.args = {
  value: 50,
  marks: [
    { value: 0, label: 'Мин' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: 'Макс' },
  ],
};

/**
 * Range слайдер
 */
export const Range: Story = (args) => <SliderDemo args={args} />;
Range.args = {
  value: [20, 80],
};

/**
 * Слайдер с отображением значения
 */
export const WithValue: Story = (args) => <SliderDemo args={args} />;
WithValue.args = {
  value: 50,
  showValue: true,
  valueFormatter: (value: number) => `${value}%`,
};

/**
 * Вертикальный слайдер
 */
export const Vertical: Story = (args) => (
  <div style={{ height: 300, padding: 20 }}>
    <Slider {...args} value={50} />
  </div>
);
Vertical.args = {
  value: 50,
  orientation: 'vertical',
  showMarks: true,
  step: 20,
}; 