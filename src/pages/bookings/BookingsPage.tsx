import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  CircularProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Временные данные для демонстрации
const mockBookings = [
  { 
    id: 1, 
    client_name: 'Іван Петренко',
    service_point_name: 'ШиноСервіс Експрес - Київ',
    date: '2023-07-15',
    time: '14:30',
    duration: 60,
    services: ['Заміна шин', 'Балансування'],
    status: 'completed',
    car: 'Toyota Camry (АА1234КК)',
    phone: '+380 67 123 45 67'
  },
  { 
    id: 2, 
    client_name: 'Марія Коваленко',
    service_point_name: 'АвтоШина Плюс - Львів',
    date: '2023-07-16',
    time: '12:00',
    duration: 45,
    services: ['Заміна шин'],
    status: 'confirmed',
    car: 'Honda Civic (ВН5678ІК)',
    phone: '+380 50 222 33 44'
  },
  { 
    id: 3, 
    client_name: 'Олексій Шевченко',
    service_point_name: 'ШиноСервіс Експрес - Київ',
    date: '2023-07-16',
    time: '16:15',
    duration: 90,
    services: ['Заміна шин', 'Балансування', 'Ремонт диска'],
    status: 'cancelled',
    car: 'BMW X5 (КА9999ХХ)',
    phone: '+380 63 555 66 77'
  },
  { 
    id: 4, 
    client_name: 'Дмитро Коваль',
    service_point_name: 'ШинМайстер - Одеса',
    date: '2023-07-17',
    time: '10:00',
    duration: 60,
    services: ['Заміна шин', 'Балансування'],
    status: 'pending',
    car: 'Kia Rio (ОД3210ВВ)',
    phone: '+380 67 777 88 99'
  },
  { 
    id: 5, 
    client_name: 'Олена Мельник',
    service_point_name: 'АвтоШина Плюс - Львів',
    date: '2023-07-18',
    time: '11:30',
    duration: 30,
    services: ['Підкачування шин'],
    status: 'confirmed',
    car: 'Hyundai Solaris (BC6543OO)',
    phone: '+380 50 111 22 33'
  },
];

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(mockBookings);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(mockBookings.length);

  const loadBookings = useCallback(() => {
    setLoading(true);
    
    // Имитация загрузки данных с сервера
    setTimeout(() => {
      // Фильтрация по поисковому запросу
      const filteredBookings = mockBookings.filter(booking => 
        booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.service_point_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.car.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setBookings(filteredBookings);
      setTotalItems(filteredBookings.length);
      setLoading(false);
    }, 500);
  }, [searchQuery]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleSearch = () => {
    setPage(1);
    loadBookings();
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewBooking = (id: number) => {
    navigate(`/bookings/${id}`);
  };

  const handleAddBooking = () => {
    navigate('/bookings/new');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Виконано';
      case 'confirmed':
        return 'Підтверджено';
      case 'pending':
        return 'Очікує';
      case 'cancelled':
        return 'Скасовано';
      default:
        return 'Невідомо';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      default:
        return <EventIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Бронирования</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddBooking}
        >
          Добавить бронирование
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            placeholder="Клиент, сервис или автомобиль"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch}>
            Поиск
          </Button>
        </Box>
      </Paper>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="bookings table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Клиент</TableCell>
                    <TableCell>Точка обслуживания</TableCell>
                    <TableCell>Дата и время</TableCell>
                    <TableCell>Автомобиль</TableCell>
                    <TableCell>Услуги</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: booking.status === 'cancelled' ? 'rgba(244, 67, 54, 0.07)' : 'inherit'
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {booking.id}
                      </TableCell>
                      <TableCell>{booking.client_name}</TableCell>
                      <TableCell>{booking.service_point_name}</TableCell>
                      <TableCell>
                        {booking.date}, {booking.time}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {booking.duration} мин.
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.car}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {booking.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.services.map((service, index) => (
                          <Chip 
                            key={index} 
                            label={service} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getStatusIcon(booking.status)}
                          label={getStatusName(booking.status)} 
                          color={getStatusColor(booking.status) as 'success' | 'primary' | 'warning' | 'error' | 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Просмотр деталей">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewBooking(booking.id)}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(totalItems / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BookingsPage; 