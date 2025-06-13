import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetBookingByIdQuery, useCancelBookingMutation } from '../../api/bookings.api';
import { BookingFormData, BookingService } from '../../types/booking';
import { getThemeColors, getButtonStyles } from '../../styles';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../../components/common/PageHeader';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';

// Расширенный интерфейс для сервиса бронирования с дополнительными полями
interface ExtendedBookingService extends BookingService {
  id?: number;
  name?: string;
}

// Расширенный интерфейс для данных бронирования с дополнительными полями
interface ExtendedBooking extends BookingFormData {
  id: number;
  status_id: number;
  services: ExtendedBookingService[];
  car?: {
    brand?: string;
    model?: string;
    year?: string;
    license_plate?: string;
  };
  service_point?: {
    name?: string;
    address?: string;
  };
}

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const dangerButtonStyles = getButtonStyles(theme, 'error');
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Состояние для диалога отмены бронирования
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  
  // Запрос данных бронирования
  const { data: bookingData, isLoading, error } = useGetBookingByIdQuery(id || '', {
    skip: !id
  });
  
  // Приводим данные к нужному типу
  const booking = bookingData as unknown as ExtendedBooking;
  
  // Мутация для отмены бронирования
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  
  // Форматирование даты
  const formatBookingDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy (EEEE)', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };
  
  // Обработчик отмены бронирования
  const handleCancelBooking = async () => {
    if (!id) return;
    
    try {
      await cancelBooking(id).unwrap();
      setCancelDialogOpen(false);
      // Обновляем страницу или перенаправляем пользователя
      window.location.reload();
    } catch (error: any) {
      setCancelError(error.data?.error || 'Не удалось отменить бронирование');
    }
  };
  
  // Проверяем, может ли пользователь отменить бронирование
  const canCancel = booking && booking.status_id === 1; // Предполагаем, что 1 - это статус "pending"
  
  // Если данные загружаются
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Если произошла ошибка
  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Не удалось загрузить данные бронирования. Пожалуйста, попробуйте позже.
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/client/bookings"
          sx={secondaryButtonStyles}
        >
          Вернуться к списку
        </Button>
      </Container>
    );
  }
  
  // Определяем статус бронирования
  const getStatusLabel = (statusId: number) => {
    switch (statusId) {
      case 1: return 'pending';
      case 2: return 'confirmed';
      case 3: return 'completed';
      case 4: return 'cancelled';
      default: return 'unknown';
    }
  };
  
  const bookingStatus = getStatusLabel(booking.status_id);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader 
        title="Детали бронирования"
        breadcrumbs={[
          { label: 'Главная', link: '/client' },
          { label: 'Мои записи', link: '/client/bookings' },
          { label: `Запись №${booking.id}`, link: '' }
        ]}
      />
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Запись №{booking.id}
          </Typography>
          <BookingStatusBadge status={bookingStatus} />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ mr: 1, color: colors.primary }} />
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Дата
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatBookingDate(booking.booking_date)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon sx={{ mr: 1, color: colors.primary }} />
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Время
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {booking.start_time} - {booking.end_time}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon sx={{ mr: 1, color: colors.primary }} />
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Сервисный центр
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {booking.service_point?.name || '—'}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {booking.service_point?.address || '—'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Автомобиль
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CarIcon sx={{ mr: 1, color: colors.primary }} />
            <Typography variant="body1">
              {booking.car?.brand} {booking.car?.model} ({booking.car?.year})
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Гос. номер: <strong>{booking.car?.license_plate || '—'}</strong>
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Услуги
          </Typography>
          
          {booking.services && booking.services.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {booking.services.map((service, index) => (
                <BookingStatusBadge 
                  key={service.id || service.service_id || index} 
                  customLabel={`${(service as ExtendedBookingService).name || `Услуга ${service.service_id}`} (${service.quantity} шт.)`}
                  status="default"
                  size="small"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Нет выбранных услуг
            </Typography>
          )}
        </Box>
        
        {booking.notes && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Примечания
              </Typography>
              
              <Typography variant="body2">
                {booking.notes}
              </Typography>
            </Box>
          </>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            component={Link} 
            to="/client/bookings"
            sx={secondaryButtonStyles}
          >
            Назад к списку
          </Button>
          
          {canCancel && (
            <Button 
              variant="contained" 
              color="error"
              onClick={() => setCancelDialogOpen(true)}
              disabled={isCancelling}
              sx={dangerButtonStyles}
            >
              {isCancelling ? <CircularProgress size={24} /> : 'Отменить запись'}
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Диалог подтверждения отмены бронирования */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Отмена записи</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите отменить запись? Это действие нельзя отменить.
          </DialogContentText>
          {cancelError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {cancelError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialogOpen(false)} 
            sx={secondaryButtonStyles}
            disabled={isCancelling}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error" 
            variant="contained"
            disabled={isCancelling}
            sx={dangerButtonStyles}
          >
            {isCancelling ? <CircularProgress size={24} /> : 'Подтвердить отмену'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingDetailsPage; 