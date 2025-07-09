import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert, Button, useTheme } from '@mui/material';
import { useGetReviewsByClientQuery } from '../../api/reviews.api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import ReviewsList from '../../components/reviews/ReviewsList';
import LoginPrompt from '../../components/auth/LoginPrompt';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ReviewStatus, Review as ReviewType } from '../../types/review';
import { Review as ModelReview } from '../../types/models';
import { getThemeColors, getButtonStyles } from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';

// Функция для конвертации типов Review
const convertReview = (modelReview: ModelReview): ReviewType => {
  return {
    id: modelReview.id,
    user_id: modelReview.client_id,
    service_point_id: modelReview.service_point_id,
    booking_id: 0, // Значение по умолчанию
    rating: modelReview.rating,
    comment: modelReview.comment || modelReview.text || '',
    status: modelReview.status as ReviewStatus || 'published',
    response: modelReview.response,
    created_at: modelReview.created_at,
    updated_at: modelReview.updated_at,
    service_point: modelReview.service_point
  };
};

// Интерфейс для фильтров
interface ReviewsFilter {
  status?: ReviewStatus;
}

const MyReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState<number>(0);
  const [filters, setFilters] = useState<ReviewsFilter>({
    status: 'published',
  });

  // Запрос на получение отзывов клиента
  // Используем client_id если есть, иначе user_id
  const clientId = (currentUser as any)?.client_id || currentUser?.id;
  const { data: reviewsData, isLoading, isError, refetch } = useGetReviewsByClientQuery(
    clientId ? String(clientId) : '',
    { skip: !clientId }
  );

  // Отладочная информация для понимания структуры данных
  console.log('🔍 MyReviewsPage DEBUG:', {
    currentUser,
    clientId,
    reviewsData,
    isArray: Array.isArray(reviewsData),
    dataType: typeof reviewsData,
    dataKeys: reviewsData ? Object.keys(reviewsData) : null,
    isLoading,
    isError
  });

  // Обработчик изменения вкладки
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Обновляем фильтры в зависимости от выбранной вкладки
    if (newValue === 0) {
      setFilters({ ...filters, status: 'published' });
    } else if (newValue === 1) {
      setFilters({ ...filters, status: 'pending' });
    }
  };

  // Переход на страницу создания отзыва
  const handleCreateReview = () => {
    navigate('/client/reviews/new');
  };

  // Если пользователь не авторизован, показываем предложение войти
  if (!currentUser) {
    return <LoginPrompt />;
  }

  // Конвертируем данные отзывов
  let reviewsArray: ModelReview[] = [];
  
  if (reviewsData) {
    // Проверяем разные возможные структуры ответа API
    if (Array.isArray(reviewsData)) {
      reviewsArray = reviewsData;
    } else if (reviewsData && typeof reviewsData === 'object' && 'data' in reviewsData && Array.isArray((reviewsData as any).data)) {
      reviewsArray = (reviewsData as any).data;
    } else if (reviewsData && typeof reviewsData === 'object' && Array.isArray((reviewsData as any).reviews)) {
      reviewsArray = (reviewsData as any).reviews;
    }
  }
  
  const convertedReviews = reviewsArray
    .map(convertReview)
    .filter((review: any) => review.status === filters.status);

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              {t('forms.clientPages.myReviews.title')}
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateReview}
            >
              {t('forms.clientPages.myReviews.createReview')}
            </Button>
          </Box>
          
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label={t('forms.clientPages.myReviews.published')} />
              <Tab label={t('forms.clientPages.myReviews.pending')} />
            </Tabs>
          </Paper>
          
          <Box mt={3}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity="error">❌ {t('forms.clientPages.myReviews.loadingError')}</Alert>
            ) : convertedReviews.length > 0 ? (
              <ReviewsList 
                reviews={convertedReviews} 
                showServicePoint={true}
              />
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {t('forms.clientPages.myReviews.noReviews')}
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {t('forms.clientPages.myReviews.noReviewsDescription')}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateReview}
                  sx={{ mt: 2 }}
                >
                  {t('forms.clientPages.myReviews.createFirstReview')}
                </Button>
              </Paper>
            )}
          </Box>
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default MyReviewsPage; 