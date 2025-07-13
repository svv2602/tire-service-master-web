import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container, Typography, Box, Paper, Button, CircularProgress,
  Alert, Divider, useTheme
} from '@mui/material';
import { RootState } from '../../store';
import { useGetClientBookingQuery, useRescheduleClientBookingMutation } from '../../api/clientBookings.api';
import { useGetSlotsForCategoryQuery } from '../../api/availability.api';
import { useGetServicePointBasicInfoQuery } from '../../api/servicePoints.api';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { format, parseISO, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BookingFormData } from '../../types/booking';
import { AvailabilitySelector } from '../../components/availability';
import type { AvailableTimeSlot } from '../../types/availability';
import { getThemeColors, getButtonStyles } from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';

const RescheduleBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');

  // 🚀 НОВАЯ ЛОГИКА: Определяем тип пользователя для фильтрации слотов
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isServiceUser = Boolean(currentUser && ['admin', 'partner', 'manager', 'operator'].includes(currentUser.role));

  console.log('🔍 Тип пользователя на странице переноса:', {
    userRole: currentUser?.role,
    isServiceUser,
    shouldShowAllSlots: isServiceUser
  });

  // Состояние для выбора даты и времени
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Запрос на получение данных о записи
  const { data: booking, isLoading: isLoadingBooking, isError: isErrorBooking } = useGetClientBookingQuery(id || '');
  
  // Мутация для переноса записи
  const [rescheduleBooking, { isLoading: isUpdating, isError: isUpdateError }] = useRescheduleClientBookingMutation();

  // Получение информации о сервисной точке
  const { data: servicePointData } = useGetServicePointBasicInfoQuery(
    booking?.service_point?.id?.toString() || '0',
    { skip: !booking?.service_point?.id }
  );

  // Загрузка доступных временных слотов
  const { data: availabilityData, isLoading: isLoadingAvailability } = useGetSlotsForCategoryQuery(
    {
      servicePointId: booking?.service_point?.id ? Number(booking.service_point.id) : 0,
      categoryId: booking?.service_category?.id || 1, // Используем категорию из бронирования или категорию по умолчанию
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    },
    { skip: !booking?.service_point?.id || !selectedDate }
  );

  // Преобразование данных слотов в формат для AvailabilitySelector
  const availableTimeSlots: AvailableTimeSlot[] = useMemo(() => {
    if (!availabilityData?.slots || availabilityData.slots.length === 0) {
      return [];
    }

    // Преобразуем слоты используя новые поля API
    let processedSlots = availabilityData.slots.map(slot => ({
      time: slot.start_time,
      available_posts: slot.available_posts || 0,
      total_posts: slot.total_posts || 0,
      bookings_count: slot.bookings_count || 0,
      duration_minutes: slot.duration_minutes,
      can_book: isServiceUser ? true : (slot.available_posts || 0) > 0, // Служебные пользователи могут бронировать любой слот
      is_available: slot.is_available !== null ? slot.is_available : undefined, // Обрабатываем null как undefined
      occupancy_status: slot.occupancy_status || ((slot.available_posts || 0) === 0 ? 'full' : 'available') // Определяем статус на основе доступности
    }));

    // 🚀 НОВАЯ ЛОГИКА: Для клиентов показываем только доступные слоты, для не-клиентов все слоты
    if (!isServiceUser) {
      // Для клиентов фильтруем только доступные слоты
      processedSlots = processedSlots.filter(slot => (slot.available_posts || 0) > 0);
      console.log('👤 Клиент на странице переноса: отфильтровано слотов с available_posts > 0:', processedSlots.length);
    } else {
      console.log('🔧 Служебный пользователь на странице переноса: показываем все слоты:', processedSlots.length);
    }

    return processedSlots.sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilityData, isServiceUser]);

  // Инициализация даты при загрузке данных о записи
  useEffect(() => {
    if (booking?.booking_date && !selectedDate) {
      try {
        const bookingDate = parseISO(booking.booking_date);
        // Устанавливаем завтра как минимальную дату для переноса
        const tomorrow = addDays(new Date(), 1);
        setSelectedDate(bookingDate >= tomorrow ? bookingDate : tomorrow);
      } catch (error) {
        console.error('Ошибка парсинга даты записи:', error);
        setSelectedDate(addDays(new Date(), 1));
      }
    }
  }, [booking, selectedDate]);

  // Отладочная информация для проверки данных (только в development)
  useEffect(() => {
    if (booking && process.env.NODE_ENV === 'development') {
      console.log('🔍 Данные записи для переноса:', {
        id: booking.id,
        service_point: booking.service_point,
        service_point_id_from_object: booking.service_point?.id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time
      });
    }
  }, [booking]);

  // Отладочная информация для API запроса слотов (только в development)
  useEffect(() => {
    if (selectedDate && booking && process.env.NODE_ENV === 'development') {
      const requestParams = {
        servicePointId: booking.service_point?.id ? Number(booking.service_point.id) : 0,
        categoryId: booking.service_category?.id || 1,
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      console.log('🔍 Параметры запроса слотов:', requestParams);
      console.log('🔍 Категория бронирования:', booking.service_category);
      console.log('🔍 Доступные слоты:', availabilityData);
    }
  }, [selectedDate, booking, availabilityData]);

  // Обработчик возврата к записи
  const handleBack = () => {
    navigate(`/client/bookings/${id}`);
  };

  // Обработчик изменения даты
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Сбрасываем время при изменении даты
  };

  // Обработчик изменения времени
  const handleTimeSlotChange = (timeSlot: string | null, slotData?: AvailableTimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  // Обработчик переноса записи
  const handleReschedule = async () => {
    if (!booking || !selectedDate || !selectedTimeSlot) return;

    try {
      await rescheduleBooking({
        id: id || '',
        new_date: format(selectedDate, 'yyyy-MM-dd'),
        new_time: selectedTimeSlot
      }).unwrap();
      
      // Перенаправляем на список бронирований без дополнительных параметров
      navigate('/client/bookings');
    } catch (error) {
      console.error('Ошибка при переносе записи:', error);
    }
  };

  // Проверка возможности сохранения
  const canSave = selectedDate && selectedTimeSlot && !isUpdating;

  // Функция для форматирования времени - только начальное время
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

  if (isLoadingBooking) {
    return (
      <ClientLayout>
        <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="center" my={8}>
              <CircularProgress />
            </Box>
          </Container>
        </Box>
      </ClientLayout>
    );
  }

  if (isErrorBooking || !booking) {
    return (
      <ClientLayout>
        <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {t('forms.clientPages.rescheduleBooking.loadingError')}
            </Alert>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBack}
              variant="outlined"
              sx={secondaryButtonStyles}
            >
              {t('forms.clientPages.rescheduleBooking.backToBooking')}
            </Button>
          </Container>
        </Box>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Заголовок */}
          <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={handleBack}
                sx={{ mr: 2, ...secondaryButtonStyles }}
                variant="outlined"
              >
                {t('forms.clientPages.rescheduleBooking.back')}
              </Button>
              <Typography variant="h4" component="h1">
                {t('forms.clientPages.rescheduleBooking.title')} №{booking.id}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleReschedule}
              disabled={!canSave}
              sx={primaryButtonStyles}
            >
              {isUpdating ? t('forms.clientPages.rescheduleBooking.saving') : t('forms.clientPages.rescheduleBooking.confirmReschedule')}
            </Button>
          </Box>

          {/* Ошибка при обновлении */}
          {isUpdateError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {t('forms.clientPages.rescheduleBooking.rescheduleError')}
            </Alert>
          )}

          {/* Информация о текущей записи */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('forms.clientPages.rescheduleBooking.currentBooking')}
            </Typography>
            
            <Box mt={2} mb={2}>
              <Typography variant="body1" gutterBottom>
                <strong>{t('forms.clientPages.rescheduleBooking.date')}:</strong> {format(parseISO(booking.booking_date), 'dd.MM.yyyy')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t('forms.clientPages.rescheduleBooking.time')}:</strong> {formatTime(booking.start_time)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t('forms.clientPages.rescheduleBooking.servicePoint')}:</strong> {servicePointData?.name || booking.service_point?.name || `#${booking.service_point?.id}`}
              </Typography>
              {servicePointData?.address && (
                <Typography variant="body2" color="textSecondary">
                  {servicePointData.address}
                </Typography>
              )}
            </Box>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Выбор новой даты и времени */}
          <Typography variant="h6" gutterBottom>
            {t('forms.clientPages.rescheduleBooking.selectNewDateTime')}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <AvailabilitySelector
              servicePointId={booking.service_point?.id ? Number(booking.service_point.id) : undefined}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotChange={handleTimeSlotChange}
              availableTimeSlots={availableTimeSlots}
              isLoading={isLoadingAvailability}
              servicePointPhone={servicePointData?.contact_phone || servicePointData?.phone}
              categoryId={booking.service_category?.id || 1}
              totalSlotsForDay={availabilityData?.total_slots}
              isServiceUser={isServiceUser}
            />
          </Box>

          {/* Информация о выбранной дате и времени */}
          {selectedDate && selectedTimeSlot && (
            <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: colors.backgroundSecondary }}>
              {/* Заголовок с кнопкой справа */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">
                  {t('forms.clientPages.rescheduleBooking.newDateTime')}
                </Typography>
                
                {/* Кнопка подтверждения справа */}
                <Button
                  variant="contained"
                  startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleReschedule}
                  disabled={!canSave}
                  sx={primaryButtonStyles}
                  size="large"
                >
                  {isUpdating ? t('forms.clientPages.rescheduleBooking.saving') : t('forms.clientPages.rescheduleBooking.confirmReschedule')}
                </Button>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                <strong>{t('forms.clientPages.rescheduleBooking.date')}:</strong> {format(selectedDate, 'dd.MM.yyyy')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t('forms.clientPages.rescheduleBooking.time')}:</strong> {selectedTimeSlot}
                {(() => {
                  const selectedSlotData = availableTimeSlots.find(slot => slot.time === selectedTimeSlot);
                  if (selectedSlotData?.duration_minutes) {
                    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
                    const endDate = new Date();
                    endDate.setHours(hours, minutes + selectedSlotData.duration_minutes);
                    const endTime = endDate.toTimeString().substring(0, 5);
                    return ` - ${endTime}`;
                  }
                  return '';
                })()}
              </Typography>
            </Paper>
          )}

          {/* Предупреждения */}
          {!selectedDate && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              {t('forms.clientPages.rescheduleBooking.selectDate')} для продолжения
            </Alert>
          )}

          {selectedDate && !selectedTimeSlot && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              {t('forms.clientPages.rescheduleBooking.selectTime')} для продолжения
            </Alert>
          )}
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default RescheduleBookingPage; 