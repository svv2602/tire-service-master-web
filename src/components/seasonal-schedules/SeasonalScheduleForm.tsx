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

// Дни недели
const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Понедельник' },
  { key: 'tuesday', label: 'Вторник' },
  { key: 'wednesday', label: 'Среда' },
  { key: 'thursday', label: 'Четверг' },
  { key: 'friday', label: 'Пятница' },
  { key: 'saturday', label: 'Суббота' },
  { key: 'sunday', label: 'Воскресенье' },
];

// Схема валидации
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Название обязательно')
    .max(255, 'Название не должно превышать 255 символов'),
  description: Yup.string()
    .max(1000, 'Описание не должно превышать 1000 символов'),
  start_date: Yup.date()
    .required('Дата начала обязательна')
    .min(new Date(), 'Дата начала не может быть в прошлом'),
  end_date: Yup.date()
    .required('Дата окончания обязательна')
    .min(Yup.ref('start_date'), 'Дата окончания должна быть после даты начала'),
  priority: Yup.number()
    .required('Приоритет обязателен')
    .min(0, 'Приоритет не может быть отрицательным')
    .max(100, 'Приоритет не может быть больше 100'),
});

export const SeasonalScheduleForm: React.FC<SeasonalScheduleFormProps> = ({
  servicePointId,
  schedule,
  onSuccess,
  onCancel,
}) => {
  const [createSchedule, { isLoading: isCreating }] = useCreateSeasonalScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateSeasonalScheduleMutation();

  const isEditing = !!schedule;
  const isLoading = isCreating || isUpdating;

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

  // Обработчики для изменения расписания дня
  const handleDayWorkingChange = (dayKey: string, isWorking: boolean) => {
    formik.setFieldValue(`working_hours.${dayKey}.is_working_day`, isWorking);
  };

  const handleDayTimeChange = (dayKey: string, timeType: 'start' | 'end', value: Date | null) => {
    if (value) {
      const timeString = format(value, 'HH:mm');
      formik.setFieldValue(`working_hours.${dayKey}.${timeType}`, timeString);
    }
  };

  // Функция для копирования расписания на все дни
  const copyToAllDays = (sourceDayKey: string) => {
    const sourceSchedule = formik.values.working_hours[sourceDayKey];
    const newWorkingHours = { ...formik.values.working_hours };
    
    DAYS_OF_WEEK.forEach(day => {
      if (day.key !== sourceDayKey) {
        newWorkingHours[day.key] = { ...sourceSchedule };
      }
    });
    
    formik.setFieldValue('working_hours', newWorkingHours);
  };

  // Функция для быстрого заполнения рабочих дней
  const setWorkingDaysPattern = (pattern: 'weekdays' | 'all' | 'none') => {
    const newWorkingHours = { ...formik.values.working_hours };
    
    DAYS_OF_WEEK.forEach(day => {
      switch (pattern) {
        case 'weekdays':
          newWorkingHours[day.key].is_working_day = !['saturday', 'sunday'].includes(day.key);
          break;
        case 'all':
          newWorkingHours[day.key].is_working_day = true;
          break;
        case 'none':
          newWorkingHours[day.key].is_working_day = false;
          break;
      }
    });
    
    formik.setFieldValue('working_hours', newWorkingHours);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
        {/* Основная информация */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Основная информация" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название расписания"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  placeholder="Например: Летнее расписание, Новогодние каникулы"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Описание"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  placeholder="Дополнительная информация о расписании"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Дата начала"
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
                  label="Дата окончания"
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
                <Box>
                  <Typography gutterBottom>
                    Приоритет: {formik.values.priority}
                  </Typography>
                  <Slider
                    value={formik.values.priority}
                    onChange={(_, value) => formik.setFieldValue('priority', value)}
                    min={0}
                    max={100}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Чем выше приоритет, тем важнее расписание при пересечении периодов
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.is_active}
                      onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    />
                  }
                  label="Активное расписание"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Расписание работы */}
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Расписание работы"
            action={
              <Box display="flex" gap={1}>
                <Button size="small" onClick={() => setWorkingDaysPattern('weekdays')}>
                  Пн-Пт
                </Button>
                <Button size="small" onClick={() => setWorkingDaysPattern('all')}>
                  Все дни
                </Button>
                <Button size="small" onClick={() => setWorkingDaysPattern('none')}>
                  Выходные
                </Button>
              </Box>
            }
          />
          <CardContent>
            {/* Информация о постах с индивидуальным расписанием */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Важная информация о постах обслуживания
              </Typography>
              <Typography variant="body2">
                Если у сервисной точки есть посты с индивидуальным расписанием, они будут продолжать работать по своему расписанию, 
                игнорируя данное сезонное расписание. Сезонное расписание влияет только на посты, которые используют общее расписание точки.
              </Typography>
            </Alert>
            <Grid container spacing={2}>
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = formik.values.working_hours[day.key];
                return (
                  <Grid item xs={12} key={day.key}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: daySchedule.is_working_day 
                          ? (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(102, 187, 106, 0.15)' // Светло-зеленый с прозрачностью для темной темы
                            : 'success.light'             // Обычный зеленый для светлой темы
                          : (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)' // Слабый белый для темной темы
                            : 'grey.100',                  // Серый для светлой темы
                        opacity: daySchedule.is_working_day ? 1 : 0.6,
                        color: daySchedule.is_working_day
                          ? (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.87)' // Белый текст для темной темы
                            : 'text.primary'               // Обычный текст для светлой темы
                          : 'text.secondary',
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={daySchedule.is_working_day}
                                onChange={(e) => handleDayWorkingChange(day.key, e.target.checked)}
                              />
                            }
                            label={day.label}
                          />
                        </Grid>

                        {daySchedule.is_working_day && (
                          <>
                                                         <Grid item xs={12} md={3}>
                               <TimePicker
                                 label="Начало"
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
                                 label="Окончание"
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

                            <Grid item xs={12} md={3}>
                              <Button
                                size="small"
                                onClick={() => copyToAllDays(day.key)}
                                variant="outlined"
                                fullWidth
                              >
                                Копировать на все дни
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
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isEditing ? 'Сохранить изменения' : 'Создать расписание'}
          </Button>
        </Box>

        {/* Ошибки формы */}
        {formik.errors.start_date && formik.touched.start_date && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formik.errors.start_date}
          </Alert>
        )}
        {formik.errors.end_date && formik.touched.end_date && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formik.errors.end_date}
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
}; 