import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

// API хуки
import { useGetBookingsQuery } from '../../../api/bookings.api';
import { useGetReviewsQuery } from '../../../api/reviews.api';
import { useOperatorServicePoint } from '../../../hooks/useOperatorServicePoint';

// Типы
interface OperatorPointStatsProps {
  variant?: 'card' | 'inline' | 'dashboard';
  period?: 'today' | 'week' | 'month' | 'all';
  showDetails?: boolean;
}

interface StatsData {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  todayBookings: number;
}

export const OperatorPointStats: React.FC<OperatorPointStatsProps> = ({
  variant = 'card',
  period = 'month',
  showDetails = true,
}) => {
  const { selectedPointId, selectedPoint, isOperator } = useOperatorServicePoint();

  // Формируем параметры для статистики
  const statsParams = useMemo(() => {
    if (!selectedPointId) return null;

    const params: any = {
      service_point_id: selectedPointId,
      per_page: 1000, // Загружаем много записей для статистики
    };

    // Добавляем фильтр по периоду
    const now = new Date();
    switch (period) {
      case 'today':
        params.from_date = now.toISOString().split('T')[0];
        params.to_date = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.from_date = weekAgo.toISOString().split('T')[0];
        params.to_date = now.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.from_date = monthAgo.toISOString().split('T')[0];
        params.to_date = now.toISOString().split('T')[0];
        break;
      // 'all' - без фильтра по дате
    }

    return params;
  }, [selectedPointId, period]);

  // API запросы
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
  } = useGetBookingsQuery(statsParams || {}, {
    skip: !statsParams,
  });

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useGetReviewsQuery({
    service_point_id: selectedPointId || 0,
    per_page: 1000,
  }, {
    skip: !selectedPointId,
  });

  // Обработка данных
  const stats: StatsData = useMemo(() => {
    const bookings = bookingsData?.data || [];
    const reviews = reviewsData?.data || [];

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const pendingBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length;

    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    // Статистика по отзывам
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews
      : 0;

    // Сегодняшние бронирования
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => 
      b.booking_date?.startsWith(today)
    ).length;

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      averageRating,
      totalReviews,
      completionRate,
      todayBookings,
    };
  }, [bookingsData, reviewsData]);

  // Не показываем если не оператор или нет выбранной точки
  if (!isOperator || !selectedPointId || !selectedPoint) {
    return null;
  }

  // Состояние загрузки
  if (bookingsLoading || reviewsLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Загрузка статистики...
        </Typography>
      </Box>
    );
  }

  // Получение названия периода
  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'за сегодня';
      case 'week': return 'за неделю';
      case 'month': return 'за месяц';
      case 'all': return 'за все время';
      default: return '';
    }
  };

  // Компактный вариант
  if (variant === 'inline') {
    return (
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <Chip
          icon={<EventIcon />}
          label={`${stats.totalBookings} записей`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Chip
          icon={<CheckCircleIcon />}
          label={`${stats.completedBookings} выполнено`}
          size="small"
          color="success"
          variant="outlined"
        />
        <Chip
          icon={<StarIcon />}
          label={`${stats.averageRating.toFixed(1)} ⭐`}
          size="small"
          color="warning"
          variant="outlined"
        />
        <Chip
          icon={<AccessTimeIcon />}
          label={`${stats.todayBookings} сегодня`}
          size="small"
          color="info"
          variant="outlined"
        />
      </Box>
    );
  }

  // Карточный вариант
  return (
    <Card>
      <CardContent>
        {/* Заголовок */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6">
            Статистика {getPeriodLabel()}
          </Typography>
        </Box>

        {/* Информация о точке */}
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: 'grey.50',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocationIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              {selectedPoint.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            📍 {selectedPoint.address}
          </Typography>
        </Box>

        {/* Основные метрики */}
        <Grid container spacing={2} mb={showDetails ? 2 : 0}>
          {/* Общие бронирования */}
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {stats.totalBookings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Всего записей
              </Typography>
            </Box>
          </Grid>

          {/* Выполненные */}
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.completedBookings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Выполнено
              </Typography>
            </Box>
          </Grid>

          {/* Средняя оценка */}
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.averageRating.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Рейтинг ⭐
              </Typography>
            </Box>
          </Grid>

          {/* Сегодня */}
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.todayBookings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Сегодня
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Детальная статистика */}
        {showDetails && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* Процент выполнения */}
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="bold">
                  Процент выполнения
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.completionRate.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.completionRate} 
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Детали по статусам */}
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.completedBookings}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Выполнено
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon color="warning" fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.pendingBookings}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      В ожидании
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CancelIcon color="error" fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.cancelledBookings}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Отменено
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Отзывы */}
            {stats.totalReviews > 0 && (
              <Box mt={2}>
                <Alert severity="info" icon={<StarIcon />}>
                  <Typography variant="body2">
                    <strong>{stats.totalReviews}</strong> отзывов со средней оценкой{' '}
                    <strong>{stats.averageRating.toFixed(1)}</strong> из 5
                  </Typography>
                </Alert>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 