import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import Typography, { TypographyProps } from './Typography';
import { Box, Paper, Grid, Switch, FormControlLabel, ThemeProvider } from '@mui/material';
import { createTheme } from '../../../styles/theme/theme';

export default {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Typography - расширенный компонент для текста с поддержкой токенов дизайн-системы и различных вариантов стилей.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'subtitle1', 'subtitle2',
        'body1', 'body2',
        'button', 'caption', 'overline'
      ],
      description: 'Вариант типографики MUI',
    },
    textVariant: {
      control: 'select',
      options: [
        'primary', 'secondary', 'success',
        'error', 'warning', 'info', 'muted', undefined
      ],
      description: 'Цветовой вариант текста',
    },
    fontWeight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold', undefined],
      description: 'Вес шрифта',
    },
    align: {
      control: 'select',
      options: ['inherit', 'left', 'center', 'right', 'justify'],
      description: 'Выравнивание текста',
    },
  },
} as Meta;

const Template: Story<TypographyProps> = (args) => {
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
          <Typography {...args}>
            {args.children || 'Пример текста для компонента Typography'}
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  variant: 'body1',
};

export const Heading = Template.bind({});
Heading.args = {
  variant: 'h1',
  children: 'Заголовок первого уровня',
  fontWeight: 'bold',
};

export const ColorVariants: Story = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  const variants = [
    'primary', 'secondary', 'success',
    'error', 'warning', 'info', 'muted'
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
          <Grid container spacing={2}>
            {variants.map((variant) => (
              <Grid item xs={12} key={variant}>
                <Typography 
                  textVariant={variant as any} 
                  variant="body1"
                >
                  Текст с вариантом {variant}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export const FontWeights: Story = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  const weights = ['light', 'regular', 'medium', 'bold'];
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', borderRadius: 1 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Темная тема"
          sx={{ mb: 2 }}
        />
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {weights.map((weight) => (
              <Grid item xs={12} key={weight}>
                <Typography 
                  fontWeight={weight as any} 
                  variant="body1"
                >
                  Текст с весом {weight}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export const AllVariants: Story = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const theme = createTheme(darkMode ? 'dark' : 'light');
  
  const variants = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'subtitle1', 'subtitle2',
    'body1', 'body2',
    'button', 'caption', 'overline'
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
          <Grid container spacing={2}>
            {variants.map((variant) => (
              <Grid item xs={12} key={variant}>
                <Typography variant={variant as any}>
                  Текст с вариантом {variant}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};