import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Stack } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import Badge from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Badge>;

export default meta;

// Базовый пример
export const Basic: StoryFn = () => (
  <Stack spacing={4} direction="row" alignItems="center">
    <Badge badgeContent={4}>
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={100} max={99}>
      <MailIcon />
    </Badge>
  </Stack>
);

// Разные цвета
export const Colors: StoryFn = () => (
  <Stack spacing={4} direction="row" alignItems="center">
    <Badge badgeContent={4} color="primary">
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={4} color="secondary">
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={4} color="error">
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={4} color="warning">
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={4} color="info">
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={4} color="success">
      <NotificationsIcon />
    </Badge>
  </Stack>
);

// Точка
export const Dot: StoryFn = () => (
  <Stack spacing={4} direction="row" alignItems="center">
    <Badge dot color="primary">
      <NotificationsIcon />
    </Badge>
    <Badge dot color="error">
      <MailIcon />
    </Badge>
  </Stack>
);

// Позиционирование
export const Positioning: StoryFn = () => (
  <Stack spacing={4} direction="row" alignItems="center">
    <Badge badgeContent={4} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={4} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
      <NotificationsIcon />
    </Badge>
    <Badge badgeContent={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <NotificationsIcon />
    </Badge>
  </Stack>
); 