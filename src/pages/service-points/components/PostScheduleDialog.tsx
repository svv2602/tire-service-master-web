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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    
    // Проверяем, отличается ли индивидуальное расписание от основного
    if (finalSchedule.has_custom_schedule) {
      const isDifferentFromMainSchedule = checkIfDifferentFromMainSchedule(finalSchedule);
      
      if (isDifferentFromMainSchedule) {
        // Показываем диалог подтверждения
        const confirmed = window.confirm(
          `${t('forms.servicePoint.scheduleDialog.confirmation.warning')}\n\n` +
          `${t('forms.servicePoint.scheduleDialog.confirmation.mainScheduleWarning')}\n\n` +
          `${t('forms.servicePoint.scheduleDialog.confirmation.explanation.point')}\n` +
          `• ${t('forms.servicePoint.scheduleDialog.confirmation.explanation.point1')}\n` +
          `• ${t('forms.servicePoint.scheduleDialog.confirmation.explanation.point2')}\n` +
          `• ${t('forms.servicePoint.scheduleDialog.confirmation.explanation.point3')}\n\n` +
          `${t('forms.servicePoint.scheduleDialog.confirmation.confirmQuestion')}`
        );
        
        if (!confirmed) {
          return; // Отменяем сохранение
        }
      }
    }
    
    // Отправляем изменения в родительский компонент
    const dataToSave = {
      has_custom_schedule: finalSchedule.has_custom_schedule,
      working_days: finalSchedule.has_custom_schedule ? finalSchedule.working_days : undefined,
      custom_hours: finalSchedule.has_custom_schedule ? finalSchedule.custom_hours : undefined,
    };
    
    onSave(dataToSave);
    onClose();
  };

  // Функция для проверки отличий от основного расписания
  const checkIfDifferentFromMainSchedule = (schedule: typeof localSchedule) => {
    // Здесь можно добавить логику сравнения с основным расписанием сервисной точки
    // Пока что просто проверяем, есть ли выходные дни в индивидуальном расписании,
    // которые обычно являются рабочими (или наоборот)
    
    const workingDaysCount = Object.values(schedule.working_days).filter(Boolean).length;
    const hasWeekendWork = schedule.working_days.saturday || schedule.working_days.sunday;
    const hasWeekdayOff = !schedule.working_days.monday || !schedule.working_days.tuesday || 
                         !schedule.working_days.wednesday || !schedule.working_days.thursday || 
                         !schedule.working_days.friday;
    
    // Считаем расписание "особенным", если:
    // 1. Есть работа в выходные (суббота/воскресенье)
    // 2. Есть выходные в будни
    // 3. Менее 5 рабочих дней в неделю
    return hasWeekendWork || hasWeekdayOff || workingDaysCount < 5;
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
      <DialogTitle>{t('forms.servicePoint.scheduleDialog.title')}</DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>{t('forms.servicePoint.scheduleDialog.info')}</Alert>

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
                <Typography variant="body1" fontWeight="medium">{t('forms.servicePoint.scheduleDialog.useCustomSchedule')}</Typography>
                <Typography variant="body2" color="text.secondary">{localSchedule.has_custom_schedule 
                    ? t('forms.servicePoint.scheduleDialog.customScheduleActive') 
                    : t('forms.servicePoint.scheduleDialog.mainScheduleActive')
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
                {t('forms.servicePoint.scheduleDialog.workingDaysTitle')}
                <Typography component="span" variant="body2" color="text.secondary">
                  ({selectedWorkingDaysCount} {t('forms.servicePoint.scheduleDialog.workingDaysCount')})
                </Typography>
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries({
                  monday: t('forms.servicePoint.scheduleDialog.monday'),
                  tuesday: t('forms.servicePoint.scheduleDialog.tuesday'), 
                  wednesday: t('forms.servicePoint.scheduleDialog.wednesday'),
                  thursday: t('forms.servicePoint.scheduleDialog.thursday'),
                  friday: t('forms.servicePoint.scheduleDialog.friday'),
                  saturday: t('forms.servicePoint.scheduleDialog.saturday'),
                  sunday: t('forms.servicePoint.scheduleDialog.sunday')
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
                <Alert severity="warning" sx={{ mt: 2 }}>{t('forms.servicePoint.scheduleDialog.selectWorkingDayWarning')}</Alert>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Рабочие часы */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" />
                {t('forms.servicePoint.scheduleDialog.workingHoursTitle')}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label={t('forms.servicePoint.scheduleDialog.startTimeLabel')}
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
                    label={t('forms.servicePoint.scheduleDialog.endTimeLabel')}
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
                <Alert severity="error" sx={{ mt: 2 }}>{t('forms.servicePoint.scheduleDialog.startTimeAfterEndError')}</Alert>
              )}
            </Box>

            {/* Предварительный просмотр */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>{t('forms.servicePoint.scheduleDialog.previewTitle')}</Typography>
              <Typography variant="body2">
                <strong>{t('forms.servicePoint.scheduleDialog.workingDays')}:</strong> {
                  Object.entries(localSchedule.working_days)
                    .filter(([_, isWorking]) => isWorking)
                    .map(([day]) => {
                      const dayNames: { [key: string]: string } = {
                        monday: t('forms.servicePoint.scheduleDialog.mondayShort'), tuesday: t('forms.servicePoint.scheduleDialog.tuesdayShort'), wednesday: t('forms.servicePoint.scheduleDialog.wednesdayShort'),
                        thursday: t('forms.servicePoint.scheduleDialog.thursdayShort'), friday: t('forms.servicePoint.scheduleDialog.fridayShort'), saturday: t('forms.servicePoint.scheduleDialog.saturdayShort'), sunday: t('forms.servicePoint.scheduleDialog.sundayShort')
                      };
                      return dayNames[day];
                    })
                    .join(', ') || t('forms.servicePoint.scheduleDialog.noDaysSelected')
                }
              </Typography>
              <Typography variant="body2">
                <strong>{t('forms.servicePoint.scheduleDialog.workingHours')}:</strong> {localSchedule.custom_hours.start} - {localSchedule.custom_hours.end}
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel} color="inherit">{t('forms.servicePoint.scheduleDialog.cancelButton')}</Button>
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
          {t('forms.servicePoint.scheduleDialog.saveButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostScheduleDialog; 