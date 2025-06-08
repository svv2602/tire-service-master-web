import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import AutoComplete from './AutoComplete';
import { AutoCompleteProps, AutoCompleteOption } from './types';

// Моковые данные
const countries: AutoCompleteOption[] = [
  { id: 1, label: 'Россия' },
  { id: 2, label: 'США' },
  { id: 3, label: 'Китай' },
  { id: 4, label: 'Япония' },
  { id: 5, label: 'Германия' },
];

// Имитация асинхронного поиска
const asyncSearch = async (query: string): Promise<AutoCompleteOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка для демонстрации
  return countries.filter(option => 
    option.label.toLowerCase().includes(query.toLowerCase())
  );
};

export default {
  title: 'UI/AutoComplete',
  component: AutoComplete,
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder для поля ввода',
    },
    label: {
      control: 'text',
      description: 'Label для поля ввода',
    },
    debounceMs: {
      control: 'number',
      description: 'Задержка перед поиском в мс',
    },
    minSearchLength: {
      control: 'number',
      description: 'Минимальное количество символов для начала поиска',
    },
  },
} as Meta;

// Базовый пример
export const Default: Story<AutoCompleteProps> = (args) => (
  <AutoComplete
    {...args}
    placeholder="Выберите страну"
    label="Страна"
  />
);
Default.args = {
  options: countries,
};

// Пример с асинхронным поиском
export const AsyncSearch: Story<AutoCompleteProps> = (args) => {
  const [value, setValue] = useState<AutoCompleteOption | null>(null);

  return (
    <AutoComplete
      {...args}
      value={value}
      onChange={setValue}
      onSearch={asyncSearch}
      placeholder="Начните вводить название страны"
      label="Поиск стран"
      debounceMs={500}
      minSearchLength={2}
    />
  );
};
AsyncSearch.args = {
  options: [],
};

// Пример с кастомными текстами
export const CustomTexts: Story<AutoCompleteProps> = (args) => (
  <AutoComplete
    {...args}
    placeholder="Поиск"
    label="Выбор страны"
    noOptionsText="Ничего не найдено"
    loadingText="Подождите..."
  />
);
CustomTexts.args = {
  options: countries,
};

// Пример с ошибкой
export const WithError: Story<AutoCompleteProps> = (args) => (
  <AutoComplete
    {...args}
    placeholder="Выберите страну"
    label="Страна"
    TextFieldProps={{
      error: true,
      helperText: 'Обязательное поле',
    }}
  />
);
WithError.args = {
  options: countries,
}; 