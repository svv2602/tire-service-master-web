import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { 
  useGetPartnersQuery,
  useGetServicePointsQuery,
  useGetClientsQuery,
  useGetBookingsQuery
} from '../../api';
import StatCard from '../../components/StatCard';
import BookingChart from '../../components/BookingChart';
import ServicePointMap from '../../components/ServicePointMap';

const DashboardPage: React.FC = () => {
  // RTK Query хуки
  const { data: partnersData, isLoading: partnersLoading, error: partnersError } = useGetPartnersQuery({
    page: 1,
    per_page: 1
  });
  const { data: servicePointsData, isLoading: servicePointsLoading, error: servicePointsError } = useGetServicePointsQuery({
    page: 1,
    per_page: 1
  });
  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useGetClientsQuery({
    page: 1,
    per_page: 1
  });
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useGetBookingsQuery({
    page: 1,
    per_page: 1
  });

  // Статистика
  const stats = [
    {
      title: 'Партнеры',
      value: partnersData?.total || 0,
      icon: <BusinessIcon />,
      color: '#1976d2',
      description: 'Всего партнеров в системе',
    },
    {
      title: 'Сервисные точки',
      value: servicePointsData?.total || 0,
      icon: <LocationIcon />,
      color: '#388e3c',
      description: 'Активных точек обслуживания',
    },
    {
      title: 'Клиенты',
      value: clientsData?.total || 0,
      icon: <PeopleIcon />,
      color: '#e64a19',
      description: 'Зарегистрированных клиентов',
    },
  ];

  // Отображение состояний загрузки и ошибок
  if (partnersLoading || servicePointsLoading || clientsLoading || bookingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (partnersError || servicePointsError || clientsError || bookingsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка при загрузке данных для дашборда
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Панель управления
      </Typography>

      {/* Статистика */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid key={index} item xs={12} sm={6} md={4}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Графики и карта */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Статистика бронирований
            </Typography>
            <BookingChart data={bookingsData?.data || []} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Карта точек обслуживания
            </Typography>
            <ServicePointMap servicePoints={servicePointsData?.data || []} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 