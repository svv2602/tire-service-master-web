import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Event as EventIcon } from '@mui/icons-material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import type { ServicePointFormDataNew, ServicePoint } from '../../../types/models';
import { DAYS_OF_WEEK, getDayName } from '../../../types/working-hours';
import type { DayOfWeek, WorkingHoursSchedule, WorkingHours } from '../../../types/working-hours';

// Импорт компонентов сезонных расписаний
import { SeasonalScheduleManager } from '../../../components/seasonal-schedules/SeasonalScheduleManager';
import SeasonalScheduleInfo from '../../../components/seasonal-schedules/SeasonalScheduleInfo';

// Импорт компонента предварительного просмотра конфликтов
import ConflictsPreview from '../../../components/booking-conflicts/ConflictsPreview';

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
  const { t } = useTranslation();
  // Отладочная информация
  console.log('=== ScheduleStep Debug ===');
  console.log('isEditMode:', isEditMode);
  console.log('servicePoint?.working_hours:', servicePoint?.working_hours);
  console.log('formik.values.working_hours:', formik.values.working_hours);
  
  // Инициализируем расписание пустым шаблоном для новых точек
  React.useEffect(() => {
    console.log('=== ScheduleStep useEffect ===');
    console.log('formik.values.working_hours:', formik.values.working_hours);
    console.log('Object.keys(formik.values.working_hours || {}).length:', Object.keys(formik.values.working_hours || {}).length);
    
    if (!formik.values.working_hours || Object.keys(formik.values.working_hours).length === 0) {
      // Для новых точек - пустое расписание, для редактирования - данные из servicePoint
      const initialSchedule = isEditMode && servicePoint?.working_hours 
        ? servicePoint.working_hours 
        : emptyWorkingHours;
      console.log('Устанавливаем начальное расписание:', initialSchedule);
      formik.setFieldValue('working_hours', initialSchedule);
    }
  }, [formik, isEditMode, servicePoint]);

  const workingHours = formik.values.working_hours as WorkingHoursSchedule || emptyWorkingHours;

  // Нормализуем working_hours - преобразуем строковые is_working_day в boolean
  const normalizedWorkingHours: WorkingHoursSchedule = React.useMemo(() => {
    const normalized = {} as WorkingHoursSchedule;
    DAYS_OF_WEEK.forEach(day => {
      const dayHours = workingHours[day.key];
      if (dayHours) {
        normalized[day.key] = {
          start: dayHours.start,
          end: dayHours.end,
          is_working_day: dayHours.is_working_day === true || (dayHours.is_working_day as any) === 'true'
        };
      } else {
        normalized[day.key] = {
          start: '09:00',
          end: '18:00',
          is_working_day: false
        };
      }
    });
    return normalized;
  }, [workingHours]);

  // Проверяем есть ли хотя бы один рабочий день
  const hasWorkingDays = DAYS_OF_WEEK.some(day => 
    normalizedWorkingHours[day.key]?.is_working_day
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        {t('forms.servicePoint.steps.schedule')}
      </Typography>

      {!hasWorkingDays && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('forms.servicePoint.schedule.atLeastOneWorkingDay')}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {DAYS_OF_WEEK.map((day: DayOfWeek) => {
          const dayHours = normalizedWorkingHours[day.key] || {
            start: '09:00',
            end: '18:00',
            is_working_day: false
          };

          return (
            <Grid item xs={12} md={6} key={day.id}>
              <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t(`forms.servicePoint.days.${day.key}`)}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={dayHours.is_working_day}
                          onChange={(e) => {
                            console.log(`Изменение рабочего дня ${day.name}: ${dayHours.is_working_day} -> ${e.target.checked}`);
                            const newWorkingHours = {
                              ...normalizedWorkingHours,
                              [day.key]: {
                                ...dayHours,
                                is_working_day: e.target.checked
                              }
                            };
                            console.log('Новое расписание:', newWorkingHours);
                            formik.setFieldValue('working_hours', newWorkingHours);
                          }}
                          name={`working_hours.${day.key}.is_working_day`}
                        />
                      }
                      label={t('forms.servicePoint.schedule.workingDay')}
                    />
                  </Grid>

                  {dayHours.is_working_day && (
                    <>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label={t('forms.servicePoint.schedule.startTime')}
                          value={dayHours.start}
                          onChange={(e) => {
                            const newWorkingHours = {
                              ...normalizedWorkingHours,
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
                          label={t('forms.servicePoint.schedule.endTime')}
                          value={dayHours.end}
                          onChange={(e) => {
                            const newWorkingHours = {
                              ...normalizedWorkingHours,
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
          {t('forms.servicePoint.schedule.quickActions')}:
        </Typography>
        
        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            const newWorkingHours = { ...normalizedWorkingHours };
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
          {t('forms.servicePoint.schedule.standardSchedule')}
        </Typography>

        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            const newWorkingHours = { ...normalizedWorkingHours };
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
          {t('forms.servicePoint.schedule.dailySchedule')}
        </Typography>

        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            const newWorkingHours = { ...normalizedWorkingHours };
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
          {t('forms.servicePoint.schedule.clearAll')}
        </Typography>
      </Box>

      {/* Сезонные расписания */}
      {isEditMode && servicePoint?.id && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          
          {/* Информационная панель */}
          <Box sx={{ mb: 3 }}>
            <SeasonalScheduleInfo servicePointId={servicePoint.id.toString()} />
          </Box>
          
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="seasonal-schedules-content"
              id="seasonal-schedules-header"
            >
              <Box>
                <Typography variant="h6">
                  {t('seasonalSchedules.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('seasonalSchedules.description')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <SeasonalScheduleManager
                servicePointId={servicePoint.id.toString()}
                servicePointName={servicePoint.name}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Предварительный просмотр конфликтов */}
      {isEditMode && servicePoint?.id && (
        <Box sx={{ mt: 4 }}>
          <ConflictsPreview
            servicePointId={servicePoint.id}
            title={t('conflictsPreview.titles.schedule', { ns: 'components' })}
            description={t('conflictsPreview.descriptions.schedule', { ns: 'components' })}
            formData={formik.values}
            useFormData={true}
          />
        </Box>
      )}

      {/* Информация для новых сервисных точек */}
      {(!isEditMode || !servicePoint?.id) && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          
          {/* Информационная панель для новых точек */}
          <Paper 
            sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider',
              backgroundColor: 'background.default',
              mb: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <EventIcon color="disabled" />
              <Typography variant="body2" color="text.secondary">
                {t('seasonalSchedules.notConfigured')}
              </Typography>
            </Box>
          </Paper>
          
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              {t('seasonalSchedules.infoTitle')}
            </Typography>
            <Typography variant="body2">
              {t('seasonalSchedules.infoDescription')}
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default ScheduleStep; 