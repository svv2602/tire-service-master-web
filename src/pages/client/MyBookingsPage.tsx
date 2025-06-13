import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { useGetBookingsByClientQuery } from '../../api/bookings.api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import BookingsList from '../../components/bookings/BookingsList';
import BookingFilters from '../../components/bookings/BookingFilters';
import LoginPrompt from '../../components/auth/LoginPrompt';
import { BookingStatusEnum } from '../../types/booking';
import { useTranslation } from 'react-i18next';

// Интерфейс для фильтров
interface BookingsFilter {
  status?: BookingStatusEnum;
  dateFrom?: string;
  dateTo?: string;
}

const MyBookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const [tabValue, setTabValue] = useState<number>(0);
  const [filters, setFilters] = useState<BookingsFilter>({
    status: BookingStatusEnum.PENDING,
  });

  // Запрос на получение записей клиента
  const { data: bookingsData, isLoading, isError, refetch } = useGetBookingsByClientQuery(
    currentUser?.id || '', 
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('Мои записи')}
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={t('Предстоящие')} />
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
          <Alert severity="error">{t('Произошла ошибка при загрузке записей')}</Alert>
        ) : bookingsData && bookingsData.data.length > 0 ? (
          <BookingsList 
            bookings={bookingsData.data.filter(booking => booking.status === filters.status)} 
          />
        ) : (
          <Alert severity="info">{t('У вас нет записей с выбранными параметрами')}</Alert>
        )}
      </Box>
    </Container>
  );
};

export default MyBookingsPage; 