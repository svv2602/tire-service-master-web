import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, CircularProgress, Alert, Button } from '@mui/material';
import { useGetReviewsByClientQuery } from '../../api/reviews.api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import ReviewsList from '../../components/reviews/ReviewsList';
import LoginPrompt from '../../components/auth/LoginPrompt';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ReviewStatus } from '../../types/review';

// Интерфейс для фильтров
interface ReviewsFilter {
  status?: ReviewStatus;
}

const MyReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState<number>(0);
  const [filters, setFilters] = useState<ReviewsFilter>({
    status: 'published',
  });

  // Запрос на получение отзывов клиента
  const { data: reviewsData, isLoading, isError, refetch } = useGetReviewsByClientQuery(
    currentUser?.id || '',
    { skip: !currentUser?.id }
  );

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('Мои отзывы')}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateReview}
        >
          {t('Оставить отзыв')}
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
          <Tab label={t('Опубликованные')} />
          <Tab label={t('На модерации')} />
        </Tabs>
      </Paper>
      
      <Box mt={3}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">{t('Произошла ошибка при загрузке отзывов')}</Alert>
        ) : reviewsData && reviewsData.data.length > 0 ? (
          <ReviewsList 
            reviews={reviewsData.data.filter(review => review.status === filters.status)} 
            showServicePoint={true}
          />
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('У вас пока нет отзывов')}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('Оставьте отзыв о сервисе, которым вы воспользовались')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateReview}
              sx={{ mt: 2 }}
            >
              {t('Оставить отзыв')}
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default MyReviewsPage; 