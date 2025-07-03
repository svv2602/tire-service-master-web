import React, { useState, useEffect } from 'react';
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
import { convertStatusToEnum, isCancelledStatus } from '../../utils/bookingStatus';

// Функция для конвертации типов Booking
const convertBooking = (modelBooking: ModelBooking): Booking => {
  // Извлекаем статус из API ответа
  const statusName = typeof modelBooking.status === 'string' 
    ? modelBooking.status 
    : modelBooking.status?.name || 'pending';
    
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
    service_category: modelBooking.service_category,
    service_point: modelBooking.service_point ? {
      id: modelBooking.service_point.id,
      name: modelBooking.service_point.name,
      address: modelBooking.service_point.address,
      phone: modelBooking.service_point.phone || modelBooking.service_point.contact_phone,
      city: modelBooking.service_point.city
    } : undefined,
    services: modelBooking.services?.map(s => ({
      service_id: String(s.service_id),
      quantity: s.quantity,
      price: s.price
    })) || [],
    status: convertStatusToEnum({ name: statusName }), // Передаем объект с именем статуса
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
  const { data: userFromApi, isLoading: isLoadingUser, error: userError } = useGetCurrentUserQuery(undefined, {
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
      // Для отмененных записей - показываем записи с любым статусом отмены
      setFilters({ ...filters, status: undefined }); // Убираем фильтр статуса, будем фильтровать отдельно
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

  // Конвертируем данные бронирований и применяем фильтры
  const convertedBookings = bookingsData?.data
    ? bookingsData.data
        .map(booking => {
          const converted = convertBooking(booking);
          return converted;
        })
        .filter(booking => {
          // Для вкладки "Отмененные" (tabValue === 3) показываем все отмененные статусы
          if (tabValue === 3) {
            const result = isCancelledStatus(booking.status);
            return result;
          }
          // Для вкладки "Подтвержденные" (tabValue === 1) показываем подтвержденные и в процессе
          if (tabValue === 1) {
            const result = booking.status === BookingStatusEnum.CONFIRMED || 
                   booking.status === BookingStatusEnum.IN_PROGRESS;
            return result;
          }
          // Для остальных вкладок используем точное соответствие статуса
          const result = booking.status === filters.status;
          return result;
        })
        .sort((a, b) => {
          // Сортировка от самых свежих к старым по дате и времени бронирования
          const dateTimeA = new Date(`${a.booking_date}T${a.start_time}`).getTime();
          const dateTimeB = new Date(`${b.booking_date}T${b.start_time}`).getTime();
          return dateTimeB - dateTimeA; // Убывающий порядок (свежие сверху)
        })
    : [];

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
              <Typography variant="h6" gutterBottom>
                Не удалось определить профиль клиента
              </Typography>
              <Typography variant="body2" component="div">
                Ошибка: {userError ? JSON.stringify(userError) : 'Неизвестная ошибка'}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()} 
                sx={{ mt: 2 }}
              >
                Перезагрузить страницу
              </Button>
            </Alert>
          </Container>
        </Box>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Заголовок с кнопкой создания записи */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {t('Мои записи')} (Client ID: {clientId})
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
                <Typography sx={{ ml: 2 }}>
                  Загружаем бронирования для клиента {clientId}...
                </Typography>
              </Box>
            ) : isError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t('Произошла ошибка при загрузке записей')}
                <br />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Ошибка: {error ? JSON.stringify(error) : 'Неизвестная ошибка'}
                </Typography>
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