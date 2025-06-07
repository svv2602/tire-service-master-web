import React from 'react';
import { Typography, Box } from '@mui/material';
import { Table, Column } from '../../../components/ui/Table';

const columns: Column[] = [
  { 
    id: 'name', 
    label: 'Название', 
    minWidth: 170 
  },
  { 
    id: 'code', 
    label: 'Код', 
    minWidth: 100 
  },
  { 
    id: 'population', 
    label: 'Население', 
    minWidth: 170, 
    align: 'right' as const,
    format: (value: number) => value.toLocaleString('ru-RU')
  }
];

const rows = [
  { name: 'Россия', code: 'RU', population: 146793744 },
  { name: 'Китай', code: 'CN', population: 1402112000 },
  { name: 'США', code: 'US', population: 331002651 }
];

export const TableSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Таблицы
      </Typography>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Простая таблица
        </Typography>
        <Table
          columns={columns}
          rows={rows}
        />
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Таблица с пагинацией
        </Typography>
        <Table
          columns={columns}
          rows={rows}
          pagination
          rowsPerPage={2}
        />
      </Box>
    </Box>
  );
};

export default TableSection; 