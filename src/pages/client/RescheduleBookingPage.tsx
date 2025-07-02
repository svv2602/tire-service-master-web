import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, CircularProgress,
  Alert, Divider, useTheme
} from '@mui/material';
import { useGetBookingByIdQuery, useUpdateBookingMutation } from '../../api/bookings.api';
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

  // Состояние для выбора даты и времени
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Запрос на получение данных о записи
  const { data: booking, isLoading: isLoadingBooking, isError: isErrorBooking } = useGetBookingByIdQuery(id || '');
  
  // Мутация для обновления записи
  const [updateBooking, { isLoading: isUpdating, isError: isUpdateError }] = useUpdateBookingMutation();

  // Получение информации о сервисной точке
  const { data: servicePointData } = useGetServicePointBasicInfoQuery(
    booking?.service_point_id?.toString() || '0',
    { skip: !booking?.service_point_id }
  );

  // Загрузка доступных временных слотов
  const { data: availabilityData, isLoading: isLoadingAvailability } = useGetSlotsForCategoryQuery(
    {
      servicePointId: booking?.service_point_id ? Number(booking.service_point_id) : 0,
      categoryId: booking?.service_category?.id || 0,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    },
    { skip: !booking?.service_point_id || !selectedDate || !booking?.service_category?.id }
  );

  // Преобразование данных слотов в формат для AvailabilitySelector
  const availableTimeSlots: AvailableTimeSlot[] = useMemo(() => {
    if (!availabilityData?.slots || availabilityData.slots.length === 0) {
      return [];
    }

    // Группируем слоты по времени начала
    const groupedByTime = availabilityData.slots.reduce((acc, slot) => {
      const timeKey = slot.start_time;
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          time: timeKey,
          available_posts: 0,
          total_posts: 0,
          duration_minutes: slot.duration_minutes,
          can_book: true
        };
      }
      
      acc[timeKey].available_posts += 1;
      acc[timeKey].total_posts += 1;
      
      return acc;
    }, {} as Record<string, AvailableTimeSlot>);

    return Object.values(groupedByTime).sort((a, b) => a.time.localeCompare(b.time));
  }, [availabilityData]);

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
        service_point_id: booking.service_point_id,
        service_category: booking.service_category,
        categoryId: booking.service_category?.id,
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
        servicePointId: booking.service_point_id ? Number(booking.service_point_id) : 0,
        categoryId: booking.service_category?.id || 0,
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      console.log('🔍 Параметры запроса слотов:', requestParams);
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
      // Вычисляем время окончания на основе длительности слота
      const selectedSlotData = availableTimeSlots.find(slot => slot.time === selectedTimeSlot);
      const durationMinutes = selectedSlotData?.duration_minutes || 60; // По умолчанию 1 час
      
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours, minutes + durationMinutes);
      const endTime = endDate.toTimeString().substring(0, 5);

      const updateData: Partial<BookingFormData> = {
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTimeSlot,
        end_time: endTime,
      };

      await updateBooking({ id: id || '', booking: updateData }).unwrap();
      navigate(`/client/bookings/${id}?reschedule_success=true`);
    } catch (error) {
      console.error('Ошибка при переносе записи:', error);
    }
  };

  // Проверка возможности сохранения
  const canSave = selectedDate && selectedTimeSlot && !isUpdating;

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
              {t('Ошибка при загрузке данных о записи')}
            </Alert>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBack}
              variant="outlined"
              sx={secondaryButtonStyles}
            >
              {t('Вернуться к записи')}
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
                {t('Назад')}
              </Button>
              <Typography variant="h4" component="h1">
                {t('Перенос записи')} №{booking.id}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleReschedule}
              disabled={!canSave}
              sx={primaryButtonStyles}
            >
              {isUpdating ? t('Сохранение...') : t('Подтвердить перенос')}
            </Button>
          </Box>

          {/* Ошибка при обновлении */}
          {isUpdateError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {t('Ошибка при переносе записи. Пожалуйста, попробуйте еще раз.')}
            </Alert>
          )}

          {/* Информация о текущей записи */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('Текущая запись')}
            </Typography>
            
            <Box mt={2} mb={2}>
              <Typography variant="body1" gutterBottom>
                <strong>{t('Дата')}:</strong> {format(parseISO(booking.booking_date), 'd MMMM yyyy', { locale: ru })}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t('Время')}:</strong> {booking.start_time}{booking.end_time ? ` - ${booking.end_time}` : ''}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t('Сервисная точка')}:</strong> {servicePointData?.name || `#${booking.service_point_id}`}
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
            {t('Выберите новую дату и время')}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <AvailabilitySelector
              // @ts-ignore - временно игнорируем ошибку типов
              servicePointId={booking.service_point_id ? Number(booking.service_point_id) : undefined}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotChange={handleTimeSlotChange}
              availableTimeSlots={availableTimeSlots}
              isLoading={isLoadingAvailability}
              servicePointPhone={servicePointData?.contact_phone || servicePointData?.phone}
              categoryId={booking.service_category?.id}
            />
          </Box>



          {/* Информация о выбранной дате и времени */}
          {selectedDate && selectedTimeSlot && (
            <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: colors.backgroundSecondary }}>
              <Typography variant="h6" gutterBottom>
                {t('Новая дата и время')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t('Дата')}:</strong> {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </Typography>
              <Typography variant="body1">
                <strong>{t('Время')}:</strong> {selectedTimeSlot}
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
              {t('Выберите дату для продолжения')}
            </Alert>
          )}

          {selectedDate && !selectedTimeSlot && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              {t('Выберите время для продолжения')}
            </Alert>
          )}
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default RescheduleBookingPage; 