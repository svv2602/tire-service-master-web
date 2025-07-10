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
  Pagination
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
import { useGetServicesQuery, useGetServicesByCategoryIdQuery } from '../../api/servicesList.api';
import { useGetRegionsQuery } from '../../api/regions.api';
import { useGetCitiesQuery } from '../../api/cities.api';
import { useSearchServicePointsQuery, useGetRegionsWithServicePointsQuery, useGetCitiesWithServicePointsQuery } from '../../api/servicePoints.api';

// Импорт типов
import type { ServicePoint, ServiceCategory, City, ServicePointService, Region, Service } from '../../types/models';

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

const ClientServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
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
    { value: 'name', label: 'По названию' },
    { value: 'rating', label: 'По рейтингу' },
    { value: 'reviews_count', label: 'По количеству отзывов' },
    { value: 'distance', label: 'По расстоянию' }
  ];

  // API запросы
  const { 
    data: categoriesResponse, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useGetServiceCategoriesQuery({ 
    active: true,
    per_page: 50 
  });

  const { 
    data: servicesResponse, 
    isLoading: servicesLoading 
  } = useGetServicesByCategoryIdQuery({ 
    categoryId: selectedCategory?.toString() || '',
    params: { per_page: 100 }
  }, {
    skip: !selectedCategory
  });

  const { 
    data: regionsResponse, 
    isLoading: regionsLoading 
  } = useGetRegionsWithServicePointsQuery({ 
    category_id: selectedCategory || undefined,
    service_id: selectedService || undefined
  });

  // Используем динамический API для городов с учетом фильтров
  const { 
    data: citiesResponse, 
    isLoading: citiesLoading 
  } = useGetCitiesWithServicePointsQuery({ 
    category_id: selectedCategory || undefined,
    service_id: selectedService || undefined,
    region_id: selectedRegion || undefined
  });

  // Параметры поиска сервисных точек
  const searchParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      per_page: itemsPerPage
    };
    
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
  }, [selectedCity, searchQuery, selectedService, selectedCategory, currentPage, itemsPerPage]);

  const { 
    data: servicePointsResponse,
    isLoading: servicePointsLoading,
    error: servicePointsError
  } = useSearchServicePointsQuery(
    searchParams
    // Убираем skip - теперь запрос выполняется всегда
  );

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
    resetPage();
  };

  const handleRegionChange = (regionId: number | null) => {
    setSelectedRegion(regionId);
    setSelectedCity(null); // Сбрасываем выбранный город при смене региона
    resetPage();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    resetPage();
  };

  const handleServiceChange = (serviceId: number | null) => {
    setSelectedService(serviceId);
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

  const handleBookService = (servicePoint: ServicePointWithSearchData, service?: any) => {
    const params = new URLSearchParams({
      service_point_id: servicePoint.id.toString(),
      ...(selectedCategory && { category_id: selectedCategory.toString() }),
      ...(service && { service_id: service.id.toString() })
    });
    
    navigate(`/client/booking/new-with-availability?${params.toString()}`);
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
      'Шиномонтаж': '🔧',
      'Балансировка': '⚖️',
      'Ремонт дисков': '🛠️',
      'Автомойка': '🚿',
      'Диагностика': '🔍',
      'default': '🔧'
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
                Поиск сервисных центров
              </Typography>
              <Typography variant="h6" sx={{ color: colors.textSecondary, maxWidth: 600, mx: 'auto' }}>
                Найдите ближайший сервисный центр и забронируйте услугу онлайн
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
                    label="Поиск по названию"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Введите название сервиса..."
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
                    <InputLabel>Сортировать по</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      label="Сортировать по"
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
                    Фильтры
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
                        <InputLabel>Категория услуг</InputLabel>
                        <Select
                          value={selectedCategory || ''}
                          onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
                          label="Категория услуг"
                          startAdornment={
                            <InputAdornment position="start">
                              <CategoryIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">Все категории</MenuItem>
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
                        <InputLabel>Услуга</InputLabel>
                        <Select
                          value={selectedService || ''}
                          onChange={(e) => handleServiceChange(e.target.value ? Number(e.target.value) : null)}
                          label="Услуга"
                          startAdornment={
                            <InputAdornment position="start">
                              <BuildIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">Все услуги</MenuItem>
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
                        <InputLabel>Регион</InputLabel>
                        <Select
                          value={selectedRegion || ''}
                          onChange={(e) => handleRegionChange(e.target.value ? Number(e.target.value) : null)}
                          label="Регион"
                          startAdornment={
                            <InputAdornment position="start">
                              <LocationIcon />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">Все регионы</MenuItem>
                          {regions.map((region) => (
                            <MenuItem key={region.id} value={region.id}>
                              {region.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Город */}
                    <Grid item xs={12} md={6} lg={3}>
                      <Autocomplete
                        options={cities}
                        getOptionLabel={(city) => city.name}
                        value={selectedCity}
                        onChange={(_, newValue) => handleCityChange(newValue)}
                        // Теперь фильтрация происходит на сервере
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Город"
                            placeholder="Выберите город..."
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
                        loadingText="Загрузка городов..."
                        noOptionsText="Города не найдены"
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
                      Очистить фильтры
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
              Ошибка при загрузке данных. Попробуйте обновить страницу.
            </Alert>
          ) : sortedServicePoints.length === 0 ? (
            <Fade in timeout={700}>
              <Alert severity="warning" sx={{ mb: 4 }}>
                Сервисные центры не найдены.
                {(searchQuery || selectedCity || selectedCategory || selectedService) && 
                  ' Попробуйте изменить фильтры.'}
              </Alert>
            </Fade>
          ) : (
            <Fade in timeout={700}>
              <Box>
                {/* Информация о результатах */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ color: colors.textPrimary }}>
                    Найдено {totalItems} сервисных центров
                    {totalPages > 1 && ` (страница ${currentPage} из ${totalPages})`}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedCity && (
                      <Chip 
                        label={`Город: ${selectedCity.name}`}
                        onDelete={() => handleCityChange(null)}
                        color="primary"
                        size="small"
                      />
                    )}
                    {selectedCategory && (
                      <Chip 
                        label={`Категория: ${sortedCategories.find(c => c.id === selectedCategory)?.name}`}
                        onDelete={() => handleCategoryChange(null)}
                        color="secondary"
                        size="small"
                      />
                    )}
                    {selectedService && (
                      <Chip 
                        label={`Услуга: ${services.find(s => s.id === selectedService)?.name}`}
                        onDelete={() => handleServiceChange(null)}
                        color="info"
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>

                {/* Список сервисных центров */}
                <Grid container spacing={3}>
                  {sortedServicePoints.map((servicePoint, index) => (
                    <Grid item xs={12} md={6} lg={4} key={servicePoint.id}>
                      <Fade in timeout={800 + index * 100}>
                        <Card sx={{ 
                          ...cardStyles,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: ANIMATIONS.transition.medium,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8]
                          }
                        }}>
                          {/* Фото сервисного центра */}
                          {servicePoint.photos && servicePoint.photos.length > 0 && (
                            <CardMedia
                              component="img"
                              height="200"
                              image={servicePoint.photos.find(p => p.is_main)?.url || servicePoint.photos[0]?.url}
                              alt={servicePoint.name}
                              sx={{ objectFit: 'cover' }}
                            />
                          )}

                          <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            {/* Заголовок */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 }}>
                                {servicePoint.name}
                              </Typography>
                              {servicePoint.work_status === 'working' && (
                                <Chip 
                                  label="Работает"
                                  size="small"
                                  color="success"
                                />
                              )}
                            </Box>

                            {/* Рейтинг и отзывы */}
                            {servicePoint.average_rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Rating 
                                  value={formatRating(servicePoint.average_rating)} 
                                  readOnly 
                                  size="small" 
                                  sx={{ mr: 1 }} 
                                />
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                  {formatRating(servicePoint.average_rating).toFixed(1)}
                                  {servicePoint.reviews_count && ` (${servicePoint.reviews_count} отзывов)`}
                                </Typography>
                              </Box>
                            )}

                            {/* Адрес */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <LocationIcon fontSize="small" sx={{ mr: 1, color: colors.textSecondary }} />
                              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                {servicePoint.address}
                              </Typography>
                            </Box>

                            {/* Партнер */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <BusinessIcon fontSize="small" sx={{ mr: 1, color: colors.textSecondary }} />
                              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                {servicePoint.partner?.name || 'Партнер'}
                              </Typography>
                            </Box>

                            {/* Телефон */}
                            {servicePoint.contact_phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PhoneIcon fontSize="small" sx={{ mr: 1, color: colors.textSecondary }} />
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                  {servicePoint.contact_phone}
                                </Typography>
                              </Box>
                            )}

                            {/* Расстояние */}
                            {servicePoint.distance && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LocationIcon fontSize="small" sx={{ mr: 1, color: colors.textSecondary }} />
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                  {servicePoint.distance.toFixed(1)} км от вас
                                </Typography>
                              </Box>
                            )}

                            {/* Количество постов */}
                            {servicePoint.posts_count && (
                              <Chip 
                                label={`${servicePoint.posts_count} постов обслуживания`}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 2 }}
                              />
                            )}
                          </CardContent>

                          <CardActions sx={{ p: 3, pt: 0 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<BookIcon />}
                              onClick={() => handleBookService(servicePoint)}
                              sx={buttonStyles}
                            >
                              Забронировать услугу
                            </Button>
                          </CardActions>
                        </Card>
                      </Fade>
                    </Grid>
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