import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Chip, Box, Grid } from '@mui/material';
import { Booking, BookingStatusEnum } from '../../types/booking';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Получение цвета статуса
  const getStatusColor = (status: BookingStatusEnum) => {
    switch (status) {
      case BookingStatusEnum.PENDING:
        return 'warning';
      case BookingStatusEnum.CONFIRMED:
        return 'primary';
      case BookingStatusEnum.COMPLETED:
        return 'success';
      case BookingStatusEnum.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Получение названия статуса
  const getStatusName = (status: BookingStatusEnum) => {
    switch (status) {
      case BookingStatusEnum.PENDING:
        return t('Ожидает');
      case BookingStatusEnum.CONFIRMED:
        return t('Подтверждено');
      case BookingStatusEnum.COMPLETED:
        return t('Завершено');
      case BookingStatusEnum.CANCELLED:
        return t('Отменено');
      default:
        return t('Неизвестно');
    }
  };

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

  // Отмена записи
  const handleCancel = () => {
    // TODO: Реализовать отмену записи
    console.log('Отмена записи:', booking.id);
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {t('Запись №')}{booking.id}
          </Typography>
          <Chip 
            label={getStatusName(booking.status)} 
            color={getStatusColor(booking.status) as any}
            size="small"
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mb={1}>
              <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">{formattedDate}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mb={1}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                {formatTime(booking.start_time)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" alignItems="flex-start" mb={1}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', mt: 0.2 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                  {servicePointInfo.name}
                </Typography>
                {servicePointInfo.address && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                    {servicePointInfo.address}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
          
          {booking.car_id && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <DirectionsCarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" noWrap>
                  {t('Автомобиль')} #{booking.car_id}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={handleViewDetails}>
          {t('Подробнее')}
        </Button>
        
        {(booking.status === BookingStatusEnum.PENDING || booking.status === BookingStatusEnum.CONFIRMED) && (
          <Button size="small" color="primary" onClick={handleReschedule}>
            {t('Перенести')}
          </Button>
        )}
        
        {(booking.status === BookingStatusEnum.PENDING || booking.status === BookingStatusEnum.CONFIRMED) && (
          <Button size="small" color="error" onClick={handleCancel}>
            {t('Отменить')}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default BookingCard; 