import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert, useTheme } from '@mui/material';
import { useGetBookingsByClientQuery } from '../../api/bookings.api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import BookingsList from '../../components/bookings/BookingsList';
import BookingFilters from '../../components/bookings/BookingFilters';
import LoginPrompt from '../../components/auth/LoginPrompt';
import ClientNavigation from '../../components/client/ClientNavigation';
import { BookingStatusEnum } from '../../types/booking';
import { useTranslation } from 'react-i18next';
import { Booking as ModelBooking } from '../../types/models';
import { Booking } from '../../types/booking';
import { getThemeColors, getButtonStyles } from '../../styles';
import { Button } from '../../components/ui/Button';
import { Add as AddIcon } from '@mui/icons-material';

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
      setFilters({ ...filters, status: BookingStatusEnum.PENDING });
    } else if (newValue === 1) {
      setFilters({ ...filters, status: BookingStatusEnum.COMPLETED });
    } else if (newValue === 2) {
      setFilters({ ...filters, status: BookingStatusEnum.CANCELLED });
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
      <ClientNavigation colors={colors} secondaryButtonStyles={secondaryButtonStyles} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Мои записи на шиномонтаж
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
                            onClick={() => window.location.href = '/client/booking'}
            sx={{ ml: 2 }}
          >
            Записаться на обслуживание
          </Button>
        </Box>
      
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Предстоящие" />
            <Tab label="Завершенные" />
            <Tab label="Отмененные" />
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
            <Alert severity="error">❌ Произошла ошибка при загрузке записей</Alert>
          ) : convertedBookings.length > 0 ? (
            <BookingsList 
              bookings={convertedBookings} 
            />
          ) : (
            <Box sx={{ 
              textAlign: 'center',
              py: 6,
              px: 3
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {tabValue === 0 && 'У вас нет предстоящих записей'}
                {tabValue === 1 && 'У вас нет завершенных записей'}
                {tabValue === 2 && 'У вас нет отмененных записей'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Выберите удобный сервисный центр и запишитесь на обслуживание
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => window.location.href = '/client/booking'}
              >
                Записаться на обслуживание
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default MyBookingsPage; 