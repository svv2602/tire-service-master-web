import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { Card } from '../../../../components/ui/Card';

export const SkeletonSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Скелетоны
      </Typography>

      <Grid container spacing={3}>
        {/* Текстовые скелетоны */}
        <Grid item xs={12} md={6}>
          <Card title="Текстовые скелетоны">
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="70%" />
            </Box>
          </Card>
        </Grid>

        {/* Прямоугольный скелетон */}
        <Grid item xs={12} md={6}>
          <Card title="Прямоугольный скелетон">
            <Box sx={{ p: 2 }}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={200}
                animation="pulse"
              />
            </Box>
          </Card>
        </Grid>

        {/* Круглые скелетоны */}
        <Grid item xs={12} md={6}>
          <Card title="Круглые скелетоны">
            <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Skeleton 
                variant="circular" 
                width={40} 
                height={40}
                animation="wave"
              />
              <Skeleton 
                variant="circular" 
                width={40} 
                height={40}
                animation="pulse"
              />
            </Box>
          </Card>
        </Grid>

        {/* Комбинированный пример */}
        <Grid item xs={12} md={6}>
          <Card title="Карточка загрузки">
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
            <Skeleton variant="rectangular" width="100%" height={150} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SkeletonSection;