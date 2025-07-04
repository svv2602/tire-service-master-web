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
  DialogActions,
  Chip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Build as ServiceIcon,
  Comment as CommentIcon,
  Category as CategoryIcon,
  Phone as PhoneIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetClientBookingQuery, useCancelClientBookingMutation } from '../../api/clientBookings.api';
import { getThemeColors, getButtonStyles } from '../../styles';
import { useTheme } from '@mui/material/styles';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import ClientLayout from '../../components/client/ClientLayout';

// Интерфейс для полных данных бронирования
interface DetailedBooking {
  id: number;
  client_id: number;
  service_point_id: number;
  car_id: number | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status_id: number;
  notes?: string;
  car_brand?: string;
  car_model?: string;
  license_plate?: string;
  created_at: string;
  updated_at: string;
  
  // Связанные объекты
  status: {
    id: number;
    name: string;
    color: string;
  };
  service_point: {
    id: number;
    name: string;
    address: string;
    phone?: string;
    city?: {
      id: number;
      name: string;
    };
  };
  client?: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  service_recipient?: {
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string;
    email?: string;
    is_self_service: boolean;
  };
  service_category?: {
    id: number;
    name: string;
    description?: string;
  };
  car?: {
    id: number;
    brand: string;
    model: string;
    year: number;
  };
  booking_services?: Array<{
    id: number;
    service_id: number;
    service_name: string;
    price: number;
    quantity: number;
    total_price: number;
  }>;
  is_guest_booking?: boolean;
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
  const { data: bookingData, isLoading, error } = useGetClientBookingQuery(id || '', {
    skip: !id
  });
  
  // Приводим данные к нужному типу
  const booking = bookingData;
  

  
  // Мутация для отмены бронирования
  const [cancelBooking, { isLoading: isCancelling }] = useCancelClientBookingMutation();
  
  // Функция форматирования времени
  const formatTime = (timeString: string): string => {
    if (!timeString) return '—';
    
    // Если это ISO дата-время, извлекаем время
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return format(date, 'HH:mm');
    }
    
    // Если это время в формате HH:mm или HH:mm:ss
    if (timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
      return timeString.substring(0, 5); // Возвращаем только HH:mm
    }
    
    return timeString;
  };
  
  // Форматирование даты в формат dd.MM.yyyy
  const formatBookingDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Обработчик отмены бронирования
  const handleCancelBooking = async () => {
    if (!id) return;
    
    try {
      await cancelBooking({
        id: id,
        cancellation_reason_id: 10, // "Изменение расписания"
        cancellation_comment: 'Отменено клиентом через веб-интерфейс'
      }).unwrap();
      setCancelDialogOpen(false);
      // Перенаправляем на страницу бронирований с активной вкладкой "Отмененные"
      navigate('/client/bookings?tab=cancelled');
    } catch (error: any) {
      setCancelError(error.data?.error || 'Не удалось отменить бронирование');
    }
  };
  
  // Проверяем, может ли пользователь отменить бронирование
  const canCancel = booking && (booking.status.name === 'pending' || booking.status.name === 'confirmed');
  
  // Обработчик создания новой записи
  const handleNewBooking = () => {
    navigate('/client/booking');
  };
  
  // Определяем статус бронирования для BadgeStatus
  const getStatusLabel = (statusName: string) => {
    return statusName || 'unknown';
  };

  // Форматирование информации о сервисной точке
  const formatServicePointInfo = (servicePoint: DetailedBooking['service_point']) => {
    if (!servicePoint) {
      return '—';
    }
    
    // Проверяем, есть ли название
    if (!servicePoint.name || servicePoint.name.includes('Точка обслуживания #')) {
      // Пытаемся использовать данные из адреса если название не информативно
      if (servicePoint.address) {
        const parts = [servicePoint.address];
        if (servicePoint.city?.name) parts.push(`г. ${servicePoint.city.name}`);
        return parts.join(', ');
      }
    }
    
    const parts = [];
    
    // Добавляем название если оно есть и информативно
    if (servicePoint.name && !servicePoint.name.includes('Точка обслуживания #')) {
      parts.push(servicePoint.name);
    }
    
    // Добавляем адрес
    if (servicePoint.address) {
      parts.push(servicePoint.address);
    }
    
    // Добавляем город
    if (servicePoint.city?.name) {
      parts.push(`г. ${servicePoint.city.name}`);
    }
    
    return parts.join(', ') || 'Сервисная точка';
  };
  
  // Если данные загружаются
  if (isLoading) {
    return (
      <ClientLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </ClientLayout>
    );
  }
  
  // Если произошла ошибка
  if (error || !booking) {
    return (
      <ClientLayout>
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
      </ClientLayout>
    );
  }
  
  const bookingStatus = getStatusLabel(booking.status.name);
  
  return (
    <ClientLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Навигационная панель с заголовком и кнопкой создания записи */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Мои записи
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewBooking}
          sx={primaryButtonStyles}
        >
          Новая запись
        </Button>
      </Box>
      

      
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        {/* Заголовок с номером записи и статусом */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Запись №{booking.id}
          </Typography>
          <BookingStatusBadge status={bookingStatus} />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Основная информация о бронировании - компактная сетка */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Дата и время в одной строке */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>
                Дата:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatBookingDate(booking.booking_date)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TimeIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>
                Время:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatTime(booking.start_time)}
              </Typography>
            </Box>
          </Grid>
          
          {/* Категория услуг */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CategoryIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>
                Категория:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {booking.service_category?.name || '—'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Информация о сервисной точке - компактно */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <LocationIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.2rem', mt: 0.1 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                Сервисная точка:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                {formatServicePointInfo(booking.service_point)}
              </Typography>
              
              {booking.service_point?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <PhoneIcon sx={{ mr: 1, color: colors.textSecondary, fontSize: '1rem' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {booking.service_point.phone}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Информация об автомобиле - компактно */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CarIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.2rem' }} />
            <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>
              Автомобиль:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {booking.car_info?.brand && booking.car_info?.model 
                ? `${booking.car_info.brand} ${booking.car_info.model}` 
                : booking.car_info?.type || '—'
              }
            </Typography>
          </Box>
          
          {booking.car_info?.license_plate && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 4 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>
                Номер:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {booking.car_info.license_plate}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Получатель услуги - компактно */}
        {booking.client && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.2rem' }} />
                <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>
                  Клиент:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {booking.client.name || '—'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 4 }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mr: 1 }}>
                  Телефон:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {booking.client.phone || '—'}
                </Typography>
              </Box>
            </Box>
          </>
        )}
        
        {/* Услуги - компактно */}
        {booking.services && booking.services.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <ServiceIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.2rem' }} />
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Услуги:
                </Typography>
              </Box>
              
              <Box sx={{ ml: 3 }}>
                {booking.services.map((service, index) => (
                  <Box key={service.id || index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 0.5,
                    borderBottom: index < booking.services!.length - 1 ? `1px solid ${colors.borderPrimary}` : 'none'
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {service.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        {service.quantity} шт. × {service.price} грн
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                      {service.quantity * service.price} грн
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}
        
        {/* Примечания - компактно */}
        {booking.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <CommentIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.2rem', mt: 0.1 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    Примечания:
                  </Typography>
                  <Typography variant="body2" sx={{ backgroundColor: colors.backgroundField, p: 1, borderRadius: 1 }}>
                    {booking.notes}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        {/* Кнопки действий - компактно */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            component={Link} 
            to="/client/bookings"
            sx={{ ...secondaryButtonStyles, minWidth: 'auto' }}
            size="small"
          >
            Назад
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Кнопка перенести запись (только для подтвержденных и ожидающих) */}
              {(booking.status.name === 'pending' || booking.status.name === 'confirmed') && (
                <Button 
                  variant="outlined" 
                  color="primary"
                  component={Link}
                  to={`/client/bookings/${booking.id}/reschedule`}
                  sx={{ ...primaryButtonStyles, minWidth: 'auto' }}
                  size="small"
                >
                  Перенести
                </Button>
              )}
              
              {/* Кнопка отмены (только для ожидающих подтверждения) */}
              {canCancel && (
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isCancelling}
                  sx={{ ...dangerButtonStyles, minWidth: 'auto' }}
                  size="small"
                >
                  {isCancelling ? <CircularProgress size={16} /> : 'Отменить'}
                </Button>
              )}
              
              {/* Кнопка создать новое бронирование для отмененных записей */}
              {(booking.status.name === 'cancelled_by_client' || booking.status.name === 'cancelled_by_admin') && (
                <Button 
                  variant="contained" 
                  color="primary"
                  component={Link}
                  to="/client/booking/new-with-availability"
                  sx={{ ...primaryButtonStyles, minWidth: 'auto' }}
                  size="small"
                >
                  Новая запись
                </Button>
              )}
            </Box>
            
            {/* Информационное сообщение для отмененных бронирований */}
            {(booking.status.name === 'cancelled_by_client' || booking.status.name === 'cancelled_by_admin') && (
              <Typography variant="caption" sx={{ 
                color: colors.textSecondary, 
                fontSize: '0.75rem',
                textAlign: 'right',
                maxWidth: '200px'
              }}>
                Запись отменена. Действия недоступны.
              </Typography>
            )}
            
            {/* Информационное сообщение для завершенных бронирований */}
            {booking.status.name === 'completed' && (
              <Typography variant="caption" sx={{ 
                color: colors.textSecondary, 
                fontSize: '0.75rem',
                textAlign: 'right',
                maxWidth: '200px'
              }}>
                Услуга выполнена. Изменения недоступны.
              </Typography>
            )}
          </Box>
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
    </ClientLayout>
  );
};

export default BookingDetailsPage; 