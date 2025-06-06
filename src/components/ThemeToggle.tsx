import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon 
} from '@mui/icons-material';
import { getInteractiveStyles } from '../styles';
import { useAppTheme } from '../App';

const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { toggleTheme, isDarkMode } = useAppTheme();
  const interactiveStyles = getInteractiveStyles(theme);

  return (
    <Tooltip title={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}>
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