import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import {
  useGetSeasonalSchedulesQuery,
  useDeleteSeasonalScheduleMutation,
  SeasonalSchedule,
} from '../../api/seasonalSchedules.api';
import { SeasonalScheduleForm } from './SeasonalScheduleForm';

interface SeasonalScheduleManagerProps {
  servicePointId: string;
  servicePointName?: string;
}

export const SeasonalScheduleManager: React.FC<SeasonalScheduleManagerProps> = ({
  servicePointId,
  servicePointName,
}) => {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<SeasonalSchedule | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<SeasonalSchedule | null>(null);

  // API хуки
  const {
    data: schedulesData,
    isLoading,
    error,
    refetch,
  } = useGetSeasonalSchedulesQuery({
    servicePointId,
    per_page: 50,
  });

  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteSeasonalScheduleMutation();

  const schedules = schedulesData?.data || [];

  // Обработчики
  const handleCreateNew = () => {
    setEditingSchedule(null);
    setFormOpen(true);
  };

  const handleEdit = (schedule: SeasonalSchedule) => {
    setEditingSchedule(schedule);
    setFormOpen(true);
  };

  const handleDelete = (schedule: SeasonalSchedule) => {
    setScheduleToDelete(schedule);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteSchedule({
        servicePointId,
        id: scheduleToDelete.id.toString(),
      }).unwrap();
      setDeleteConfirmOpen(false);
      setScheduleToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении сезонного расписания:', error);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingSchedule(null);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingSchedule(null);
    refetch();
  };

  // Получение цвета статуса
  const getStatusColor = (status: SeasonalSchedule['status']) => {
    switch (status) {
      case 'current':
        return 'success';
      case 'upcoming':
        return 'info';
      case 'past':
        return 'default';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  // Получение текста статуса
  const getStatusText = (status: SeasonalSchedule['status']) => {
    switch (status) {
      case 'current':
        return 'Активно';
      case 'upcoming':
        return 'Предстоящее';
      case 'past':
        return 'Завершено';
      case 'inactive':
        return 'Неактивно';
      default:
        return 'Неизвестно';
    }
  };

  // Получение дней недели на русском
  const getDayName = (dayKey: string) => {
    const dayNames: { [key: string]: string } = {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье',
    };
    return dayNames[dayKey] || dayKey;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Ошибка при загрузке сезонных расписаний. Попробуйте обновить страницу.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Заголовок и кнопка создания */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Сезонные расписания
          </Typography>
          {servicePointName && (
            <Typography variant="body2" color="text.secondary">
              {servicePointName}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Создать расписание
        </Button>
      </Box>

      {/* Список расписаний */}
      {schedules.length === 0 ? (
        <Alert severity="info">
          Сезонные расписания не созданы. Нажмите "Создать расписание" для добавления первого расписания.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {schedules.map((schedule) => (
            <Grid item xs={12} md={6} lg={4} key={schedule.id}>
              <Card>
                <CardContent>
                  {/* Заголовок и статус */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {schedule.name}
                    </Typography>
                    <Chip
                      label={getStatusText(schedule.status)}
                      color={getStatusColor(schedule.status)}
                      size="small"
                    />
                  </Box>

                  {/* Описание */}
                  {schedule.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {schedule.description}
                    </Typography>
                  )}

                  {/* Период */}
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {schedule.period_description}
                    </Typography>
                  </Box>

                  {/* Рабочие дни */}
                  <Box display="flex" alignItems="center" mb={1}>
                    <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Рабочих дней: {schedule.working_days_count}
                    </Typography>
                  </Box>

                  {/* Приоритет */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Приоритет: {schedule.priority}
                    </Typography>
                  </Box>

                  {/* Детали расписания */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2">
                        Подробности расписания
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {Object.entries(schedule.working_hours).map(([dayKey, daySchedule]) => (
                          <ListItem key={dayKey} divider>
                            <ListItemIcon>
                              {daySchedule.is_working_day ? (
                                <CheckCircleIcon color="success" fontSize="small" />
                              ) : (
                                <CancelIcon color="error" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={getDayName(dayKey)}
                              secondary={
                                daySchedule.is_working_day
                                  ? `${daySchedule.start} - ${daySchedule.end}`
                                  : 'Выходной'
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(schedule)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(schedule)}
                  >
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Форма создания/редактирования */}
      <Dialog
        open={formOpen}
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSchedule ? 'Редактирование расписания' : 'Создание нового расписания'}
        </DialogTitle>
        <DialogContent>
          <SeasonalScheduleForm
            servicePointId={servicePointId}
            schedule={editingSchedule}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить сезонное расписание "{scheduleToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 