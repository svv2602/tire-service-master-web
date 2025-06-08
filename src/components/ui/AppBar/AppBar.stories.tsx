import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Button } from '@mui/material';
import { AppBar } from './AppBar';
import { AppBarProps } from './types';

export default {
  title: 'UI/AppBar',
  component: AppBar,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const Template: Story<AppBarProps> = (args) => <AppBar {...args} />;

// Базовый пример
export const Basic = Template.bind({});
Basic.args = {
  title: 'Панель управления',
};

// С кнопкой меню
export const WithMenu = Template.bind({});
WithMenu.args = {
  title: 'Панель управления',
  onMenuClick: () => console.log('Menu clicked'),
};

// С дополнительными действиями
export const WithActions = Template.bind({});
WithActions.args = {
  title: 'Панель управления',
  onMenuClick: () => console.log('Menu clicked'),
  actions: (
    <>
      <Button color="inherit">Профиль</Button>
      <Button color="inherit">Выйти</Button>
    </>
  ),
};

// С длинным заголовком
export const LongTitle = Template.bind({});
LongTitle.args = {
  title: 'Очень длинный заголовок, который должен обрезаться при нехватке места',
  onMenuClick: () => console.log('Menu clicked'),
  actions: (
    <Button color="inherit">Действие</Button>
  ),
};

// Статичный AppBar
export const Static = Template.bind({});
Static.args = {
  title: 'Статичная панель',
  position: 'static',
  onMenuClick: () => console.log('Menu clicked'),
};