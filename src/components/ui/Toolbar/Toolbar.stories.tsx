import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Toolbar from './Toolbar';
import { ToolbarProps } from './types';
import { Button, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

// Определяем мета-информацию для компонента
const meta = {
  title: 'UI/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof Toolbar>;

// Базовый вариант
export const Basic: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <Typography variant="h6">Toolbar</Typography>
      <Button color="inherit">Action</Button>
    </Toolbar>
  ),
};

// С меню и поиском
export const WithNavigation: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Dashboard
      </Typography>
      <IconButton color="inherit">
        <SearchIcon />
      </IconButton>
      <Button color="inherit">Login</Button>
    </Toolbar>
  ),
};

// Компактный вариант
export const Dense: Story = {
  render: (args) => (
    <Toolbar {...args} variant="dense">
      <Typography variant="subtitle1">Compact Toolbar</Typography>
      <Button size="small" color="inherit">
        Action
      </Button>
    </Toolbar>
  ),
}; 