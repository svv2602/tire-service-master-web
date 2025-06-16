import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Select, SelectProps } from './Select';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Select',
  component: Select,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
      defaultValue: 'medium',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    error: {
      control: 'boolean',
      defaultValue: false,
    },
    fullWidth: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as Meta;

const defaultOptions = [
  { value: 'option1', label: 'Опция 1' },
  { value: 'option2', label: 'Опция 2' },
  { value: 'option3', label: 'Опция 3' },
  { value: 'option4', label: 'Опция 4' },
  { value: 'option5', label: 'Опция 5' },
];

const Template: Story<SelectProps> = (args) => <Select {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  label: 'Выберите опцию',
  options: defaultOptions,
};

export const WithValue = Template.bind({});
WithValue.args = {
  label: 'Выберите опцию',
  options: defaultOptions,
  value: 'option2',
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Выберите опцию',
  options: defaultOptions,
  helperText: 'Дополнительная информация',
};

// Размеры
export const Small = Template.bind({});
Small.args = {
  label: 'Маленький селект',
  options: defaultOptions,
  size: 'small',
};

export const Medium = Template.bind({});
Medium.args = {
  label: 'Средний селект',
  options: defaultOptions,
  size: 'medium',
};

// Состояния
export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Отключенный селект',
  options: defaultOptions,
  disabled: true,
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Селект с ошибкой',
  options: defaultOptions,
  error: true,
  errorText: 'Необходимо выбрать опцию',
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  label: 'Селект на всю ширину',
  options: defaultOptions,
  fullWidth: true,
};

// Опции с отключенными элементами
export const WithDisabledOptions = Template.bind({});
WithDisabledOptions.args = {
  label: 'Селект с отключенными опциями',
  options: [
    { value: 'option1', label: 'Опция 1' },
    { value: 'option2', label: 'Опция 2', disabled: true },
    { value: 'option3', label: 'Опция 3' },
    { value: 'option4', label: 'Опция 4', disabled: true },
    { value: 'option5', label: 'Опция 5' },
  ],
};

// Интерактивный пример
export const Interactive = () => {
  const [value, setValue] = useState<string | number>('');
  
  const handleChange = (newValue: string | number) => {
    setValue(newValue);
  };
  
  return (
    <div style={{ width: '300px' }}>
      <Select
        label="Интерактивный селект"
        options={defaultOptions}
        value={value}
        onChange={handleChange}
        fullWidth
      />
      <div style={{ marginTop: tokens.spacing.md, color: 'gray' }}>
        Выбранное значение: {value || 'не выбрано'}
      </div>
    </div>
  );
};

// Группа селектов
export const SelectGroup = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md, width: '300px' }}>
    <Select
      label="Страна"
      options={[
        { value: 'ru', label: 'Россия' },
        { value: 'us', label: 'США' },
        { value: 'de', label: 'Германия' },
      ]}
      fullWidth
    />
    <Select
      label="Город"
      options={[
        { value: 'msk', label: 'Москва' },
        { value: 'spb', label: 'Санкт-Петербург' },
        { value: 'kzn', label: 'Казань' },
      ]}
      fullWidth
    />
  </div>
);