import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import Skeleton from '../../../../components/ui/Skeleton';

export const SkeletonSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Skeleton
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
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
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Прямоугольный скелетон
          </Typography>
          <Skeleton variant="rectangular" width={300} height={200} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Круглый скелетон
          </Typography>
          <Skeleton variant="circular" width={40} height={40} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Скругленный скелетон
          </Typography>
          <Skeleton variant="rounded" width={300} height={200} borderRadius={16} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Волновая анимация
          </Typography>
          <Skeleton variant="rectangular" width={300} height={200} animation="wave" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Без анимации
          </Typography>
          <Skeleton variant="rectangular" width={300} height={200} animation={false} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SkeletonSection;