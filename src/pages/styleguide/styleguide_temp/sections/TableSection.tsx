import React from 'react';
import { Typography, Box } from '@mui/material';
import { Table } from '../../../../components/ui/Table';

const columns = [
  { id: 'name', label: 'Название', minWidth: 170 },
  { id: 'code', label: 'Код', minWidth: 100 },
  {
    id: 'population',
    label: 'Население',
    minWidth: 170,
    align: 'right' as const,
    format: (value: number) => value.toLocaleString('ru-RU'),
  },
  {
    id: 'size',
    label: 'Размер',
    minWidth: 170,
    align: 'right' as const,
    format: (value: number) => value.toLocaleString('ru-RU'),
  },
];

const createData = (name: string, code: string, population: number, size: number) => {
  return { name, code, population, size };
};

const rows = [
  createData('Индия', 'IN', 1324171354, 3287263),
  createData('Китай', 'CN', 1403500365, 9596961),
  createData('Италия', 'IT', 60483973, 301340),
  createData('США', 'US', 327167434, 9833520),
  createData('Канада', 'CA', 37602103, 9984670),
];

export const TableSection: React.FC = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Таблицы
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Простая таблица
        </Typography>
        <Table
          columns={columns}
          rows={rows}
        />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Таблица с пагинацией
        </Typography>
        <Table
          columns={columns}
          rows={rows}
          pagination
        />
      </Box>
    </Box>
  );
};

export default TableSection;