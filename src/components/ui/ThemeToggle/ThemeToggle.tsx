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
        color="inherit"
        sx={{
          ml: 1,
          transition: tokens.transitions.duration.normal,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.05)',
            transform: 'rotate(180deg)',
          },
          '&:active': {
            transform: 'scale(0.95) rotate(180deg)',
          },
        }}
        aria-label="Переключить тему"
      >
        {isDarkMode ? (
          <LightModeIcon sx={{ fontSize: 20 }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: 20 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;