import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

// В реальном приложении это будут данные от API
const mockData = {
  partnersCount: 24,
  servicePointsCount: 53,
  clientsCount: 1287,
  bookingsCount: 4125,
  completedBookingsCount: 3698,
  canceledBookingsCount: 427,
  bookingsByMonth: [120, 145, 160, 175, 185, 190, 210, 230, 250, 270, 290, 310],
  revenueByMonth: [
    123000, 145000, 167000, 184000, 196000, 205000, 234000, 256000, 278000, 298000, 324000, 356000,
  ],
};

// Компонент информационной карточки
const InfoCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card elevation={3}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" variant="subtitle1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: 48,
            height: 48,
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(mockData);

  useEffect(() => {
    // Имитируем загрузку данных с сервера
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Обзор основных показателей
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            title="Партнеры"
            value={data.partnersCount}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            title="Точки обслуживания"
            value={data.servicePointsCount}
            icon={<LocationOnIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            title="Клиенты"
            value={data.clientsCount}
            icon={<PeopleIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            title="Бронирования"
            value={data.bookingsCount}
            icon={<EventNoteIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardHeader title="Ежемесячные бронирования" />
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                График ежемесячных бронирований будет отображен здесь с использованием библиотеки графиков
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader title="Статистика бронирований" />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    backgroundColor: '#2e7d3215',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    color: '#2e7d32',
                    mr: 2,
                  }}
                >
                  <CheckCircleIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Выполнено
                  </Typography>
                  <Typography variant="h6">{data.completedBookingsCount}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: '#d3202015',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    color: '#d32020',
                    mr: 2,
                  }}
                >
                  <CancelIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Отменено
                  </Typography>
                  <Typography variant="h6">{data.canceledBookingsCount}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 