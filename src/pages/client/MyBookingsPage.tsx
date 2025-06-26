import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert, useTheme } from '@mui/material';
import { useGetBookingsByClientQuery } from '../../api/bookings.api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import BookingsList from '../../components/bookings/BookingsList';
import BookingFilters from '../../components/bookings/BookingFilters';
import LoginPrompt from '../../components/auth/LoginPrompt';
import { BookingStatusEnum } from '../../types/booking';
import { useTranslation } from 'react-i18next';
import { Booking as ModelBooking } from '../../types/models';
import { Booking } from '../../types/booking';
import { getThemeColors, getButtonStyles } from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';

// Функция для конвертации типов Booking
const convertBooking = (modelBooking: ModelBooking): Booking => {
  return {
    id: String(modelBooking.id),
    client_id: String(modelBooking.client_id),
    service_point_id: String(modelBooking.service_point_id),
    car_id: modelBooking.car_id ? String(modelBooking.car_id) : null,
    car_type_id: String(modelBooking.car_type_id),
    slot_id: String(modelBooking.slot_id || 0),
    booking_date: modelBooking.booking_date,
    start_time: modelBooking.start_time,
    end_time: modelBooking.end_time,
    notes: modelBooking.notes,
    status_id: modelBooking.status_id,
    services: modelBooking.services?.map(s => ({
      service_id: String(s.service_id),
      quantity: s.quantity,
      price: s.price
    })) || [],
    status: modelBooking.status_id as BookingStatusEnum,
    scheduled_at: modelBooking.booking_date + ' ' + modelBooking.start_time,
    created_at: modelBooking.created_at,
    updated_at: modelBooking.updated_at
  };
};

// Интерфейс для фильтров
interface BookingsFilter {
  status?: BookingStatusEnum;
  dateFrom?: string;
  dateTo?: string;
}

const MyBookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  
  const currentUser = useSelector(selectCurrentUser);
  const [tabValue, setTabValue] = useState<number>(0);
  const [filters, setFilters] = useState<BookingsFilter>({
    status: BookingStatusEnum.PENDING,
  });

  // Получаем client_id из текущего пользователя
  // Временное решение: используем отдельный запрос для получения client_id
  const clientId = currentUser?.role === 'client' ? '1' : null; // Hardcode для тестирования

  // Отладочная информация
  console.log('MyBookingsPage - currentUser:', currentUser);
  console.log('MyBookingsPage - currentUser.id:', currentUser?.id);
  console.log('MyBookingsPage - currentUser.role:', currentUser?.role);
  console.log('MyBookingsPage - clientId:', clientId);
  
  // Запрос на получение записей клиента
  const { data: bookingsData, isLoading, isError, error } = useGetBookingsByClientQuery(
    clientId ? String(clientId) : '', 
    { skip: !clientId }
  );

  // Отладочная информация для запроса
  console.log('MyBookingsPage - RTK Query state:', {
    data: bookingsData,
    isLoading,
    isError,
    error,
    currentUserId: currentUser?.id,
    skip: !currentUser?.id
  });

  // Детальная отладочная информация для данных
  if (bookingsData?.data) {
    console.log('MyBookingsPage - Raw bookings data:', bookingsData.data);
    console.log('MyBookingsPage - Current filters:', filters);
    console.log('MyBookingsPage - Filter status:', filters.status);
    console.log('MyBookingsPage - BookingStatusEnum values:', BookingStatusEnum);
    
    bookingsData.data.forEach((booking, index) => {
      console.log(`Booking ${index}:`, {
        id: booking.id,
        status_id: booking.status_id,
        status: booking.status_id as BookingStatusEnum,
        filterStatus: filters.status,
        matches: booking.status_id === filters.status
      });
    });
  }

  // Обработчик изменения вкладки
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Обновляем фильтры в зависимости от выбранной вкладки
    if (newValue === 0) {
      setFilters({ ...filters, status: BookingStatusEnum.PENDING });
    } else if (newValue === 1) {
      setFilters({ ...filters, status: BookingStatusEnum.CONFIRMED });
    } else if (newValue === 2) {
      setFilters({ ...filters, status: BookingStatusEnum.COMPLETED });
    } else if (newValue === 3) {
      setFilters({ ...filters, status: BookingStatusEnum.CANCELLED });
    }
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: Partial<BookingsFilter>) => {
    setFilters({ ...filters, ...newFilters });
  };

  // RTK Query автоматически обновляется при изменении параметров
  // useEffect с refetch не нужен

  // Если пользователь не авторизован, показываем предложение войти
  if (!currentUser) {
    return <LoginPrompt />;
  }

  // Конвертируем данные бронирований
  const convertedBookings = bookingsData?.data
    ? bookingsData.data.map(convertBooking)
        .filter(booking => booking.status === filters.status)
    : [];

  // Для тестирования - показываем все записи без фильтрации
  const allConvertedBookings = bookingsData?.data
    ? bookingsData.data.map(convertBooking)
    : [];

  console.log('MyBookingsPage - convertedBookings:', convertedBookings);
  console.log('MyBookingsPage - allConvertedBookings (без фильтра):', allConvertedBookings);

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('Мои записи')}
          </Typography>

          {/* Отладочная информация в режиме разработки */}
          {process.env.NODE_ENV === 'development' && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>🔍 Отладочная информация</Typography>
              <Typography variant="body2">Пользователь ID: {currentUser?.id || 'Не найден'}</Typography>
              <Typography variant="body2">Роль пользователя: {currentUser?.role || 'Не найдена'}</Typography>
              <Typography variant="body2">Client ID: {clientId || 'Не найден'}</Typography>
              <Typography variant="body2">Загрузка: {isLoading ? 'Да' : 'Нет'}</Typography>
              <Typography variant="body2">Ошибка: {isError ? 'Да' : 'Нет'}</Typography>
              <Typography variant="body2">Данные получены: {bookingsData ? 'Да' : 'Нет'}</Typography>
              <Typography variant="body2">Количество записей: {bookingsData?.data?.length || 0}</Typography>
              <Typography variant="body2">Текущий фильтр статус: {filters.status}</Typography>
              <Typography variant="body2">Отфильтровано записей: {convertedBookings.length}</Typography>
              <Typography variant="body2">Активная вкладка: {tabValue}</Typography>
              {bookingsData?.data && bookingsData.data.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" fontWeight="bold">Статусы записей:</Typography>
                  {bookingsData.data.map((booking, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                      Запись {booking.id}: status_id={booking.status_id} 
                      {booking.status_id === filters.status ? ' ✅' : ' ❌'}
                    </Typography>
                  ))}
                </Box>
              )}
              {error && (
                <Typography variant="body2" color="error">
                  Детали ошибки: {JSON.stringify(error)}
                </Typography>
              )}
            </Paper>
          )}
          
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label={t('Предстоящие')} />
              <Tab label={t('Подтвержденные')} />
              <Tab label={t('Завершенные')} />
              <Tab label={t('Отмененные')} />
            </Tabs>
          </Paper>
          
          <BookingFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
          
          <Box mt={3}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity="error">❌ {t('Произошла ошибка при загрузке записей')}</Alert>
            ) : convertedBookings.length > 0 ? (
              <BookingsList 
                bookings={convertedBookings} 
              />
            ) : allConvertedBookings.length > 0 ? (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  ⚠️ Записи найдены, но не соответствуют текущему фильтру. Показаны все записи для диагностики:
                </Alert>
                <BookingsList 
                  bookings={allConvertedBookings} 
                />
              </Box>
            ) : (
              <Alert severity="info">💡 {t('У вас нет записей с выбранными параметрами')}</Alert>
            )}
          </Box>
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default MyBookingsPage; 