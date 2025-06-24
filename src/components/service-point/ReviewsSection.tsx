import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Rating, Divider, Button, 
  CircularProgress, Alert, Tabs, Tab, Pagination 
} from '@mui/material';
import { useGetReviewsByServicePointQuery } from '../../api/reviews.api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Review as ReviewType } from '../../types/review';
import { Review as ModelReview } from '../../types/models';
import ReviewCard from '../reviews/ReviewCard';
import { Add as AddIcon } from '@mui/icons-material';
import { UserRole } from '../../types/user-role';

interface ReviewsSectionProps {
  servicePointId: string | number;
}

// Функция для преобразования Review из models в Review из review
const convertModelReviewToReviewType = (modelReview: ModelReview): ReviewType => {
  // Создаем базовый объект Review
  const review: Partial<ReviewType> = {
    id: modelReview.id,
    user_id: modelReview.client_id, 
    service_point_id: modelReview.service_point_id,
    booking_id: modelReview.booking?.id || 0,
    rating: modelReview.rating,
    comment: modelReview.comment || modelReview.text || '',
    status: modelReview.status || 'published',
    response: modelReview.response,
    created_at: modelReview.created_at,
    updated_at: modelReview.updated_at,
    service_point: modelReview.service_point
  };
  
  // Если есть client, создаем объект User из доступных данных
  if (modelReview.client) {
    review.user = {
      id: modelReview.client.id,
      email: modelReview.client.user?.email || '',
      phone: modelReview.client.user?.phone || '',
      first_name: modelReview.client.first_name,
      last_name: modelReview.client.last_name,
      role: UserRole.CLIENT,
      role_id: 1, // ID роли клиента
      is_active: true,
      email_verified: true,
      phone_verified: true,
      created_at: modelReview.created_at, // Используем дату создания отзыва
      updated_at: modelReview.updated_at  // Используем дату обновления отзыва
    };
  }
  
  return review as ReviewType;
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ servicePointId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const reviewsPerPage = 6;

  // Запрос на получение отзывов для сервисной точки
  const { data: reviewsData, isLoading, isError } = useGetReviewsByServicePointQuery(
    servicePointId.toString()
  );

  // Обработчик изменения страницы
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Обработчик изменения вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1); // Сбрасываем страницу при смене вкладки
  };

  // Переход на страницу создания отзыва
  const handleCreateReview = () => {
    navigate(`/client/reviews/new/${servicePointId}`);
  };

  // Если загружаем данные, показываем индикатор загрузки
  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Отзывы клиентов')}
        </Typography>
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  // Если произошла ошибка, показываем сообщение об ошибке
  if (isError || !reviewsData) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Отзывы клиентов')}
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {t('Не удалось загрузить отзывы')}
        </Alert>
      </Paper>
    );
  }

  // Получаем только опубликованные отзывы
  const publishedReviews = reviewsData.filter((review: any) => review.status === 'published');

  // Рассчитываем средний рейтинг
  const averageRating = publishedReviews.length > 0
    ? publishedReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / publishedReviews.length
    : 0;

  // Фильтруем отзывы по рейтингу в зависимости от выбранной вкладки
  let filteredModelReviews: ModelReview[] = [];
  if (tabValue === 0) {
    filteredModelReviews = publishedReviews; // Все отзывы
  } else if (tabValue === 1) {
    filteredModelReviews = publishedReviews.filter((review: any) => review.rating >= 4); // Положительные (4-5 звезд)
  } else if (tabValue === 2) {
    filteredModelReviews = publishedReviews.filter((review: any) => review.rating <= 3); // Критические (1-3 звезды)
  }
  
  // Конвертируем отзывы из модели в тип Review
  const filteredReviews: ReviewType[] = filteredModelReviews.map(convertModelReviewToReviewType);

  // Разбиваем на страницы
  const startIndex = (page - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);
  const pageCount = Math.ceil(filteredReviews.length / reviewsPerPage);

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('Отзывы клиентов')}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={handleCreateReview}
        >
          {t('Оставить отзыв')}
        </Button>
      </Box>

      <Box display="flex" alignItems="center" mb={3}>
        <Box mr={2}>
          <Typography variant="h4" component="span">
            {averageRating.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            / 5
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Rating value={averageRating} precision={0.5} readOnly />
          <Typography variant="body2" color="textSecondary">
            {publishedReviews.length} {t('отзывов')}
          </Typography>
        </Box>
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label={t('Все отзывы')} />
        <Tab label={t('Положительные')} />
        <Tab label={t('Критические')} />
      </Tabs>

      {paginatedReviews.length > 0 ? (
        <>
          <Box sx={{ mb: 3 }}>
            {paginatedReviews.map((review) => (
              <Box key={review.id} sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="textSecondary">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" paragraph>
                  {review.comment}
                </Typography>
                {review.response && (
                  <Box bgcolor="grey.100" p={2} borderRadius={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('Ответ сервиса')}:
                    </Typography>
                    <Typography variant="body2">
                      {review.response}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Box>
          
          {pageCount > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="textSecondary">
            {t('Отзывы не найдены')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ReviewsSection; 