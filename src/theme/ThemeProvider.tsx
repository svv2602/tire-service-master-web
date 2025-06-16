// src/theme/ThemeProvider.tsx
// Компонент-обертка для управления темой приложения

import React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as CustomThemeProvider } from '../contexts/ThemeContext';
import { GlobalUIStyles } from '../components/styled/CommonComponents';

/**
 * Компонент-обертка для управления темой приложения
 */
export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CustomThemeProvider>
      <>
        <CssBaseline />
        <GlobalUIStyles />
        {children}
      </>
    </CustomThemeProvider>
  );
};

export default AppThemeProvider;