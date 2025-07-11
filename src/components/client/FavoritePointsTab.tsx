import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  IconButton,
  Rating,
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarTodayIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGetMyFavoritePointsByCategoryQuery, useRemoveFromMyFavoritesMutation, QuickBookingCategory, QuickBookingData } from '../../api/favoritePoints.api';
import { useGetServiceCategoriesQuery } from '../../api/serviceCategories.api';
import { useGetCurrentUserQuery } from '../../api/auth.api';

interface FavoritePointsTabProps {
  onNotify: (message: string, type: 'success' | 'error') => void;
}

// Обновляем интерфейс для соответствия реальным данным API
interface ServicePointData {
  id: number;
  name: string;
  address: string;
  city_name: string;
  partner_name: string;
  photo_url?: string;
  average_rating?: number;
}

interface FavoritePointsResponse {
  has_favorites: boolean;
  categories_with_favorites: QuickBookingCategory[];
}

const FavoritePointsTab: React.FC<FavoritePointsTabProps> = ({ onNotify }) => {
  const { t } = useTranslation(['components', 'profile']);
  const navigate = useNavigate();
  
  // Состояния
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pointToRemove, setPointToRemove] = useState<number | null>(null);

  // RTK Query
  const { data: currentUser } = useGetCurrentUserQuery();
  const clientId = currentUser?.client?.id;
  
  const { 
    data: favoritesData, 
    isLoading: favoritesLoading, 
    error: favoritesError 
  } = useGetMyFavoritePointsByCategoryQuery(undefined, {
    skip: !clientId
  });

  // Исправляем вызов useGetServiceCategoriesQuery - добавляем параметры
  const { data: categoriesData } = useGetServiceCategoriesQuery({});
  
  const [removeFavoritePoint, { isLoading: isRemoving }] = useRemoveFromMyFavoritesMutation();

  // Обработчики
  const handleRemoveFavorite = async () => {
    if (!pointToRemove || !clientId) return;

    try {
      await removeFavoritePoint(pointToRemove).unwrap();
      
      setConfirmDialogOpen(false);
      setPointToRemove(null);
      onNotify(t('components:favoritePoints.messages.removeSuccess'), 'success');
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
      onNotify(t('components:favoritePoints.messages.removeError'), 'error');
    }
  };

  const handleBookingClick = (servicePointId: number, categoryId: number) => {
    navigate(`/client/booking/new-with-availability?service_point_id=${servicePointId}&category_id=${categoryId}`);
  };

  const handleOpenConfirmDialog = (pointId: number) => {
    setPointToRemove(pointId);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setPointToRemove(null);
  };

  const handleSearchClick = () => {
    navigate('/client/search');
  };

  const getCategoryName = (categoryId: number) => {
    if (!categoriesData?.data || !Array.isArray(categoriesData.data)) return t('components:favoritePoints.info.unknownCategory');
    const category = categoriesData.data.find((cat: any) => cat.id === categoryId);
    return category?.name || t('components:favoritePoints.info.unknownCategory');
  };

  // Состояния загрузки и ошибок
  if (favoritesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (favoritesError) {
    return (
      <Alert severity="error">
        {t('components:favoritePoints.messages.loadError')}
      </Alert>
    );
  }

  if (!favoritesData?.has_favorites || !favoritesData?.categories_with_favorites?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <FavoriteBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('components:favoritePoints.emptyState.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('components:favoritePoints.emptyState.description')}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<LocationOnIcon />}
          onClick={handleSearchClick}
        >
          {t('components:favoritePoints.emptyState.searchButton')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Информационное сообщение */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>{t('components:favoritePoints.info.title')}</AlertTitle>
        {t('components:favoritePoints.info.description')}
      </Alert>
      
      {/* Группировка по категориям */}
      {favoritesData.categories_with_favorites.map((category: QuickBookingCategory) => (
        <Box key={category.category_id} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ mr: 1 }}>
              {getCategoryName(category.category_id)}
            </Typography>
            <Chip 
              label={category.service_points.length} 
              size="small" 
              color="primary" 
            />
          </Box>

          <Grid container spacing={2}>
            {category.service_points.map((point: ServicePointData) => (
              <Grid item xs={12} md={6} lg={4} key={point.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
                        {point.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenConfirmDialog(point.id)}
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Рейтинг - используем average_rating с проверкой */}
                    {point.average_rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={point.average_rating} readOnly size="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          ({point.average_rating}/5)
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {point.address}
                      </Typography>
                    </Box>

                    {/* Показываем город и партнера */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {point.city_name} • {point.partner_name}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CalendarTodayIcon />}
                      onClick={() => handleBookingClick(point.id, category.category_id)}
                      fullWidth
                    >
                      {t('components:favoritePoints.actions.quickBooking')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('components:favoritePoints.confirmDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('components:favoritePoints.confirmDialog.message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>
            {t('components:favoritePoints.confirmDialog.cancel')}
          </Button>
          <Button 
            onClick={handleRemoveFavorite} 
            variant="contained" 
            color="error"
            disabled={isRemoving}
          >
            {isRemoving ? <CircularProgress size={20} /> : t('components:favoritePoints.confirmDialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FavoritePointsTab; 