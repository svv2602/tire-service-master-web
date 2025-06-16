import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Radio, RadioProps } from './Radio';
import { Box } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Radio',
  component: Radio,
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      defaultValue: 'medium',
    },
    row: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as Meta;

const defaultOptions = [
  { value: 'option1', label: 'Опция 1' },
  { value: 'option2', label: 'Опция 2' },
  { value: 'option3', label: 'Опция 3' },
];

const Template: Story<RadioProps> = (args) => <Radio {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  label: 'Выберите опцию',
  options: defaultOptions,
  value: 'option1',
};

export const WithoutLabel = Template.bind({});
WithoutLabel.args = {
  options: defaultOptions,
  value: 'option1',
};

// Расположение
export const Vertical = Template.bind({});
Vertical.args = {
  label: 'Вертикальное расположение',
  options: defaultOptions,
  value: 'option1',
  row: false,
};

export const Horizontal = Template.bind({});
Horizontal.args = {
  label: 'Горизонтальное расположение',
  options: defaultOptions,
  value: 'option1',
  row: true,
};

// Размеры
export const Small = Template.bind({});
Small.args = {
  label: 'Маленький размер',
  options: defaultOptions,
  value: 'option1',
  size: 'small',
};

export const Medium = Template.bind({});
Medium.args = {
  label: 'Средний размер',
  options: defaultOptions,
  value: 'option1',
  size: 'medium',
};

// Цвета
export const Primary = Template.bind({});
Primary.args = {
  label: 'Основной цвет',
  options: defaultOptions,
  value: 'option1',
  color: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Вторичный цвет',
  options: defaultOptions,
  value: 'option1',
  color: 'secondary',
};

export const Success = Template.bind({});
Success.args = {
  label: 'Успех',
  options: defaultOptions,
  value: 'option1',
  color: 'success',
};

export const Error = Template.bind({});
Error.args = {
  label: 'Ошибка',
  options: defaultOptions,
  value: 'option1',
  color: 'error',
};

// Состояния
export const WithDisabledOption = Template.bind({});
WithDisabledOption.args = {
  label: 'С отключенной опцией',
  options: [
    { value: 'option1', label: 'Опция 1' },
    { value: 'option2', label: 'Опция 2', disabled: true },
    { value: 'option3', label: 'Опция 3' },
  ],
  value: 'option1',
};

// Интерактивный пример
export const Interactive = () => {
  const [value, setValue] = useState('option1');
  
  const handleChange = (newValue: string) => {
    setValue(newValue);
  };
  
  return (
    <div>
      <Radio
        label="Интерактивный выбор"
        options={defaultOptions}
        value={value}
        onChange={handleChange}
      />
      <div style={{ marginTop: tokens.spacing.md, color: 'gray' }}>
        Выбрано: {value}
      </div>
    </div>
  );
};

// Множественные группы
export const MultipleGroups = () => {
  const [transport, setTransport] = useState('car');
  const [color, setColor] = useState('red');
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
      <Radio
        label="Выберите транспорт"
        options={[
          { value: 'car', label: 'Автомобиль' },
          { value: 'bike', label: 'Велосипед' },
          { value: 'scooter', label: 'Самокат' },
        ]}
        value={transport}
        onChange={setTransport}
        color="primary"
      />
      
      <Radio
        label="Выберите цвет"
        options={[
          { value: 'red', label: 'Красный' },
          { value: 'green', label: 'Зеленый' },
          { value: 'blue', label: 'Синий' },
        ]}
        value={color}
        onChange={setColor}
        color="secondary"
        row
      />
      
      <div style={{ color: 'gray' }}>
        Выбрано: {transport}, {color}
      </div>
    </Box>
  );
}; 