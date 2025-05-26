import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useGetPartnersQuery } from '../../api/partners';
import { useGetServicePointsQuery } from '../../api/service-points';
import { useGetClientsQuery } from '../../api/clients';
import { useGetBookingsQuery } from '../../api/bookings';
import StatCard from '../../components/StatCard';
import BookingChart from '../../components/BookingChart';
import ServicePointMap from '../../components/ServicePointMap';

const DashboardPage: React.FC = () => {
  // RTK Query хуки
  const { data: partnersData, isLoading: partnersLoading, error: partnersError } = useGetPartnersQuery({});
  const { data: servicePointsData, isLoading: servicePointsLoading, error: servicePointsError } = useGetServicePointsQuery({});
  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useGetClientsQuery({});
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useGetBookingsQuery({});

  // Статистика
  const stats = [
    {
      title: 'Партнеры',
      value: partnersData?.pagination?.total_count || 0,
      icon: <BusinessIcon />,
      color: '#1976d2',
      description: 'Всего партнеров в системе',
    },
    {
      title: 'Сервисные точки',
      value: servicePointsData?.pagination?.total_count || 0,
      icon: <LocationIcon />,
      color: '#388e3c',
      description: 'Активных точек обслуживания',
    },
    {
      title: 'Клиенты',
      value: clientsData?.pagination?.total_count || 0,
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
            <Grid key={index} xs={12} sm={6} md={4}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Графики и карта */}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Статистика бронирований
            </Typography>
            <BookingChart data={bookingsData?.data || []} />
          </Paper>
        </Grid>
        
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Карта точек обслуживания
            </Typography>
            <ServicePointMap points={servicePointsData?.data || []} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 