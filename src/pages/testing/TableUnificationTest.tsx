import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ResponsiveTable } from '../../components/ui/Table/ResponsiveTable';
import { VirtualizedResponsiveTable } from '../../components/ui/Table/VirtualizedResponsiveTable';
import { LazyImage } from '../../components/ui/LazyImage';

// Генерация тестовых данных
const testRows = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Имя пользователя ${i + 1}`,
  email: `user${i + 1}@example.com`,
  logo: i % 3 === 0 ? `https://api.dicebear.com/7.x/identicon/svg?seed=${i}` : '',
  description: 'Очень длинное описание '.repeat((i % 5) + 1),
  status: i % 2 === 0 ? 'active' : 'inactive',
}));

const columns = [
  {
    id: 'logo',
    label: 'Логотип',
    minWidth: 60,
    maxWidth: 80,
    render: (row: any) => <LazyImage src={row.logo} alt={row.name} style={{ width: 40, height: 40, borderRadius: 8 }} fallback={<span style={{color:'#bbb'}}>—</span>} />, 
    hideOnMobile: true,
    sticky: true,
  },
  {
    id: 'name',
    label: 'Имя',
    minWidth: 120,
    render: (row: any) => row.name,
    ellipsis: true,
  },
  {
    id: 'email',
    label: 'Email',
    minWidth: 180,
    render: (row: any) => row.email,
    ellipsis: true,
    hideOnMobile: true,
  },
  {
    id: 'description',
    label: 'Описание',
    minWidth: 200,
    maxWidth: 300,
    render: (row: any) => row.description,
    ellipsis: true,
    hideOnTablet: true,
  },
  {
    id: 'status',
    label: 'Статус',
    minWidth: 80,
    render: (row: any) => row.status === 'active' ? 'Активен' : 'Неактивен',
  },
];

export default function TableUnificationTest() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Тестовая страница унификации таблиц</Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">ResponsiveTable (до 1000 строк)</Typography>
        <ResponsiveTable columns={columns} rows={testRows.slice(0, 20)} rowKey={row => row.id} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">VirtualizedResponsiveTable (1000 строк)</Typography>
        <VirtualizedResponsiveTable columns={columns} rows={testRows} rowKey={row => row.id} height={400} rowHeight={48} />
      </Paper>
    </Box>
  );
}
