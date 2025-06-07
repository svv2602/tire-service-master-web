import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Checkbox } from '../../../../components/ui/Checkbox';

export const CheckboxSection = () => {
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Чекбоксы
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Базовые чекбоксы
          </Typography>
          <Box display="flex" gap={2}>
            <Checkbox label="Стандартный" />
            <Checkbox label="Отмеченный" checked onChange={() => {}} />
            <Checkbox label="Отключенный" disabled />
            <Checkbox label="Отмеченный отключенный" checked disabled />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Интерактивный чекбокс
          </Typography>
          <Checkbox
            label="Нажми меня"
            checked={checked}
            onChange={setChecked}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Неопределенное состояние
          </Typography>
          <Checkbox
            label="Неопределенный"
            indeterminate={indeterminate}
            checked={!indeterminate}
            onChange={() => setIndeterminate(!indeterminate)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CheckboxSection; 