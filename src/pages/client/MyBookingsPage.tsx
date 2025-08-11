import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert, useTheme, Button, useMediaQuery } from '@mui/material';
import { useGetBookingsByClientQuery } from '../../api/bookings.api';
import { useGetCurrentUserQuery } from '../../api/auth.api';
import { useGetClientMeQuery } from '../../api/clientAuth.api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import BookingsList from '../../components/bookings/BookingsList';
import BookingFilters from '../../components/bookings/BookingFilters';
import LoginPrompt from '../../components/auth/LoginPrompt';
import { BookingStatusKey, BOOKING_STATUSES } from '../../types/booking';
import { useTranslation } from 'react-i18next';
import { Booking as ModelBooking } from '../../types/models';
import { Booking } from '../../types/booking';
import { getThemeColors, getButtonStyles } from '../../styles';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientLayout from '../../components/client/ClientLayout';
import { convertStatusToKey, isCancelledStatus } from '../../utils/bookingStatus';

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
    is_service_booking: modelBooking.is_service_booking || false, // Добавляем поле сервисного бронирования
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
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Определяем мобильное устройство для адаптивных табов
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const currentUser = useSelector(selectCurrentUser);
  const { isAuthenticated, isInitialized, loading } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState<number>(0);
  const [filters, setFilters] = useState<BookingsFilter>({
    status: BOOKING_STATUSES.PENDING,
  });
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  // Проверяем, был ли создан новый аккаунт (из URL параметров)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('newAccount') === 'true') {
      setShowWelcomeMessage(true);
      // Убираем параметр из URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Проверяем параметр tab для активации нужной вкладки
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      switch (tabParam) {
        case 'pending':
          setTabValue(0);
          setFilters({ ...filters, status: BOOKING_STATUSES.PENDING });
          break;
        case 'confirmed':
          setTabValue(1);
          setFilters({ ...filters, status: BOOKING_STATUSES.CONFIRMED });
          break;
        case 'completed':
          setTabValue(2);
          setFilters({ ...filters, status: BOOKING_STATUSES.COMPLETED });
          break;
        case 'cancelled':
          setTabValue(3);
          setFilters({ ...filters, status: undefined }); // Для отмененных убираем фильтр статуса
          break;
        default:
          // Оставляем значение по умолчанию
          break;
      }
      // Убираем параметр tab из URL после обработки
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Получаем актуальную информацию о пользователе из API
  // Для клиентов используем специальный endpoint /clients/me
  const { data: userFromApi, isLoading: isLoadingUser, error: userError } = useGetCurrentUserQuery(undefined, {
    skip: !currentUser || currentUser.role === 'client' // Пропускаем для клиентов
  });
  
  // Для клиентов используем /clients/me
  const { data: clientFromApi, isLoading: isLoadingClient, error: clientError } = useGetClientMeQuery(undefined, {
    skip: !currentUser || currentUser.role !== 'client' // Используем только для клиентов
  });

  // Определяем client_id из API данных или из Redux
  const clientId = clientFromApi?.client?.id || userFromApi?.user?.client_id || currentUser?.client_id;
  
  // Отладочная информация
  console.log('🔍 MyBookingsPage - отладка clientId:', {
    currentUser,
    clientFromApi,
    userFromApi,
    clientId,
    isLoadingClient,
    isLoadingUser,
    clientError,
    userError
  });
  
  // Запрос на получение записей клиента
  const { data: bookingsData, isLoading, isError, error, refetch } = useGetBookingsByClientQuery(
    clientId ? String(clientId) : '', 
    { skip: !clientId }
  );
  
  // Отладочная информация для бронирований
  console.log('📋 MyBookingsPage - отладка бронирований:', {
    clientId,
    bookingsData,
    isLoading,
    isError,
    error,
    skip: !clientId
  });

  // Обработчик изменения вкладки
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Обновляем фильтры в зависимости от выбранной вкладки
    if (newValue === 0) {
      setFilters({ ...filters, status: BOOKING_STATUSES.PENDING });
    } else if (newValue === 1) {
      setFilters({ ...filters, status: BOOKING_STATUSES.CONFIRMED });
    } else if (newValue === 2) {
      setFilters({ ...filters, status: BOOKING_STATUSES.COMPLETED });
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
          // Фильтрация по дате (общая для всех вкладок)
          let dateOk = true;
          if (filters.dateFrom) {
            dateOk = dateOk && booking.booking_date >= filters.dateFrom;
          }
          if (filters.dateTo) {
            dateOk = dateOk && booking.booking_date <= filters.dateTo;
          }
          if (!dateOk) return false;

          // Для вкладки t('client.myBookings.cancelled') (tabValue === 3) показываем все отмененные статусы
          if (tabValue === 3) {
            return isCancelledStatus(String(booking.status));
          }
          // Для вкладки t('client.myBookings.confirmed') (tabValue === 1) показываем подтвержденные и в процессе
          if (tabValue === 1) {
            return booking.status === BOOKING_STATUSES.CONFIRMED || 
                   booking.status === BOOKING_STATUSES.IN_PROGRESS;
          }
          // Для остальных вкладок используем точное соответствие статуса
          if (filters.status !== undefined) {
            return booking.status === filters.status;
          }
          return true;
        })
        .sort((a, b) => {
          // Сортировка от самых свежих к старым по дате и времени бронирования
          const dateTimeA = new Date(`${a.booking_date}T${a.start_time}`).getTime();
          const dateTimeB = new Date(`${b.booking_date}T${b.start_time}`).getTime();
          return dateTimeB - dateTimeA; // Убывающий порядок (свежие сверху)
        })
    : [];

  // Показываем загрузку если состояние еще не инициализировано или загружаются данные
  if (!isInitialized || loading || isLoadingUser || isLoadingClient) {
    return (
      <ClientLayout>
        <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{t('forms.clientPages.myBookings.loading')}</Typography>
        </Box>
      </ClientLayout>
    );
  }

  // Если пользователь не авторизован, показываем предложение войти
  if (!isAuthenticated || !currentUser) {
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
                {t('forms.clientPages.myBookings.clientProfileError')}
              </Typography>
              <Typography variant="body2" component="div">
                {t('forms.clientPages.myBookings.error')}: {userError ? JSON.stringify(userError) : clientError ? JSON.stringify(clientError) : t('forms.clientPages.myBookings.unknownError')}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()} 
                sx={{ mt: 2 }}
              >
                {t('forms.clientPages.myBookings.reloadPage')}
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
          {/* Приветственное сообщение */}
          {showWelcomeMessage && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              onClose={() => setShowWelcomeMessage(false)}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('forms.clientPages.myBookings.welcome')}
              </Typography>
              <Typography variant="body2">
                {t('forms.clientPages.myBookings.welcomeMessage')}
              </Typography>
            </Alert>
          )}

          {/* Заголовок с кнопкой создания записи */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {t('forms.clientPages.myBookings.title')} {clientFromApi?.user ? `(${clientFromApi.user.first_name} ${clientFromApi.user.last_name})` : `(Client ID: ${clientId})`}
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewBooking}
              sx={primaryButtonStyles}
            >
              {t('forms.clientPages.myBookings.newBooking')}
            </Button>
          </Box>
          
          {/* Вкладки статусов - адаптивные для мобильных */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile={isMobile}
              sx={{
                // Улучшенные стили для мобильных табов
                '& .MuiTab-root': {
                  minWidth: isMobile ? 80 : 'auto',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: isMobile ? 1 : 2,
                },
                // Стиль для прокрутки табов на мобильных
                '& .MuiTabs-scrollButtons': {
                  color: theme.palette.primary.main,
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                },
              }}
            >
              <Tab 
                label={isMobile 
                  ? t('forms.clientPages.myBookings.upcomingShort') || 'Предст.' 
                  : t('forms.clientPages.myBookings.upcoming')
                } 
              />
              <Tab 
                label={isMobile 
                  ? t('forms.clientPages.myBookings.confirmedShort') || 'Подтв.' 
                  : t('forms.clientPages.myBookings.confirmed')
                } 
              />
              <Tab 
                label={isMobile 
                  ? t('forms.clientPages.myBookings.completedShort') || 'Завер.' 
                  : t('forms.clientPages.myBookings.completed')
                } 
              />
              <Tab 
                label={isMobile 
                  ? t('forms.clientPages.myBookings.cancelledShort') || 'Отмен.' 
                  : t('forms.clientPages.myBookings.cancelled')
                } 
              />
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
                  {t('forms.clientPages.myBookings.loadingBookings', { clientId })}
                </Typography>
              </Box>
            ) : isError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t('forms.clientPages.myBookings.loadingError')}
                <br />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t('forms.clientPages.myBookings.error')}: {error ? JSON.stringify(error) : t('forms.clientPages.myBookings.unknownError')}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => refetch()}
                  sx={{ ml: 2 }}
                >
                  {t('forms.clientPages.myBookings.retry')}
                </Button>
              </Alert>
            ) : convertedBookings.length > 0 ? (
              <BookingsList 
                bookings={convertedBookings} 
                onBookingUpdated={refetch}
              />
            ) : (
              <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('forms.clientPages.myBookings.noBookings')}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {tabValue === 0 && t('forms.clientPages.myBookings.noUpcomingBookings')}
                  {tabValue === 1 && t('forms.clientPages.myBookings.noConfirmedBookings')}
                  {tabValue === 2 && t('forms.clientPages.myBookings.noCompletedBookings')}
                  {tabValue === 3 && t('forms.clientPages.myBookings.noCancelledBookings')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNewBooking}
                  sx={primaryButtonStyles}
                >
                  {t('forms.clientPages.myBookings.createFirstBooking')}
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