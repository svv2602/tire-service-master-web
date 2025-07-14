import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { useGetSeasonalSchedulesQuery } from '../../api/seasonalSchedules.api';
import type { SeasonalSchedule } from '../../api/seasonalSchedules.api';

interface SeasonalScheduleInfoProps {
  servicePointId: string;
}

const SeasonalScheduleInfo: React.FC<SeasonalScheduleInfoProps> = ({
  servicePointId,
}) => {
  const { t } = useTranslation('components');
  const { data: schedulesData, isLoading, error } = useGetSeasonalSchedulesQuery({
    servicePointId,
    page: 1,
    per_page: 50,
  });

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          {t('seasonalSchedules.loading')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        {t('seasonalSchedules.info.loadingError')}
      </Alert>
    );
  }

  const schedules = schedulesData?.data || [];
  const activeSchedules = schedules.filter(schedule => schedule.is_active);
  
  // Найти ближайшее расписание
  const findNearestSchedule = (schedules: SeasonalSchedule[]) => {
    const currentDate = new Date();
    
    // Сначала ищем текущие расписания
    const currentSchedules = schedules.filter(schedule => {
      const startDate = new Date(schedule.start_date);
      const endDate = new Date(schedule.end_date);
      return (isBefore(startDate, currentDate) || isToday(startDate)) && 
             (isAfter(endDate, currentDate) || isToday(endDate));
    });

    if (currentSchedules.length > 0) {
      // Возвращаем текущее расписание с наивысшим приоритетом
      return currentSchedules.sort((a, b) => b.priority - a.priority)[0];
    }

    // Если нет текущих, ищем ближайшие будущие
    const futureSchedules = schedules
      .filter(schedule => isAfter(new Date(schedule.start_date), currentDate))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    return futureSchedules[0] || null;
  };

  const nearestSchedule = findNearestSchedule(activeSchedules);

  // Определить статус расписания
  const getScheduleStatus = (schedule: SeasonalSchedule) => {
    const currentDate = new Date();
    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);

    if ((isBefore(startDate, currentDate) || isToday(startDate)) && 
        (isAfter(endDate, currentDate) || isToday(endDate))) {
      return 'current';
    } else if (isAfter(startDate, currentDate)) {
      return 'upcoming';
    } else {
      return 'past';
    }
  };

  // Получить цвет статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'success';
      case 'upcoming':
        return 'info';
      case 'past':
        return 'default';
      default:
        return 'default';
    }
  };

  // Получить текст статуса
  const getStatusText = (status: string) => {
    const key = `seasonalSchedules.info.${status}`;
    const translated = t(key);
    
    // Если перевод не найден (возвращается ключ), используем fallback
    if (translated === key) {
      switch (status) {
        case 'current':
          return 'Активно';
        case 'upcoming':
          return 'Предстоящее';
        case 'past':
          return 'Завершено';
        default:
          return 'Неизвестно';
      }
    }
    
    return translated;
  };

  if (schedules.length === 0) {
    return (
      <Paper 
        sx={{ 
          p: 2, 
          border: '1px solid', 
          borderColor: 'divider',
          backgroundColor: 'background.default',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <EventIcon color="disabled" />
          <Typography variant="body2" color="text.secondary">
            {t('seasonalSchedules.noSchedulesConfigured')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        border: '1px solid', 
        borderColor: 'divider',
        backgroundColor: 'background.default',
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon color="primary" />
            <Typography variant="body2" fontWeight="medium">
              {t('seasonalSchedules.totalSchedules', { count: schedules.length })}
            </Typography>
            <Chip 
              label={t('seasonalSchedules.activeSchedulesCount', { count: activeSchedules.length })}
              size="small"
              color={activeSchedules.length > 0 ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          {nearestSchedule ? (
            <Box display="flex" alignItems="center" gap={1}>
              <ScheduleIcon color="primary" />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {nearestSchedule.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(nearestSchedule.start_date), 'dd MMM yyyy', { locale: ru })} - 
                    {format(new Date(nearestSchedule.end_date), 'dd MMM yyyy', { locale: ru })}
                  </Typography>
                  <Chip 
                    label={getStatusText(getScheduleStatus(nearestSchedule))}
                    size="small"
                    color={getStatusColor(getScheduleStatus(nearestSchedule)) as any}
                    variant="filled"
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <ScheduleIcon color="disabled" />
              <Typography variant="body2" color="text.secondary">
                {t('seasonalSchedules.noUpcomingSchedules')}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SeasonalScheduleInfo; 