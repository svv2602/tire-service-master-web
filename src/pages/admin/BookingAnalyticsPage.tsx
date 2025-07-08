import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BookingAnalytics } from '../../components/analytics/BookingAnalytics';
import { useGetBookingsQuery } from '../../api/bookings.api';
import { Booking } from '../../types/models';
import { subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

const BookingAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Date range state for analysis
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 1), // Last month by default
    end: new Date(),
  });

  // Load bookings data
  const { 
    data: bookingsResponse, 
    isLoading, 
    error 
  } = useGetBookingsQuery({
    from_date: format(dateRange.start, 'yyyy-MM-dd'),
    to_date: format(dateRange.end, 'yyyy-MM-dd'),
    per_page: 1000, // Load many records for analysis
  });

  const bookings = useMemo(() => {
    return (bookingsResponse?.data || []) as Booking[];
  }, [bookingsResponse]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          {t('admin.analytics.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.analytics.subtitle')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('admin.analytics.dataLoadError')}: {error.toString()}
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