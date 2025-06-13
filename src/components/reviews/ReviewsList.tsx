import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { Review } from '../../types/review';
import ReviewCard from './ReviewCard';
import { useTranslation } from 'react-i18next';

interface ReviewsListProps {
  reviews: Review[];
  showServicePoint?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, showServicePoint = false }) => {
  const { t } = useTranslation();

  if (!reviews || reviews.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          {t('Отзывы не найдены')}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {reviews.map((review) => (
        <Grid item xs={12} sm={6} md={4} key={review.id}>
          <ReviewCard review={review} showServicePoint={showServicePoint} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ReviewsList; 