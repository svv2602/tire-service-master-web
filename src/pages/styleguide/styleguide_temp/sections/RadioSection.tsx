import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Radio } from '../../../../components/ui/Radio';
import type { RadioOption } from '../../../../components/ui/Radio';

export const RadioSection = () => {
  const [selectedValue, setSelectedValue] = useState('a');

  const options: RadioOption[] = [
    { value: 'a', label: 'Опция А' },
    { value: 'b', label: 'Опция Б' },
    { value: 'c', label: 'Опция В' }
  ];

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Радио кнопки
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Базовые радио кнопки
          </Typography>
          <Box display="flex" gap={2}>
            <Radio
              label="Опция А"
              value="a"
              options={options}
              checked={selectedValue === 'a'}
              onChange={setSelectedValue}
            />
            <Radio
              label="Опция Б"
              value="b"
              options={options}
              checked={selectedValue === 'b'}
              onChange={setSelectedValue}
            />
            <Radio
              label="Отключенная"
              value="c"
              options={options}
              disabled
              checked={selectedValue === 'c'}
              onChange={setSelectedValue}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Радио группа
          </Typography>
          <Radio
            label="Выберите вариант"
            value={selectedValue}
            options={options}
            onChange={setSelectedValue}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RadioSection; 