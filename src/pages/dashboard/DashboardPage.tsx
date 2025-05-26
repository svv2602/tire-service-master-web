import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';

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
  const dispatch = useDispatch<AppDispatch>();
  
  // Получаем данные из Redux store
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchDashboardStats());
  };

  // Отладочная информация
  console.log('Dashboard state:', { stats, loading, error });
  console.log('Stats object:', stats);
  console.log('Partners count:', stats?.partners_count);
  console.log('Service points count:', stats?.service_points_count);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Ошибка загрузки данных дашборда
        </Typography>
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleRetry} 
          sx={{ mt: 2 }}
        >
          Повторить попытку
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Добро пожаловать в систему "Твоя шина"!
            </Typography>
            <Typography paragraph>
              Выберите раздел в меню слева для начала работы.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Дашборд
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Обзор основных показателей
      </Typography>
      <Divider sx={{ my: 2 }} />

      {!stats ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Нет данных для отображения
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleRetry} 
            sx={{ mt: 2 }}
          >
            Загрузить данные
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoCard
                title="Партнеры"
                value={stats.partners_count || 0}
                icon={<PeopleIcon />}
                color="#1976d2"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoCard
                title="Точки обслуживания"
                value={stats.service_points_count || 0}
                icon={<LocationOnIcon />}
                color="#2e7d32"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoCard
                title="Клиенты"
                value={stats.clients_count || 0}
                icon={<PeopleIcon />}
                color="#ed6c02"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoCard
                title="Бронирования"
                value={stats.bookings_count || 0}
                icon={<EventNoteIcon />}
                color="#9c27b0"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card elevation={3}>
                <CardHeader title="Ежемесячные бронирования" />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    График ежемесячных бронирований будет отображен здесь с использованием библиотеки графиков
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Данные за последние 12 месяцев: {stats.bookings_by_month?.join(', ') || 'Загрузка...'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
                      <Typography variant="h6">{stats.completed_bookings_count || 0}</Typography>
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
                      <Typography variant="h6">{stats.canceled_bookings_count || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DashboardPage; 