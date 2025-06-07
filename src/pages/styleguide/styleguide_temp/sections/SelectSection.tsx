import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Select } from '../../../../components/ui/Select';
import type { SelectOption } from '../../../../components/ui/Select';

export const SelectSection = () => {
  const [value, setValue] = useState<string>('');
  const [multiValue, setMultiValue] = useState<string[]>([]);

  const options: SelectOption[] = [
    { value: 'chocolate', label: 'Шоколад' },
    { value: 'strawberry', label: 'Клубника' },
    { value: 'vanilla', label: 'Ваниль' }
  ];

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Выпадающие списки
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Базовый выпадающий список
          </Typography>
          <Select
            label="Выберите вкус"
            value={value}
            onChange={(newValue) => setValue(newValue.toString())}
            options={options}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Множественный выбор
          </Typography>
          <Select
            label="Выберите несколько вкусов"
            value={multiValue}
            onChange={(newValue) => {
              if (Array.isArray(newValue)) {
                setMultiValue(newValue.map(v => v.toString()));
              }
            }}
            options={options}
            multiple
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Отключенное состояние
          </Typography>
          <Select
            label="Отключенный список"
            value=""
            onChange={() => {}}
            options={options}
            disabled
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SelectSection; 