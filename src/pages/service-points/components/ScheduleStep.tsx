import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  Alert,
} from '@mui/material';
import { FormikProps } from 'formik';
import type { ServicePointFormDataNew, ServicePoint } from '../../../types/models';
import { DAYS_OF_WEEK, getDayName } from '../../../types/working-hours';
import type { DayOfWeek, WorkingHoursSchedule, WorkingHours } from '../../../types/working-hours';

interface ScheduleStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

// Пустое расписание для новых точек
const emptyWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: false // Все дни изначально выключены
  };
  acc[day.key] = workingHours;
  return acc;
}, {} as WorkingHoursSchedule);

// Стандартное расписание для быстрого заполнения
const defaultWorkingHours: WorkingHoursSchedule = DAYS_OF_WEEK.reduce<WorkingHoursSchedule>((acc, day) => {
  const workingHours: WorkingHours = {
    start: '09:00',
    end: '18:00',
    is_working_day: day.id < 6 // Пн-Пт рабочие дни
  };
  acc[day.key] = workingHours;
  return acc;
}, {} as WorkingHoursSchedule);

const ScheduleStep: React.FC<ScheduleStepProps> = ({ formik, isEditMode, servicePoint }) => {
  // Инициализируем расписание пустым шаблоном для новых точек
  React.useEffect(() => {
    if (!formik.values.working_hours || Object.keys(formik.values.working_hours).length === 0) {
      // Для новых точек - пустое расписание, для редактирования - данные из servicePoint
      const initialSchedule = isEditMode && servicePoint?.working_hours 
        ? servicePoint.working_hours 
        : emptyWorkingHours;
      formik.setFieldValue('working_hours', initialSchedule);
    }
  }, [formik, isEditMode, servicePoint]);

  const workingHours = formik.values.working_hours as WorkingHoursSchedule || emptyWorkingHours;

  // Проверяем есть ли хотя бы один рабочий день
  const hasWorkingDays = DAYS_OF_WEEK.some(day => 
    workingHours[day.key]?.is_working_day
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        График работы
      </Typography>

      {!hasWorkingDays && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Необходимо указать хотя бы один рабочий день
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {DAYS_OF_WEEK.map((day: DayOfWeek) => {
          const dayHours = workingHours[day.key] || {
            start: '09:00',
            end: '18:00',
            is_working_day: false
          };

          return (
            <Grid item xs={12} md={6} key={day.id}>
              <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" gutterBottom>
                  {day.name}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={dayHours.is_working_day}
                          onChange={(e) => {
                            const newWorkingHours = {
                              ...workingHours,
                              [day.key]: {
                                ...dayHours,
                                is_working_day: e.target.checked
                              }
                            };
                            formik.setFieldValue('working_hours', newWorkingHours);
                          }}
                          name={`working_hours.${day.key}.is_working_day`}
                        />
                      }
                      label="Рабочий день"
                    />
                  </Grid>

                  {dayHours.is_working_day && (
                    <>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Начало работы"
                          value={dayHours.start}
                          onChange={(e) => {
                            const newWorkingHours = {
                              ...workingHours,
                              [day.key]: {
                                ...dayHours,
                                start: e.target.value
                              }
                            };
                            formik.setFieldValue('working_hours', newWorkingHours);
                          }}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Конец работы"
                          value={dayHours.end}
                          onChange={(e) => {
                            const newWorkingHours = {
                              ...workingHours,
                              [day.key]: {
                                ...dayHours,
                                end: e.target.value
                              }
                            };
                            formik.setFieldValue('working_hours', newWorkingHours);
                          }}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Быстрые действия */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          Быстрые действия:
        </Typography>
        
        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            const newWorkingHours = { ...workingHours };
            DAYS_OF_WEEK.forEach(day => {
              if (day.id >= 1 && day.id <= 5) { // Пн-Пт (id: 1-5)
                newWorkingHours[day.key] = {
                  start: '09:00',
                  end: '18:00',
                  is_working_day: true
                };
              } else { // Сб-Вс (id: 0, 6)
                newWorkingHours[day.key] = {
                  start: '09:00',
                  end: '18:00',
                  is_working_day: false
                };
              }
            });
            formik.setFieldValue('working_hours', newWorkingHours);
          }}
        >
          Стандартный график (Пн-Пт 9:00-18:00)
        </Typography>

        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            const newWorkingHours = { ...workingHours };
            DAYS_OF_WEEK.forEach(day => {
              newWorkingHours[day.key] = {
                start: '08:00',
                end: '20:00',
                is_working_day: true
              };
            });
            formik.setFieldValue('working_hours', newWorkingHours);
          }}
        >
          Ежедневно (8:00-20:00)
        </Typography>

        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            const newWorkingHours = { ...workingHours };
            DAYS_OF_WEEK.forEach(day => {
              newWorkingHours[day.key] = {
                start: '09:00',
                end: '18:00',
                is_working_day: false
              };
            });
            formik.setFieldValue('working_hours', newWorkingHours);
          }}
        >
          Очистить все
        </Typography>
      </Box>
    </Box>
  );
};

export default ScheduleStep; 