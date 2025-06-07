import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Switch } from '../../../../components/ui/Switch';

export const SwitchSection = () => {
  const [checked, setChecked] = useState(false);

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Переключатели
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Базовые переключатели
          </Typography>
          <Box display="flex" gap={2}>
            <Switch label="Стандартный" />
            <Switch label="Включенный" checked onChange={() => {}} />
            <Switch label="Отключенный" disabled />
            <Switch label="Включенный отключенный" checked disabled />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Интерактивный переключатель
          </Typography>
          <Switch
            label={`Переключатель ${checked ? 'включен' : 'выключен'}`}
            checked={checked}
            onChange={setChecked}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Цветные переключатели
          </Typography>
          <Box display="flex" gap={2}>
            <Switch label="Основной" color="primary" checked />
            <Switch label="Вторичный" color="secondary" checked />
            <Switch label="Успех" color="success" checked />
            <Switch label="Ошибка" color="error" checked />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SwitchSection; 