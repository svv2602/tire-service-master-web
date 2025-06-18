import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import { 
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { getTablePageStyles } from '../../styles/components';
import { Table as UITable, Column } from '../../components/ui/Table/Table';

const WordWrapTestPage: React.FC = () => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);

  // Тестовые данные с длинным текстом
  const testData = [
    {
      id: 1,
      name: 'Очень длинное название автомобильного бренда Mercedes-Benz',
      description: 'Исключительно подробное описание автомобильного сервиса, которое включает множество технических деталей и особенностей обслуживания',
      address: 'ул. Длинная улица с очень подробным адресом и номером дома 123, корпус 45А, офис 678',
      phone: '+7 (999) 123-45-67',
      status: 'active'
    },
    {
      id: 2,
      name: 'Volkswagen',
      description: 'Качественное обслуживание автомобилей немецкого производства с использованием оригинальных запчастей и современного диагностического оборудования',
      address: 'пр. Технологический, д. 89, торговый центр "Автомобильный", 3 этаж',
      phone: '+7 (888) 987-65-43',
      status: 'inactive'
    },
    {
      id: 3,
      name: 'BMW',
      description: 'Премиальный сервис',
      address: 'ул. Короткая, 1',
      phone: '+7 (777) 111-22-33',
      status: 'active'
    }
  ];

  // Колонки для UI компонента с переносом слов
  const columnsWithWrap: Column[] = [
    {
      id: 'name',
      label: 'Название',
      minWidth: 150,
      wrap: true
    },
    {
      id: 'description',
      label: 'Описание',
      minWidth: 200,
      wrap: true
    },
    {
      id: 'address',
      label: 'Адрес',
      minWidth: 180,
      wrap: true
    },
    {
      id: 'phone',
      label: 'Телефон',
      minWidth: 120
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 100,
      align: 'center',
      format: (value: string) => (
        <Chip
          label={value === 'active' ? 'Активен' : 'Неактивен'}
          color={value === 'active' ? 'success' : 'default'}
          size="small"
        />
      )
    }
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Тестирование переноса слов в таблицах
      </Typography>

      {/* Тест 1: Новый UI компонент с переносом слов */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. UI компонент Table с переносом слов
        </Typography>
        <Paper sx={{ padding: 2 }}>
          <UITable
            columns={columnsWithWrap}
            rows={testData}
            maxHeight={300}
          />
        </Paper>
      </Box>

      {/* Тест 2: Существующая таблица с применением tableCellWrap */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          2. Существующая таблица с стилями tableCellWrap
        </Typography>
        <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
          <Table>
            <TableHead sx={tablePageStyles.tableHeader}>
              <TableRow>
                <TableCell>Бренд</TableCell>
                <TableCell>Описание (с переносом)</TableCell>
                <TableCell>Адрес (с переносом)</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testData.map((item) => (
                <TableRow key={item.id} sx={tablePageStyles.tableRow}>
                  <TableCell>
                    <Box sx={tablePageStyles.avatarContainer}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <CarIcon />
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={tablePageStyles.tableCellWrap}>
                    <Typography variant="body2">
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tablePageStyles.tableCellWrap}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationIcon fontSize="small" sx={{ marginTop: 0.2 }} />
                      <Typography variant="body2">
                        {item.address}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" />
                      <Typography variant="body2">
                        {item.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status === 'active' ? 'Активен' : 'Неактивен'}
                      color={item.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Тест 3: Сравнение с таблицей без переноса слов */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          3. Таблица без переноса слов (для сравнения)
        </Typography>
        <TableContainer component={Paper} sx={tablePageStyles.tableContainer}>
          <Table>
            <TableHead sx={tablePageStyles.tableHeader}>
              <TableRow>
                <TableCell>Бренд</TableCell>
                <TableCell>Описание (без переноса)</TableCell>
                <TableCell>Адрес (без переноса)</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testData.map((item) => (
                <TableRow key={item.id} sx={tablePageStyles.tableRow}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tablePageStyles.tableCell}>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200
                      }}
                    >
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tablePageStyles.tableCell}>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 180
                      }}
                    >
                      {item.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status === 'active' ? 'Активен' : 'Неактивен'}
                      color={item.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Информация о тестах */}
      <Paper sx={{ padding: 2, backgroundColor: theme.palette.grey[50] }}>
        <Typography variant="h6" gutterBottom>
          Описание тестов
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Тест 1:</strong> Демонстрирует новый UI компонент Table с поддержкой переноса слов через prop wrap.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Тест 2:</strong> Показывает применение стилей tableCellWrap к существующим таблицам.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Тест 3:</strong> Сравнительная таблица без переноса слов для демонстрации разницы.
        </Typography>
        <Typography variant="body2" color="primary">
          Обратите внимание на то, как длинный текст обрабатывается в каждом случае.
        </Typography>
      </Paper>
    </Box>
  );
};

export default WordWrapTestPage;
