import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert, useTheme, Button } from '@mui/material';
import { useGetBookingsByClientQuery } from '../../api/bookings.api';
import { useGetCurrentUserQuery } from '../../api/auth.api';
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
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const navigate = useNavigate();
  
  const currentUser = useSelector(selectCurrentUser);
  const [tabValue, setTabValue] = useState<number>(0);
  const [filters, setFilters] = useState<BookingsFilter>({
    status: BookingStatusEnum.PENDING,
  });

  // Получаем актуальную информацию о пользователе из API
  const { data: userFromApi } = useGetCurrentUserQuery(undefined, {
    skip: !currentUser // Пропускаем запрос если пользователь не авторизован
  });

  // Определяем client_id из API данных или из Redux
  const clientId = userFromApi?.client_id || currentUser?.client_id;
  
  // Запрос на получение записей клиента
  const { data: bookingsData, isLoading, isError, error, refetch } = useGetBookingsByClientQuery(
    clientId ? String(clientId) : '', 
    { skip: !clientId }
  );

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

  // Обработчик создания новой записи
  const handleNewBooking = () => {
    navigate('/client/booking');
  };

  // Если пользователь не авторизован, показываем предложение войти
  if (!currentUser) {
    return <LoginPrompt />;
  }

  // Если нет client_id, показываем сообщение об ошибке
  if (!clientId) {
    return (
      <ClientLayout>
        <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="error">
              Не удалось определить профиль клиента. Обратитесь к администратору.
            </Alert>
          </Container>
        </Box>
      </ClientLayout>
    );
  }

  // Конвертируем данные бронирований и применяем фильтры
  const convertedBookings = bookingsData?.data
    ? bookingsData.data
        .map(convertBooking)
        .filter(booking => booking.status === filters.status)
    : [];

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Заголовок с кнопкой создания записи */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {t('Мои записи')}
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
          
          {/* Вкладки статусов */}
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
          
          {/* Фильтры */}
          <BookingFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
          
          {/* Список бронирований */}
          <Box mt={3}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t('Произошла ошибка при загрузке записей')}
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => refetch()}
                  sx={{ ml: 2 }}
                >
                  Повторить
                </Button>
              </Alert>
            ) : convertedBookings.length > 0 ? (
              <BookingsList 
                bookings={convertedBookings} 
              />
            ) : (
              <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('У вас нет записей')}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {tabValue === 0 && 'У вас нет предстоящих записей'}
                  {tabValue === 1 && 'У вас нет подтвержденных записей'}
                  {tabValue === 2 && 'У вас нет завершенных записей'}
                  {tabValue === 3 && 'У вас нет отмененных записей'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNewBooking}
                  sx={primaryButtonStyles}
                >
                  Создать первую запись
                </Button>
              </Alert>
            )}
          </Box>
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default MyBookingsPage; 