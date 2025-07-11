import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
  Rating,
  Stack,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGetMyFavoritePointsByCategoryQuery, QuickBookingCategory, QuickBookingData } from '../../../api/favoritePoints.api';
import { useGetServiceCategoriesQuery } from '../../../api/serviceCategories.api';

interface QuickFavoritesStepProps {
  clientId: number;
  onCategoryAndServicePointSelect: (categoryId: number, servicePointId: number) => void;
  onUseRegularSearch: () => void;
}

const QuickFavoritesStep: React.FC<QuickFavoritesStepProps> = ({
  clientId,
  onCategoryAndServicePointSelect,
  onUseRegularSearch,
}) => {
  const { t } = useTranslation(['common', 'components']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedServicePointId, setSelectedServicePointId] = useState<number | null>(null);

  // Запросы API
  const { 
    data: favoritesData, 
    isLoading: isLoadingFavorites,
    error: favoritesError 
  } = useGetMyFavoritePointsByCategoryQuery(undefined, {
    skip: !clientId
  });

  const { 
    data: categoriesData,
    isLoading: isLoadingCategories 
  } = useGetServiceCategoriesQuery({});

  // Обработчики
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedServicePointId(null);
  };

  const handleServicePointSelect = (servicePointId: number) => {
    setSelectedServicePointId(servicePointId);
  };

  const handleContinueToDateTime = () => {
    if (selectedCategoryId && selectedServicePointId) {
      onCategoryAndServicePointSelect(selectedCategoryId, selectedServicePointId);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categoriesData?.data?.find((cat: any) => cat.id === categoryId);
    return category?.name || t('common.unknown');
  };

  if (isLoadingFavorites || isLoadingCategories) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          <Skeleton width="50%" />
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          <Skeleton width="80%" />
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (favoritesError || !favoritesData?.has_favorites) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('components.favoritePoints.quick_booking.no_favorites')}
          </Typography>
          <Typography variant="body2">
            {t('components.favoritePoints.quick_booking.add_favorites_suggestion')}
          </Typography>
        </Alert>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onUseRegularSearch}
          startIcon={<ChevronRightIcon />}
        >
          {t('components.favoritePoints.quick_booking.use_regular_search')}
        </Button>
      </Box>
    );
  }

  const selectedCategory = favoritesData.categories_with_favorites.find(
    cat => cat.category_id === selectedCategoryId
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Typography variant="h4" gutterBottom>
        {t('components.favoritePoints.quick_booking.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('components.favoritePoints.quick_booking.subtitle')}
      </Typography>

      {/* Шаг 1: Выбор категории */}
      {!selectedCategoryId && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('components.favoritePoints.quick_booking.select_category')}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {favoritesData.categories_with_favorites.map((category: QuickBookingCategory) => (
              <Grid item xs={12} sm={6} md={4} key={category.category_id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                  onClick={() => handleCategorySelect(category.category_id)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {category.category_name}
                    </Typography>
                    <Chip 
                      label={`${category.service_points.length} ${t('components.favoritePoints.info.points')}`}
                      color="primary"
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onUseRegularSearch}
          >
            {t('components.favoritePoints.quick_booking.use_regular_search')}
          </Button>
        </Box>
      )}

      {/* Шаг 2: Выбор сервисной точки */}
      {selectedCategoryId && selectedCategory && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Chip
              label={getCategoryName(selectedCategoryId)}
              onDelete={() => setSelectedCategoryId(null)}
              deleteIcon={<CancelIcon />}
              color="primary"
              variant="outlined"
              sx={{ mr: 2 }}
            />
          </Box>
          
          <Typography variant="h6" gutterBottom>
            {t('components.favoritePoints.quick_booking.select_service_point')}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {selectedCategory.service_points.map((servicePoint) => (
              <Grid item xs={12} sm={6} md={4} key={servicePoint.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: selectedServicePointId === servicePoint.id ? 
                      `2px solid ${theme.palette.primary.main}` : 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[6],
                    },
                  }}
                  onClick={() => handleServicePointSelect(servicePoint.id)}
                >
                  {servicePoint.photo_url && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={servicePoint.photo_url}
                      alt={servicePoint.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom noWrap>
                      {servicePoint.name}
                    </Typography>
                    
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {servicePoint.city_name}
                        </Typography>
                      </Box>
                      
                      {servicePoint.average_rating && servicePoint.average_rating > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating 
                            value={servicePoint.average_rating} 
                            readOnly 
                            size="small"
                            precision={0.1}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({servicePoint.average_rating.toFixed(1)})
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography variant="body2" color="text.secondary">
                        {servicePoint.partner_name}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {selectedServicePointId && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleContinueToDateTime}
                startIcon={<ChevronRightIcon />}
              >
                {t('components.favoritePoints.quick_booking.continue_to_datetime')}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onUseRegularSearch}
              >
                {t('components.favoritePoints.quick_booking.use_regular_search')}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default QuickFavoritesStep;