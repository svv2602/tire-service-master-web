import React from 'react';
import { Card, CardContent, CardActions, Typography, Box, Rating, Chip, Divider, Button } from '@mui/material';
import { Review } from '../../types/review';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import EventIcon from '@mui/icons-material/Event';
import CommentIcon from '@mui/icons-material/Comment';

interface ReviewCardProps {
  review: Review;
  showServicePoint?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, showServicePoint = false }) => {
  const { t } = useTranslation('components');
  const navigate = useNavigate();

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Получение названия статуса
  const getStatusName = (status: string) => {
    switch (status) {
      case 'published':
        return t('reviewCard.status.published');
      case 'pending':
        return t('reviewCard.status.pending');
      case 'rejected':
        return t('reviewCard.status.rejected');
      default:
        return t('reviewCard.status.unknown');
    }
  };

  // Переход на страницу деталей отзыва
  const handleViewDetails = () => {
    navigate(`/client/reviews/${review.id}`);
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Rating value={review.rating} readOnly precision={0.5} />
          <Chip 
            label={getStatusName(review.status)} 
            color={getStatusColor(review.status) as any}
            size="small"
          />
        </Box>

        {showServicePoint && review.service_point && (
          <Box display="flex" alignItems="center" mb={2}>
            <StoreIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" noWrap>
              {review.service_point.name}
            </Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center" mb={2}>
          <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {formatDate(review.created_at)}
          </Typography>
        </Box>

        <Typography variant="body1" gutterBottom>
          {review.comment}
        </Typography>

        {review.response && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box bgcolor="grey.100" p={1.5} borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>
                {t('reviewCard.serviceResponse')}:
              </Typography>
              <Typography variant="body2">
                {review.response}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={handleViewDetails}>
          {t('reviewCard.buttons.viewDetails')}
        </Button>
        
        {review.status === 'published' && (
          <Button size="small" color="primary">
            {t('reviewCard.buttons.edit')}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ReviewCard; 