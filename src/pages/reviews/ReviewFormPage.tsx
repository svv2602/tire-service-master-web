import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Rating,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { 
  useGetBookingsByClientQuery,
  useCreateReviewMutation,
} from '../../api';
import { Booking } from '../../types/models';
import { RootState } from '../../store';

// Схема валидации
const validationSchema = yup.object({
  booking_id: yup.number()
    .required('Выберите бронирование'),
  rating: yup.number()
    .required('Оценка обязательна')
    .min(1, 'Минимальная оценка - 1 звезда')
    .max(5, 'Максимальная оценка - 5 звезд'),
  comment: yup.string()
    .required('Текст отзыва обязателен')
    .min(10, 'Минимальная длина отзыва - 10 символов')
    .max(1000, 'Максимальная длина отзыва - 1000 символов'),
});

const ReviewFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();
  
  // Получаем userId из Redux store
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  // RTK Query хуки
  const { 
    data: bookingsData, 
    isLoading: bookingsLoading,
    error: bookingsError
  } = useGetBookingsByClientQuery(userId || '', { skip: !userId });

  const formik = useFormik({
    initialValues: {
      booking_id: '',
      rating: 0,
      comment: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Находим выбранное бронирование для получения service_point_id
        const selectedBooking = bookingsData?.find((booking: Booking) => booking.id === values.booking_id);
        
        await createReview({
          service_point_id: selectedBooking?.service_point_id || '',
          rating: values.rating,
          comment: values.comment,
        }).unwrap();
        navigate('/my-reviews');
      } catch (error) {
        console.error('Ошибка при создании отзыва:', error);
      }
    },
  });

  const handleBack = () => {
    navigate('/my-reviews');
  };

  if (bookingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (bookingsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке бронирований: {bookingsError.toString()}
        </Alert>
      </Box>
    );
  }

  const bookings = bookingsData || [];

  // Если нет завершенных бронирований
  if (bookings.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Назад
          </Button>
          <Typography variant="h4">Новый отзыв</Typography>
        </Box>
        <Alert severity="info">
          У вас пока нет завершенных бронирований. После завершения обслуживания вы сможете оставить отзыв.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Назад
        </Button>
        <Typography variant="h4">Новый отзыв</Typography>
      </Box>

      {/* Форма */}
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl error={formik.touched.booking_id && Boolean(formik.errors.booking_id)}>
              <InputLabel>Выберите бронирование</InputLabel>
              <Select
                name="booking_id"
                value={formik.values.booking_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Выберите бронирование"
              >
                {bookings.map((booking: Booking) => (
                  <MenuItem key={booking.id} value={booking.id}>
                    {booking.service_point?.name} - {new Date(booking.scheduled_at).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.booking_id && formik.errors.booking_id && (
                <FormHelperText>{formik.errors.booking_id}</FormHelperText>
              )}
            </FormControl>

            <Box>
              <Typography component="legend">Ваша оценка</Typography>
              <Rating
                name="rating"
                value={formik.values.rating}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rating', newValue);
                }}
                onBlur={formik.handleBlur}
                size="large"
              />
              {formik.touched.rating && formik.errors.rating && (
                <FormHelperText error>{formik.errors.rating}</FormHelperText>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              name="comment"
              label="Текст отзыва"
              value={formik.values.comment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.comment && Boolean(formik.errors.comment)}
              helperText={formik.touched.comment && formik.errors.comment}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={handleBack}>
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={<StarIcon />}
              >
                {isSubmitting ? 'Сохранение...' : 'Опубликовать отзыв'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ReviewFormPage; 