import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Button, 
  List, 
  ListItem, 
  Divider, 
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  DirectionsCar as CarIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchWithAuth } from '../../api/apiUtils';
import { User } from '../../types/user';
import { GridContainer, GridItem, CenteredBox, StyledAlert } from '../../components/styled/CommonComponents';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  is_primary: boolean;
  car_type_id: number;
}

const MyCarsList: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const clientId = user?.id;
      
      if (!clientId) {
        throw new Error('Отсутствует идентификатор клиента');
      }
      
      const response = await fetchWithAuth(`/api/v1/clients/${clientId}/cars`);
      const data = await response.json();
      setCars(data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Ошибка при загрузке автомобилей');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleSetPrimary = async (carId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetchWithAuth(
        `/api/v1/clients/${user.id}/cars/${carId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_primary: true }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Не удалось установить автомобиль как основной');
      }
      
      fetchCars();
    } catch (error) {
      console.error('Error setting primary car:', error);
      setError('Ошибка при установке основного автомобиля');
    }
  };

  const handleDeleteCar = async (carId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      return;
    }
    
    try {
      const clientId = user?.id;
      const response = await fetchWithAuth(
        `/api/v1/clients/${clientId}/cars/${carId}`,
        {
          method: 'DELETE',
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось удалить автомобиль');
      }
      
      // Обновляем список автомобилей
      fetchCars();
    } catch (err) {
      console.error('Ошибка удаления автомобиля:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  const handleEditCar = (carId: number) => {
    const clientId = user?.id;
    // Здесь можно добавить логику редактирования
    console.log(`Редактирование автомобиля ${carId} для клиента ${clientId}`);
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
      <Box my={4}>
        <StyledAlert severity="error" marginBottom={2}>
          <Typography variant="h6">
            Ошибка загрузки данных
          </Typography>
          <Typography>{error}</Typography>
        </StyledAlert>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={fetchCars} 
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
          Мои автомобили
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/my-cars/new"
        >
          Добавить автомобиль
        </Button>
      </Box>
      
      {cars.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            У вас пока нет добавленных автомобилей
          </Typography>
          <Typography color="textSecondary" paragraph>
            Добавьте свой первый автомобиль, чтобы ускорить процесс записи на шиномонтаж
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/my-cars/new"
            sx={{ mt: 2 }}
          >
            Добавить автомобиль
          </Button>
        </Paper>
      ) : (
        <GridContainer spacing={3}>
          {cars.map((car) => (
            <GridItem xs={12} sm={6} md={4} key={car.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: car.is_primary ? '2px solid #4caf50' : 'none'
                }}
              >
                {car.is_primary && (
                  <Chip 
                    icon={<StarIcon />} 
                    label="Основной" 
                    color="success"
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10,
                      zIndex: 1
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {car.make} {car.model} ({car.year})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Гос. номер: {car.license_plate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Цвет: {car.color}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <IconButton 
                      aria-label="edit"
                      component={RouterLink}
                      to={`/my-cars/${car.id}/edit`}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete"
                      onClick={() => handleDeleteCar(car.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  {!car.is_primary && (
                    <Button
                      startIcon={<StarBorderIcon />}
                      onClick={() => handleSetPrimary(car.id.toString())}
                      size="small"
                    >
                      Сделать основным
                    </Button>
                  )}
                </CardActions>
              </Card>
            </GridItem>
          ))}
        </GridContainer>
      )}
    </Box>
  );
};

export default MyCarsList; 