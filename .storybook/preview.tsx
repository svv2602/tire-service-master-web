import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '../src/styles/theme/theme';
import { ThemeProvider as CustomThemeProvider } from '../src/contexts/ThemeContext';

// Глобальные стили для историй
const styles = {
  padding: '20px',
  minHeight: '100vh',
};

const withThemeProvider = (Story, context) => {
  // Получаем текущую тему из параметров
  const { globals } = context;
  const theme = globals.theme || 'light';
  
  return (
    <CustomThemeProvider>
      <div style={{ ...styles }}>
        <Story />
      </div>
    </CustomThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#121212' },
      ],
    },
    layout: 'centered',
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  decorators: [withThemeProvider],
};

export default preview;