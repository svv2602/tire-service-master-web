import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Rating,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { 
  useGetReviewByIdQuery,
  useUpdateReviewMutation,
} from '../../api';
import { ReviewUpdateData } from '../../types/models';

// Схема валидации
const validationSchema = yup.object({
  response: yup.string()
    .required('Ответ обязателен')
    .min(10, 'Ответ должен содержать минимум 10 символов')
    .max(1000, 'Ответ не должен превышать 1000 символов'),
});

const ReviewReplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // RTK Query хуки
  const { 
    data: review,
    isLoading: reviewLoading,
    error: reviewError,
  } = useGetReviewByIdQuery(id || '', { skip: !id });

  const [updateReview, { isLoading: updateLoading }] = useUpdateReviewMutation();

  const formik = useFormik({
    initialValues: {
      response: review?.response || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (id) {
        try {
          await updateReview({
            id: id || '',
            data: { response: values.response } as ReviewUpdateData,
          }).unwrap();
          navigate('/admin/reviews');
        } catch (error) {
          console.error('Ошибка при сохранении ответа:', error);
        }
      }
    },
  });

  // Вспомогательные функции
  const getClientInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'К';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    navigate('/admin/reviews');
  };

  // Отображение состояний загрузки и ошибок
  if (reviewLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (reviewError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке отзыва: {reviewError.toString()}
        </Alert>
      </Box>
    );
  }

  if (!review) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Отзыв не найден
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Ответ на отзыв</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Назад к списку
        </Button>
      </Box>

      {/* Информация об отзыве */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getClientInitials(review.client?.first_name, review.client?.last_name)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {review.client?.first_name} {review.client?.last_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Rating value={review.rating} readOnly size="small" />
              <Typography variant="body2" color="textSecondary">
                {formatDate(review.created_at)}
              </Typography>
            </Box>
            <Typography sx={{ mb: 2 }}>
              {review.comment}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon color="action" />
            <Typography>
              {review.service_point?.name}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Форма ответа */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            id="response"
            name="response"
            label="Ваш ответ"
            value={formik.values.response}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.response && Boolean(formik.errors.response)}
            helperText={formik.touched.response && formik.errors.response}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleBack}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<ReplyIcon />}
              disabled={formik.isSubmitting || updateLoading}
            >
              {formik.isSubmitting || updateLoading ? 'Сохранение...' : 'Ответить'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ReviewReplyPage; 