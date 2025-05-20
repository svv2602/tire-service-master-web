import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
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
  LocationOn as LocationIcon,
  Star as StarIcon,
  Store as StoreIcon,
  Delete as DeleteIcon
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

const FavoriteServicePoints: React.FC = () => {
  const [favoritePoints, setFavoritePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavoritePoints();
  }, []);

  const fetchFavoritePoints = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/v1/service_points/favorites');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить данные избранных сервисных центров');
      }
      
      const responseJson = await response.json();
      console.log('API Response in FavoriteServicePoints:', responseJson);
      
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
      
      setFavoritePoints(points);
    } catch (err) {
      console.error('Ошибка загрузки избранных сервисных центров:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот сервисный центр из избранного?')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/api/v1/service_points/${id}/remove_favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось удалить из избранного');
      }
      
      // Обновляем список избранных центров
      setFavoritePoints(points => points.filter(point => point.id !== id));
    } catch (err) {
      console.error('Ошибка удаления из избранного:', err);
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
          onClick={fetchFavoritePoints} 
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box my={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Избранные сервисные центры
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          component={RouterLink}
          to="/service-points/search"
        >
          Найти сервисные центры
        </Button>
      </Box>
      
      {favoritePoints.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <StoreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            У вас пока нет избранных сервисных центров
          </Typography>
          <Typography color="textSecondary" paragraph>
            Добавляйте сервисные центры в избранное, чтобы быстро находить их при записи на шиномонтаж
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink}
            to="/service-points/search"
            sx={{ mt: 2 }}
          >
            Найти сервисные центры
          </Button>
        </Box>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-12px' }}>
          {favoritePoints.map((point) => (
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
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeFromFavorites(point.id)}
                  >
                    Удалить из избранного
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

export default FavoriteServicePoints; 