import React from 'react';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from '../../components/ui';
import { Card } from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { getDashboardStyles } from '../../styles';
import { 
  useGetPartnersQuery,
  useGetServicePointsQuery,
  useGetClientsQuery,
  useGetBookingsQuery
} from '../../api';
import { ApiResponse, Partner, ServicePoint, Client, Booking } from '../../types/models';
import StatCard from '../../components/StatCard';
import BookingChart from '../../components/BookingChart';
import ServicePointMap from '../../components/ServicePointMap';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dashboardStyles = getDashboardStyles(theme);

  // RTK Query хуки с типизацией
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
      title: t('forms.dashboard.stats.partners.title'),
      value: partnersData?.pagination?.total_count || 0,
      icon: <BusinessIcon />,
      color: '#1976d2',
      description: t('forms.dashboard.stats.partners.description'),
    },
    {
      title: t('forms.dashboard.stats.servicePoints.title'),
      value: servicePointsData?.pagination?.total_count || 0,
      icon: <LocationIcon />,
      color: '#388e3c',
      description: t('forms.dashboard.stats.servicePoints.description'),
    },
    {
      title: t('forms.dashboard.stats.clients.title'),
      value: clientsData?.pagination?.total_count || 0,
      icon: <PeopleIcon />,
      color: '#e64a19',
      description: t('forms.dashboard.stats.clients.description'),
    },
  ];

  // Отображение состояний загрузки и ошибок
  if (partnersLoading || servicePointsLoading || clientsLoading || bookingsLoading) {
    return (
      <Box sx={dashboardStyles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (partnersError || servicePointsError || clientsError || bookingsError) {
    return (
      <Box sx={dashboardStyles.errorContainer}>
        <Alert severity="error" sx={dashboardStyles.errorAlert}>
          {t('forms.dashboard.errorMessage')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={dashboardStyles.pageContainer}>
      <Typography variant="h4" sx={dashboardStyles.pageTitle}>
        {t('forms.dashboard.title')}
      </Typography>

      {/* Статистика */}
      <Box sx={dashboardStyles.statsContainer}>
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
          <Card sx={dashboardStyles.chartCard}>
            <Typography variant="h6" sx={dashboardStyles.chartTitle}>
              {t('forms.dashboard.charts.bookingStats')}
            </Typography>
            <BookingChart data={bookingsData?.data || []} />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={dashboardStyles.chartCard}>
            <Typography variant="h6" sx={dashboardStyles.chartTitle}>
              {t('forms.dashboard.charts.servicePointsMap')}
            </Typography>
            <ServicePointMap servicePoints={servicePointsData?.data || []} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 