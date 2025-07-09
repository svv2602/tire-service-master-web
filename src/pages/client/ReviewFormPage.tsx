import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useCreateReviewMutation } from '../../api/reviews.api';
import { useGetBookingsByClientQuery } from '../../api/bookings.api';
import { ReviewFormData } from '../../types/review';
import ReviewForm from '../../components/reviews/ReviewForm';
import LoginPrompt from '../../components/auth/LoginPrompt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Booking as ModelBooking } from '../../types/models';
import { getThemeColors, getButtonStyles } from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';

const ReviewFormPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  
  const { servicePointId } = useParams<{ servicePointId?: string }>();
  const currentUser = useSelector(selectCurrentUser);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [selectedServicePointId, setSelectedServicePointId] = useState<string>(servicePointId || '');

  // Запрос на получение записей клиента для выбора сервисной точки
  const { data: bookingsData, isLoading: isLoadingBookings } = useGetBookingsByClientQuery(
    currentUser?.id ? String(currentUser.id) : '',
    { skip: !currentUser?.id }
  );

  // Мутация для создания отзыва
  const [createReview, { isLoading: isSubmitting, isError, error }] = useCreateReviewMutation();

  // Обработчик отправки формы
  const handleSubmit = async (values: ReviewFormData) => {
    try {
      await createReview({
        client_id: currentUser!.id,
        data: {
          ...values,
          service_point_id: selectedServicePointId,
          ...(selectedBookingId ? { booking_id: Number(selectedBookingId) } : {}),
        } as any
      }).unwrap();
      navigate('/client/reviews?success=true');
    } catch (error) {
      console.error('Ошибка при создании отзыва:', error);
    }
  };

  // Обработчик изменения выбранной записи
  const handleBookingChange = (event: SelectChangeEvent<string>) => {
    const bookingId = event.target.value as string;
    setSelectedBookingId(bookingId);
    
    // Если выбрана запись, устанавливаем соответствующую сервисную точку
    if (bookingId && bookingsData) {
      const booking = bookingsData.data.find(b => String(b.id) === bookingId);
      if (booking) {
        setSelectedServicePointId(String(booking.service_point_id));
      }
    }
  };

  // Обработчик возврата к списку отзывов
  const handleBack = () => {
    navigate('/client/reviews');
  };

  // Если пользователь не авторизован, показываем предложение войти
  if (!currentUser) {
    return <LoginPrompt />;
  }

  // Фильтруем только завершенные записи
  const completedBookings = bookingsData?.data.filter(booking => booking.status === 'completed') || [];

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box mb={3} display="flex" alignItems="center">
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              {t('forms.clientPages.reviewForm.back')}
            </Button>
            <Typography variant="h4" component="h1">
              {t('forms.clientPages.reviewForm.title')}
            </Typography>
          </Box>

          {isLoadingBookings ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : completedBookings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {t('forms.clientPages.reviewForm.noCompletedBookings')}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {t('forms.clientPages.reviewForm.noCompletedBookingsDescription')}
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/client/booking')}
                sx={{ mt: 2 }}
              >
                {t('forms.clientPages.reviewForm.bookToService')}
              </Button>
            </Paper>
          ) : (
            <>
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t('forms.clientPages.reviewForm.selectBookingLabel')}
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="booking-select-label">{t('forms.clientPages.reviewForm.bookingSelectPlaceholder')}</InputLabel>
                  <Select
                    labelId="booking-select-label"
                    id="booking-select"
                    value={selectedBookingId}
                    onChange={handleBookingChange}
                    label={t('forms.clientPages.reviewForm.bookingSelectPlaceholder')}
                  >
                    <MenuItem value="">{t('forms.clientPages.reviewForm.selectBookingOption')}</MenuItem>
                    {completedBookings.map((booking) => (
                      <MenuItem key={booking.id} value={String(booking.id)}>
                        {t('forms.clientPages.reviewForm.bookingNumber')}{booking.id} - {booking.booking_date} ({booking.start_time}-{booking.end_time})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>

              <ReviewForm
                servicePointId={selectedServicePointId}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                error={error}
              />
            </>
          )}
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default ReviewFormPage;