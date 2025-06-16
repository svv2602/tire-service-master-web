import React from 'react';
import { Story, Meta } from '@storybook/react';
import ThemeToggle from './ThemeToggle';
import { Box, Paper, Typography, ThemeProvider } from '@mui/material';
import { ThemeModeProvider } from '../../../contexts/ThemeContext';
import { createTheme } from '../../../styles/theme/theme';

export default {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    docs: {
      description: {
        component: 'Компонент ThemeToggle - кнопка для переключения между светлой и темной темой. Использует контекст темы для изменения режима.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeModeProvider>
        <Story />
      </ThemeModeProvider>
    ),
  ],
} as Meta;

const Template: Story = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Переключатель темы</Typography>
        <ThemeToggle />
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="body1" paragraph>
          Нажмите на иконку выше для переключения между светлой и темной темой.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Компонент использует ThemeContext для управления темой приложения.
        </Typography>
      </Box>
    </Box>
  );
};

export const Default = Template.bind({});

const InAppExample: Story = () => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };
  
  const theme = createTheme(mode);
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', minHeight: '200px', borderRadius: 1 }}>
        <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Пример в приложении</Typography>
          <ThemeToggle />
        </Paper>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" paragraph>
            Текущая тема: <strong>{mode === 'light' ? 'Светлая' : 'Темная'}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            В реальном приложении переключатель изменяет тему всего интерфейса.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export const AppExample = InAppExample.bind({});