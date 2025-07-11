import React, { useState, useMemo } from 'react';
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
  useTheme,
  Card,
  CardContent,
  CardActionArea,
  IconButton
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  BookOnline as BookOnlineIcon,
  Refresh as RefreshIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Импорты типов и API
import { RootState } from '../../store';
import { useGetMyFavoritePointsQuery, useRemoveFromMyFavoritesMutation } from '../../api/favoritePoints.api';
import { ServicePointCard, ServicePointData } from '../ui/ServicePointCard';
import { useGetServicePostsQuery } from '../../api/servicePoints.api';
import { useGetServiceCategoriesQuery } from '../../api/serviceCategories.api';
import { ServicePost } from '../../types/models';

// Импорт стилей
import { getThemeColors, getButtonStyles } from '../../styles';

interface FavoritePointsTabProps {
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

// Интерфейс для категории услуг
interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  services: any[];
}

// Компонент для одной карточки избранной точки с загрузкой категорий
const FavoritePointCard: React.FC<{
  favoritePoint: any;
  onViewDetails: (servicePoint: ServicePointData) => void;
  onBook: (servicePoint: ServicePointData) => void;
  onRemove: (servicePoint: ServicePointData) => void;
}> = ({ favoritePoint, onViewDetails, onBook, onRemove }) => {
  const servicePointData = convertToServicePointData(favoritePoint);
  
  // Загружаем посты сервисной точки для получения доступных категорий
  const { data: servicePostsData, isLoading: isLoadingPosts } = useGetServicePostsQuery(
    servicePointData.id.toString()
  );
  
  // Загружаем все категории для получения названий
  const { data: categoriesResponse } = useGetServiceCategoriesQuery({});

  // Получаем доступные категории на основе активных постов
  const availableCategories = useMemo(() => {
    if (!servicePostsData || !categoriesResponse?.data) return [];
    
    // Получаем список категорий, для которых есть активные посты
    const activeCategoryIds = new Set<number>();
    servicePostsData.forEach((post: ServicePost) => {
      if (post.is_active && post.service_category_id) {
        activeCategoryIds.add(post.service_category_id);
      }
    });
    
    // Создаем категории на основе активных постов
    const categoriesMap = new Map();
    Array.from(activeCategoryIds).forEach(categoryId => {
      const categoryInfo = categoriesResponse.data.find(cat => cat.id === categoryId);
      if (categoryInfo) {
        // Подсчитываем количество активных постов для этой категории
        const postsCount = servicePostsData.filter(
          (post: ServicePost) => post.is_active && post.service_category_id === categoryId
        ).length;
        
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryInfo.name,
          description: categoryInfo.description,
          services_count: postsCount // Используем количество постов вместо услуг
        });
      }
    });
    
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [servicePostsData, categoriesResponse?.data]);

  return (
    <ServicePointCard
      servicePoint={servicePointData}
      variant="compact"
      onViewDetails={onViewDetails}
      onBook={onBook}
      showDetailsLink={true}
      showBookButton={true}
      showFavoriteButton={true}
      categories={availableCategories}
      isLoadingCategories={isLoadingPosts}
    />
  );
};

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
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedServicePointForBooking, setSelectedServicePointForBooking] = useState<ServicePointData | null>(null);

  // API хуки
  const { 
    data: favoritePointsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetMyFavoritePointsQuery();
  
  const [removeFromFavorites, { isLoading: isRemoving }] = useRemoveFromMyFavoritesMutation();
  
  // Загружаем посты сервисной точки для получения доступных категорий (только для модального окна)
  const { data: servicePostsData } = useGetServicePostsQuery(
    selectedServicePointForBooking?.id.toString() || '',
    { skip: !selectedServicePointForBooking?.id }
  );
  
  // Загружаем все категории для получения названий
  const { data: categoriesResponse } = useGetServiceCategoriesQuery({});

  // Получаем доступные категории для выбранной сервисной точки (для модального окна)
  const availableCategories = useMemo(() => {
    if (!servicePostsData || !categoriesResponse?.data) return [];
    
    // Получаем список категорий, для которых есть активные посты
    const activeCategoryIds = new Set<number>();
    servicePostsData.forEach((post: ServicePost) => {
      if (post.is_active && post.service_category_id) {
        activeCategoryIds.add(post.service_category_id);
      }
    });
    
    const categoriesMap = new Map();
    
    // Создаем категории на основе активных постов
    Array.from(activeCategoryIds).forEach(categoryId => {
      const categoryInfo = categoriesResponse.data.find(cat => cat.id === categoryId);
      if (categoryInfo) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryInfo.name,
          description: categoryInfo.description,
          services: []
        });
      }
    });
    
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [servicePostsData, categoriesResponse?.data]);

  // Обработчики событий
  const handleViewDetails = (servicePointData: ServicePointData) => {
    navigate(`/client/service-point/${servicePointData.id}`);
  };

  const handleBookService = (servicePointData: ServicePointData) => {
    setSelectedServicePointForBooking(servicePointData);
    // Загружаем категории для выбранной точки и обрабатываем бронирование
    handleBookingWithCategorySelection(servicePointData);
  };

  const handleBookingWithCategorySelection = (servicePointData: ServicePointData) => {
    // Сначала устанавливаем выбранную точку, чтобы запустить загрузку данных
    setSelectedServicePointForBooking(servicePointData);
    
    // Даем время для загрузки данных о постах, затем проверяем категории
    setTimeout(() => {
      // Проверяем доступные категории после загрузки
      if (availableCategories.length === 0) {
        // Если категорий нет, все равно переходим к бронированию - пользователь сможет выбрать категорию на следующем шаге
        navigate('/client/booking/new-with-availability', {
          state: {
            servicePointId: servicePointData.id,
            cityId: servicePointData.city?.id,
            cityName: servicePointData.city?.name,
            // Не передаем service_category_id, пользователь выберет на первом шаге
          }
        });
        return;
      }
      
      // Если есть только одна категория, сразу переходим к бронированию
      if (availableCategories.length === 1) {
        handleCategorySelect(availableCategories[0]);
        return;
      }
      
      // Иначе открываем модальное окно для выбора категории
      setCategoryModalOpen(true);
    }, 200); // Увеличиваем задержку для надежной загрузки
  };

  const handleCategorySelect = (category: ServiceCategory) => {
    if (!selectedServicePointForBooking) return;
    
    setCategoryModalOpen(false);
    
    // Переходим на страницу бронирования с предзаполненными данными
    navigate('/client/booking/new-with-availability', {
      state: {
        servicePointId: selectedServicePointForBooking.id,
        cityId: selectedServicePointForBooking.city?.id,
        cityName: selectedServicePointForBooking.city?.name,
        service_category_id: category.id,
        step1Completed: true // Указываем что первый шаг уже завершен
      }
    });
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setSelectedServicePointForBooking(null);
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
        {favoritePointsData.map((favoritePoint: any) => (
          <Grid item xs={12} md={6} lg={4} key={favoritePoint.id}>
            <FavoritePointCard
              favoritePoint={favoritePoint}
              onViewDetails={handleViewDetails}
              onBook={handleBookService}
              onRemove={handleRemoveFromFavorites}
            />
          </Grid>
        ))}
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

      {/* Модальное окно выбора категории услуг */}
      <Dialog
        open={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Выберите категорию услуг
          </Typography>
          <IconButton
            aria-label="Закрыть"
            onClick={handleCloseCategoryModal}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Выберите категорию услуг для записи в сервисную точку "{selectedServicePointForBooking?.name}"
          </Typography>
          
          <Grid container spacing={2}>
            {availableCategories.map((category) => (
              <Grid item xs={12} sm={6} key={category.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardActionArea>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                      </Box>
                      
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {category.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Доступно для записи
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FavoritePointsTab; 