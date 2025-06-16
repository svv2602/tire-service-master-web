import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Switch, SwitchProps } from './Switch';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Switch',
  component: Switch,
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      defaultValue: 'medium',
    },
    labelPlacement: {
      control: 'select',
      options: ['start', 'end', 'top', 'bottom'],
      defaultValue: 'end',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    checked: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as Meta;

const Template: Story<SwitchProps> = (args) => <Switch {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  label: 'Переключатель',
};

export const Checked = Template.bind({});
Checked.args = {
  label: 'Включенный переключатель',
  checked: true,
};

export const WithoutLabel = Template.bind({});
WithoutLabel.args = {
  checked: false,
};

// Размеры
export const Small = Template.bind({});
Small.args = {
  label: 'Маленький переключатель',
  size: 'small',
};

export const Medium = Template.bind({});
Medium.args = {
  label: 'Средний переключатель',
  size: 'medium',
};

export const Large = Template.bind({});
Large.args = {
  label: 'Большой переключатель',
  size: 'large',
};

// Цвета
export const Primary = Template.bind({});
Primary.args = {
  label: 'Основной цвет',
  color: 'primary',
  checked: true,
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Вторичный цвет',
  color: 'secondary',
  checked: true,
};

export const Success = Template.bind({});
Success.args = {
  label: 'Успех',
  color: 'success',
  checked: true,
};

export const Warning = Template.bind({});
Warning.args = {
  label: 'Предупреждение',
  color: 'warning',
  checked: true,
};

export const Error = Template.bind({});
Error.args = {
  label: 'Ошибка',
  color: 'error',
  checked: true,
};

// Позиция лейбла
export const LabelStart = Template.bind({});
LabelStart.args = {
  label: 'Лейбл слева',
  labelPlacement: 'start',
};

export const LabelEnd = Template.bind({});
LabelEnd.args = {
  label: 'Лейбл справа',
  labelPlacement: 'end',
};

export const LabelTop = Template.bind({});
LabelTop.args = {
  label: 'Лейбл сверху',
  labelPlacement: 'top',
};

export const LabelBottom = Template.bind({});
LabelBottom.args = {
  label: 'Лейбл снизу',
  labelPlacement: 'bottom',
};

// Состояния
export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Отключенный переключатель',
  disabled: true,
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  label: 'Отключенный включенный переключатель',
  disabled: true,
  checked: true,
};

// Интерактивный пример
export const Interactive = () => {
  const [checked, setChecked] = useState(false);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, isChecked: boolean) => {
    setChecked(isChecked);
  };
  
  return (
    <div>
      <Switch
        label="Интерактивный переключатель"
        checked={checked}
        onChange={handleChange}
      />
      <div style={{ marginTop: tokens.spacing.md, color: 'gray' }}>
        Состояние: {checked ? 'Включено' : 'Выключено'}
      </div>
    </div>
  );
};

// Группа переключателей
export const SwitchGroup = () => {
  const [state, setState] = useState({
    notifications: true,
    darkMode: false,
    autoSave: false,
  });
  
  const handleChange = (option: keyof typeof state) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setState({
      ...state,
      [option]: checked,
    });
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
      <Switch
        label="Уведомления"
        checked={state.notifications}
        onChange={handleChange('notifications')}
      />
      <Switch
        label="Темный режим"
        checked={state.darkMode}
        onChange={handleChange('darkMode')}
      />
      <Switch
        label="Автосохранение"
        checked={state.autoSave}
        onChange={handleChange('autoSave')}
      />
      <div style={{ marginTop: tokens.spacing.md, color: 'gray' }}>
        Активные настройки: {Object.entries(state)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(', ') || 'нет активных настроек'}
      </div>
    </div>
  );
};