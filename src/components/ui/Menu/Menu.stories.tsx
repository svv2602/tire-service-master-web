import React, { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Menu from './Menu';
import { MenuItem } from './types';

const meta = {
  title: 'UI/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Menu>;

export default meta;

// Базовый пример
export const Basic: StoryFn = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const items: MenuItem[] = [
    { id: 1, label: 'Редактировать' },
    { id: 2, label: 'Удалить' },
    { id: 3, label: 'Копировать' },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelect = (item: MenuItem) => {
    console.log('Selected:', item);
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClick}>
        Открыть меню
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        items={items}
        onSelect={handleSelect}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
};

// Меню с иконками
export const WithIcons: StoryFn = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const items: MenuItem[] = [
    { id: 1, label: 'Редактировать', icon: <EditIcon /> },
    { id: 2, label: 'Удалить', icon: <DeleteIcon />, divider: true },
    { id: 3, label: 'Копировать', icon: <ContentCopyIcon /> },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelect = (item: MenuItem) => {
    console.log('Selected:', item);
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClick}>
        Меню с иконками
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        items={items}
        onSelect={handleSelect}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
};

// Меню с отключенными элементами
export const WithDisabledItems: StoryFn = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const items: MenuItem[] = [
    { id: 1, label: 'Редактировать', icon: <EditIcon /> },
    { id: 2, label: 'Удалить', icon: <DeleteIcon />, disabled: true },
    { id: 3, label: 'Копировать', icon: <ContentCopyIcon /> },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelect = (item: MenuItem) => {
    console.log('Selected:', item);
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClick}>
        Меню с отключенными элементами
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        items={items}
        onSelect={handleSelect}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
}; 