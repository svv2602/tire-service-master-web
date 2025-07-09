import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon 
} from '@mui/icons-material';
import { getInteractiveStyles } from '../styles';
import { useThemeMode } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { toggleTheme, mode } = useThemeMode();
  const { t } = useTranslation('components');
  const isDarkMode = mode === 'dark';
  const interactiveStyles = getInteractiveStyles(theme);

  return (
    <Tooltip title={isDarkMode ? t('themeToggle.lightMode') : t('themeToggle.darkMode')}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          ml: 1,
          ...interactiveStyles.pressEffect,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'rotate(180deg)',
          },
        }}
        aria-label={t('themeToggle.ariaLabel')}
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