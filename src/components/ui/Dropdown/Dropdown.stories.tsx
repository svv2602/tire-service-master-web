import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Dropdown, DropdownProps, DropdownItem } from './Dropdown';
import { 
  Box, 
  Paper, 
  Typography, 
  Switch, 
  FormControlLabel, 
  ThemeProvider,
  Button,
  Grid,
  Avatar
} from '@mui/material';
import { createTheme } from '../../../styles/theme/theme';

// Иконки для примеров
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

export default {
  title: 'UI/Dropdown',
  component: Dropdown,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Dropdown - выпадающее меню с различными вариантами отображения. Обновлен для поддержки токенов дизайн-системы и темной темы.',
      },
    },
  },
} as Meta;

const Template: Story<DropdownProps> = (args) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <Dropdown {...args} />
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

// Базовые элементы меню для всех примеров
const baseItems: DropdownItem[] = [
  {
    id: 'edit',
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: () => console.log('Edit clicked'),
  },
  {
    id: 'copy',
    label: 'Копировать',
    icon: <ContentCopyIcon />,
    onClick: () => console.log('Copy clicked'),
  },
  {
    id: 'share',
    label: 'Поделиться',
    icon: <ShareIcon />,
    onClick: () => console.log('Share clicked'),
  },
  {
    id: 'download',
    label: 'Скачать',
    icon: <DownloadIcon />,
    onClick: () => console.log('Download clicked'),
  },
  {
    id: 'delete',
    label: 'Удалить',
    icon: <DeleteIcon />,
    onClick: () => console.log('Delete clicked'),
    danger: true,
  },
];

// Пример с иконкой
export const IconVariant = Template.bind({});
IconVariant.args = {
  items: baseItems,
  variant: 'icon',
};

// Пример с кнопкой
export const ButtonVariant = Template.bind({});
ButtonVariant.args = {
  items: baseItems,
  variant: 'button',
  label: 'Действия',
};

// Пример с кастомным триггером
export const CustomTrigger = Template.bind({});
CustomTrigger.args = {
  items: baseItems,
  trigger: (
    <Button 
      variant="contained" 
      color="primary" 
      startIcon={<MoreVertIcon />}
    >
      Открыть меню
    </Button>
  ),
};

// Пример с отключенными элементами
export const WithDisabledItems = Template.bind({});
WithDisabledItems.args = {
  items: [
    ...baseItems.slice(0, 2),
    {
      ...baseItems[2],
      disabled: true,
    },
    ...baseItems.slice(3),
  ],
  variant: 'button',
  label: 'С отключенными элементами',
};

// Пример с разделителями
export const WithDividers = Template.bind({});
WithDividers.args = {
  items: [
    ...baseItems.slice(0, 2),
    {
      id: 'divider1',
      label: '',
      onClick: () => {},
      divider: true,
    },
    ...baseItems.slice(2, 4),
    {
      id: 'divider2',
      label: '',
      onClick: () => {},
      divider: true,
    },
    baseItems[4],
  ],
  variant: 'button',
  label: 'С разделителями',
};

// Пример с пользовательским меню
export const UserMenu: Story<DropdownProps> = (args) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  const userMenuItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Мой профиль',
      icon: <PersonIcon />,
      onClick: () => console.log('Profile clicked'),
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: <SettingsIcon />,
      onClick: () => console.log('Settings clicked'),
    },
    {
      id: 'divider',
      label: '',
      onClick: () => {},
      divider: true,
    },
    {
      id: 'logout',
      label: 'Выйти',
      icon: <LogoutIcon />,
      onClick: () => console.log('Logout clicked'),
    },
  ];
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Dropdown
              items={userMenuItems}
              trigger={
                <Avatar sx={{ cursor: 'pointer', bgcolor: theme.palette.primary.main }}>
                  ИП
                </Avatar>
              }
            />
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

// Пример с различными вариантами
export const AllVariants: Story<DropdownProps> = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Иконка
                </Typography>
                <Dropdown
                  items={baseItems}
                  variant="icon"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Кнопка
                </Typography>
                <Dropdown
                  items={baseItems}
                  variant="button"
                  label="Действия"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Кастомный триггер
                </Typography>
                <Dropdown
                  items={baseItems}
                  trigger={
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      startIcon={<SettingsIcon />}
                    >
                      Опции
                    </Button>
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};