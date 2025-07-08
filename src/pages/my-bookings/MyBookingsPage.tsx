import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert, useTheme } from '@mui/material';
import { useGetBookingsByClientQuery } from '../../api/bookings.api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import BookingsList from '../../components/bookings/BookingsList';
import BookingFilters from '../../components/bookings/BookingFilters';
import LoginPrompt from '../../components/auth/LoginPrompt';
import { BookingStatusKey, BOOKING_STATUSES } from '../../types/booking';
import { useTranslation } from 'react-i18next';
import { Booking as ModelBooking } from '../../types/models';
import { Booking } from '../../types/booking';
import { getThemeColors, getButtonStyles } from '../../styles';
import { Button } from '../../components/ui/Button';
import { Add as AddIcon } from '@mui/icons-material';
import { convertStatusToKey } from '../../utils/bookingStatus';
import { useNavigate } from 'react-router-dom';

// Функция для конвертации типов Booking
const convertBooking = (modelBooking: ModelBooking): Booking => {
  // Извлекаем статус из API ответа - теперь это всегда строка
  const statusName = modelBooking.status || 'pending';
    
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
    services: modelBooking.services?.map(s => ({
      service_id: String(s.service_id),
      quantity: s.quantity,
      price: s.price
    })) || [],
    status: convertStatusToKey(statusName),
    scheduled_at: modelBooking.booking_date + ' ' + modelBooking.start_time,
    created_at: modelBooking.created_at,
    updated_at: modelBooking.updated_at
  };
};

// Интерфейс для фильтров
interface BookingsFilter {
  status?: BookingStatusKey;
  dateFrom?: string;
  dateTo?: string;
}

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  
  const currentUser = useSelector(selectCurrentUser);
  const [tabValue, setTabValue] = useState<number>(0);
  const [filters, setFilters] = useState<BookingsFilter>({
    status: BOOKING_STATUSES.PENDING,
  });

  // Запрос на получение записей клиента
  const { data: bookingsData, isLoading, isError, refetch } = useGetBookingsByClientQuery(
    currentUser?.id ? String(currentUser.id) : '', 
    { skip: !currentUser?.id }
  );

  // Обработчик изменения вкладки
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Обновляем фильтры в зависимости от выбранной вкладки
    if (newValue === 0) {
      setFilters({ ...filters, status: BOOKING_STATUSES.PENDING });
    } else if (newValue === 1) {
      setFilters({ ...filters, status: BOOKING_STATUSES.COMPLETED });
    } else if (newValue === 2) {
      setFilters({ ...filters, status: BOOKING_STATUSES.CANCELLED_BY_CLIENT });
    }
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: Partial<BookingsFilter>) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Эффект для обновления данных при изменении фильтров
  useEffect(() => {
    if (currentUser?.id) {
      refetch();
    }
  }, [filters, currentUser, refetch]);

  // Если пользователь не авторизован, показываем предложение войти
  if (!currentUser) {
    return <LoginPrompt />;
  }

  // Конвертируем данные бронирований
  const convertedBookings = bookingsData?.data
    ? bookingsData.data.map(convertBooking)
        .filter(booking => booking.status === filters.status)
    : [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {t('client.myBookings.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/client/booking')}
            sx={{ ml: 2 }}
          >
            {t('client.myBookings.newBooking')}
          </Button>
        </Box>
      
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={t('client.myBookings.tabs.upcoming')} />
            <Tab label={t('client.myBookings.tabs.completed')} />
            <Tab label={t('client.myBookings.tabs.cancelled')} />
          </Tabs>
        </Paper>
      
        <BookingFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      
        <Box mt={3}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              ❌ {t('client.myBookings.loadError')}
            </Alert>
          ) : convertedBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                {tabValue === 0 && t('client.myBookings.noUpcoming')}
                {tabValue === 1 && t('client.myBookings.noCompleted')}
                {tabValue === 2 && t('client.myBookings.noCancelled')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                {t('client.myBookings.description')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/client/booking')}
              >
                {t('client.myBookings.newBooking')}
              </Button>
            </Box>
          ) : (
            <BookingsList 
              bookings={convertedBookings}
            />
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default MyBookingsPage; 