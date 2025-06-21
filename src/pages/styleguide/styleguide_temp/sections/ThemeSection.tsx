import React from 'react';
import { Box, Typography } from '@mui/material';
import { Switch } from '../../../../components/ui/Switch';
import { useThemeMode } from '../../../../contexts/ThemeContext';

export const ThemeSection = () => {
  const { toggleTheme, mode } = useThemeMode();
  const isDarkMode = mode === 'dark';

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Тема оформления
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Переключатель темы
          </Typography>
          <Switch
            label={`Тёмная тема ${isDarkMode ? 'включена' : 'выключена'}`}
            checked={isDarkMode}
            onChange={toggleTheme}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ThemeSection; 