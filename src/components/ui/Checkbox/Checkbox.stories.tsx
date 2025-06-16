import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Checkbox, CheckboxProps } from './Checkbox';
import { tokens } from '../../../styles/theme/tokens';

export default {
  title: 'UI/Checkbox',
  component: Checkbox,
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

const Template: Story<CheckboxProps> = (args) => <Checkbox {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  label: 'Чекбокс',
};

export const Checked = Template.bind({});
Checked.args = {
  label: 'Выбранный чекбокс',
  checked: true,
};

export const WithoutLabel = Template.bind({});
WithoutLabel.args = {
  checked: false,
};

// Размеры
export const Small = Template.bind({});
Small.args = {
  label: 'Маленький чекбокс',
  size: 'small',
};

export const Medium = Template.bind({});
Medium.args = {
  label: 'Средний чекбокс',
  size: 'medium',
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
  label: 'Отключенный чекбокс',
  disabled: true,
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  label: 'Отключенный выбранный чекбокс',
  disabled: true,
  checked: true,
};

// Интерактивный пример
export const Interactive = () => {
  const [checked, setChecked] = useState(false);
  
  const handleChange = (isChecked: boolean) => {
    setChecked(isChecked);
  };
  
  return (
    <div>
      <Checkbox
        label="Интерактивный чекбокс"
        checked={checked}
        onChange={handleChange}
      />
      <div style={{ marginTop: tokens.spacing.md, color: 'gray' }}>
        Состояние: {checked ? 'Выбран' : 'Не выбран'}
      </div>
    </div>
  );
};

// Группа чекбоксов
export const CheckboxGroup = () => {
  const [state, setState] = useState({
    option1: true,
    option2: false,
    option3: false,
  });
  
  const handleChange = (option: keyof typeof state) => (checked: boolean) => {
    setState({
      ...state,
      [option]: checked,
    });
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
      <Checkbox
        label="Опция 1"
        checked={state.option1}
        onChange={handleChange('option1')}
      />
      <Checkbox
        label="Опция 2"
        checked={state.option2}
        onChange={handleChange('option2')}
      />
      <Checkbox
        label="Опция 3"
        checked={state.option3}
        onChange={handleChange('option3')}
      />
      <div style={{ marginTop: tokens.spacing.md, color: 'gray' }}>
        Выбраны: {Object.entries(state)
          .filter(([_, value]) => value)
          .map(([key]) => key.replace('option', 'Опция '))
          .join(', ') || 'нет выбранных опций'}
      </div>
    </div>
  );
};