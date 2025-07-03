import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { BookingAnalytics } from '../../components/analytics/BookingAnalytics';
import { useGetBookingsQuery } from '../../api/bookings.api';
import { Booking } from '../../types/models';
import { subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

const BookingAnalyticsPage: React.FC = () => {
  // Состояние для периода анализа
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 1), // Последний месяц по умолчанию
    end: new Date(),
  });

  // Загрузка данных бронирований
  const { 
    data: bookingsResponse, 
    isLoading, 
    error 
  } = useGetBookingsQuery({
    from_date: format(dateRange.start, 'yyyy-MM-dd'),
    to_date: format(dateRange.end, 'yyyy-MM-dd'),
    per_page: 1000, // Загружаем много записей для анализа
  });

  const bookings = useMemo(() => {
    return (bookingsResponse?.data || []) as Booking[];
  }, [bookingsResponse]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Аналитика бронирований
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Детальный анализ статистики бронирований, доходов и популярных услуг
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке данных: {error.toString()}
        </Alert>
      )}

      <Card>
        <CardContent>
          <BookingAnalytics 
            bookings={bookings}
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default BookingAnalyticsPage;