import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Rating,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Collapse,
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  BookOnline as BookIcon,
  Description as DescriptionIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { getButtonStyles, getThemeColors, getCardStyles } from '../../styles';
import { useTheme } from '@mui/material';
import { useSearchServicePointsQuery, useGetServicePointServicesQuery } from '../../api/servicePoints.api';
import { useGetServiceCategoriesByCityQuery } from '../../api/services.api';

// Интерфейс для сервисной точки из API поиска
interface SearchServicePoint {
  id: number;
  name: string;
  address: string;
  description?: string;
  city: {
    id: number;
    name: string;
    region: string;
  };
  partner: {
    id: number;
    name: string;
  };
  contact_phone?: string;
  average_rating?: string | number;
  reviews_count?: number;
  posts_count?: number;
  work_status: string;
  distance?: number;
  photos?: {
    id: number;
    url: string;
    description?: string;
    is_main: boolean;
    sort_order: number;
  }[];
}

// Интерфейс для услуги
interface ServicePointService {
  id: number;
  service_id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_available?: boolean;
}

// Компонент фотогалереи с Dialog
const PhotoGallery: React.FC<{
  photos: { id: number; url: string; description?: string; is_main: boolean; sort_order: number; }[];
  height?: number | string;
  showCounter?: boolean;
  fallbackIcon?: React.ReactNode;
  servicePointName?: string;
}> = ({ photos = [], height = 200, showCounter = true, fallbackIcon = '🚗', servicePointName }) => {
  const theme = useTheme();
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
    console.log('Opening modal with photos:', sortedPhotos);
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

  // Добавляем поддержку клавиатурной навигации
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
  }, [modalOpen, handlePrevPhoto, handleNextPhoto, handleCloseModal]);

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
          onClick={handleOpenModal}
        >
          {hasPhotos ? (
            <CardMedia
              component="img"
              image={mainPhoto.url.replace(/\?.*$/, '') + '?w=600&h=400&fit=crop&auto=format,compress&q=85'}
              alt={mainPhoto.description || 'Фото сервисной точки'}
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
                // Fallback к оригинальному URL если оптимизированное не загружается
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

          {/* Оверлей с информацией о количестве фото */}
          {hasPhotos && sortedPhotos.length > 1 && showCounter && (
            <Box
              className="photo-overlay"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              📷 {sortedPhotos.length}
            </Box>
          )}

          {/* Индикатор главного фото */}
          {hasPhotos && mainPhoto.is_main && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                bgcolor: 'rgba(76, 175, 80, 0.9)',
                color: 'white',
                px: 1,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Главное фото
            </Box>
          )}
        </Box>

        {/* Миниатюры фотографий */}
        {hasPhotos && sortedPhotos.length > 1 && (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              mt: 1,
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': {
                height: 4,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'grey.200',
                borderRadius: 2,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: 2,
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
                  minWidth: 60,
                  height: 40,
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: index === 0 ? '2px solid' : '1px solid',
                  borderColor: index === 0 ? 'primary.main' : 'grey.300',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex(index);
                  handleOpenModal();
                }}
              >
                <CardMedia
                  component="img"
                  image={photo.url.replace(/\?.*$/, '') + '?w=120&h=80&fit=crop&auto=format,compress&q=80'}
                  alt={photo.description || `Фото ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback к оригинальному URL если оптимизированное не загружается
                    (e.target as HTMLImageElement).src = photo.url;
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Модальное окно с Dialog */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6">
            {servicePointName ? `Фотогалерея - ${servicePointName}` : 'Фотогалерея'}
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            ✕
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {hasPhotos && sortedPhotos[currentPhotoIndex] ? (
            <Box sx={{ 
              position: 'relative',
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
              minHeight: '60vh'
            }}>
              {/* Индикатор позиции фото */}
              {sortedPhotos.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1,
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(0, 0, 0, 0.8)'
                      : 'rgba(255, 255, 255, 0.95)',
                    color: theme.palette.mode === 'dark'
                      ? 'white'
                      : 'text.primary',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                      : '0 4px 20px rgba(0, 0, 0, 0.15)',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.1)',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {currentPhotoIndex + 1} / {sortedPhotos.length}
                </Box>
              )}
              <CardMedia
                component="img"
                image={sortedPhotos[currentPhotoIndex].url}
                alt={sortedPhotos[currentPhotoIndex].description || 'Фото сервисной точки'}
                sx={{
                  width: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'
                }}
                onError={(e) => {
                  console.error('Failed to load image:', sortedPhotos[currentPhotoIndex].url);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', sortedPhotos[currentPhotoIndex].url);
                }}
              />
              
              {/* Навигация между фото */}
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
                      marginLeft: '4px' // Компенсируем смещение иконки влево
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
                      marginRight: '4px' // Компенсируем смещение иконки вправо
                    }} />
                  </IconButton>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Фотографии не найдены
              </Typography>
            </Box>
          )}
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
                     alt={photo.description || `Фото ${index + 1}`}
                     sx={{
                       width: '100%',
                       height: '100%',
                       objectFit: 'cover'
                     }}
                     onError={(e) => {
                       // Fallback к оригинальному URL если оптимизированное не загружается
                       (e.target as HTMLImageElement).src = photo.url;
                     }}
                   />
                 </Box>
               ))}
             </Box>
           )}
           
           {/* Информация о фото и кнопки */}
           <Box sx={{ 
             display: 'flex', 
             justifyContent: 'space-between', 
             alignItems: 'center',
             width: '100%'
           }}>
             <Box sx={{ flex: 1 }}>
               {hasPhotos && sortedPhotos[currentPhotoIndex] && (
                 <Typography variant="body2" color="text.secondary">
                   {sortedPhotos[currentPhotoIndex].description || 'Фото сервисной точки'}
                 </Typography>
               )}
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               {sortedPhotos.length > 1 && (
                 <Typography variant="body2" color="text.secondary">
                   {currentPhotoIndex + 1} из {sortedPhotos.length}
                 </Typography>
               )}
               <Button onClick={handleCloseModal} color="primary" variant="contained">
                 Закрыть
               </Button>
             </Box>
           </Box>
         </DialogActions>
      </Dialog>
    </>
  );
};

// Интерфейс для расписания
interface WorkingSchedule {
  day: string;
  time: string;
  isWorkingDay: boolean;
}

// Компонент карточки сервисной точки
const ServicePointCard: React.FC<{ servicePoint: SearchServicePoint }> = ({ servicePoint }) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const cardStyles = getCardStyles(theme, 'primary');
  const navigate = useNavigate();
  
  const [showDetails, setShowDetails] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  // Загружаем реальные услуги для сервисной точки
  const { 
    data: servicesData, 
    isLoading: servicesLoading 
  } = useGetServicePointServicesQuery(servicePoint.id.toString(), {
    skip: !showDetails // Загружаем только при развертывании деталей
  });

  // Преобразуем данные услуг
  const services: ServicePointService[] = (servicesData || []).map(service => ({
    id: service.id,
    service_id: service.service_id,
    name: service.name,
    description: service.description,
    price: service.current_price || service.price || 0,
    duration: service.duration || 0,
    is_available: service.is_available
  }));

  // Заглушка для расписания (TODO: интегрировать с API расписания)
  const mockSchedule: WorkingSchedule[] = [
    { day: 'Понеділок - П\'ятниця', time: '09:00 - 18:00', isWorkingDay: true },
    { day: 'Субота', time: '09:00 - 16:00', isWorkingDay: true },
    { day: 'Неділя', time: 'Вихідний', isWorkingDay: false }
  ];

  const handleBooking = () => {
            navigate('/client/booking', { 
      state: { 
        servicePointId: servicePoint.id,
        servicePointName: servicePoint.name,
        cityId: servicePoint.city.id,
        cityName: servicePoint.city.name,
        partnerId: servicePoint.partner.id,
        partnerName: servicePoint.partner.name,
        step1Completed: true // Указываем, что данные для шага 1 уже заполнены
      } 
    });
  };

  const handleViewDetails = () => {
    navigate(`/client/service-point/${servicePoint.id}`);
  };

  return (
    <Card sx={{ 
      ...cardStyles, 
      mb: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      {/* Фотогалерея сервисной точки */}
      <PhotoGallery
        photos={servicePoint.photos || []}
        height={200}
        showCounter={true}
        fallbackIcon="🚗"
        servicePointName={servicePoint.name}
      />

      <CardContent>
        {/* Основная информация */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: colors.textPrimary }}>
            {servicePoint.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon sx={{ color: colors.textSecondary, fontSize: '1.2rem' }} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {servicePoint.address}, {servicePoint.city.name}
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
                ({servicePoint.reviews_count} відгуків)
              </Typography>
            </Box>
            
            <Chip 
              label={servicePoint.work_status} 
              size="small" 
              color={servicePoint.work_status.toLowerCase().includes('работает') || servicePoint.work_status.toLowerCase() === 'working' ? 'success' : 'default'}
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

        {/* Детальная информация (свернуто по умолчанию) */}
        <Collapse in={showDetails}>
          <Divider sx={{ my: 2 }} />
          
          {/* Описание */}
          {servicePoint.description && servicePoint.description.trim() && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: colors.backgroundField }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer' 
                }}
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Опис
                  </Typography>
                </Box>
                {descriptionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              
              <Collapse in={descriptionExpanded}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 2, 
                    color: colors.textPrimary,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap' // Сохраняем переносы строк
                  }}
                >
                  {servicePoint.description}
                </Typography>
              </Collapse>
            </Paper>
          )}
          
          {/* Услуги */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: colors.backgroundField }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer' 
              }}
              onClick={() => setServicesExpanded(!servicesExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Послуги ({servicesLoading ? '...' : services.length})
                </Typography>
              </Box>
              {servicesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={servicesExpanded}>
              {servicesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : services.length > 0 ? (
                <List dense sx={{ mt: 1 }}>
                  {services.map((service) => (
                    <ListItem key={service.id} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <BuildIcon sx={{ fontSize: '1rem', color: colors.textSecondary }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={service.name}
                        secondary={`${service.price > 0 ? `${service.price} грн` : 'Цена по запросу'} • ${service.duration > 0 ? `${service.duration} хв` : 'Время уточняется'}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ mt: 1, color: colors.textSecondary }}>
                  Услуги не загружены
                </Typography>
              )}
            </Collapse>
          </Paper>

          {/* Расписание работы */}
          <Paper sx={{ p: 2, bgcolor: colors.backgroundField }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer' 
              }}
              onClick={() => setScheduleExpanded(!scheduleExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Графік роботи
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

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          onClick={() => setShowDetails(!showDetails)}
          sx={{ color: colors.textSecondary }}
        >
          {showDetails ? 'Згорнути' : 'Детальніше'}
        </Button>
        
        <Button
          size="small"
          variant="outlined"
          onClick={handleViewDetails}
          sx={{ 
            ml: 1,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': { 
              borderColor: theme.palette.primary.dark,
              bgcolor: theme.palette.primary.main,
              color: 'white'
            }
          }}
        >
          Подробнее
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          variant="contained"
          size="small"
          startIcon={<BookIcon />}
          onClick={handleBooking}
          sx={{ 
            bgcolor: theme.palette.primary.main,
            '&:hover': { bgcolor: theme.palette.primary.dark }
          }}
        >
          Записатися
        </Button>
      </CardActions>
    </Card>
  );
};

const ClientSearchPage: React.FC = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Получаем параметры поиска из URL
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      city: params.get('city') || '',
      query: params.get('query') || ''
    };
  }, [location.search]);

  // Запрос для получения категорий услуг по городу
  const { 
    data: categoriesResult, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useGetServiceCategoriesByCityQuery(
    searchParams.city,
    { skip: !searchParams.city }
  );

  // Запрос к API для поиска сервисных точек
  const { 
    data: searchResult, 
    isLoading, 
    error 
  } = useSearchServicePointsQuery(
    { 
      city: searchParams.city,
      query: searchParams.query 
    },
    { skip: !searchParams.city || selectedCategory === null } // Пропускаем запрос, если нет города или не выбрана категория
  );

  // Адаптируем данные из API к локальному интерфейсу
  const servicePoints: SearchServicePoint[] = (searchResult?.data || []).map(point => {
    return {
      id: point.id,
      name: point.name,
      address: point.address,
      description: (point as any).description,
      city: {
        id: point.city?.id || 0,
        name: point.city?.name || '',
        region: point.city?.region?.name || ''
      },
      partner: {
        id: point.partner?.id || 0,
        name: point.partner?.company_name || point.partner?.name || ''
      },
      contact_phone: point.contact_phone,
      average_rating: (point as any).average_rating || 4.0,
      reviews_count: (point as any).reviews_count || 0,
      posts_count: point.post_count,
      work_status: point.work_status,
      distance: undefined, // Пока не используется расстояние
      photos: ((point as any).photos || []).map((photo: any) => ({
        id: photo.id,
        url: photo.url,
        description: photo.description,
        is_main: photo.is_main,
        sort_order: photo.sort_order || 0
      }))
    };
  });
  const totalFound = searchResult?.total || 0;
  const cityFound = searchResult?.city_found ?? true;

  // Обработка состояния загрузки
  if (categoriesLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2, color: colors.textSecondary }}>
              Завантаження категорій послуг...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Заголовок результатов */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.textPrimary }}>
            🔍 Результати пошуку
          </Typography>
          
          {searchParams.city && (
            <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
              Сервісні точки в місті "{searchParams.city}"
              {searchParams.query && ` за запитом "${searchParams.query}"`}
            </Typography>
          )}

          {/* Статистика и кнопка возврата */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label={`Знайдено: ${totalFound}`} 
                color="primary" 
                variant="outlined" 
              />
              {cityFound && searchParams.city && (
                <Chip 
                  label={`Місто знайдено`} 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
            
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/client'}
              sx={secondaryButtonStyles}
            >
              На головну
            </Button>
          </Box>
        </Box>

        {/* Выбор категории услуг */}
        {categoriesResult && categoriesResult.data.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: colors.textPrimary }}>
              Виберіть тип послуг
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3 }}>
              Виберіть категорію послуг для пошуку підходящих сервісних точок
            </Typography>
            
            <Grid container spacing={3}>
              {categoriesResult.data.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: selectedCategory === category.id ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box sx={{ 
                        fontSize: '2.5rem', 
                        mb: 2,
                        color: selectedCategory === category.id ? theme.palette.primary.main : colors.textSecondary
                      }}>
                        {category.name.includes('Техническое') ? '🔧' : '🚗'}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                        {category.description || 'Мойка, полировка и другие услуги'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Доступно услуг: ${category.services_count}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          label={`Доступно сервісів: ${category.service_points_count}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Обработка ошибок */}
        {categoriesError && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Помилка завантаження категорій послуг. Спробуйте пізніше.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Помилка завантаження даних. Спробуйте пізніше.
          </Alert>
        )}

        {/* Случай, когда город не найден */}
        {!cityFound && searchParams.city && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Місто "{searchParams.city}" не знайдено або в ньому немає сервісних точок.
          </Alert>
        )}

        {/* Результаты поиска */}
        {selectedCategory && (
          <>
            {/* Индикатор загрузки сервисных точек */}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="h6" sx={{ ml: 2, color: colors.textSecondary }}>
                  Пошук сервісних точок...
                </Typography>
              </Box>
            )}

            {/* Заголовок результатов для выбранной категории */}
            {!isLoading && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}>
                  🏢 Сервісні точки
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  Сервісні точки, що надають послуги обраної категорії в місті "{searchParams.city}"
                </Typography>
              </Box>
            )}

            {servicePoints.length === 0 && !isLoading && !error ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 2 }}>
                  😔 Сервісні точки не знайдені
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 4 }}>
                  Для обраної категорії послуг не знайдено сервісних точок у цьому місті
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setSelectedCategory(null)}
                  sx={secondaryButtonStyles}
                >
                  Обрати іншу категорію
                </Button>
              </Box>
            ) : !isLoading && (
              <Grid container spacing={3}>
                {servicePoints.map((servicePoint) => (
                  <Grid item xs={12} md={6} lg={4} key={servicePoint.id}>
                    <ServicePointCard servicePoint={servicePoint} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ClientSearchPage;