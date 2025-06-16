import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import Rating from './Rating';
import { RatingProps } from './types';
import { Box, Typography, Stack, Switch, FormControlLabel, ThemeProvider } from '@mui/material';
import { createTheme } from '../../../styles/theme/theme';

export default {
  title: 'UI/Rating',
  component: Rating,
  parameters: {
    docs: {
      description: {
        component: 'Компонент звездочного рейтинга с поддержкой различных размеров и состояний. Обновлен для поддержки токенов дизайн-системы и темной темы.',
      },
    },
  },
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
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Rating
          {...args}
          value={value}
          onChange={setValue}
          label="Базовый рейтинг"
        />
      </Box>
    </ThemeProvider>
  );
};

// Пример с половинными значениями
export const HalfRating: Story<RatingProps> = (args) => {
  const [value, setValue] = useState<number | null>(3.5);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Rating
          {...args}
          value={value}
          onChange={setValue}
          precision={0.5}
          label="Рейтинг с половинными значениями"
        />
      </Box>
    </ThemeProvider>
  );
};

// Пример только для чтения
export const ReadOnly: Story<RatingProps> = (args) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Rating
          {...args}
          value={4}
          readOnly
          label="Рейтинг только для чтения"
        />
      </Box>
    </ThemeProvider>
  );
};

// Пример с ошибкой
export const WithError: Story<RatingProps> = (args) => {
  const [value, setValue] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Rating
          {...args}
          value={value}
          onChange={setValue}
          error
          label="Рейтинг с ошибкой"
          helperText="Это поле обязательно для заполнения"
        />
      </Box>
    </ThemeProvider>
  );
};

// Пример с разными размерами
export const Sizes: Story<RatingProps> = (args) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Stack spacing={2}>
          <Rating {...args} size="small" label="Маленький размер" value={3} />
          <Rating {...args} size="medium" label="Средний размер" value={3} />
          <Rating {...args} size="large" label="Большой размер" value={3} />
        </Stack>
      </Box>
    </ThemeProvider>
  );
}; 