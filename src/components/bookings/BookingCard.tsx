import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Chip, 
  Box, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { Booking, BOOKING_STATUSES } from '../../types/booking';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { getStatusDisplayName, getStatusChipColor, isCancelledStatus } from '../../utils/bookingStatus';
import { useCancelClientBookingMutation } from '../../api/clientBookings.api';

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
  onBookingUpdated?: () => void; // Callback для обновления списка после изменений
}

// Функция для получения цвета статуса для Chip
const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  return getStatusChipColor(status);
};

// Функция для получения названия статуса
const getStatusName = (status: string): string => {
  return getStatusDisplayName(status);
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick, onBookingUpdated }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Состояния для диалогов
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationComment, setCancellationComment] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  
  // RTK Query мутация для отмены
  const [cancelClientBooking, { isLoading: isCancelling }] = useCancelClientBookingMutation();

  // Форматирование даты в формате dd.mm.yyyy
  const formattedDate = booking.booking_date 
    ? format(new Date(booking.booking_date), 'dd.MM.yyyy')
    : '';

  // Форматирование времени - только начальное время
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    try {
      // Если время в формате ISO (2000-01-01T09:35:00.000+02:00)
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return format(date, 'HH:mm');
      }
      
      // Если время в формате HH:mm
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString;
      }
      
      // Попытка парсинга как время
      const date = new Date(`2000-01-01T${timeString}`);
      return format(date, 'HH:mm');
    } catch (error) {
      console.warn('Ошибка форматирования времени:', timeString);
      return timeString;
    }
  };

  // Функция для форматирования информации о сервисной точке
  const formatServicePointInfo = () => {
    if (booking.service_point) {
      const { name, address, city } = booking.service_point;
      const cityName = city?.name || '';
      
      // Формируем полный адрес
      const fullAddress = cityName ? `${address}, ${cityName}` : address;
      
      return {
        name: name || `Сервисная точка #${booking.service_point.id}`,
        address: fullAddress
      };
    }
    
    // Fallback если нет данных о сервисной точке
    return {
      name: `${t('Сервисная точка')} #${booking.service_point_id}`,
      address: ''
    };
  };

  const servicePointInfo = formatServicePointInfo();

  // Переход на страницу деталей записи
  const handleViewDetails = () => {
    navigate(`/client/bookings/${booking.id}`);
  };

  // Переход на страницу переноса записи
  const handleReschedule = () => {
    navigate(`/client/bookings/${booking.id}/reschedule`);
  };

  // Открытие диалога отмены
  const handleCancelClick = () => {
    setCancelDialogOpen(true);
    setCancelError(null);
    setCancellationComment('');
  };

  // Закрытие диалога отмены
  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setCancelError(null);
    setCancellationComment('');
  };

  // Подтверждение отмены записи
  const handleConfirmCancel = async () => {
    try {
      setCancelError(null);
      
      await cancelClientBooking({
        id: booking.id,
        cancellation_comment: cancellationComment || 'Отменено клиентом'
      }).unwrap();
      
      // Закрываем диалог
      setCancelDialogOpen(false);
      
      // Обновляем список бронирований
      if (onBookingUpdated) {
        onBookingUpdated();
      }
      
      // Перенаправляем на страницу бронирований с активной вкладкой "Отмененные"
      navigate('/client/bookings?tab=cancelled');
      
    } catch (error: any) {
      console.error('Ошибка при отмене записи:', error);
      setCancelError(
        error?.data?.error || 
        error?.message || 
        'Произошла ошибка при отмене записи'
      );
    }
  };

  // Проверяем, можно ли изменять бронирование (используем константы из BOOKING_STATUSES)
  const canModifyBooking = booking.status === BOOKING_STATUSES.PENDING || booking.status === BOOKING_STATUSES.CONFIRMED;

  return (
    <>
      <Card 
        onClick={onClick}
        sx={{ 
          cursor: onClick ? 'pointer' : 'default',
          mb: 2,
          '&:hover': onClick ? { boxShadow: 3 } : {}
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" component="h3">
              {t('Бронирование')} #{booking.id}
            </Typography>
            <Chip 
              label={getStatusName(booking.status)} 
              color={getStatusColor(booking.status)}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('Дата')}: {formattedDate}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('Время')}: {formatTime(booking.start_time)} - {booking.end_time}
          </Typography>
          
          {booking.service_point && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('Сервисная точка')}: {booking.service_point.name}
            </Typography>
          )}
          
          {booking.notes && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              {t('Примечания')}: {booking.notes}
            </Typography>
          )}
        </CardContent>
        
        <CardActions>
          <Button size="small" onClick={handleViewDetails}>
            {t('Подробнее')}
          </Button>
          
          {canModifyBooking && (
            <Button size="small" color="primary" onClick={handleReschedule}>
              {t('Перенести')}
            </Button>
          )}
          
          {canModifyBooking && (
            <Button 
              size="small" 
              color="error" 
              onClick={handleCancelClick}
              disabled={isCancelling}
            >
              {isCancelling ? <CircularProgress size={16} /> : t('Отменить')}
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Диалог подтверждения отмены */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={handleCancelDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Отмена записи
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Вы действительно хотите отменить запись на {formattedDate} в {formatTime(booking.start_time)}?
          </DialogContentText>
          
          {cancelError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cancelError}
            </Alert>
          )}
          
          <TextField
            label="Причина отмены (необязательно)"
            multiline
            rows={3}
            fullWidth
            value={cancellationComment}
            onChange={(e) => setCancellationComment(e.target.value)}
            placeholder="Укажите причину отмены записи..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelDialogClose}
            disabled={isCancelling}
          >
            Назад
          </Button>
          <Button 
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Отменяем...
              </>
            ) : (
              'Отменить запись'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingCard; 