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
      console.warn(t('forms.clientPages.bookingCard.comments.errorFormat'), timeString);
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
        name: name || `${t('forms.clientPages.bookingCard.servicePointFallback')} #${booking.service_point.id}`,
        address: fullAddress
      };
    }
    
    // Fallback если нет данных о сервисной точке
    return {
      name: `${t('forms.clientPages.bookingCard.servicePointFallback')} #${booking.service_point_id}`,
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
        cancellation_comment: cancellationComment || t('forms.clientPages.bookingCard.cancelDialog.defaultComment')
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
      console.error(t('forms.clientPages.bookingCard.comments.errorCancel'), error);
      setCancelError(
        error?.data?.error || 
        error?.message || 
        t('forms.clientPages.bookingCard.cancelDialog.errorMessage')
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
              {t('forms.clientPages.bookingCard.title')} #{booking.id}
            </Typography>
            <Chip 
              label={getStatusName(booking.status)} 
              color={getStatusColor(booking.status)}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('forms.clientPages.bookingCard.date')}: {formattedDate}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('forms.clientPages.bookingCard.time')}: {formatTime(booking.start_time)} - {booking.end_time}
          </Typography>
          
          {booking.service_point && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('forms.clientPages.bookingCard.servicePoint')}: {booking.service_point.name}
            </Typography>
          )}
          
          {booking.notes && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              {t('forms.clientPages.bookingCard.notes')}: {booking.notes}
            </Typography>
          )}
        </CardContent>
        
        <CardActions>
          <Button size="small" onClick={handleViewDetails}>
            {t('forms.clientPages.bookingCard.actions.details')}
          </Button>
          
          {canModifyBooking && (
            <Button size="small" color="primary" onClick={handleReschedule}>
              {t('forms.clientPages.bookingCard.actions.reschedule')}
            </Button>
          )}
          
          {canModifyBooking && (
            <Button 
              size="small" 
              color="error" 
              onClick={handleCancelClick}
              disabled={isCancelling}
            >
              {isCancelling ? <CircularProgress size={16} /> : t('forms.clientPages.bookingCard.actions.cancel')}
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
          {t('forms.clientPages.bookingCard.cancelDialog.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('forms.clientPages.bookingCard.cancelDialog.message', { 
              date: formattedDate, 
              time: formatTime(booking.start_time) 
            })}
          </DialogContentText>
          
          {cancelError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cancelError}
            </Alert>
          )}
          
          <TextField
            label={t('forms.clientPages.bookingCard.cancelDialog.reasonLabel')}
            multiline
            rows={3}
            fullWidth
            value={cancellationComment}
            onChange={(e) => setCancellationComment(e.target.value)}
            placeholder={t('forms.clientPages.bookingCard.cancelDialog.reasonPlaceholder')}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelDialogClose}
            disabled={isCancelling}
          >
            {t('forms.clientPages.bookingCard.cancelDialog.backButton')}
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
                {t('forms.clientPages.bookingCard.actions.cancelling')}
              </>
            ) : (
              t('forms.clientPages.bookingCard.cancelDialog.confirmButton')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingCard; 