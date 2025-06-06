import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  TextField, 
  InputAdornment,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Card, 
  CardMedia,
  CardContent, 
  CardActions,
  CircularProgress,
  Alert,
  Rating,
  Divider,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/apiUtils';
import { 
  GridContainer, 
  GridItem, 
  FlexBox, 
  CenteredBox,
  StyledAlert,
  ServiceCard,
  ServiceCardMedia,
  ServiceCardContent,
  ServiceCardActions
} from '../../../components/styled/CommonComponents';

interface ServicePoint {
  id: number;
  name: string;
  description?: string;
  partner_id: number;
  address: string;
  city_id: number;
  contact_phone?: string;
  status_id: number;
  post_count: number;
  default_slot_duration: number;
  latitude?: number;
  longitude?: number;
  total_clients_served: number;
  average_rating: number;
  cancellation_rate: number;
  rating?: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
  partner?: {
    id: number;
    company_name: string;
  };
  city?: {
    id: number;
    name: string;
    region?: {
      id: number;
      name: string;
    }
  };
  status?: {
    id: number;
    name: string;
    color: string;
  };
  services?: {
    id: number;
    name: string;
    price: number;
  }[];
  photos?: {
    id: number;
    url: string;
    sort_order: number;
  }[];
  is_favorite?: boolean;
}

const ServicePointsSearch: React.FC = () => {
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<number | ''>('');
  const [services, setServices] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    fetchServicePoints();
    fetchServices();
  }, []);

  const filterServicePoints = useCallback(async () => {
    try {
      let filtered = [...servicePoints];
      
      // Фильтрация по поисковому запросу
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(point => 
          point.name.toLowerCase().includes(query) || 
          point.address.toLowerCase().includes(query) ||
          point.description?.toLowerCase().includes(query) ||
          point.partner?.company_name.toLowerCase().includes(query) ||
          point.city?.name.toLowerCase().includes(query)
        );
      }
      
      // Фильтрация по выбранной услуге
      if (selectedService) {
        filtered = filtered.filter(point => 
          point.services?.some(service => service.id === selectedService)
        );
      }
      
      setFilteredPoints(filtered);
    } catch (error) {
      console.error('Ошибка при фильтрации сервисных точек:', error);
    }
  }, [searchQuery, selectedService, servicePoints]);

  useEffect(() => {
    filterServicePoints();
  }, [filterServicePoints]);

  const fetchServicePoints = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/v1/service_points');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить данные сервисных центров');
      }
      
      const responseJson = await response.json();
      console.log('API Response in ServicePointsSearch:', responseJson);
      
      let points = [];
      
      if (responseJson.data && Array.isArray(responseJson.data)) {
        // Новая структура: { data: [...], pagination: {...} }
        points = responseJson.data;
      } else if (responseJson.service_points && Array.isArray(responseJson.service_points)) {
        // Старая структура: { service_points: [...] }
        points = responseJson.service_points;
      } else if (Array.isArray(responseJson)) {
        // Простой массив: [...]
        points = responseJson;
      } else {
        console.error('Неизвестный формат данных:', responseJson);
        throw new Error('Неподдерживаемый формат данных от API');
      }
      
      setServicePoints(points);
      setFilteredPoints(points);
    } catch (err) {
      console.error('Ошибка загрузки сервисных центров:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/services');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить данные услуг');
      }
      
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleServiceChange = (e: any) => {
    setSelectedService(e.target.value);
  };

  const toggleFavorite = async (id: number, isFavorite: boolean) => {
    try {
      const url = isFavorite 
        ? `/api/v1/service_points/${id}/remove_favorite`
        : `/api/v1/service_points/${id}/add_favorite`;
        
      const response = await fetchWithAuth(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Не удалось ${isFavorite ? 'убрать из' : 'добавить в'} избранное`);
      }
      
      // Обновляем данные в списке
      setServicePoints(points => 
        points.map(point => 
          point.id === id ? { ...point, is_favorite: !isFavorite } : point
        )
      );
    } catch (err) {
      console.error('Ошибка управления избранным:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  if (loading) {
    return (
      <CenteredBox my={4}>
        <CircularProgress />
      </CenteredBox>
    );
  }

  if (error) {
    return (
      <FlexBox direction="column" my={4}>
        <StyledAlert severity="error" marginBottom={2}>
          {error}
        </StyledAlert>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchServicePoints} 
        >
          Попробовать снова
        </Button>
      </FlexBox>
    );
  }

  return (
    <GridContainer spacing={3} my={3}>
      {/* Фильтры поиска */}
      <GridItem xs={12}>
        <FlexBox gap={2}>
          <TextField
            fullWidth
            placeholder="Поиск по названию, адресу или описанию..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Фильтр по услугам</InputLabel>
            <Select
              value={selectedService}
              onChange={handleServiceChange}
              label="Фильтр по услугам"
            >
              <MenuItem value="">Все услуги</MenuItem>
              {services.map(service => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FlexBox>
      </GridItem>

      {/* Результаты поиска */}
      {filteredPoints.length === 0 ? (
        <GridItem xs={12}>
          <CenteredBox flexDirection="column" py={4}>
            <StoreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Сервисные центры не найдены
            </Typography>
            <Typography color="text.secondary">
              Попробуйте изменить параметры поиска
            </Typography>
          </CenteredBox>
        </GridItem>
      ) : (
        <GridItem xs={12}>
          <GridContainer spacing={3}>
            {filteredPoints.map((point) => (
              <GridItem key={point.id} xs={12} sm={6} md={4}>
                <ServiceCard>
                  {point.photos && point.photos.length > 0 && (
                    <ServiceCardMedia
                      component="img"
                      image={point.photos[0].url}
                      alt={point.name}
                    />
                  )}
                  <ServiceCardContent>
                    <Typography variant="h6" component="h2">
                      {point.name}
                    </Typography>
                    <FlexBox alignItems="center" gap={1}>
                      <LocationIcon color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {point.address}
                      </Typography>
                    </FlexBox>
                    {point.description && (
                      <Typography variant="body2" color="text.secondary">
                        {point.description}
                      </Typography>
                    )}
                    <FlexBox alignItems="center" gap={1}>
                      <Rating value={point.average_rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({point.reviews_count || 0} отзывов)
                      </Typography>
                    </FlexBox>
                    {point.services && point.services.length > 0 && (
                      <FlexBox gap={1} wrap>
                        {point.services.slice(0, 3).map(service => (
                          <Chip
                            key={service.id}
                            label={`${service.name} - ${service.price} ₽`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {point.services.length > 3 && (
                          <Chip
                            label={`+${point.services.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </FlexBox>
                    )}
                  </ServiceCardContent>
                  <ServiceCardActions>
                    <Button
                      component={RouterLink}
                      to={`/service-points/${point.id}`}
                      size="small"
                      color="primary"
                    >
                      Подробнее
                    </Button>
                    <Button
                      size="small"
                      color={point.is_favorite ? "error" : "primary"}
                      onClick={() => toggleFavorite(point.id, point.is_favorite || false)}
                      startIcon={<StarIcon />}
                    >
                      {point.is_favorite ? "Убрать из избранного" : "В избранное"}
                    </Button>
                  </ServiceCardActions>
                </ServiceCard>
              </GridItem>
            ))}
          </GridContainer>
        </GridItem>
      )}
    </GridContainer>
  );
};

export default ServicePointsSearch; 
