import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import {
  useCreateSeasonalScheduleMutation,
  useUpdateSeasonalScheduleMutation,
  SeasonalSchedule,
  SeasonalScheduleFormData,
} from '../../api/seasonalSchedules.api';

interface SeasonalScheduleFormProps {
  servicePointId: string;
  schedule?: SeasonalSchedule | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SeasonalScheduleForm: React.FC<SeasonalScheduleFormProps> = ({
  servicePointId,
  schedule,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation('components');
  const [createSchedule, { isLoading: isCreating }] = useCreateSeasonalScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateSeasonalScheduleMutation();

  const isEditing = !!schedule;
  const isLoading = isCreating || isUpdating;

  // Дни недели с переводами
  const DAYS_OF_WEEK = [
    { key: 'monday', label: t('seasonalSchedules.days.monday') },
    { key: 'tuesday', label: t('seasonalSchedules.days.tuesday') },
    { key: 'wednesday', label: t('seasonalSchedules.days.wednesday') },
    { key: 'thursday', label: t('seasonalSchedules.days.thursday') },
    { key: 'friday', label: t('seasonalSchedules.days.friday') },
    { key: 'saturday', label: t('seasonalSchedules.days.saturday') },
    { key: 'sunday', label: t('seasonalSchedules.days.sunday') },
  ];

  // Схема валидации с переводами
  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('seasonalSchedules.form.validation.nameRequired'))
      .max(255, t('seasonalSchedules.form.validation.nameMaxLength')),
    description: Yup.string()
      .max(1000, t('seasonalSchedules.form.validation.descriptionMaxLength')),
    start_date: Yup.date()
      .required(t('seasonalSchedules.form.validation.startDateRequired'))
      .min(new Date(), t('seasonalSchedules.form.validation.startDateFuture')),
    end_date: Yup.date()
      .required(t('seasonalSchedules.form.validation.endDateRequired'))
      .min(Yup.ref('start_date'), t('seasonalSchedules.form.validation.endDateAfterStart')),
    priority: Yup.number()
      .required(t('seasonalSchedules.form.validation.priorityRequired'))
      .min(0, t('seasonalSchedules.form.validation.priorityMin'))
      .max(100, t('seasonalSchedules.form.validation.priorityMax')),
  });

  // Инициализация формы
  const formik = useFormik<SeasonalScheduleFormData>({
    initialValues: {
      name: schedule?.name || '',
      description: schedule?.description || '',
      start_date: schedule?.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: schedule?.end_date || format(new Date(), 'yyyy-MM-dd'),
      is_active: schedule?.is_active ?? true,
      priority: schedule?.priority || 0,
      working_hours: schedule?.working_hours || {
        monday: { is_working_day: true, start: '09:00', end: '18:00' },
        tuesday: { is_working_day: true, start: '09:00', end: '18:00' },
        wednesday: { is_working_day: true, start: '09:00', end: '18:00' },
        thursday: { is_working_day: true, start: '09:00', end: '18:00' },
        friday: { is_working_day: true, start: '09:00', end: '18:00' },
        saturday: { is_working_day: false, start: '09:00', end: '18:00' },
        sunday: { is_working_day: false, start: '09:00', end: '18:00' },
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing) {
          await updateSchedule({
            servicePointId,
            id: schedule!.id.toString(),
            data: values,
          }).unwrap();
        } else {
          await createSchedule({
            servicePointId,
            data: values,
          }).unwrap();
        }
        onSuccess();
      } catch (error) {
        console.error('Ошибка при сохранении сезонного расписания:', error);
      }
    },
  });

  // Обработчики для быстрого заполнения рабочих дней
  const setWorkingDaysPattern = (pattern: 'weekdays' | 'all' | 'none') => {
    const newWorkingHours = { ...formik.values.working_hours };
    
    Object.keys(newWorkingHours).forEach(day => {
      switch (pattern) {
        case 'weekdays':
          newWorkingHours[day].is_working_day = !['saturday', 'sunday'].includes(day);
          break;
        case 'all':
          newWorkingHours[day].is_working_day = true;
          break;
        case 'none':
          newWorkingHours[day].is_working_day = false;
          break;
      }
    });
    
    formik.setFieldValue('working_hours', newWorkingHours);
  };

  // Обработчик изменения времени для дня
  const handleDayTimeChange = (day: string, field: 'start' | 'end', time: Date | null) => {
    if (time) {
      const timeString = format(time, 'HH:mm');
      formik.setFieldValue(`working_hours.${day}.${field}`, timeString);
    }
  };

  // Копирование расписания дня на все дни
  const copyToAllDays = (sourceDay: string) => {
    const sourceSchedule = formik.values.working_hours[sourceDay];
    const newWorkingHours = { ...formik.values.working_hours };
    
    Object.keys(newWorkingHours).forEach(day => {
      newWorkingHours[day] = { ...sourceSchedule };
    });
    
    formik.setFieldValue('working_hours', newWorkingHours);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
        {/* Основная информация */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title={t('seasonalSchedules.form.basicInfo')} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('seasonalSchedules.form.fields.name')}
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  placeholder={t('seasonalSchedules.form.fields.namePlaceholder')}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('seasonalSchedules.form.fields.description')}
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  placeholder={t('seasonalSchedules.form.fields.descriptionPlaceholder')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label={t('seasonalSchedules.form.fields.startDate')}
                  value={formik.values.start_date ? new Date(formik.values.start_date) : null}
                  onChange={(date) => {
                    if (date) {
                      formik.setFieldValue('start_date', format(date, 'yyyy-MM-dd'));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.start_date && Boolean(formik.errors.start_date),
                      helperText: formik.touched.start_date && formik.errors.start_date,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label={t('seasonalSchedules.form.fields.endDate')}
                  value={formik.values.end_date ? new Date(formik.values.end_date) : null}
                  onChange={(date) => {
                    if (date) {
                      formik.setFieldValue('end_date', format(date, 'yyyy-MM-dd'));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.end_date && Boolean(formik.errors.end_date),
                      helperText: formik.touched.end_date && formik.errors.end_date,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('seasonalSchedules.form.fields.priority')}
                  name="priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  helperText={formik.touched.priority && formik.errors.priority || t('seasonalSchedules.form.fields.priorityHelp')}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.is_active}
                      onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                      name="is_active"
                    />
                  }
                  label={t('seasonalSchedules.form.fields.isActive')}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Расписание работы */}
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title={t('seasonalSchedules.form.workingHours')}
            action={
              <Box display="flex" gap={1}>
                <Button size="small" onClick={() => setWorkingDaysPattern('weekdays')}>
                  {t('seasonalSchedules.form.workingDays.weekdays')}
                </Button>
                <Button size="small" onClick={() => setWorkingDaysPattern('all')}>
                  {t('seasonalSchedules.form.workingDays.allDays')}
                </Button>
                <Button size="small" onClick={() => setWorkingDaysPattern('none')}>
                  {t('seasonalSchedules.form.workingDays.weekends')}
                </Button>
              </Box>
            }
          />
          <CardContent>
            {/* Информация о постах с индивидуальным расписанием */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('seasonalSchedules.form.workingDays.importantInfo')}
              </Typography>
              <Typography variant="body2">
                {t('seasonalSchedules.form.workingDays.importantInfoText')}
              </Typography>
            </Alert>

            <Grid container spacing={2}>
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = formik.values.working_hours[day.key];
                return (
                  <Grid item xs={12} key={day.key}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                          <Typography variant="subtitle2">{day.label}</Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={daySchedule.is_working_day}
                                onChange={(e) => {
                                  formik.setFieldValue(
                                    `working_hours.${day.key}.is_working_day`,
                                    e.target.checked
                                  );
                                }}
                                size="small"
                              />
                            }
                            label={t('seasonalSchedules.form.workingDays.isWorkingDay')}
                          />
                        </Grid>

                        {daySchedule.is_working_day && (
                          <>
                            <Grid item xs={12} md={3}>
                              <TimePicker
                                label={t('seasonalSchedules.form.workingDays.startTime')}
                                value={daySchedule.start ? parse(daySchedule.start, 'HH:mm', new Date()) : null}
                                onChange={(time) => handleDayTimeChange(day.key, 'start', time)}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: 'small',
                                  },
                                }}
                              />
                            </Grid>

                            <Grid item xs={12} md={3}>
                              <TimePicker
                                label={t('seasonalSchedules.form.workingDays.endTime')}
                                value={daySchedule.end ? parse(daySchedule.end, 'HH:mm', new Date()) : null}
                                onChange={(time) => handleDayTimeChange(day.key, 'end', time)}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: 'small',
                                  },
                                }}
                              />
                            </Grid>

                            <Grid item xs={12} md={2}>
                              <Button
                                size="small"
                                onClick={() => copyToAllDays(day.key)}
                                variant="outlined"
                                fullWidth
                              >
                                {t('seasonalSchedules.form.workingDays.copyToAll')}
                              </Button>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>

        {/* Кнопки управления */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={onCancel} disabled={isLoading}>
            {t('seasonalSchedules.form.buttons.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading 
              ? (isEditing ? t('seasonalSchedules.form.buttons.saving') : t('seasonalSchedules.form.buttons.creating'))
              : (isEditing ? t('seasonalSchedules.form.buttons.save') : t('seasonalSchedules.form.buttons.create'))
            }
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}; 