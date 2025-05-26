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
  Alert,
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
import { bookingsApi, Booking } from '../../api/bookings';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bookingsApi.getAll({
        page,
        per_page: pageSize,
        // Добавляем поиск если есть запрос
        ...(searchQuery && { search: searchQuery })
      });
      
      // Обрабатываем новую структуру ответа API
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          // Новая структура с пагинацией
          setBookings(response.data.data);
          setTotalItems(response.data.pagination?.total_count || response.data.data.length);
        } else if (Array.isArray(response.data)) {
          // Старая структура (массив)
          setBookings(response.data);
          setTotalItems(response.data.length);
        } else {
          setBookings([]);
          setTotalItems(0);
        }
      } else {
        setBookings([]);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Ошибка загрузки бронирований:', error);
      setError(error.response?.data?.error || 'Не удалось загрузить бронирования');
      setBookings([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery]);

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

  const getStatusColor = (statusId: number) => {
    // Маппинг ID статусов на цвета
    switch (statusId) {
      case 1: // pending
        return 'warning';
      case 2: // confirmed
        return 'primary';
      case 3: // in_progress
        return 'info';
      case 4: // completed
        return 'success';
      case 5: // canceled_by_client
      case 6: // canceled_by_partner
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusName = (statusId: number) => {
    // Маппинг ID статусов на названия
    switch (statusId) {
      case 1:
        return 'Ожидает';
      case 2:
        return 'Подтверждено';
      case 3:
        return 'В процессе';
      case 4:
        return 'Завершено';
      case 5:
        return 'Отменено клиентом';
      case 6:
        return 'Отменено партнером';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case 4: // completed
        return <CheckCircleIcon fontSize="small" />;
      case 5: // canceled_by_client
      case 6: // canceled_by_partner
        return <CancelIcon fontSize="small" />;
      default:
        return <EventIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Если время в формате ISO (2000-01-01T11:30:00.000Z), извлекаем только время
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'UTC' // Используем UTC поскольку время хранится как UTC
        });
      }
      // Если время в формате HH:MM:SS, обрезаем секунды
      return timeString.substring(0, 5);
    } catch {
      return timeString;
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            placeholder="Поиск по клиенту, сервису или автомобилю"
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
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                          {loading ? 'Загрузка...' : 'Бронирования не найдены'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          bgcolor: (booking.status_id === 5 || booking.status_id === 6) ? 'rgba(244, 67, 54, 0.07)' : 'inherit'
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {booking.id}
                        </TableCell>
                        <TableCell>
                          {booking.client_id}
                          {/* TODO: Добавить информацию о клиенте когда будет доступна */}
                        </TableCell>
                        <TableCell>
                          {booking.service_point_id}
                          {/* TODO: Добавить название точки обслуживания когда будет доступно */}
                        </TableCell>
                        <TableCell>
                          {formatDate(booking.booking_date)}, {formatTime(booking.start_time)}
                          {booking.end_time && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              до {formatTime(booking.end_time)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.car_id || 'Не указан'}
                          {/* TODO: Добавить информацию об автомобиле когда будет доступна */}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(booking.status_id)}
                            label={getStatusName(booking.status_id)}
                            color={getStatusColor(booking.status_id) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Просмотр">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewBooking(booking.id)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalItems > pageSize && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                  count={Math.ceil(totalItems / pageSize)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BookingsPage; 