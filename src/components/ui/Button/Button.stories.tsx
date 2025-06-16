import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Button, ButtonProps } from './Button';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'text', 'contained', 'outlined'],
      defaultValue: 'primary',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      defaultValue: 'medium',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    loading: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as Meta;

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

// Основные варианты
export const Primary = Template.bind({});
Primary.args = {
  children: 'Кнопка',
  variant: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Кнопка',
  variant: 'secondary',
};

export const Success = Template.bind({});
Success.args = {
  children: 'Кнопка',
  variant: 'success',
};

export const Error = Template.bind({});
Error.args = {
  children: 'Кнопка',
  variant: 'error',
};

// Варианты отображения
export const Contained = Template.bind({});
Contained.args = {
  children: 'Кнопка',
  variant: 'contained',
};

export const Outlined = Template.bind({});
Outlined.args = {
  children: 'Кнопка',
  variant: 'outlined',
};

export const Text = Template.bind({});
Text.args = {
  children: 'Кнопка',
  variant: 'text',
};

// Размеры
export const Small = Template.bind({});
Small.args = {
  children: 'Маленькая кнопка',
  size: 'small',
};

export const Medium = Template.bind({});
Medium.args = {
  children: 'Средняя кнопка',
  size: 'medium',
};

export const Large = Template.bind({});
Large.args = {
  children: 'Большая кнопка',
  size: 'large',
};

// Состояния
export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Отключенная кнопка',
  disabled: true,
};

export const Loading = Template.bind({});
Loading.args = {
  children: 'Загрузка...',
  loading: true,
};

// Группа кнопок
export const ButtonGroup = () => (
  <div style={{ display: 'flex', gap: tokens.spacing.md }}>
    <Button variant="contained">Сохранить</Button>
    <Button variant="outlined">Отменить</Button>
    <Button variant="text">Сбросить</Button>
  </div>
);

// Кнопки с иконками
export const WithIconsGroup = () => (
  <div style={{ display: 'flex', gap: tokens.spacing.md }}>
    <Button variant="contained">
      <span style={{ marginRight: tokens.spacing.sm }}>✓</span>
      Подтвердить
    </Button>
    <Button variant="outlined">
      <span style={{ marginRight: tokens.spacing.sm }}>✕</span>
      Отклонить
    </Button>
  </div>
);