import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Table, TableProps, Column } from './Table';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default {
  title: 'UI/Table',
  component: Table,
  argTypes: {
    stickyHeader: {
      control: 'boolean',
      defaultValue: false,
    },
    maxHeight: {
      control: 'number',
    },
  },
} as Meta;

// Базовые данные для таблицы
const columns: Column[] = [
  { id: 'name', label: 'Название', minWidth: 150 },
  { id: 'code', label: 'Код', minWidth: 100 },
  {
    id: 'population',
    label: 'Население',
    minWidth: 120,
    align: 'right',
    format: (value: number) => value.toLocaleString('ru-RU'),
  },
  {
    id: 'size',
    label: 'Размер (км²)',
    minWidth: 120,
    align: 'right',
    format: (value: number) => value.toLocaleString('ru-RU'),
  },
  {
    id: 'density',
    label: 'Плотность',
    minWidth: 120,
    align: 'right',
    format: (value: number) => value.toFixed(2),
  },
];

const rows = [
  { name: 'Россия', code: 'RU', population: 146793744, size: 17098246, density: 8.59 },
  { name: 'Китай', code: 'CN', population: 1403500365, size: 9596961, density: 146.25 },
  { name: 'США', code: 'US', population: 331449281, size: 9833517, density: 33.71 },
  { name: 'Индия', code: 'IN', population: 1366417754, size: 3287263, density: 415.68 },
  { name: 'Бразилия', code: 'BR', population: 211049527, size: 8515767, density: 24.78 },
  { name: 'Германия', code: 'DE', population: 83019200, size: 357022, density: 232.53 },
  { name: 'Франция', code: 'FR', population: 67022000, size: 551695, density: 121.48 },
  { name: 'Япония', code: 'JP', population: 126476461, size: 377975, density: 334.62 },
];

// Шаблон таблицы
const Template: Story<TableProps> = (args) => <Table {...args} />;

// Основные варианты
export const Default = Template.bind({});
Default.args = {
  columns,
  rows,
};

export const StickyHeader = Template.bind({});
StickyHeader.args = {
  columns,
  rows: [...rows, ...rows, ...rows], // Дублируем строки для демонстрации
  stickyHeader: true,
  maxHeight: 400,
};

// Таблица с форматированием ячеек
const usersColumns: Column[] = [
  { 
    id: 'avatar', 
    label: '', 
    minWidth: 60,
    format: (value: string) => <Avatar src={value} sx={{ width: 40, height: 40 }} />
  },
  { id: 'name', label: 'Имя', minWidth: 150 },
  { id: 'email', label: 'Email', minWidth: 200 },
  { 
    id: 'status', 
    label: 'Статус', 
    minWidth: 120,
    align: 'center',
    format: (value: string) => 
      value === 'active' ? 
        <Chip 
          icon={<CheckCircleIcon fontSize="small" />} 
          label="Активен" 
          color="success" 
          size="small" 
        /> : 
        <Chip 
          icon={<CancelIcon fontSize="small" />} 
          label="Неактивен" 
          color="error" 
          size="small" 
        />
  },
  { 
    id: 'lastLogin', 
    label: 'Последний вход', 
    minWidth: 150,
    format: (value: string) => new Date(value).toLocaleString('ru-RU')
  },
];

const usersData = [
  { 
    avatar: 'https://i.pravatar.cc/150?img=1', 
    name: 'Иван Иванов', 
    email: 'ivan@example.com',
    status: 'active',
    lastLogin: '2023-06-15T10:30:00'
  },
  { 
    avatar: 'https://i.pravatar.cc/150?img=2', 
    name: 'Мария Петрова', 
    email: 'maria@example.com',
    status: 'inactive',
    lastLogin: '2023-05-20T15:45:00'
  },
  { 
    avatar: 'https://i.pravatar.cc/150?img=3', 
    name: 'Алексей Смирнов', 
    email: 'alex@example.com',
    status: 'active',
    lastLogin: '2023-06-14T09:15:00'
  },
  { 
    avatar: 'https://i.pravatar.cc/150?img=4', 
    name: 'Елена Кузнецова', 
    email: 'elena@example.com',
    status: 'active',
    lastLogin: '2023-06-16T11:20:00'
  },
];

export const FormattedCells = Template.bind({});
FormattedCells.args = {
  columns: usersColumns,
  rows: usersData,
};

// Таблица без данных
export const EmptyTable = Template.bind({});
EmptyTable.args = {
  columns,
  rows: [],
};

// Пример с кастомным стилем
export const CustomStyling = () => (
  <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>Статистика по странам</Typography>
    <Table
      columns={columns}
      rows={rows}
      sx={{
        '& .MuiTableCell-head': {
          backgroundColor: '#1976d2',
          color: 'white',
          fontWeight: 'bold'
        },
        '& .MuiTableRow-root:nth-of-type(odd)': {
          backgroundColor: '#f9f9f9'
        },
        '& .MuiTableRow-root:hover': {
          backgroundColor: '#e3f2fd'
        }
      }}
    />
  </Box>
); 