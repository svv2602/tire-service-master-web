import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { TextField, TextFieldProps } from './TextField';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/TextField',
  component: TextField,
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
      defaultValue: 'outlined',
    },
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

const Template: Story<TextFieldProps> = (args) => <TextField {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  label: 'Текстовое поле',
  placeholder: 'Введите текст',
};

export const Filled = Template.bind({});
Filled.args = {
  label: 'Текстовое поле',
  placeholder: 'Введите текст',
  variant: 'filled',
};

export const Standard = Template.bind({});
Standard.args = {
  label: 'Текстовое поле',
  placeholder: 'Введите текст',
  variant: 'standard',
};

// Размеры
export const Small = Template.bind({});
Small.args = {
  label: 'Маленькое поле',
  placeholder: 'Введите текст',
  size: 'small',
};

export const Medium = Template.bind({});
Medium.args = {
  label: 'Среднее поле',
  placeholder: 'Введите текст',
  size: 'medium',
};

// Состояния
export const WithValue = Template.bind({});
WithValue.args = {
  label: 'С значением',
  value: 'Пример текста',
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Отключенное поле',
  placeholder: 'Недоступно для ввода',
  disabled: true,
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Поле с ошибкой',
  placeholder: 'Введите текст',
  error: true,
  helperText: 'Текст с ошибкой',
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  label: 'Поле на всю ширину',
  placeholder: 'Введите текст',
  fullWidth: true,
};

// Интерактивный пример
export const Interactive = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    
    if (newValue.length < 3 && newValue.length > 0) {
      setError('Минимальная длина 3 символа');
    } else {
      setError(null);
    }
  };

  return (
    <div style={{ width: '300px' }}>
      <TextField
        label="Интерактивное поле"
        value={value}
        onChange={handleChange}
        error={!!error}
        helperText={error}
        fullWidth
      />
      <div style={{ marginTop: tokens.spacing.md, color: 'gray' }}>
        Введите минимум 3 символа
      </div>
    </div>
  );
};

// Группа полей
export const TextFieldGroup = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md, width: '300px' }}>
    <TextField label="Имя" placeholder="Введите имя" />
    <TextField label="Фамилия" placeholder="Введите фамилию" />
    <TextField label="Email" placeholder="Введите email" type="email" />
    <TextField label="Пароль" placeholder="Введите пароль" type="password" />
  </div>
);