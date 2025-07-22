import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Paper,
  Grid,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { getButtonStyles, getThemeColors } from '../../styles';
import { useTheme } from '@mui/material';
import { useGetBookingByIdQuery } from '../../api/bookings.api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ThemeToggle from '../../components/ui/ThemeToggle';
import ClientLayout from '../../components/client/ClientLayout';

const BookingSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const location = useLocation();
  
  // Получаем ID бронирования из параметров URL
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get('bookingId');
  
  // Запрашиваем данные бронирования
  const { data: bookingData, isLoading, error } = useGetBookingByIdQuery(
    bookingId || '',
    { skip: !bookingId }
  );
  
  // Форматирование даты
  const formatBookingDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy (EEEE)', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <ClientLayout>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
          <Link to="/client" style={{ display: 'flex', alignItems: 'center', color: colors.textSecondary, textDecoration: 'none' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {t('forms.clientPages.bookingSuccess.breadcrumbHome')}
          </Link>
                        <Link to="/client/booking" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
            {t('forms.clientPages.bookingSuccess.breadcrumbBooking')}
          </Link>
          <Typography sx={{ color: colors.textPrimary }}>{t('forms.clientPages.bookingSuccess.breadcrumbConfirmation')}</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 4, mb: 4, borderRadius: 2, textAlign: 'center' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ py: 4 }}>
              <Typography variant="h5" sx={{ color: colors.error, mb: 2 }}>
                {t('forms.clientPages.bookingSuccess.loadError')}
              </Typography>
              <Typography variant="body1">
                {t('forms.clientPages.bookingSuccess.loadErrorText')}
              </Typography>
              <Button 
                variant="contained" 
                component={Link} 
                to="/client" 
                sx={{ ...primaryButtonStyles, mt: 4 }}
              >
                {t('forms.clientPages.bookingSuccess.backToMainOnError')}
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: colors.success,
                    color: 'white',
                    mb: 3
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: colors.textPrimary }}>
                  {t('forms.clientPages.bookingSuccess.title')}
                </Typography>
                <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
                  {t('forms.clientPages.bookingSuccess.bookingNumber')} <strong>{bookingId}</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  {t('forms.clientPages.bookingSuccess.smsNotification')}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textAlign: 'left' }}>
                  {t('forms.clientPages.bookingSuccess.detailsTitle')}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                      <CalendarIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                        {t('forms.clientPages.bookingSuccess.date')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {bookingData?.booking_date ? formatBookingDate(bookingData.booking_date) : '—'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                      <TimeIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                        {t('forms.clientPages.bookingSuccess.time')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {bookingData?.start_time || '—'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                      <LocationIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                        {t('forms.clientPages.bookingSuccess.serviceCenter')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {bookingData?.service_point?.name || '—'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/client" 
                  sx={secondaryButtonStyles}
                >
                  {t('client.bookingSuccess.backToMain')}
                </Button>
                <Button 
                  variant="contained" 
                  component="a"
                  href={`tel:${bookingData?.service_point?.phone || ''}`}
                  sx={primaryButtonStyles}
                >
                  {t('forms.clientPages.bookingSuccess.callService')}
                </Button>
              </Box>
            </>
          )}
        </Paper>
        
        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: colors.backgroundSecondary }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {t('forms.clientPages.bookingSuccess.changeInfo')}
          </Typography>
        </Paper>
      </Container>
    </ClientLayout>
  );
};

export default BookingSuccessPage; 