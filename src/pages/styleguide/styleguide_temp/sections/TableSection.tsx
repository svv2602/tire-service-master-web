import React from 'react';
import { Box, Typography } from '@mui/material';
import { Table, Column } from '../../../../components/ui/Table';

export const TableSection = () => {
  const columns: Column[] = [
    { 
      id: 'name', 
      label: 'Название', 
      minWidth: 170,
      align: 'left'
    },
    { 
      id: 'code', 
      label: 'Код', 
      minWidth: 100,
      align: 'left'
    },
    {
      id: 'population',
      label: 'Население',
      minWidth: 170,
      align: 'right',
      format: (value: number) => value.toLocaleString('ru-RU'),
    },
  ];

  const data = [
    { name: 'Россия', code: 'RU', population: 146793744 },
    { name: 'Китай', code: 'CN', population: 1402112000 },
    { name: 'Италия', code: 'IT', population: 60317000 },
    { name: 'США', code: 'US', population: 331002651 },
    { name: 'Канада', code: 'CA', population: 37742154 },
  ];

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Таблицы
      </Typography>
      <Box display="flex" flexDirection="column" gap={4}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Простая таблица
          </Typography>
          <Table
            columns={columns}
            rows={data}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Таблица с фиксированным заголовком
          </Typography>
          <Table
            columns={columns}
            rows={data}
            stickyHeader
            maxHeight={300}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TableSection;