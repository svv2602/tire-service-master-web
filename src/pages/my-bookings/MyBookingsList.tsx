import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Chip,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchWithAuth } from '../../api/apiUtils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';

interface Booking {
  id: number;
  client_id: number;
  service_point_id: number;
  service_point_name: string;
  car_id: number;
  car_name: string;
  services: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  status: string;
  start_time: string;
  end_time: string;
  total_price: number;
  comment?: string;
}

const getStatusChip = (status: string) => {
  switch (status) {
    case 'pending':
      return <Chip icon={<EventNoteIcon />} label="Ожидает подтверждения" color="warning" />;
    case 'confirmed':
      return <Chip icon={<EventAvailableIcon />} label="Подтверждено" color="success" />;
    case 'completed':
      return <Chip icon={<EventAvailableIcon />} label="Выполнено" color="success" />;
    case 'cancelled':
      return <Chip icon={<EventBusyIcon />} label="Отменено" color="error" />;
    default:
      return <Chip label={status} />;
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
  } catch (error) {
    return dateString;
  }
};

const MyBookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const clientId = user?.client_id;
      
      if (!clientId) {
        throw new Error('Отсутствует идентификатор клиента');
      }
      
      const response = await fetchWithAuth(`/api/v1/clients/${clientId}/bookings`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить данные записей');
      }
      
      const data = await response.json();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки записей:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [user?.client_id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Вы уверены, что хотите отменить запись?')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(
        `/api/v1/bookings/${bookingId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось отменить запись');
      }
      
      // Обновляем список записей
      fetchBookings();
    } catch (err) {
      console.error('Ошибка отмены записи:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchBookings} 
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box my={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Мои записи на шиномонтаж
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/service-points/search"
        >
          Записаться на шиномонтаж
        </Button>
      </Box>
      
      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            У вас пока нет записей на шиномонтаж
          </Typography>
          <Typography color="textSecondary" paragraph>
            Выберите сервисный центр и запишитесь на удобное время
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/service-points/search"
            sx={{ mt: 2 }}
          >
            Выбрать сервисный центр
          </Button>
        </Paper>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-12px' }}>
          {bookings.map((booking) => (
            <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }} key={booking.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {booking.service_point_name}
                    </Typography>
                    {getStatusChip(booking.status)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Автомобиль:</strong> {booking.car_name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Дата и время:</strong> {formatDate(booking.start_time)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Услуги:</strong> {booking.services.map(service => service.name).join(', ')}
                  </Typography>
                  
                  <Typography variant="body1" fontWeight="bold" mt={2}>
                    Стоимость: {booking.total_price} ₽
                  </Typography>
                  
                  {booking.comment && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Комментарий:</strong> {booking.comment}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    component={RouterLink}
                    to={`/bookings/${booking.id}`}
                    size="small"
                  >
                    Подробнее
                  </Button>
                  
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button 
                      color="error"
                      size="small"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Отменить запись
                    </Button>
                  )}
                </CardActions>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};

export default MyBookingsList; 