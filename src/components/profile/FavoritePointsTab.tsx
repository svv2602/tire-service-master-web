import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  BookOnline as BookOnlineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Импорты типов и API
import { RootState } from '../../store';
import { useGetMyFavoritePointsQuery, useRemoveFromMyFavoritesMutation } from '../../api/favoritePoints.api';
import { ServicePointCard, ServicePointData } from '../ui/ServicePointCard';

// Импорт стилей
import { getThemeColors, getButtonStyles } from '../../styles';

interface FavoritePointsTabProps {
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

// Функция конвертации данных API в формат ServicePointData
const convertToServicePointData = (favoritePoint: any): ServicePointData => {
  const servicePoint = favoritePoint.service_point || favoritePoint;
  
  return {
    id: servicePoint.id,
    name: servicePoint.name,
    address: servicePoint.address,
    description: servicePoint.description || '',
    city: servicePoint.city ? {
      id: servicePoint.city.id,
      name: servicePoint.city.name,
      region: servicePoint.city.region
    } : undefined,
    partner: servicePoint.partner ? {
      id: servicePoint.partner.id,
      name: servicePoint.partner.name
    } : undefined,
    contact_phone: servicePoint.contact_phone || '',
    average_rating: parseFloat(servicePoint.average_rating?.toString() || '0'),
    reviews_count: servicePoint.reviews_count || 0,
    work_status: servicePoint.work_status || 'working',
    photos: (servicePoint.photos || []).map((photo: any) => ({
      id: photo.id,
      url: photo.url,
      description: photo.description || '',
      is_main: photo.is_main || false,
      sort_order: photo.sort_order || 0
    }))
  };
};

const FavoritePointsTab: React.FC<FavoritePointsTabProps> = ({ onNotify }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const buttonStyles = getButtonStyles(theme, 'primary');
  const navigate = useNavigate();
  
  // Redux состояние
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Состояния компонента
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pointToDelete, setPointToDelete] = useState<any>(null);

  // API хуки
  const { 
    data: favoritePointsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetMyFavoritePointsQuery();
  
  const [removeFromFavorites, { isLoading: isRemoving }] = useRemoveFromMyFavoritesMutation();

  // Обработчики событий
  const handleViewDetails = (servicePointData: ServicePointData) => {
    navigate(`/client/service-point/${servicePointData.id}`);
  };

  const handleBookService = (servicePointData: ServicePointData) => {
    navigate(`/client/booking/new-with-availability?service_point_id=${servicePointData.id}`);
  };

  const handleRemoveFromFavorites = (servicePointData: ServicePointData) => {
    // Находим соответствующий объект избранной точки
    const favoritePoint = favoritePointsData?.find((fp: any) => 
      (fp.service_point?.id || fp.id) === servicePointData.id
    );
    
    if (favoritePoint) {
      setPointToDelete(favoritePoint);
      setDeleteDialogOpen(true);
    }
  };

  const confirmRemoveFromFavorites = async () => {
    if (!pointToDelete || !user?.client_id) return;

    try {
      await removeFromFavorites(pointToDelete.id).unwrap();

      onNotify(t('forms.profile.favoritePoints.removedSuccess'), 'success');
      setDeleteDialogOpen(false);
      setPointToDelete(null);
      refetch(); // Обновляем список
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
      onNotify(t('forms.profile.favoritePoints.removeError'), 'error');
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Обработка состояний загрузки и ошибок
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              {t('common.retry')}
            </Button>
          }
        >
          {t('forms.profile.favoritePoints.loadError')}
        </Alert>
      </Box>
    );
  }

  // Обработка пустого списка
  if (!favoritePointsData || favoritePointsData.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <FavoriteBorderIcon 
          sx={{ 
            fontSize: 64, 
            color: colors.textSecondary, 
            mb: 2 
          }} 
        />
        <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
          {t('forms.profile.favoritePoints.noFavorites')}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
          {t('forms.profile.favoritePoints.noFavoritesDescription')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<BookOnlineIcon />}
          onClick={() => navigate('/client/services')}
          sx={buttonStyles}
        >
          {t('forms.profile.favoritePoints.browseServices')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Заголовок и статистика */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: colors.textPrimary }}>
          {t('forms.profile.favoritePoints.title')} ({favoritePointsData.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {/* Сетка карточек избранных точек */}
      <Grid container spacing={3}>
        {favoritePointsData.map((favoritePoint: any) => {
          const servicePointData = convertToServicePointData(favoritePoint);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={favoritePoint.id}>
              <ServicePointCard
                servicePoint={servicePointData}
                variant="compact"
                onViewDetails={handleViewDetails}
                onBook={handleBookService}
                showDetailsLink={true}
                showBookButton={true}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('forms.profile.favoritePoints.confirmRemoveTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('forms.profile.favoritePoints.confirmRemoveMessage', {
              name: pointToDelete?.service_point?.name || pointToDelete?.name
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isRemoving}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={confirmRemoveFromFavorites}
            color="error"
            variant="contained"
            disabled={isRemoving}
          >
            {isRemoving ? t('common.removing') : t('common.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FavoritePointsTab; 