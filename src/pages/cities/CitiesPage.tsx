import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { SIZES } from '../../styles/theme';
import CitiesList from '../../components/CitiesList';
import { City } from '../../types/models';

const CitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Временное решение - захардкоженный ID региона
  // TODO: Получать ID региона из URL или состояния приложения
  const defaultRegionId = 1;

  const handleEditCity = (city: City) => {
    navigate(`/admin/cities/${city.id}/edit`);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: SIZES.spacing.lg }}>
        Управление городами
      </Typography>
      <CitiesList regionId={defaultRegionId} onEditCity={handleEditCity} />
    </Box>
  );
};

export default CitiesPage;
