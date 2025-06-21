import React, { useEffect, useState } from 'react';
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

const BookingSuccessPage: React.FC = () => {
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
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <AppBar position="static" sx={{ bgcolor: colors.backgroundCard, boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: colors.textPrimary, fontWeight: 700 }}>
            🚗 Твоя Шина
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/client" sx={{ color: colors.textSecondary }}>
              Главная
            </Button>
            <ThemeToggle />
            <Button variant="outlined" component={Link} to="/login" sx={secondaryButtonStyles}>
              Войти
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
          <Link to="/client" style={{ display: 'flex', alignItems: 'center', color: colors.textSecondary, textDecoration: 'none' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Главная
          </Link>
          <Link to="/client/booking" style={{ color: colors.textSecondary, textDecoration: 'none' }}>
            Запись на услугу
          </Link>
          <Typography sx={{ color: colors.textPrimary }}>Подтверждение</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 4, mb: 4, borderRadius: 2, textAlign: 'center' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ py: 4 }}>
              <Typography variant="h5" sx={{ color: colors.error, mb: 2 }}>
                Ошибка при загрузке данных
              </Typography>
              <Typography variant="body1">
                Не удалось загрузить информацию о бронировании. Пожалуйста, проверьте номер бронирования.
              </Typography>
              <Button 
                variant="contained" 
                component={Link} 
                to="/client" 
                sx={{ ...primaryButtonStyles, mt: 4 }}
              >
                Вернуться на главную
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
                  Запись подтверждена!
                </Typography>
                <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
                  Номер вашей записи: <strong>{bookingId}</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  Мы отправили детали записи на ваш телефон
                </Typography>
              </Box>
              
              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textAlign: 'left' }}>
                  Детали записи
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                      <CalendarIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                        Дата
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
                        Время
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
                        Сервисный центр
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
                  На главную
                </Button>
                <Button 
                  variant="contained" 
                  component="a"
                  href={`tel:${bookingData?.service_point?.phone || ''}`}
                  sx={primaryButtonStyles}
                >
                  Позвонить в сервис
                </Button>
              </Box>
            </>
          )}
        </Paper>
        
        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: colors.backgroundSecondary }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Если вам нужно изменить или отменить запись, пожалуйста, свяжитесь с сервисным центром по телефону.
            Отмена записи возможна не позднее чем за 2 часа до назначенного времени.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default BookingSuccessPage; 