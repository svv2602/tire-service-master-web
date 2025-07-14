import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  useTheme,
  Skeleton,
  Alert,
  Autocomplete,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Rating,
  Tooltip,
  Stack,
  Avatar,
  CardMedia,
  Pagination,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  BookOnline as BookIcon,
  Info as InfoIcon,
  Sort as SortIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Reviews as ReviewsIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

import { 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles,
  getThemeColors,
  ANIMATIONS
} from '../../styles';
import ClientLayout from '../../components/client/ClientLayout';

// API импорты
import { useGetServiceCategoriesQuery } from '../../api/services.api';
import { useGetServicesQuery } from '../../api/servicesList.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { useGetCitiesQuery } from '../../api/cities.api';
import { useSearchServicePointsQuery, useGetRegionsWithServicePointsQuery, useGetCitiesWithServicePointsQuery, useGetServicePointByIdQuery } from '../../api/servicePoints.api';
import { useDispatch } from 'react-redux';
import { baseApi } from '../../api/baseApi';

// Импорт типов
import type { ServicePoint, ServiceCategory, City, ServicePointService, Region, Service } from '../../types/models';
import { useLocalizedName } from '../../utils/localizationHelpers';

// Импорт компонентов
import { ServicePointCard, ServicePointData } from '../../components/ui/ServicePointCard';

// Расширенный интерфейс для сервисных точек из поиска
interface ServicePointWithSearchData extends ServicePoint {
  average_rating?: number | string;
  reviews_count?: number;
  distance?: number;
  posts_count?: number;
}

// Интерфейсы для сортировки
interface SortOption {
  value: string;
  label: string;
}

// Функция конвертации ServicePoint в ServicePointData
const convertServicePointToServicePointData = (servicePoint: ServicePointWithSearchData): ServicePointData => {
  return {
    id: servicePoint.id,
    name: servicePoint.name,
    address: servicePoint.address || '',
    description: servicePoint.description,
    city: servicePoint.city ? {
      id: servicePoint.city.id,
      name: servicePoint.city.name,
      region: servicePoint.city.region?.name
    } : undefined,
    partner: servicePoint.partner ? {
      id: servicePoint.partner.id,
      name: servicePoint.partner.company_name || servicePoint.partner.name || ''
    } : undefined,
    contact_phone: servicePoint.contact_phone || servicePoint.phone,
    average_rating: servicePoint.average_rating,
    reviews_count: servicePoint.reviews_count,
    work_status: servicePoint.work_status,
    is_active: servicePoint.is_active,
    photos: servicePoint.photos?.map(photo => ({
      id: photo.id,
      url: photo.url || '',
      description: photo.description,
      is_main: photo.is_main || false,
      sort_order: photo.sort_order || 0
    })) || [],
  };
};

// Обертка для ServicePointCard с загрузкой полных данных
const ServicePointCardWrapper: React.FC<{
  servicePoint: ServicePointWithSearchData;
  onViewDetails: (servicePointData: ServicePointData) => void;
  onBook: (servicePointData: ServicePointData) => void;
}> = ({ servicePoint, onViewDetails, onBook }) => {
  // Загружаем полные данные сервисной точки включая фотографии и service_posts
  const { data: fullServicePointData, isLoading } = useGetServicePointByIdQuery(servicePoint.id.toString());
  
  // Преобразуем данные в нужный формат
  const servicePointData = convertServicePointToServicePointData(fullServicePointData || servicePoint);
  
  // Извлекаем уникальные категории из service_posts
  const categories = useMemo(() => {
    if (!fullServicePointData?.service_posts) return [];
    
    const uniqueCategories = new Map();
    fullServicePointData.service_posts.forEach(post => {
      if (post.service_category && !uniqueCategories.has(post.service_category.id)) {
        uniqueCategories.set(post.service_category.id, {
          id: post.service_category.id,
          name: post.service_category.name,
          description: post.service_category.description,
          services_count: post.service_category.services_count || 0
        });
      }
    });
    
    return Array.from(uniqueCategories.values());
  }, [fullServicePointData?.service_posts]);

  // Если данные загружаются, показываем скелетон
  if (isLoading) {
    return (
      <Grid item xs={12} md={6} lg={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={6} lg={4}>
      <ServicePointCard
        servicePoint={servicePointData}
        variant="compact"
        onViewDetails={() => onViewDetails(servicePointData)}
        onBook={() => onBook(servicePointData)}
        showDetailsLink={true}
        showBookButton={true}
        showFavoriteButton={true}
        categories={categories}
        isLoadingCategories={isLoading}
      />
    </Grid>
  );
};

const ClientServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const localizedName = useLocalizedName();
  const dispatch = useDispatch();
  
  const cardStyles = getCardStyles(theme, 'primary');
  const buttonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');
  
  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedServicePoints, setExpandedServicePoints] = useState<Set<number>>(new Set());
  
  // Состояния пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 карточек на страницу

  // Опции сортировки
  const sortOptions: SortOption[] = [
    { value: 'name', label: t('forms.clientPages.clientServicesPage.sortOptions.name') },
    { value: 'rating', label: t('forms.clientPages.clientServicesPage.sortOptions.rating') },
    { value: 'reviews_count', label: t('forms.clientPages.clientServicesPage.sortOptions.reviewsCount') },
    { value: 'distance', label: t('forms.clientPages.clientServicesPage.sortOptions.distance') }
  ];

  // API запросы
  const { 
    data: categoriesResponse, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useGetServiceCategoriesQuery({ 
    active: true,
    with_active_posts: true,
    per_page: 50 
  });

  const { 
    data: servicesResponse, 
    isLoading: servicesLoading 
  } = useGetServicesQuery({ 
    category_id: selectedCategory || undefined,
    per_page: 100 
  });

  // Запрос регионов с учетом фильтров - выполняется всегда для получения доступных регионов
  const { 
    data: regionsResponse, 
    isLoading: regionsLoading 
  } = useGetRegionsWithServicePointsQuery({ 
    category_id: selectedCategory || undefined,
    service_id: selectedService || undefined
  });

  // Запрос городов с учетом фильтров - выполняется всегда для получения доступных городов
  const citiesQueryParams = useMemo(() => ({
    category_id: selectedCategory || undefined,
    service_id: selectedService || undefined,
    region_id: selectedRegion || undefined
  }), [selectedCategory, selectedService, selectedRegion]);

  // Отладка параметров запроса городов
  console.log('🏙️ Cities query params:', citiesQueryParams);
  console.log('🏙️ Selected region:', selectedRegion);

  const { 
    data: citiesResponse, 
    isLoading: citiesLoading,
    refetch: refetchCities
  } = useGetCitiesWithServicePointsQuery(citiesQueryParams, {
    // Принудительно перезапрашиваем при изменении параметров
    refetchOnMountOrArgChange: true,
  });

  // Отладка ответа городов
  console.log('🏙️ Cities response:', citiesResponse);
  console.log('🏙️ Cities data:', citiesResponse?.data);

  // Параметры поиска сервисных точек
  const searchParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      per_page: itemsPerPage
    };
    
    // Добавляем фильтр по региону (приоритетный)
    if (selectedRegion) {
      params.region_id = selectedRegion;
    }
    
    if (selectedCity) {
      params.city = selectedCity.name;
    }
    
    if (searchQuery) {
      params.query = searchQuery;
    }
    
    // Добавляем фильтр по категории услуг
    if (selectedCategory) {
      params.category_id = selectedCategory;
    }
    
    // Добавляем фильтр по конкретной услуге
    if (selectedService) {
      params.service_id = selectedService;
    }
    
    return params;
  }, [selectedRegion, selectedCity, searchQuery, selectedService, selectedCategory, currentPage, itemsPerPage]);

  // Запрос сервисных точек - выполняется всегда для отображения всех доступных сервисных точек
  const { 
    data: servicePointsResponse,
    isLoading: servicePointsLoading,
    error: servicePointsError
  } = useSearchServicePointsQuery(searchParams);

  // Обработанные данные
  const categories = categoriesResponse?.data || [];
  const services = servicesResponse?.data || [];
  const regions = regionsResponse?.data || [];
  const cities = citiesResponse?.data || []; // Убираем filteredCities, используем напрямую citiesResponse
  const servicePoints: ServicePointWithSearchData[] = servicePointsResponse?.data || [];

  // Сортировка категорий в логическом порядке
  const sortedCategories = useMemo(() => {
    const categoryOrder = ['Шиномонтаж', 'Техническое обслуживание', 'Дополнительные услуги'];
    return [...categories].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.name);
      const indexB = categoryOrder.indexOf(b.name);
      
      // Если категория не найдена в списке приоритетов, помещаем её в конец
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
  }, [categories]);

  // Сортировка сервисных точек
  const sortedServicePoints = useMemo(() => {
    if (!servicePoints.length) return [];

    const sorted = [...servicePoints].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          const ratingA = parseFloat(a.average_rating?.toString() || '0');
          const ratingB = parseFloat(b.average_rating?.toString() || '0');
          return ratingB - ratingA;
        case 'reviews_count':
          return (b.reviews_count || 0) - (a.reviews_count || 0);
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [servicePoints, sortBy]);

  // Общее количество элементов и страниц
  const totalItems = servicePointsResponse?.total || sortedServicePoints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Сброс страницы при изменении фильтров
  const resetPage = () => {
    setCurrentPage(1);
  };

  // Обработчики
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedService(null);
    setSelectedRegion(null);
    setSelectedCity(null);
    setSortBy('name');
    resetPage();
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSelectedService(null); // Сбрасываем выбранную услугу при смене категории
    // При смене категории также сбрасываем регион и город, так как список может измениться
    setSelectedRegion(null);
    setSelectedCity(null);
    resetPage();
  };

  const handleRegionChange = (regionId: number | null) => {
    console.log('🔄 Region change:', regionId);
    console.log('🔄 Previous region:', selectedRegion);
    
    // Принудительно инвалидируем кэш городов
    dispatch(baseApi.util.invalidateTags(['City']));
    
    setSelectedRegion(regionId);
    setSelectedCity(null); // Сбрасываем выбранный город при смене региона
    resetPage();
    
    // Принудительно перезапрашиваем города после изменения состояния
    setTimeout(() => {
      refetchCities();
    }, 100);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    resetPage();
  };

  const handleServiceChange = (serviceId: number | null) => {
    setSelectedService(serviceId);
    // При смене услуги также сбрасываем регион и город, так как список может измениться
    setSelectedRegion(null);
    setSelectedCity(null);
    resetPage();
  };

  const handleCityChange = (city: City | null) => {
    setSelectedCity(city);
    resetPage();
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    resetPage();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Прокрутка к началу результатов
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleBookService = (servicePointData: ServicePointData) => {
    // Логика бронирования теперь обрабатывается в ServicePointCard через модальное окно
    // Этот обработчик оставляем для совместимости, но основную работу выполняет компонент
    console.log('🎯 Бронирование через ServicePointCard для:', servicePointData.name);
  };

  const handleViewDetails = (servicePointData: ServicePointData) => {
    // Переход на детальную страницу сервисной точки
    navigate(`/client/service-point/${servicePointData.id}`);
  };

  const toggleServicePointExpansion = (servicePointId: number) => {
    const newExpanded = new Set(expandedServicePoints);
    if (newExpanded.has(servicePointId)) {
      newExpanded.delete(servicePointId);
    } else {
      newExpanded.add(servicePointId);
    }
    setExpandedServicePoints(newExpanded);
  };

  const getServiceIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Шиномонтаж': t('forms.clientPages.clientServicesPage.serviceIcons.tireService'),
      'Балансировка': t('forms.clientPages.clientServicesPage.serviceIcons.balancing'),
      'Ремонт дисков': t('forms.clientPages.clientServicesPage.serviceIcons.wheelRepair'),
      'Автомойка': t('forms.clientPages.clientServicesPage.serviceIcons.carWash'),
      'Диагностика': t('forms.clientPages.clientServicesPage.serviceIcons.diagnostics'),
      'default': t('forms.clientPages.clientServicesPage.serviceIcons.default')
    };
    return iconMap[categoryName] || iconMap.default;
  };

  const formatRating = (rating: string | number | undefined) => {
    if (!rating) return 0;
    return parseFloat(rating.toString());
  };

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Заголовок */}
          <Fade in timeout={300}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: colors.textPrimary }}>
                {t('forms.clientPages.clientServicesPage.title')}
              </Typography>
              <Typography variant="h6" sx={{ color: colors.textSecondary, maxWidth: 600, mx: 'auto' }}>
                {t('forms.clientPages.clientServicesPage.subtitle')}
              </Typography>
            </Box>
          </Fade>

          {/* Основные фильтры */}
          <Fade in timeout={500}>
            <Paper sx={{ ...cardStyles, mb: 4, p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                {/* Поиск */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('forms.clientPages.clientServicesPage.searchLabel')}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={t('forms.clientPages.clientServicesPage.searchPlaceholder')}
                    sx={textFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchQuery('')}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                {/* Сортировка */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth sx={textFieldStyles}>
                    <InputLabel>{t('forms.clientPages.clientServicesPage.sortLabel')}</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      label={t('forms.clientPages.clientServicesPage.sortLabel')}
                      startAdornment={
                        <InputAdornment position="start">
                          <SortIcon />
                        </InputAdornment>
                      }
                    >
                      {sortOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Кнопка дополнительных фильтров */}
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TuneIcon />}
                    endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ ...secondaryButtonStyles, height: '56px' }}
                  >
                    {t('forms.clientPages.clientServicesPage.filtersButton')}
                  </Button>
                </Grid>
              </Grid>

              {/* Дополнительные фильтры */}
              <Collapse in={showFilters}>
                <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${colors.backgroundSecondary}` }}>
                  <Grid container spacing={3}>
                    {/* Категория услуг */}
                    <Grid item xs={12} md={6} lg={3}>
                      <FormControl fullWidth sx={textFieldStyles}>
                        <InputLabel>{t('forms.clientPages.clientServicesPage.categoryLabel')}</InputLabel>
                        <Select
                          value={selectedCategory || ''}
                          onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
                          label={t('forms.clientPages.clientServicesPage.categoryLabel')}
                          startAdornment={
                            <InputAdornment position="start">
                              <CategoryIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">{t('forms.clientPages.clientServicesPage.filters.allCategories')}</MenuItem>
                          {sortedCategories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {getServiceIcon(category.name)} {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Услуги */}
                    <Grid item xs={12} md={6} lg={3}>
                      <FormControl fullWidth sx={textFieldStyles} disabled={!selectedCategory}>
                        <InputLabel>{t('forms.clientPages.clientServicesPage.serviceLabel')}</InputLabel>
                        <Select
                          value={selectedService || ''}
                          onChange={(e) => handleServiceChange(e.target.value ? Number(e.target.value) : null)}
                          label={t('forms.clientPages.clientServicesPage.serviceLabel')}
                          startAdornment={
                            <InputAdornment position="start">
                              <BuildIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">{t('forms.clientPages.clientServicesPage.filters.allServices')}</MenuItem>
                          {services.map((service) => (
                            <MenuItem key={service.id} value={service.id}>
                              {service.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Регион */}
                    <Grid item xs={12} md={6} lg={3}>
                      <FormControl fullWidth sx={textFieldStyles}>
                        <InputLabel>{t('forms.clientPages.clientServicesPage.regionLabel')}</InputLabel>
                        <Select
                          value={selectedRegion || ''}
                          onChange={(e) => handleRegionChange(e.target.value ? Number(e.target.value) : null)}
                          label={t('forms.clientPages.clientServicesPage.regionLabel')}
                          startAdornment={
                            <InputAdornment position="start">
                              <LocationIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">{t('forms.clientPages.clientServicesPage.filters.allRegions')}</MenuItem>
                          {regions.map((region) => (
                            <MenuItem key={region.id} value={region.id}>
                              {localizedName(region)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Город */}
                    <Grid item xs={12} md={6} lg={3}>
                      <Autocomplete
                        options={cities}
                        getOptionLabel={(city) => localizedName(city)}
                        value={selectedCity}
                        onChange={(_, newValue) => handleCityChange(newValue)}
                        // Теперь фильтрация происходит на сервере
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t('forms.clientPages.clientServicesPage.cityLabel')}
                            placeholder={t('forms.clientPages.clientServicesPage.cityPlaceholder')}
                            sx={textFieldStyles}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        loading={citiesLoading}
                        loadingText={t('forms.clientPages.clientServicesPage.loading.cities')}
                        noOptionsText={t('forms.clientPages.clientServicesPage.noOptions.cities')}
                      />
                    </Grid>
                  </Grid>

                  {/* Кнопка очистки фильтров */}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="text"
                      startIcon={<ClearIcon />}
                      onClick={handleClearFilters}
                      sx={{ color: colors.textSecondary }}
                    >
                      {t('forms.clientPages.clientServicesPage.clearFiltersButton')}
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          </Fade>

          {/* Результаты поиска */}
          {servicePointsLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <Grid item xs={12} md={6} lg={4} key={i}>
                  <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : servicePointsError ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              {t('forms.clientPages.clientServicesPage.errors.loadingData')}
            </Alert>
          ) : sortedServicePoints.length === 0 ? (
            <Fade in timeout={700}>
              <Alert severity="warning" sx={{ mb: 4 }}>
                {t('forms.clientPages.clientServicesPage.results.noResults')}
                {(searchQuery || selectedCity || selectedCategory || selectedService) && 
                  t('forms.clientPages.clientServicesPage.results.tryChangeFilters')}
              </Alert>
            </Fade>
          ) : (
            <Fade in timeout={700}>
              <Box>
                {/* Информация о результатах */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ color: colors.textPrimary }}>
                    {totalPages > 1 
                      ? t('forms.clientPages.clientServicesPage.results.foundWithPagination', { 
                          total: totalItems, 
                          current: currentPage, 
                          total_pages: totalPages 
                        })
                      : t('forms.clientPages.clientServicesPage.results.found', { count: totalItems })
                    }
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedCity && (
                      <Chip 
                        label={t('forms.clientPages.clientServicesPage.chips.city', { name: selectedCity.name })}
                        onDelete={() => handleCityChange(null)}
                        color="primary"
                        size="small"
                      />
                    )}
                    {selectedCategory && (
                      <Chip 
                        label={t('forms.clientPages.clientServicesPage.chips.category', { 
                          name: sortedCategories.find(c => c.id === selectedCategory)?.name 
                        })}
                        onDelete={() => handleCategoryChange(null)}
                        color="secondary"
                        size="small"
                      />
                    )}
                    {selectedService && (
                      <Chip 
                        label={t('forms.clientPages.clientServicesPage.chips.service', { 
                          name: services.find(s => s.id === selectedService)?.name 
                        })}
                        onDelete={() => handleServiceChange(null)}
                        color="info"
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>

                {/* Список сервисных центров */}
                <Grid container spacing={3}>
                  {sortedServicePoints.map((servicePoint) => (
                    <ServicePointCardWrapper
                      key={servicePoint.id}
                      servicePoint={servicePoint}
                      onViewDetails={handleViewDetails}
                      onBook={handleBookService}
                    />
                  ))}
                </Grid>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: '1rem',
                          fontWeight: 500,
                        },
                        '& .MuiPaginationItem-page.Mui-selected': {
                          backgroundColor: colors.primary,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: colors.primary,
                            opacity: 0.8,
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Fade>
          )}
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default ClientServicesPage; 