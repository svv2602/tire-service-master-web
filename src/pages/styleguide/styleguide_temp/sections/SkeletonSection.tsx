import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import Skeleton from '../../../../components/ui/Skeleton';
import { Card } from '../../../../components/ui/Card';

export const SkeletonSection: React.FC = () => {
  return (
    <Card>
      <Typography variant="h4" gutterBottom>
        Skeleton
      </Typography>
      <Typography variant="body1" paragraph>
        Компонент для отображения состояния загрузки контента.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Текстовый скелетон
          </Typography>
          <Box sx={{ maxWidth: 500 }}>
            <Typography variant="h4">
              <Skeleton width="60%" />
            </Typography>
            <Typography variant="body1">
              <Skeleton />
            </Typography>
            <Typography variant="body1">
              <Skeleton width="80%" />
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Прямоугольный скелетон
          </Typography>
          <Skeleton variant="rectangular" width={300} height={200} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Круглый скелетон
          </Typography>
          <Skeleton variant="circular" width={40} height={40} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Скругленный скелетон
          </Typography>
          <Skeleton variant="rounded" width={300} height={200} borderRadius={16} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Волновая анимация
          </Typography>
          <Skeleton variant="rectangular" width={300} height={200} animation="wave" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Без анимации
          </Typography>
          <Skeleton variant="rectangular" width={300} height={200} animation={false} />
        </Grid>
      </Grid>
    </Card>
  );
};

export default SkeletonSection;