import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import Rating from './Rating';
import { RatingProps } from './types';

export default {
  title: 'UI/Rating',
  component: Rating,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Размер компонента',
    },
    max: {
      control: 'number',
      description: 'Максимальное значение',
    },
    precision: {
      control: 'number',
      description: 'Точность (шаг) рейтинга',
    },
    readOnly: {
      control: 'boolean',
      description: 'Только для чтения',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключено',
    },
    label: {
      control: 'text',
      description: 'Подпись',
    },
    helperText: {
      control: 'text',
      description: 'Вспомогательный текст',
    },
    error: {
      control: 'boolean',
      description: 'Состояние ошибки',
    },
  },
} as Meta;

// Базовый пример
export const Default: Story<RatingProps> = (args) => {
  const [value, setValue] = useState<number | null>(3);
  
  return (
    <Rating
      {...args}
      value={value}
      onChange={setValue}
      label="Базовый рейтинг"
    />
  );
};

// Пример с половинными значениями
export const HalfRating: Story<RatingProps> = (args) => {
  const [value, setValue] = useState<number | null>(3.5);
  
  return (
    <Rating
      {...args}
      value={value}
      onChange={setValue}
      precision={0.5}
      label="Рейтинг с половинными значениями"
    />
  );
};

// Пример только для чтения
export const ReadOnly: Story<RatingProps> = (args) => (
  <Rating
    {...args}
    value={4}
    readOnly
    label="Рейтинг только для чтения"
  />
);

// Пример с ошибкой
export const WithError: Story<RatingProps> = (args) => {
  const [value, setValue] = useState<number | null>(null);
  
  return (
    <Rating
      {...args}
      value={value}
      onChange={setValue}
      error
      label="Рейтинг с ошибкой"
      helperText="Это поле обязательно для заполнения"
    />
  );
};

// Пример с разными размерами
export const Sizes: Story<RatingProps> = (args) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <Rating {...args} size="small" label="Маленький размер" value={3} />
    <Rating {...args} size="medium" label="Средний размер" value={3} />
    <Rating {...args} size="large" label="Большой размер" value={3} />
  </div>
); 