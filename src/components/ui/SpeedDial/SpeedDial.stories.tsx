import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SpeedDial from './SpeedDial';
import { SpeedDialProps } from './types';
import { Box, Switch, FormControlLabel, ThemeProvider } from '@mui/material';
import { createTheme } from '../../../styles/theme/theme';

export default {
  title: 'UI/SpeedDial',
  component: SpeedDial,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Компонент SpeedDial - плавающая кнопка с выпадающим меню действий. Обновлен для поддержки токенов дизайн-системы и темной темы.',
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      description: 'Позиция на экране',
    },
    direction: {
      control: 'select',
      options: ['up', 'down', 'left', 'right'],
      description: 'Направление открытия',
    },
    margin: {
      control: 'number',
      description: 'Отступы от краев',
    },
  },
} as Meta;

// Базовый шаблон с поддержкой темной темы
const Template: Story<SpeedDialProps> = (args) => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', position: 'relative', p: 2, bgcolor: 'background.default' }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <SpeedDial
          {...args}
          open={open}
          onOpen={handleOpen}
          onClose={handleClose}
        />
      </Box>
    </ThemeProvider>
  );
};

// Базовый пример с цветами
export const Default = Template.bind({});
Default.args = {
  actions: [
    {
      id: 'edit',
      icon: <EditIcon />,
      tooltipTitle: 'Редактировать',
      onClick: () => console.log('Edit clicked'),
      color: '#2196F3', // Синий
    },
    {
      id: 'copy',
      icon: <FileCopyIcon />,
      tooltipTitle: 'Копировать',
      onClick: () => console.log('Copy clicked'),
      color: '#4CAF50', // Зеленый
    },
    {
      id: 'delete',
      icon: <DeleteIcon />,
      tooltipTitle: 'Удалить',
      onClick: () => console.log('Delete clicked'),
      color: '#F44336', // Красный
    },
  ],
  icon: <AddIcon />,
  tooltipTitle: 'Добавить',
  ariaLabel: 'Добавить новый элемент',
};

// Пример без цветов (использует цвета темы)
export const NoColors = Template.bind({});
NoColors.args = {
  actions: [
    {
      id: 'edit',
      icon: <EditIcon />,
      tooltipTitle: 'Редактировать',
      onClick: () => console.log('Edit clicked'),
    },
    {
      id: 'copy',
      icon: <FileCopyIcon />,
      tooltipTitle: 'Копировать',
      onClick: () => console.log('Copy clicked'),
    },
    {
      id: 'delete',
      icon: <DeleteIcon />,
      tooltipTitle: 'Удалить',
      onClick: () => console.log('Delete clicked'),
    },
  ],
  icon: <AddIcon />,
  tooltipTitle: 'Добавить',
  ariaLabel: 'Добавить новый элемент',
};

// Пример с разными позициями
export const TopLeft = Template.bind({});
TopLeft.args = {
  ...Default.args,
  position: 'top-left',
};

export const TopRight = Template.bind({});
TopRight.args = {
  ...Default.args,
  position: 'top-right',
};

export const BottomLeft = Template.bind({});
BottomLeft.args = {
  ...Default.args,
  position: 'bottom-left',
};

// Пример с разными направлениями
export const DirectionRight = Template.bind({});
DirectionRight.args = {
  ...Default.args,
  direction: 'right',
};

export const DirectionDown = Template.bind({});
DirectionDown.args = {
  ...Default.args,
  position: 'top-right',
  direction: 'down',
};

// Пример с отключенными действиями
export const WithDisabledAction = Template.bind({});
WithDisabledAction.args = {
  actions: [
    {
      id: 'edit',
      icon: <EditIcon />,
      tooltipTitle: 'Редактировать',
      onClick: () => console.log('Edit clicked'),
      color: '#2196F3',
    },
    {
      id: 'copy',
      icon: <FileCopyIcon />,
      tooltipTitle: 'Копировать',
      onClick: () => console.log('Copy clicked'),
      disabled: true,
      color: '#4CAF50',
    },
    {
      id: 'delete',
      icon: <DeleteIcon />,
      tooltipTitle: 'Удалить',
      onClick: () => console.log('Delete clicked'),
      color: '#F44336',
    },
  ],
  icon: <AddIcon />,
  tooltipTitle: 'Добавить',
  ariaLabel: 'Добавить новый элемент',
};