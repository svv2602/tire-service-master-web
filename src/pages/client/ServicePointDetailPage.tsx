import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Container,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CardActionArea
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Star as StarIcon,
  BookOnline as BookIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  useGetServicePointByIdQuery,
  useGetCityByIdQuery,
  useGetServicePointServicesQuery
} from '../../api';
import { useGetServicePostsQuery } from '../../api/servicePoints.api';
import { useGetServiceCategoriesQuery } from '../../api/serviceCategories.api';
import { ServicePost } from '../../types/models';
import { getThemeColors } from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';
import { useLocalizedName } from '../../utils/localizationHelpers';

// Интерфейсы
interface ServicePointService {
  id: number;
  service_id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_available?: boolean;
}

interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  services: ServicePointService[];
}

interface WorkingSchedule {
  day: string;
  time: string;
  isWorkingDay: boolean;
}

// Компонент фотогалереи
const PhotoGallery: React.FC<{
  photos: any[];
  servicePointName: string;
}> = ({ photos = [], servicePointName }) => {
  const theme = useTheme();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Сортируем фотографии: главная первая, затем по sort_order
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return a.sort_order - b.sort_order;
  });

  const hasPhotos = sortedPhotos.length > 0;

  if (!hasPhotos) {
    return (
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            height: 400,
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '4rem'
          }}
        >
          🚗
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      {/* Основное изображение */}
      <Box sx={{ position: 'relative', height: 400 }}>
        <img
          src={sortedPhotos[currentPhotoIndex]?.url}
          alt={`${servicePointName} - фото ${currentPhotoIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Счетчик фотографий */}
        {sortedPhotos.length > 1 && (
          <Chip
            label={`${currentPhotoIndex + 1} / ${sortedPhotos.length}`}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white'
            }}
          />
        )}
      </Box>
      
      {/* Миниатюры */}
      {sortedPhotos.length > 1 && (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={1}>
            {sortedPhotos.map((photo, index) => (
              <Grid item xs={2} sm={1.5} md={1} key={photo.id}>
                <Box
                  sx={{
                    width: '100%',
                    height: 60,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: currentPhotoIndex === index ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                  onClick={() => setCurrentPhotoIndex(index)}
                >
                  <img
                    src={photo.url}
                    alt={`Миниатюра ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Card>
  );
};

const ServicePointDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const localizedName = useLocalizedName();
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const { data: servicePointData, isLoading, error } = useGetServicePointByIdQuery(id || '', {
    skip: !id
  });

  // Загружаем данные о городе для отображения в адресе
  const { data: cityData } = useGetCityByIdQuery(servicePointData?.city?.id || 0, {
    skip: !servicePointData?.city?.id
  });

  // Загружаем услуги сервисной точки
  const { data: servicesData, isLoading: isLoadingServicesData } = useGetServicePointServicesQuery(id || '', {
    skip: !id
  });

  // Загружаем посты сервисной точки для проверки доступности категорий
  const { data: servicePostsData, isLoading: isLoadingPosts, error: postsError } = useGetServicePostsQuery(id || '', {
    skip: !id
  });

  // Загружаем все категории для получения названий
  const { data: categoriesResponse } = useGetServiceCategoriesQuery({});
  
  console.log('🔍 Загрузка постов:', {
    id,
    isLoadingPosts,
    postsError,
    servicePostsData,
    postsWithCategories: servicePostsData?.map(p => ({ 
      id: p.id, 
      name: p.name, 
      category_id: p.service_category_id, 
      category: p.service_category 
    }))
  });

  // Получаем категории на основе активных постов (независимо от услуг)
  const serviceCategories = useMemo(() => {
    if (!servicePostsData || !categoriesResponse?.data) return [];
    
    // Получаем список категорий, для которых есть активные посты
    const activeCategoryIds = new Set<number>();
    servicePostsData.forEach((post: ServicePost) => {
      if (post.is_active && post.service_category_id) {
        activeCategoryIds.add(post.service_category_id);
      }
    });
    
    console.log('🔧 Активные категории постов:', Array.from(activeCategoryIds));
    
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
    
    // Затем добавляем услуги, если они есть
    if (servicesData) {
      servicesData.forEach(service => {
        if (service.category && service.is_available) {
          const categoryId = service.category.id;
          
          // Добавляем услуги только в те категории, которые уже есть (на основе постов)
          if (categoriesMap.has(categoryId)) {
            categoriesMap.get(categoryId).services.push({
              id: service.id,
              name: service.name,
              description: service.description,
              price: service.current_price,
              duration: service.duration
            });
          }
        }
      });
    }
    
    const result = Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    console.log('🎯 Доступные категории для бронирования:', result.map(c => ({ id: c.id, name: c.name, servicesCount: c.services.length })));
    
    return result;
  }, [servicePostsData, categoriesResponse?.data, servicesData]);

  // Преобразуем расписание из API в удобный формат
  const schedule: WorkingSchedule[] = useMemo(() => {
    if (!servicePointData?.working_hours) return [];
    
    const days = [
      { key: 'monday', name: 'Понедельник' },
      { key: 'tuesday', name: 'Вторник' },
      { key: 'wednesday', name: 'Среда' },
      { key: 'thursday', name: 'Четверг' },
      { key: 'friday', name: 'Пятница' },
      { key: 'saturday', name: 'Суббота' },
      { key: 'sunday', name: 'Воскресенье' }
    ];
    
    return days.map(day => {
      const dayData = servicePointData.working_hours[day.key as keyof typeof servicePointData.working_hours];
      return {
        day: day.name,
        time: dayData?.is_working_day ? `${dayData.start} - ${dayData.end}` : 'Выходной',
        isWorkingDay: dayData?.is_working_day || false
      };
    });
  }, [servicePointData?.working_hours]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBooking = () => {
    console.log('🎯 handleBooking вызван, serviceCategories:', serviceCategories);
    
    // Проверяем, есть ли доступные категории услуг
    if (serviceCategories.length === 0) {
      console.warn('⚠️ Нет доступных категорий услуг');
      alert('В данной сервисной точке нет доступных категорий услуг');
      return;
    }
    
    // Если есть только одна категория, сразу переходим к бронированию
    if (serviceCategories.length === 1) {
      console.log('📍 Только одна категория, прямой переход:', serviceCategories[0]);
      handleCategorySelect(serviceCategories[0]);
      return;
    }
    
    // Иначе открываем модальное окно для выбора категории
    console.log('📋 Открываем модальное окно выбора категории');
    setCategoryModalOpen(true);
  };

  const handleCategorySelect = (category: ServiceCategory) => {
    console.log('🎯 handleCategorySelect вызван с категорией:', category);
    console.log('📍 Текущие данные сервисной точки:', {
      id: id,
      cityId: servicePointData?.city?.id,
      cityName: servicePointData?.city?.name
    });
    
    setSelectedCategory(category);
    setCategoryModalOpen(false);
    
    const navigationData = { 
      servicePointId: parseInt(id || '0'),
      cityId: servicePointData?.city?.id,
      cityName: servicePointData?.city ? localizedName(servicePointData.city) : '',
      service_category_id: category.id,
      step1Completed: true // Указываем что первый шаг уже завершен
    };
    
    console.log('🎯 Навигация к /client/booking с данными:', navigationData);
    console.log('🔄 Выполняем navigate...');
    
    // Переходим на форму бронирования с предзаполненными данными
    navigate('/client/booking', {
      state: navigationData
    });
    
    console.log('✅ navigate выполнен');
  };

  const handleCloseModal = () => {
    setCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка загрузки информации о сервисной точке
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Вернуться назад
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!servicePointData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          {t('forms.clientPages.servicePointDetail.notFound')}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          {t('forms.clientPages.servicePointDetail.backButton')}
        </Button>
      </Container>
    );
  }

  return (
    <ClientLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Заголовок и кнопки */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              {servicePointData.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                <Typography variant="body1" color="text.secondary">
                  {cityData?.data ? `${localizedName(cityData.data)}, ${servicePointData.address}` : servicePointData.address}
                </Typography>
              </Box>
              <Chip 
                label={servicePointData.work_status === 'working' ? t('forms.clientPages.servicePointDetail.workingStatus') : t('forms.clientPages.servicePointDetail.closedStatus')} 
                color={servicePointData.work_status === 'working' ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              {t('forms.clientPages.servicePointDetail.backToSearch')}
            </Button>
            <Button
              variant="contained"
              startIcon={<BookIcon />}
              onClick={handleBooking}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {t('forms.clientPages.servicePointDetail.bookNow')}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Левая колонка - Фотогалерея и описание */}
          <Grid item xs={12} lg={8}>
            {/* Фотогалерея */}
            <PhotoGallery 
              photos={servicePointData.photos || []} 
              servicePointName={servicePointData.name}
            />

            {/* Описание */}
            {servicePointData.description && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('forms.clientPages.servicePointDetail.description')}
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {servicePointData.description}
                </Typography>
              </Paper>
            )}

            {/* Категории услуг */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: 2
                }}
                onClick={() => setServicesExpanded(!servicesExpanded)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('forms.clientPages.servicePointDetail.availableCategories')} ({isLoadingServicesData ? '...' : serviceCategories.length})
                  </Typography>
                </Box>
                {servicesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              
              <Collapse in={servicesExpanded}>
                {isLoadingServicesData ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : serviceCategories.length > 0 ? (
                  <List>
                    {serviceCategories.map((category, categoryIndex) => (
                      <React.Fragment key={category.id}>
                        <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <BuildIcon sx={{ color: 'primary.main' }} />
                            </ListItemIcon>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {category.name}
                              </Typography>
                              {category.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {category.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          {/* Список услуг в категории */}
                          {category.services.length > 0 ? (
                            <Box sx={{ ml: 4, width: '100%' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {t('forms.clientPages.servicePointDetail.servicesInCategory')}:
                              </Typography>
                              <List dense>
                                {category.services.map((service: ServicePointService) => (
                                  <ListItem key={service.id} sx={{ py: 0.5, px: 0 }}>
                                    <ListItemText
                                      primary={service.name}
                                      secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          {service.price > 0 && (
                                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                                              {service.price} грн
                                            </Typography>
                                          )}
                                          {service.duration > 0 && (
                                            <Typography variant="body2" color="text.secondary">
                                              {service.duration} мин
                                            </Typography>
                                          )}
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          ) : (
                            <Box sx={{ ml: 4, width: '100%' }}>
                              <Typography variant="body2" color="text.secondary">
                                {t('forms.clientPages.servicePointDetail.servicesInCategory')}
                              </Typography>
                              <Typography variant="body2" color="primary.main">
                                {t('forms.clientPages.servicePointDetail.phone')}: {servicePointData.contact_phone}
                              </Typography>
                            </Box>
                          )}
                        </ListItem>
                        
                        {categoryIndex < serviceCategories.length - 1 && <Divider sx={{ my: 2 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('clientPages.servicePointDetail.servicesNotFound')}
                  </Typography>
                )}
              </Collapse>
            </Paper>
          </Grid>

          {/* Контактная информация */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {t('forms.clientPages.servicePointDetail.contactInfo')}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('forms.clientPages.servicePointDetail.address')}
                    </Typography>
                    <Typography variant="body2">
                      {cityData?.data ? `${localizedName(cityData.data)}, ${servicePointData.address}` : servicePointData.address}
                    </Typography>
                  </Box>
                </Box>

                {servicePointData.contact_phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('forms.clientPages.servicePointDetail.phone')}
                      </Typography>
                      <Typography variant="body2">
                        <a href={`tel:${servicePointData.contact_phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {servicePointData.contact_phone}
                        </a>
                      </Typography>
                    </Box>
                  </Box>
                )}

                {servicePointData.partner?.company_name && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('forms.clientPages.servicePointDetail.partner')}
                      </Typography>
                      <Typography variant="body2">
                        {servicePointData.partner.company_name}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Режим работы */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: 2
                }}
                onClick={() => setScheduleExpanded(!scheduleExpanded)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('forms.clientPages.servicePointDetail.workingHours')}
                  </Typography>
                </Box>
                {scheduleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              
              <Collapse in={scheduleExpanded}>
                <List dense>
                  {schedule.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={item.day}
                        secondary={item.time}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: item.isWorkingDay ? 'text.primary' : 'text.secondary'
                        }}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          color: item.isWorkingDay ? 'text.secondary' : 'text.disabled'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Paper>

            {/* Кнопка записи */}
            <Button
              variant="contained"
              size="large"
              startIcon={<BookIcon />}
              onClick={handleBooking}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {t('forms.clientPages.servicePointDetail.bookNow')} на обслуживание
            </Button>
          </Grid>
        </Grid>

        {/* Модальное окно выбора категории услуг */}
        <Dialog
          open={categoryModalOpen}
          onClose={handleCloseModal}
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
              {t('forms.clientPages.servicePointDetail.selectCategory')}
            </Typography>
            <IconButton
              aria-label={t('forms.clientPages.servicePointDetail.cancel')}
              onClick={handleCloseModal}
              sx={{ color: 'grey.500' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('forms.clientPages.servicePointDetail.selectCategoryDescription')} {servicePointData.name}
            </Typography>
            
            <Grid container spacing={2}>
              {serviceCategories.map((category) => (
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
                            {category.services.length} {category.services.length === 1 ? t('forms.clientPages.servicePointDetail.service') : t('forms.clientPages.servicePointDetail.services')}
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
      </Container>
    </ClientLayout>
  );
};

export default ServicePointDetailPage; 