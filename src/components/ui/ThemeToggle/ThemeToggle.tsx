// src/components/ui/ThemeToggle/ThemeToggle.tsx
// Компонент для переключения между светлой и темной темой

import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon 
} from '@mui/icons-material';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { tokens } from '../../../styles/theme/tokens';

/**
 * Компонент для переключения между светлой и темной темой
 */
const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const isDarkMode = mode === 'dark';

  return (
    <Tooltip title={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          ml: 1,
          color: theme.palette.mode === 'dark' ? '#fff' : '#0d2345',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : '#fff',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.2)' 
            : '1.5px solid #1976d2',
          transition: tokens.transitions.duration.normal,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : '#e3f0ff',
            transform: 'rotate(180deg)',
            borderColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.3)' 
              : '#1565c0',
          },
          '&:active': {
            transform: 'scale(0.95) rotate(180deg)',
          },
        }}
        aria-label="Переключить тему"
      >
        {isDarkMode ? (
          <LightModeIcon sx={{ fontSize: 22, color: '#FFC107' }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: 22, color: '#0d2345' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;