import React, { useState, useMemo, useEffect } from 'react';
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
  Tooltip
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
  Info as InfoIcon
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
import { useGetCitiesQuery } from '../../api/cities.api';
import { useSearchServicePointsQuery } from '../../api/servicePoints.api';

// Импорт типов
import type { ServicePoint, ServiceCategory, City, ServicePointService } from '../../types/models';

const ClientServicesPage: React.FC = () => {
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
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [priceFilter, setPriceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedServicePoints, setExpandedServicePoints] = useState<Set<number>>(new Set());

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
    data: citiesResponse, 
    isLoading: citiesLoading 
  } = useGetCitiesQuery({ 
    per_page: 100 
  });

  const { 
    data: servicePointsResponse,
    isLoading: servicePointsLoading,
    error: servicePointsError
  } = useSearchServicePointsQuery(
    selectedCity ? { city: selectedCity.name } : {},
    { skip: !selectedCity }
  );

  // Обработанные данные
  const categories = categoriesResponse?.data || [];
  const cities = citiesResponse?.data || [];
  const servicePoints = servicePointsResponse?.data || [];

  // Фильтрация услуг
  const filteredServices = useMemo(() => {
    if (!servicePoints.length) return [];

    let allServices: (ServicePointService & { servicePoint: ServicePoint })[] = [];
    
    // Собираем все услуги из всех сервисных точек
    servicePoints.forEach(servicePoint => {
      if (servicePoint.services) {
        servicePoint.services.forEach(service => {
          if (service.is_available && service.service) {
            allServices.push({
              ...service,
              servicePoint
            });
          }
        });
      }
    });

    // Применяем фильтры
    return allServices.filter(service => {
      // Поиск по названию услуги
      const serviceName = service.service?.name || '';
      const matchesSearch = !searchQuery || 
        serviceName.toLowerCase().includes(searchQuery.toLowerCase());

      // Фильтр по категории
      const matchesCategory = !selectedCategory || 
        (service.service?.category && service.service.category.id === selectedCategory);

      // Фильтр по цене
      const matchesPrice = !priceFilter || 
        (priceFilter === 'low' && service.price <= 500) ||
        (priceFilter === 'medium' && service.price > 500 && service.price <= 1500) ||
        (priceFilter === 'high' && service.price > 1500);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [servicePoints, searchQuery, selectedCategory, priceFilter]);

  // Группировка услуг по сервисным точкам
  const servicesByServicePoint = useMemo(() => {
    const grouped = new Map<number, {
      servicePoint: ServicePoint;
      services: ServicePointService[];
    }>();

    filteredServices.forEach(service => {
      const spId = service.servicePoint.id;
      if (!grouped.has(spId)) {
        grouped.set(spId, {
          servicePoint: service.servicePoint,
          services: []
        });
      }
      grouped.get(spId)!.services.push(service);
    });

    return Array.from(grouped.values());
  }, [filteredServices]);

  // Обработчики
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedCity(null);
    setPriceFilter('');
  };

  const handleBookService = (service: ServicePointService, servicePoint: ServicePoint) => {
    if (!servicePoint.city || !service.service) return;
    
    navigate('/client/booking/new-with-availability', {
      state: {
        preselected: {
          city_id: servicePoint.city.id,
          service_point_id: servicePoint.id,
          service_id: service.service_id,
          service_name: service.service.name,
          service_price: service.price,
          service_duration: service.duration
        }
      }
    });
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
      'техническое обслуживание': '🔧',
      'шиномонтаж': '🚗',
      'диагностика': '🔍',
      'ремонт': '⚙️',
      'мойка': '💧',
      'автосервис': '🏪'
    };
    return iconMap[categoryName.toLowerCase()] || '🔧';
  };

  // Рендер состояний загрузки и ошибок
  if (categoriesLoading || citiesLoading) {
    return (
      <ClientLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 4 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} md={6} lg={4} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Заголовок */}
          <Fade in timeout={300}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: colors.textPrimary }}>
                🔧 Поиск услуг
              </Typography>
              <Typography variant="h6" sx={{ color: colors.textSecondary, maxWidth: 600, mx: 'auto' }}>
                Найдите нужную услугу в вашем городе и запишитесь на удобное время
              </Typography>
            </Box>
          </Fade>

          {/* Основные фильтры */}
          <Fade in timeout={500}>
            <Paper sx={{ ...cardStyles, mb: 4, p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                {/* Поиск */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Поиск услуг"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Найти услугу..."
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
                
                {/* Выбор города */}
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={cities}
                    getOptionLabel={(city) => `${city.name}${city.region ? `, ${city.region.name}` : ''}`}
                    value={selectedCity}
                    onChange={(_, newValue) => setSelectedCity(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Выберите город"
                        placeholder="Начните вводить название города..."
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
                
                {/* Кнопка дополнительных фильтров */}
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterIcon />}
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
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth sx={textFieldStyles}>
                        <InputLabel>Категория услуг</InputLabel>
                        <Select
                          value={selectedCategory || ''}
                          onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                          label="Категория услуг"
                        >
                          <MenuItem value="">Все категории</MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {getServiceIcon(category.name)} {category.name}
                              {category.services_count && ` (${category.services_count})`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* Ценовой диапазон */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth sx={textFieldStyles}>
                        <InputLabel>Ценовой диапазон</InputLabel>
                        <Select
                          value={priceFilter}
                          onChange={(e) => setPriceFilter(e.target.value)}
                          label="Ценовой диапазон"
                        >
                          <MenuItem value="">Любая цена</MenuItem>
                          <MenuItem value="low">До 500 ₴</MenuItem>
                          <MenuItem value="medium">500 - 1500 ₴</MenuItem>
                          <MenuItem value="high">Свыше 1500 ₴</MenuItem>
                        </Select>
                      </FormControl>
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
          {!selectedCity ? (
            <Fade in timeout={700}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 4,
                  '& .MuiAlert-message': { 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1 
                  }
                }}
              >
                <LocationIcon />
                Выберите город для поиска доступных услуг
              </Alert>
            </Fade>
          ) : servicePointsLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : servicePointsError ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              Ошибка при загрузке данных. Попробуйте обновить страницу.
            </Alert>
          ) : servicesByServicePoint.length === 0 ? (
            <Fade in timeout={700}>
              <Alert severity="warning" sx={{ mb: 4 }}>
                В городе {selectedCity.name} не найдено услуг по заданным критериям.
                Попробуйте изменить фильтры или выбрать другой город.
              </Alert>
            </Fade>
          ) : (
            <Fade in timeout={700}>
              <Box>
                {/* Информация о результатах */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ color: colors.textPrimary }}>
                    Найдено {filteredServices.length} услуг в {servicesByServicePoint.length} точках обслуживания
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Город: {selectedCity.name}
                  </Typography>
                </Box>

                {/* Список сервисных точек с услугами */}
                <Grid container spacing={3}>
                  {servicesByServicePoint.map(({ servicePoint, services }, index) => (
                    <Grid item xs={12} key={servicePoint.id}>
                      <Fade in timeout={800 + index * 100}>
                        <Card sx={{ 
                          ...cardStyles,
                          transition: ANIMATIONS.transition.medium,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]
                          }
                        }}>
                          {/* Заголовок сервисной точки */}
                          <CardContent sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.textPrimary }}>
                                  {servicePoint.name}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                  <Chip 
                                    icon={<LocationIcon />}
                                    label={servicePoint.address}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {servicePoint.contact_phone && (
                                    <Chip 
                                      icon={<LocationIcon />}
                                      label={servicePoint.contact_phone}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                  {servicePoint.partner?.name || servicePoint.partner?.company_name || 'Неизвестный партнер'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
{/* Рейтинг временно скрыт - нет в типе ServicePoint */}
                                <Chip 
                                  label={`${services.length} услуг`}
                                  size="small"
                                  color="primary"
                                />
                              </Box>
                            </Box>

                            {/* Кнопка развернуть/свернуть */}
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <IconButton
                                onClick={() => toggleServicePointExpansion(servicePoint.id)}
                                sx={{ color: colors.primary }}
                              >
                                {expandedServicePoints.has(servicePoint.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </Box>
                          </CardContent>

                          {/* Список услуг */}
                          <Collapse in={expandedServicePoints.has(servicePoint.id)}>
                            <Divider />
                            <CardContent sx={{ pt: 2 }}>
                              <List sx={{ p: 0 }}>
                                {services.map((service, serviceIndex) => (
                                  <ListItem
                                    key={service.id}
                                    sx={{
                                      border: `1px solid ${colors.backgroundSecondary}`,
                                      borderRadius: 2,
                                      mb: serviceIndex < services.length - 1 ? 2 : 0,
                                      bgcolor: colors.backgroundSecondary,
                                      '&:hover': {
                                        bgcolor: colors.backgroundField
                                      }
                                    }}
                                  >
                                    <ListItemIcon>
                                      <Box sx={{ 
                                        fontSize: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: colors.primary,
                                        color: 'white'
                                      }}>
                                        {service.service?.category ? getServiceIcon(service.service.category.name) : '🔧'}
                                      </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                                            {service.service?.name || 'Неизвестная услуга'}
                                          </Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip
                                              icon={<MoneyIcon />}
                                              label={`${service.price} ₴`}
                                              size="small"
                                              color="primary"
                                              variant="filled"
                                            />
                                            <Chip
                                              icon={<ScheduleIcon />}
                                              label={`${service.duration} мин`}
                                              size="small"
                                              variant="outlined"
                                            />
                                          </Box>
                                        </Box>
                                      }
                                      secondary={
                                        <Box sx={{ mt: 1 }}>
                                          {service.service?.category && (
                                            <Chip
                                              label={service.service.category.name}
                                              size="small"
                                              variant="outlined"
                                              sx={{ mr: 1 }}
                                            />
                                          )}
                                          <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<BookIcon />}
                                            onClick={() => handleBookService(service, servicePoint)}
                                            sx={{ 
                                              ...buttonStyles,
                                              mt: 1,
                                              minWidth: 140
                                            }}
                                          >
                                            Записаться
                                          </Button>
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </CardContent>
                          </Collapse>
                        </Card>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>
          )}
        </Container>
      </Box>
    </ClientLayout>
  );
};

export default ClientServicesPage; 