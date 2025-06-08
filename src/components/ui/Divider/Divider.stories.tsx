import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Stack, Typography } from '@mui/material';
import Divider from './Divider';

const meta = {
  title: 'UI/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Divider>;

export default meta;

// Базовый пример
export const Basic: StoryFn = () => (
  <Stack spacing={2} sx={{ width: 300 }}>
    <Typography>Текст сверху</Typography>
    <Divider />
    <Typography>Текст снизу</Typography>
  </Stack>
);

// С текстом
export const WithText: StoryFn = () => (
  <Stack spacing={2} sx={{ width: 300 }}>
    <Typography>Первая секция</Typography>
    <Divider text="ИЛИ" />
    <Typography>Вторая секция</Typography>
  </Stack>
);

// Вертикальный разделитель
export const Vertical: StoryFn = () => (
  <Stack
    direction="row"
    spacing={2}
    alignItems="center"
    sx={{ height: 100 }}
  >
    <Typography>Слева</Typography>
    <Divider orientation="vertical" flexItem />
    <Typography>Справа</Typography>
  </Stack>
);

// Разные варианты
export const Variants: StoryFn = () => (
  <Stack spacing={2} sx={{ width: 300 }}>
    <Divider text="Обычный" />
    <Divider text="По центру" textAlign="center" />
    <Divider text="Справа" textAlign="right" />
    <Divider text="С отступами" textPadding={4} />
    <Divider variant="middle" text="Middle" />
    <Divider variant="inset" text="Inset" />
  </Stack>
); 