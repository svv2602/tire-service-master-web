import React from 'react';
import { Box, Typography } from '@mui/material';
import CitiesList from '../../components/CitiesList';

const CitiesPage: React.FC = () => {
  // Временное решение - захардкоженный ID региона
  // TODO: Получать ID региона из URL или состояния приложения
  const defaultRegionId = 1;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Города
      </Typography>
      <CitiesList regionId={defaultRegionId} />
    </Box>
  );
};

export default CitiesPage;
