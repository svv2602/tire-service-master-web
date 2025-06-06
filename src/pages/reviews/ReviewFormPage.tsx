import React from 'react';
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
  useTheme,
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
import { getCardStyles, getButtonStyles, getTextFieldStyles } from '../../styles/components';
import { SIZES } from '../../styles/theme';

/**
 * Схема валидации для формы отзыва
 * Определяет правила валидации полей отзыва:
 * - Бронирование: обязательное поле выбора
 * - Рейтинг: от 1 до 5 звезд (обязательно)
 * - Комментарий: от 10 до 1000 символов (обязательно)
 */
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

/**
 * Компонент формы создания отзыва о сервисной точке
 * Позволяет клиентам оставлять отзывы на основе завершенных бронирований
 * 
 * Функциональность:
 * - Выбор бронирования из списка завершенных
 * - Выставление рейтинга от 1 до 5 звезд
 * - Написание текстового отзыва
 * - Валидация всех полей формы
 * 
 * Использует централизованную систему стилей для консистентного UI
 */

const ReviewFormPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();
  
  // Централизованные стили
  const cardStyles = getCardStyles(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme);
  
  // Получаем userId из Redux store
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  // RTK Query хуки
  const { 
    data: bookingsData, 
    isLoading: bookingsLoading,
    error: bookingsError
  } = useGetBookingsByClientQuery(userId?.toString() || '', { skip: !userId });

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
        const selectedBooking = bookingsData?.data?.find((booking: Booking) => booking.id.toString() === values.booking_id);
        
        await createReview({
          service_point_id: selectedBooking?.service_point_id?.toString() || '',
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
      <Box sx={{ padding: SIZES.spacing.xl }}>
        <Alert severity="error">
          Ошибка при загрузке бронирований: {bookingsError.toString()}
        </Alert>
      </Box>
    );
  }

  const bookings = bookingsData?.data || [];

  // Если нет завершенных бронирований
  if (bookings.length === 0) {
    return (
      <Box sx={{ padding: SIZES.spacing.xl }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: SIZES.spacing.sm, 
          marginBottom: SIZES.spacing.xl 
        }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={secondaryButtonStyles}
          >
            Назад
          </Button>
          <Typography 
            variant="h4"
            sx={{
              fontSize: SIZES.fontSize.xl,
              fontWeight: 600,
            }}
          >
            Новый отзыв
          </Typography>
        </Box>
        <Alert severity="info">
          У вас пока нет завершенных бронирований. После завершения обслуживания вы сможете оставить отзыв.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: SIZES.spacing.xl }}>
      {/* Заголовок */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: SIZES.spacing.sm, 
        marginBottom: SIZES.spacing.xl 
      }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={secondaryButtonStyles}
        >
          Назад
        </Button>
        <Typography 
          variant="h4"
          sx={{
            fontSize: SIZES.fontSize.xl,
            fontWeight: 600,
          }}
        >
          Новый отзыв
        </Typography>
      </Box>

      {/* Форма */}
      <Paper sx={{ ...cardStyles, maxWidth: 600 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: SIZES.spacing.xl 
          }}>
            <FormControl error={formik.touched.booking_id && Boolean(formik.errors.booking_id)}>
              <InputLabel>Выберите бронирование</InputLabel>
              <Select
                name="booking_id"
                value={formik.values.booking_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Выберите бронирование"
                sx={{
                  ...textFieldStyles,
                  '& .MuiSelect-select': {
                    borderRadius: SIZES.borderRadius.sm,
                  }
                }}
              >
                {bookings.map((booking: Booking) => (
                  <MenuItem key={booking.id} value={booking.id}>
                    {booking.service_point?.name} - {new Date(booking.booking_date).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.booking_id && formik.errors.booking_id && (
                <FormHelperText>{formik.errors.booking_id}</FormHelperText>
              )}
            </FormControl>

            <Box>
              <Typography 
                component="legend"
                sx={{
                  fontSize: SIZES.fontSize.md,
                  fontWeight: 500,
                  marginBottom: SIZES.spacing.sm,
                }}
              >
                Ваша оценка
              </Typography>
              <Rating
                name="rating"
                value={formik.values.rating}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rating', newValue);
                }}
                onBlur={formik.handleBlur}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiRating-iconHover': {
                    color: theme.palette.primary.light,
                  },
                }}
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
              sx={textFieldStyles}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: SIZES.spacing.md, 
              marginTop: SIZES.spacing.lg 
            }}>
              <Button 
                onClick={handleBack}
                sx={secondaryButtonStyles}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={<StarIcon />}
                sx={primaryButtonStyles}
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