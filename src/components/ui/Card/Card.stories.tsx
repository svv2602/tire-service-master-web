import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Button } from '@mui/material';
import { Card } from './Card';
import { CardProps } from './types';

export default {
  title: 'UI/Card',
  component: Card,
} as Meta;

const Template: Story<CardProps> = (args) => <Card {...args} />;

// Базовая карточка
export const Basic = Template.bind({});
Basic.args = {
  title: 'Простая карточка',
  children: 'Содержимое карточки',
  hoverable: true,
};

// Карточка с медиа-контентом
export const WithMedia = Template.bind({});
WithMedia.args = {
  title: 'Карточка с изображением',
  media: {
    image: 'https://source.unsplash.com/random/800x400',
    alt: 'Случайное изображение',
    height: 200,
  },
  children: 'Описание изображения',
};

// Карточка с действиями
export const WithActions = Template.bind({});
WithActions.args = {
  title: 'Карточка с действиями',
  children: 'Содержимое карточки с действиями',
  hoverable: true,
  animated: true,
  actions: (
    <>
      <Button variant="contained" color="primary">Подтвердить</Button>
      <Button variant="outlined" color="secondary">Отмена</Button>
    </>
  ),
};

// Карточка с обводкой
export const Outlined = Template.bind({});
Outlined.args = {
  title: 'Карточка с обводкой',
  content: 'Вариант карточки с обводкой вместо тени.',
  variant: 'outlined',
};

// Кликабельная карточка
export const Clickable = Template.bind({});
Clickable.args = {
  title: 'Кликабельная карточка',
  content: 'Нажмите на карточку для выполнения действия.',
  onClick: () => alert('Карточка нажата!'),
  elevation: 2,
};