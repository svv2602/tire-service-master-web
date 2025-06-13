import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Grid, Divider, 
  Button, Chip, CircularProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { useGetBookingByIdQuery, useDeleteBookingMutation } from '../../api/bookings.api';
import { BookingStatusEnum } from '../../types/booking';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotesIcon from '@mui/icons-material/Notes';
import BookingStatus from '../../components/bookings/BookingStatus';
import ContactService from '../../components/bookings/ContactService';

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Запрос на получение данных о записи
  const { data: booking, isLoading, isError } = useGetBookingByIdQuery(id || '');
  
  // Мутация для отмены записи
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();

  // Получение названия статуса
  const getStatusName = (status: BookingStatusEnum) => {
    switch (status) {
      case BookingStatusEnum.PENDING:
        return t('Ожидает');
      case BookingStatusEnum.COMPLETED:
        return t('Завершено');
      case BookingStatusEnum.CANCELLED:
        return t('Отменено');
      default:
        return t('Неизвестно');
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status: BookingStatusEnum) => {
    switch (status) {
      case BookingStatusEnum.PENDING:
        return 'primary';
      case BookingStatusEnum.COMPLETED:
        return 'success';
      case BookingStatusEnum.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  // Обработчик возврата к списку записей
  const handleBack = () => {
    navigate('/client/bookings');
  };

  // Обработчик перехода на страницу переноса записи
  const handleReschedule = () => {
    navigate(`/client/bookings/${id}/reschedule`);
  };

  // Обработчики отмены записи
  const handleCancelBookingClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
  };

  const handleConfirmCancel = async () => {
    try {
      await deleteBooking(id || '').unwrap();
      setCancelDialogOpen(false);
      navigate('/client/bookings');
    } catch (error) {
      console.error('Ошибка при отмене записи:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('Ошибка при загрузке данных о записи')}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="outlined"
        >
          {t('Вернуться к списку записей')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={3} display="flex" alignItems="center">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          {t('Назад')}
        </Button>
        <Typography variant="h4" component="h1">
          {t('Запись №')}{booking.id}
        </Typography>
        <Box ml={2}>
          <Chip 
            label={getStatusName(booking.status)} 
            color={getStatusColor(booking.status) as any}
          />
        </Box>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('Детали записи')}
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>{t('Дата')}:</strong> {formatDate(booking.booking_date)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>{t('Время')}:</strong> {booking.start_time} - {booking.end_time}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>{t('Сервисная точка')}:</strong> ID: {booking.service_point_id}
              </Typography>
            </Box>
          </Grid>
          
          {booking.car_id && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <DirectionsCarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>{t('Автомобиль')}:</strong> ID: {booking.car_id}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {booking.notes && (
            <Grid item xs={12}>
              <Box display="flex" mb={2}>
                <NotesIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body1" gutterBottom>
                    <strong>{t('Примечания')}:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {booking.notes}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          {t('Услуги')}
        </Typography>
        
        {booking.services && booking.services.length > 0 ? (
          <Box component="ul" sx={{ pl: 2 }}>
            {booking.services.map((service, index) => (
              <Typography component="li" key={index} variant="body1" gutterBottom>
                {t('Услуга')} ID: {service.service_id} - {service.quantity} шт. x {service.price} руб.
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            {t('Нет информации об услугах')}
          </Typography>
        )}
        
        <Box mt={4} display="flex" flexWrap="wrap" gap={2}>
          {booking.status === BookingStatusEnum.PENDING && (
            <>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleReschedule}
              >
                {t('Перенести запись')}
              </Button>
              
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleCancelBookingClick}
                disabled={isDeleting}
              >
                {t('Отменить запись')}
              </Button>
            </>
          )}
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <BookingStatus booking={booking} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ContactService servicePointId={booking.service_point_id} />
        </Grid>
      </Grid>
      
      {/* Диалог подтверждения отмены */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
      >
        <DialogTitle>{t('Отменить запись?')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('Вы уверены, что хотите отменить запись? Это действие нельзя будет отменить.')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            {t('Отмена')}
          </Button>
          <Button 
            onClick={handleConfirmCancel} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : t('Подтвердить отмену')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingDetailsPage; 