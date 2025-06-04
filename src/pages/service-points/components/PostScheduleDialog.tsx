import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { ServicePost } from '../../../types/models';

interface PostScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  post: ServicePost;
  onSave: (updatedPost: Partial<ServicePost>) => void;
}

const PostScheduleDialog: React.FC<PostScheduleDialogProps> = ({ 
  open, 
  onClose, 
  post, 
  onSave 
}) => {
  // Локальное состояние для редактирования
  const [localSchedule, setLocalSchedule] = useState({
    has_custom_schedule: post.has_custom_schedule || false,
    working_days: post.working_days || {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    custom_hours: post.custom_hours || {
      start: '09:00',
      end: '18:00',
    },
  });

  // Синхронизируем с пропсами при открытии диалога
  useEffect(() => {
    if (open) {
      setLocalSchedule({
        has_custom_schedule: post.has_custom_schedule || false,
        working_days: post.working_days || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
        custom_hours: post.custom_hours || {
          start: '09:00',
          end: '18:00',
        },
      });
    }
  }, [open, post]);

  const handleSave = () => {
    // Проверяем что если включено индивидуальное расписание, то выбран хотя бы один рабочий день
    let finalSchedule = { ...localSchedule };
    
    if (localSchedule.has_custom_schedule) {
      const hasWorkingDays = Object.values(localSchedule.working_days).some(isWorking => isWorking === true);
      
      if (!hasWorkingDays) {
        // Если нет рабочих дней, автоматически отключаем индивидуальное расписание
        finalSchedule.has_custom_schedule = false;
        console.warn('PostScheduleDialog: отключено индивидуальное расписание из-за отсутствия рабочих дней');
      }
    }
    
    // Отправляем изменения в родительский компонент
    const dataToSave = {
      has_custom_schedule: finalSchedule.has_custom_schedule,
      working_days: finalSchedule.has_custom_schedule ? finalSchedule.working_days : undefined,
      custom_hours: finalSchedule.has_custom_schedule ? finalSchedule.custom_hours : undefined,
    };
    
    console.log('PostScheduleDialog: сохраняем данные:', dataToSave);
    console.log('PostScheduleDialog: локальное состояние:', localSchedule);
    console.log('PostScheduleDialog: финальное состояние:', finalSchedule);
    
    onSave(dataToSave);
    onClose();
  };

  const handleCancel = () => {
    // Сбрасываем локальные изменения
    setLocalSchedule({
      has_custom_schedule: post.has_custom_schedule || false,
      working_days: post.working_days || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      custom_hours: post.custom_hours || {
        start: '09:00',
        end: '18:00',
      },
    });
    onClose();
  };

  const updateWorkingDay = (day: string, isWorking: boolean) => {
    setLocalSchedule(prev => ({
      ...prev,
      working_days: {
        ...prev.working_days,
        [day]: isWorking,
      },
    }));
  };

  const updateCustomHours = (field: 'start' | 'end', value: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      custom_hours: {
        ...prev.custom_hours,
        [field]: value,
      },
    }));
  };

  const selectedWorkingDaysCount = localSchedule.working_days 
    ? Object.values(localSchedule.working_days).filter(Boolean).length 
    : 0;

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 500 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6">
            Индивидуальное расписание: {post.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Настройте индивидуальное расписание работы для данного поста. 
            Если выключено, пост будет работать по общему расписанию сервисной точки.
          </Typography>
        </Alert>

        {/* Включение/выключение индивидуального расписания */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={localSchedule.has_custom_schedule}
                onChange={(e) => setLocalSchedule(prev => ({
                  ...prev,
                  has_custom_schedule: e.target.checked
                }))}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Использовать индивидуальное расписание
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {localSchedule.has_custom_schedule 
                    ? 'Пост работает по индивидуальному графику' 
                    : 'Пост работает по общему расписанию сервисной точки'
                  }
                </Typography>
              </Box>
            }
          />
        </Box>

        {localSchedule.has_custom_schedule && (
          <>
            <Divider sx={{ mb: 3 }} />
            
            {/* Рабочие дни */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon fontSize="small" />
                Рабочие дни
                <Typography component="span" variant="body2" color="text.secondary">
                  ({selectedWorkingDaysCount} из 7 дней)
                </Typography>
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries({
                  monday: 'Понедельник',
                  tuesday: 'Вторник', 
                  wednesday: 'Среда',
                  thursday: 'Четверг',
                  friday: 'Пятница',
                  saturday: 'Суббота',
                  sunday: 'Воскресенье'
                }).map(([day, label]) => (
                  <Grid item xs={12} sm={6} md={4} key={day}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSchedule.working_days[day as keyof typeof localSchedule.working_days] || false}
                          onChange={(e) => updateWorkingDay(day, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={label}
                    />
                  </Grid>
                ))}
              </Grid>

              {selectedWorkingDaysCount === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Выберите хотя бы один рабочий день
                </Alert>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Рабочие часы */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" />
                Рабочие часы
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Начало работы"
                    value={localSchedule.custom_hours.start}
                    onChange={(e) => updateCustomHours('start', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      step: 300, // 5 минут
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Конец работы"
                    value={localSchedule.custom_hours.end}
                    onChange={(e) => updateCustomHours('end', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      step: 300, // 5 минут
                    }}
                  />
                </Grid>
              </Grid>

              {/* Валидация времени */}
              {localSchedule.custom_hours.start >= localSchedule.custom_hours.end && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Время начала работы должно быть раньше времени окончания
                </Alert>
              )}
            </Box>

            {/* Предварительный просмотр */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Предварительный просмотр расписания:
              </Typography>
              <Typography variant="body2">
                <strong>Рабочие дни:</strong> {
                  Object.entries(localSchedule.working_days)
                    .filter(([_, isWorking]) => isWorking)
                    .map(([day]) => {
                      const dayNames: { [key: string]: string } = {
                        monday: 'Пн', tuesday: 'Вт', wednesday: 'Ср',
                        thursday: 'Чт', friday: 'Пт', saturday: 'Сб', sunday: 'Вс'
                      };
                      return dayNames[day];
                    })
                    .join(', ') || 'Не выбраны'
                }
              </Typography>
              <Typography variant="body2">
                <strong>Часы работы:</strong> {localSchedule.custom_hours.start} - {localSchedule.custom_hours.end}
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Отмена
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={
            localSchedule.has_custom_schedule && (
              selectedWorkingDaysCount === 0 || 
              localSchedule.custom_hours.start >= localSchedule.custom_hours.end
            )
          }
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostScheduleDialog; 