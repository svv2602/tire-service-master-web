import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedName } from '../../../utils/localizationHelpers';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  Rating,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Collapse,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  BookOnline as BookIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { FavoriteButton } from '../FavoriteButton';
import { CategorySelectionModal } from '../CategorySelectionModal';
import { useTheme } from '@mui/material/styles';
import { getThemeColors, getCardStyles } from '../../../styles';
import { useCategorySelection } from '../../../hooks/useCategorySelection';

// Интерфейсы
export interface ServicePointPhoto {
  id: number;
  url: string;
  description?: string;
  is_main: boolean;
  sort_order: number;
}

export interface ServicePointService {
  id: number;
  service_id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_available?: boolean;
}

export interface ServicePointData {
  id: number;
  name: string;
  address: string;
  description?: string;
  city?: {
    id: number;
    name: string;
    region?: string;
  };
  partner?: {
    id: number;
    name: string;
  };
  contact_phone?: string;
  average_rating?: string | number;
  reviews_count?: number;
  work_status?: string;
  is_active?: boolean;
  photos?: ServicePointPhoto[];
}

interface WorkingSchedule {
  day: string;
  time: string;
  isWorkingDay: boolean;
}

// Компонент фотогалереи
const PhotoGallery: React.FC<{
  photos: ServicePointPhoto[];
  height?: number | string;
  showCounter?: boolean;
  fallbackIcon?: React.ReactNode;
  servicePointName?: string;
  disableGalleryOpen?: boolean;
}> = ({ photos = [], height = 200, showCounter = true, fallbackIcon = '🚗', servicePointName, disableGalleryOpen = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Сортируем фотографии: главная первая, затем по sort_order
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return a.sort_order - b.sort_order;
  });

  const mainPhoto = sortedPhotos[0];
  const hasPhotos = sortedPhotos.length > 0;

  const handleOpenModal = () => {
    if (hasPhotos) {
      setModalOpen(true);
      setCurrentPhotoIndex(0);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex(prev => prev === sortedPhotos.length - 1 ? 0 : prev + 1);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(prev => prev === 0 ? sortedPhotos.length - 1 : prev - 1);
  };

  // Клавиатурная навигация
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!modalOpen) return;
      
      if (event.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (event.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [modalOpen]);

  return (
    <>
      <Box>
        {/* Основное изображение */}
        <Box
          sx={{
            position: 'relative',
            height,
            cursor: hasPhotos ? 'pointer' : 'default',
            overflow: 'hidden',
            borderRadius: 1,
            '&:hover .photo-overlay': {
              opacity: hasPhotos ? 1 : 0,
            }
          }}
          onClick={disableGalleryOpen ? undefined : handleOpenModal}
        >
          {hasPhotos ? (
            <CardMedia
              component="img"
              image={mainPhoto.url.replace(/\?.*$/, '') + '?w=600&h=400&fit=crop&auto=format,compress&q=85'}
              alt={mainPhoto.description || t('components:servicePointCard.servicePointPhoto')}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = mainPhoto.url;
              }}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '4rem'
              }}
            >
              {fallbackIcon}
            </Box>
          )}



          {/* Миниатюры под основным фото */}
          {hasPhotos && photos.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                display: 'flex',
                gap: 0.5,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              {sortedPhotos.slice(0, 5).map((photo, index) => (
                <Box
                  key={photo.id}
                  sx={{
                    minWidth: 60,
                    height: 40,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: index === 0 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: `2px solid ${theme.palette.primary.main}`
                    }
                  }}
                >
                  <img
                    src={`${photo.url}?w=120&h=80&q=80`}
                    alt={photo.description || `Миниатюра ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = photo.url;
                    }}
                  />
                </Box>
              ))}
              {photos.length > 5 && (
                <Box
                  sx={{
                    minWidth: 60,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                    +{photos.length - 5}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Модальное окно с фотогалереей */}
      {modalOpen && hasPhotos && (
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                {servicePointName ? `${t('components:servicePointCard.photoGallery')} - ${servicePointName}` : t('components:servicePointCard.photoGallery')}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                px: 2,
                py: 0.5
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {currentPhotoIndex + 1} / {sortedPhotos.length}
                </Typography>
              </Box>
            </Box>
            {sortedPhotos[currentPhotoIndex].description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {sortedPhotos[currentPhotoIndex].description}
              </Typography>
            )}
          </DialogTitle>
          
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <Box sx={{ position: 'relative', minHeight: 400 }}>
              <CardMedia
                component="img"
                image={sortedPhotos[currentPhotoIndex].url}
                alt={sortedPhotos[currentPhotoIndex].description || `${t('components:servicePointCard.servicePointPhoto')} ${currentPhotoIndex + 1}`}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              
              {/* Стрелки навигации - точно как на странице поиска */}
              {sortedPhotos.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevPhoto}
                    sx={{
                      position: 'absolute',
                      left: 24,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 64,
                      height: 64,
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(0, 0, 0, 0.8)' 
                        : 'rgba(255, 255, 255, 0.95)',
                      color: theme.palette.mode === 'dark' 
                        ? 'white' 
                        : 'primary.main',
                      border: '2px solid',
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.3)' 
                        : 'primary.main',
                      backdropFilter: 'blur(10px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                        : '0 8px 32px rgba(0, 0, 0, 0.15)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'primary.main',
                        color: theme.palette.mode === 'dark'
                          ? '#90CAF9'
                          : 'white',
                        transform: 'translateY(-50%) scale(1.1)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 12px 40px rgba(0, 0, 0, 0.6)'
                          : '0 12px 40px rgba(25, 118, 210, 0.4)',
                        borderColor: theme.palette.mode === 'dark'
                          ? '#90CAF9'
                          : 'primary.dark'
                      },
                      '&:active': {
                        transform: 'translateY(-50%) scale(0.95)'
                      }
                    }}
                  >
                    <ArrowBackIosIcon sx={{ 
                      fontSize: '2.5rem',
                      marginLeft: '4px'
                    }} />
                  </IconButton>
                  
                  <IconButton
                    onClick={handleNextPhoto}
                    sx={{
                      position: 'absolute',
                      right: 24,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 64,
                      height: 64,
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(0, 0, 0, 0.8)' 
                        : 'rgba(255, 255, 255, 0.95)',
                      color: theme.palette.mode === 'dark' 
                        ? 'white' 
                        : 'primary.main',
                      border: '2px solid',
                      borderColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.3)' 
                        : 'primary.main',
                      backdropFilter: 'blur(10px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                        : '0 8px 32px rgba(0, 0, 0, 0.15)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'primary.main',
                        color: theme.palette.mode === 'dark'
                          ? '#90CAF9'
                          : 'white',
                        transform: 'translateY(-50%) scale(1.1)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 12px 40px rgba(0, 0, 0, 0.6)'
                          : '0 12px 40px rgba(25, 118, 210, 0.4)',
                        borderColor: theme.palette.mode === 'dark'
                          ? '#90CAF9'
                          : 'primary.dark'
                      },
                      '&:active': {
                        transform: 'translateY(-50%) scale(0.95)'
                      }
                    }}
                  >
                    <ArrowForwardIosIcon sx={{ 
                      fontSize: '2.5rem',
                      marginRight: '4px'
                    }} />
                  </IconButton>
                </>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            flexDirection: 'column',
            px: 3, 
            py: 2,
            gap: 2
          }}>
            {/* Миниатюры в модальном окне */}
            {sortedPhotos.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  maxWidth: '100%',
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: 'grey.200',
                    borderRadius: 3,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'grey.400',
                    borderRadius: 3,
                    '&:hover': {
                      bgcolor: 'grey.500',
                    },
                  },
                }}
              >
                {sortedPhotos.map((photo, index) => (
                  <Box
                    key={photo.id}
                    sx={{
                      minWidth: 80,
                      height: 60,
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: index === currentPhotoIndex ? '3px solid' : '2px solid',
                      borderColor: index === currentPhotoIndex ? 'primary.main' : 'grey.300',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'scale(1.05)'
                      }
                    }}
                    onClick={() => setCurrentPhotoIndex(index)}
                  >
                    <CardMedia
                      component="img"
                      image={photo.url.replace(/\?.*$/, '') + '?w=160&h=120&fit=crop&auto=format,compress&q=80'}
                      alt={photo.description || `${t('components:servicePointCard.servicePointPhoto')} ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = photo.url;
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Кнопка закрытия */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              width: '100%'
            }}>
              <Box sx={{ flex: 1 }}>
                {hasPhotos && sortedPhotos[currentPhotoIndex] && (
                  <Typography variant="body2" color="text.secondary">
                    {sortedPhotos[currentPhotoIndex].description || t('components:servicePointCard.servicePointPhoto')}
                  </Typography>
                )}
              </Box>
              <Button onClick={handleCloseModal} color="primary" variant="contained">
                Закрыть
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

// Основной компонент карточки сервисной точки
export interface ServicePointCardProps {
  servicePoint: ServicePointData;
  isSelected?: boolean;
  onSelect?: (servicePoint: ServicePointData) => void;
  onBook?: (servicePoint: ServicePointData) => void;
  showBookButton?: boolean;
  showSelectButton?: boolean;
  showDetailsLink?: boolean;
  showFavoriteButton?: boolean;
  onViewDetails?: (servicePoint: ServicePointData) => void;
  services?: ServicePointService[];
  isLoadingServices?: boolean;
  categories?: Array<{
    id: number;
    name: string;
    localized_name?: string;
    description?: string;
    localized_description?: string;
    services_count?: number;
  }>;
  isLoadingCategories?: boolean;
  variant?: 'default' | 'compact';
}

const ServicePointCard: React.FC<ServicePointCardProps> = ({
  servicePoint,
  isSelected = false,
  onSelect,
  onBook,
  showBookButton = false,
  showSelectButton = false,
  showDetailsLink = false,
  showFavoriteButton = true,
  onViewDetails,
  services = [],
  isLoadingServices = false,
  categories = [],
  isLoadingCategories = false,
  variant = 'default'
}) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');
  const { t } = useTranslation(['components']);
  const getLocalizedName = useLocalizedName();
  
  const [showDetails, setShowDetails] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  // Хук для выбора категории услуг
  const {
    isModalOpen,
    selectedServicePoint,
    availableCategories,
    isLoadingCategories: isLoadingCategoriesFromHook,
    openCategorySelection,
    closeCategorySelection,
    handleCategorySelect
  } = useCategorySelection();

  // Заглушка для расписания (TODO: интегрировать с API расписания)
  const mockSchedule: WorkingSchedule[] = [
    { day: 'Понеділок - П\'ятниця', time: '09:00 - 18:00', isWorkingDay: true },
    { day: 'Субота', time: '09:00 - 16:00', isWorkingDay: true },
    { day: 'Неділя', time: 'Вихідний', isWorkingDay: false }
  ];

  const handleSelect = () => {
    if (onSelect) {
      onSelect(servicePoint);
    }
  };

  const handleBook = () => {
    // Используем новый хук для выбора категории
    openCategorySelection({
      id: servicePoint.id,
      name: servicePoint.name,
      city: servicePoint.city
    });
    
    // Не вызываем старый обработчик, чтобы избежать конфликтов
    // Новая логика модального окна полностью заменяет старую
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(servicePoint);
    }
  };

  return (
    <Card sx={{ 
      ...cardStyles, 
      mb: variant === 'compact' ? 2 : 3,
      border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
      borderColor: isSelected ? 'primary.main' : 'divider',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      {/* Фотогалерея сервисной точки с кнопкой избранного */}
      <Box sx={{ position: 'relative' }}>
        <PhotoGallery
          photos={servicePoint.photos || []}
          height={variant === 'compact' ? 160 : 200}
          showCounter={true}
          fallbackIcon="🚗"
          servicePointName={servicePoint.name}
          disableGalleryOpen={true}
        />
        
        {/* Кнопка избранного в правом верхнем углу */}
        {showFavoriteButton && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '50%',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            <FavoriteButton
              servicePointId={servicePoint.id}
              servicePointName={servicePoint.name}
              size="medium"
              showTooltip={true}
            />
          </Box>
        )}
      </Box>

      <CardContent onClick={showSelectButton ? handleSelect : undefined} sx={{ cursor: showSelectButton ? 'pointer' : 'default' }}>
        {/* Основная информация */}
        <Box sx={{ mb: 2 }}>
          <Typography variant={variant === 'compact' ? 'h6' : 'h5'} sx={{ fontWeight: 700, mb: 1, color: colors.textPrimary }}>
            {servicePoint.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon sx={{ color: colors.textSecondary, fontSize: '1.2rem' }} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {servicePoint.address}{servicePoint.city?.name ? `, ${getLocalizedName(servicePoint.city)}` : ''}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating 
                value={servicePoint.average_rating ? parseFloat(String(servicePoint.average_rating)) : 0} 
                readOnly 
                size="small" 
                precision={0.1}
              />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                ({servicePoint.reviews_count || 0} {t('components:servicePointCard.reviews')})
              </Typography>
            </Box>
            
            <Chip 
              label={
                servicePoint.work_status === 'working' || servicePoint.work_status === 'Працює'
                  ? t('components:servicePointCard.working')
                  : servicePoint.work_status === 'Не працює' || servicePoint.work_status === 'not_working'
                  ? t('components:servicePointCard.notWorking')
                  : servicePoint.work_status || (servicePoint.is_active !== false ? t('components:servicePointCard.working') : t('components:servicePointCard.notWorking'))
              }
              size="small" 
              color={servicePoint.is_active !== false ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          {/* Контактный телефон */}
          {servicePoint.contact_phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ color: colors.textSecondary, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                {servicePoint.contact_phone}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Детальная информация (теперь всегда развернута) */}
        <Collapse in={true}>
          <Divider sx={{ my: 2 }} />
          
          {/* Доступные категории услуг */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: colors.backgroundField }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer' 
              }}
              onClick={(e) => {
                e.stopPropagation();
                setServicesExpanded(!servicesExpanded);
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('components:servicePointCard.availableCategories')} ({isLoadingCategories ? '...' : categories.length})
                </Typography>
              </Box>
              {servicesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={servicesExpanded}>
              {isLoadingCategories ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : categories.length > 0 ? (
                <List dense sx={{ mt: 1 }}>
                  {categories.map((category) => (
                    <ListItem key={category.id} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <BuildIcon sx={{ fontSize: '1rem', color: colors.textSecondary }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={category.localized_name || category.name}
                        secondary={`${category.localized_description || category.description || t('components:servicePointCard.categoryDescription')} • ${category.services_count || 0} ${t('components:servicePointCard.services')}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ mt: 1, color: colors.textSecondary }}>
                  {t('components:servicePointCard.categoriesNotLoaded')}
                </Typography>
              )}
            </Collapse>
          </Paper>

          {/* График работы */}
          <Paper sx={{ p: 2, bgcolor: colors.backgroundField }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer' 
              }}
              onClick={(e) => {
                e.stopPropagation();
                setScheduleExpanded(!scheduleExpanded);
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('components:servicePointCard.workingHours')}
                </Typography>
              </Box>
              {scheduleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={scheduleExpanded}>
              <List dense sx={{ mt: 1 }}>
                {mockSchedule.map((schedule, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CalendarIcon 
                        sx={{ 
                          fontSize: '1rem', 
                          color: schedule.isWorkingDay ? theme.palette.success.main : colors.textSecondary 
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={schedule.day}
                      secondary={schedule.time}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ 
                        variant: 'caption',
                        color: schedule.isWorkingDay ? 'inherit' : 'error'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>
        </Collapse>
      </CardContent>

      {/* CardActions: кнопки действий */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        {/* Кнопка 'Подробнее' */}
        {showDetailsLink && (
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            sx={{ 
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': { 
                borderColor: theme.palette.primary.dark,
                bgcolor: theme.palette.primary.main,
                color: 'white'
              }
            }}
          >
            {t('components:servicePointCard.details')}
          </Button>
        )}
        
        {/* Кнопка 'Забронировать' */}
        {showBookButton && (
          <Button
            size="small"
            variant="contained"
            startIcon={<BookIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleBook();
            }}
            sx={{ 
              bgcolor: theme.palette.success.main,
              '&:hover': { bgcolor: theme.palette.success.dark },
              ml: 2 // Добавляем отступ слева
            }}
          >
            {t('components:servicePointCard.book')}
          </Button>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Кнопка 'Выбрать' */}
        {showSelectButton && (
          <>
            {isSelected ? (
              <Chip
                icon={<CheckCircleIcon />}
                label={t('components:servicePointCard.selected')}
                color="primary"
                size="small"
                variant="filled"
              />
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect();
                }}
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  '&:hover': { bgcolor: theme.palette.primary.dark }
                }}
              >
                {t('components:servicePointCard.select')}
              </Button>
            )}
          </>
        )}
      </CardActions>

      {/* Модальное окно выбора категории услуг */}
      <CategorySelectionModal
        open={isModalOpen}
        onClose={closeCategorySelection}
        servicePointName={selectedServicePoint?.name || ''}
        categories={availableCategories}
        isLoading={isLoadingCategoriesFromHook}
        onCategorySelect={handleCategorySelect}
      />
    </Card>
  );
};

export default ServicePointCard;
