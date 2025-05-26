import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  CardActions,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  EventNote as EventIcon,
  DirectionsCar as CarIcon,
  Build as ServiceIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetPartnersQuery } from '../../api/partners';
import { useGetServicePointsQuery } from '../../api/servicePoints';
import { useGetClientsQuery } from '../../api/clients';
import { useGetBookingsQuery } from '../../api/bookings';
import { useGetCarBrandsQuery } from '../../api/carBrands';
import { useGetCarModelsQuery } from '../../api/carModels';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  description?: string;
  actionText?: string;
  actionPath?: string;
  loading?: boolean;
  error?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
  actionText,
  actionPath,
  loading,
  error
}) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: `${color}20`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {loading ? (
            <CircularProgress size={24} />
          ) : error ? (
            <Typography variant="h4" color="error">
              Ошибка
            </Typography>
          ) : (
            <Typography variant="h3" component="div" sx={{ color: color, fontWeight: 'bold' }}>
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
      
      {actionText && actionPath && (
        <CardActions>
          <Button 
            size="small" 
            onClick={() => navigate(actionPath)}
            sx={{ color: color }}
          >
            {actionText}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  // Загружаем данные для статистики
  const { data: partnersData, isLoading: partnersLoading, error: partnersError } = useGetPartnersQuery({ per_page: 1 });
  const { data: servicePointsData, isLoading: servicePointsLoading, error: servicePointsError } = useGetServicePointsQuery({ per_page: 1 });
  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useGetClientsQuery({ per_page: 1 });
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useGetBookingsQuery({ per_page: 1 });
  const { data: brandsData, isLoading: brandsLoading, error: brandsError } = useGetCarBrandsQuery({ per_page: 1 });
  const { data: modelsData, isLoading: modelsLoading, error: modelsError } = useGetCarModelsQuery({ per_page: 1 });

  // Статистические данные
  const stats = [
    {
      title: 'Партнеры',
      value: partnersData?.pagination?.total_count || 0,
      icon: <BusinessIcon />,
      color: '#1976d2',
      description: 'Всего партнеров в системе',
      actionText: 'Управление партнерами',
      actionPath: '/partners',
      loading: partnersLoading,
      error: !!partnersError,
    },
    {
      title: 'Сервисные точки',
      value: servicePointsData?.pagination?.total_count || 0,
      icon: <LocationIcon />,
      color: '#388e3c',
      description: 'Активных точек обслуживания',
      actionText: 'Просмотр точек',
      actionPath: '/service-points',
      loading: servicePointsLoading,
      error: !!servicePointsError,
    },
    {
      title: 'Клиенты',
      value: clientsData?.pagination?.total_count || 0,
      icon: <PeopleIcon />,
      color: '#f57c00',
      description: 'Зарегистрированных клиентов',
      actionText: 'База клиентов',
      actionPath: '/clients',
      loading: clientsLoading,
      error: !!clientsError,
    },
    {
      title: 'Бронирования',
      value: bookingsData?.pagination?.total_count || 0,
      icon: <EventIcon />,
      color: '#7b1fa2',
      description: 'Всего бронирований',
      actionText: 'Управление записями',
      actionPath: '/bookings',
      loading: bookingsLoading,
      error: !!bookingsError,
    },
    {
      title: 'Бренды авто',
      value: brandsData?.pagination?.total_count || 0,
      icon: <CarIcon />,
      color: '#d32f2f',
      description: 'Брендов в каталоге',
      actionText: 'Каталог брендов',
      actionPath: '/car-brands',
      loading: brandsLoading,
      error: !!brandsError,
    },
    {
      title: 'Модели авто',
      value: modelsData?.pagination?.total_count || 0,
      icon: <ServiceIcon />,
      color: '#303f9f',
      description: 'Моделей в каталоге',
      actionText: 'Каталог моделей',
      actionPath: '/car-models',
      loading: modelsLoading,
      error: !!modelsError,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Панель управления
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Обзор основных показателей системы управления шиномонтажными услугами
        </Typography>
      </Box>

      {/* Статистические карточки */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Быстрые действия */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon sx={{ mr: 1 }} />
          Быстрые действия
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Новый партнер
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Добавить нового партнера в систему
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" href="/partners/new">
                  Создать
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Новая точка
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Добавить сервисную точку
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" href="/service-points/new">
                  Создать
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Новое бронирование
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Создать запись на обслуживание
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" href="/bookings/new">
                  Создать
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Аналитика
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Просмотр отчетов и статистики
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" href="/analytics">
                  Открыть
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Статус системы */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Статус системы
        </Typography>
        
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label="API Подключено" 
                    color="success" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Соединение с бэкендом активно
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label="База данных" 
                    color="success" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Все сервисы работают
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label="Кэширование" 
                    color="success" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    RTK Query активен
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip 
                    label="Интеграция" 
                    color="success" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Все модули подключены
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage; 