import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  List, 
  ListItem, 
  Divider, 
  Grid,
  IconButton,
  CircularProgress
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

// Импорты UI компонентов
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Chip } from '../../components/ui/Chip';
import { Card } from '../../components/ui/Card';

// Импорт стилей
import { SIZES } from '../../styles/theme';
import { 
  getButtonStyles, 
  getCardStyles
} from '../../styles/components';

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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        my: SIZES.spacing.lg,
        p: SIZES.spacing.lg
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: SIZES.spacing.lg, p: SIZES.spacing.lg }}>
        <Alert severity="error" sx={{ mb: SIZES.spacing.md }}>
          <Typography variant="h6" sx={{
            fontSize: SIZES.fontSize.lg,
            fontWeight: 600
          }}>
            Ошибка загрузки данных
          </Typography>
          <Typography sx={{ fontSize: SIZES.fontSize.md }}>
            {error}
          </Typography>
        </Alert>
        <Button 
          variant="outlined" 
          onClick={fetchCars} 
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ my: SIZES.spacing.lg, p: SIZES.spacing.lg }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: SIZES.spacing.lg 
      }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{
          fontSize: SIZES.fontSize.xl,
          fontWeight: 600
        }}>
          Мои автомобили
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => window.location.href = '/my-cars/new'}
        >
          Добавить автомобиль
        </Button>
      </Box>
      
      {cars.length === 0 ? (
        <Box sx={{ 
          p: SIZES.spacing.xl, 
          textAlign: 'center',
          borderRadius: SIZES.borderRadius.md,
          border: `1px solid rgba(0, 0, 0, 0.12)`
        }}>
          <CarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: SIZES.spacing.md }} />
          <Typography variant="h6" gutterBottom sx={{
            fontSize: SIZES.fontSize.lg,
            fontWeight: 600
          }}>
            У вас пока нет добавленных автомобилей
          </Typography>
          <Typography color="textSecondary" paragraph sx={{
            fontSize: SIZES.fontSize.md,
            mb: SIZES.spacing.md
          }}>
            Добавьте свой первый автомобиль, чтобы ускорить процесс записи на шиномонтаж
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => window.location.href = '/my-cars/new'}
            sx={{ mt: SIZES.spacing.md }}
          >
            Добавить автомобиль
          </Button>
        </Box>
      ) : (
        <GridContainer spacing={3}>
          {cars.map((car) => (
            <GridItem xs={12} sm={6} md={4} key={car.id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: car.is_primary ? '2px solid #4caf50' : 'none',
                p: SIZES.spacing.lg
              }}>
                {car.is_primary && (
                  <Chip 
                    icon={<StarIcon />} 
                    label="Основной" 
                    color="success"
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: SIZES.spacing.md, 
                      right: SIZES.spacing.md,
                      zIndex: 1
                    }}
                  />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom sx={{
                    fontSize: SIZES.fontSize.lg,
                    fontWeight: 600
                  }}>
                    {car.make} {car.model} ({car.year})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{
                    fontSize: SIZES.fontSize.sm,
                    mb: SIZES.spacing.sm
                  }}>
                    Гос. номер: {car.license_plate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: SIZES.fontSize.sm
                  }}>
                    Цвет: {car.color}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: SIZES.spacing.md,
                  pt: SIZES.spacing.md,
                  borderTop: `1px solid rgba(0, 0, 0, 0.12)`
                }}>
                  <Box sx={{ display: 'flex', gap: SIZES.spacing.sm }}>
                    <IconButton 
                      aria-label="edit"
                      onClick={() => window.location.href = `/my-cars/${car.id}/edit`}
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
                </Box>
              </Card>
            </GridItem>
          ))}
        </GridContainer>
      )}
    </Box>
  );
};

export default MyCarsList; 