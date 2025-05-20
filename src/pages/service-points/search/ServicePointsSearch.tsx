import React, { useState, useEffect } from 'react';
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

interface ServicePoint {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  rating: number;
  reviews_count: number;
  opening_time: string;
  closing_time: string;
  is_favorite: boolean;
  services: {
    id: number;
    name: string;
    price: number;
  }[];
  photos: {
    id: number;
    url: string;
  }[];
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

  useEffect(() => {
    filterServicePoints();
  }, [searchQuery, selectedService, servicePoints]);

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

  const filterServicePoints = () => {
    let filtered = [...servicePoints];
    
    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(point => 
        point.name.toLowerCase().includes(query) || 
        point.address.toLowerCase().includes(query) ||
        point.description.toLowerCase().includes(query)
      );
    }
    
    // Фильтрация по выбранной услуге
    if (selectedService) {
      filtered = filtered.filter(point => 
        point.services.some(service => service.id === selectedService)
      );
    }
    
    setFilteredPoints(filtered);
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
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchServicePoints} 
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box my={3}>
      <Typography variant="h5" component="h1" gutterBottom>
        Поиск сервисных центров
      </Typography>

      {/* Фильтры поиска */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-12px' }}>
          <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
            <TextField
              fullWidth
              label="Поиск по названию или адресу"
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
          </div>
          <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }}>
            <FormControl fullWidth>
              <InputLabel id="service-select-label">Услуга</InputLabel>
              <Select
                labelId="service-select-label"
                value={selectedService}
                onChange={handleServiceChange}
                label="Услуга"
              >
                <MenuItem value="">Все услуги</MenuItem>
                {services.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </Box>

      {/* Результаты поиска */}
      {filteredPoints.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <StoreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Сервисные центры не найдены
          </Typography>
          <Typography color="textSecondary">
            Попробуйте изменить параметры поиска
          </Typography>
        </Box>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-12px' }}>
          {filteredPoints.map((point) => (
            <div style={{ width: '50%', padding: '12px', boxSizing: 'border-box' }} key={point.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={point.photos.length > 0 ? point.photos[0].url : '/images/service-point-placeholder.jpg'}
                  alt={point.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="div" gutterBottom>
                      {point.name}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Rating 
                        value={point.rating} 
                        readOnly 
                        precision={0.5} 
                        size="small" 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({point.reviews_count})
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {point.address}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Время работы: {point.opening_time} - {point.closing_time}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    Услуги:
                  </Typography>
                  
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {point.services.slice(0, 5).map(service => (
                      <Chip 
                        key={service.id} 
                        label={`${service.name} - ${service.price} ₽`} 
                        size="small" 
                        variant="outlined" 
                      />
                    ))}
                    {point.services.length > 5 && (
                      <Chip 
                        label={`+${point.services.length - 5}`} 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink}
                    to={`/service-points/${point.id}`}
                  >
                    Подробнее
                  </Button>
                  <Button 
                    size="small" 
                    component={RouterLink}
                    to={`/bookings/new?service_point_id=${point.id}`}
                    color="primary"
                  >
                    Записаться
                  </Button>
                  <Button 
                    size="small"
                    color={point.is_favorite ? 'error' : 'secondary'}
                    onClick={() => toggleFavorite(point.id, point.is_favorite)}
                    startIcon={<StarIcon />}
                  >
                    {point.is_favorite ? 'Удалить из избранного' : 'В избранное'}
                  </Button>
                </CardActions>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};

export default ServicePointsSearch; 