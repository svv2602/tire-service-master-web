import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  Alert,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import type { ServicePointFormDataNew, ServicePost, ServicePoint } from '../../../types/models';
import type { WorkingHours } from '../../../types/working-hours';
import { DAYS_OF_WEEK } from '../../../types/working-hours';
import PostScheduleDialog from './PostScheduleDialog';

interface PostsStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const PostsStep: React.FC<PostsStepProps> = ({ formik, isEditMode, servicePoint }) => {
  // Принудительное обновление компонента
  const [, forceUpdate] = useState({});
  
  // Состояние для диалога индивидуальных настроек
  const [scheduleDialog, setScheduleDialog] = useState<{
    open: boolean;
    postIndex: number | null;
  }>({
    open: false,
    postIndex: null,
  });
  
  // Получаем посты из формы (исключая помеченные для удаления)
  const activePosts = formik.values.service_posts?.filter(post => !post._destroy) || [];

  // Отладка данных постов (упрощенная)
  console.log('PostsStep: количество постов в форме:', activePosts.length);
  if (activePosts.length > 0) {
    activePosts.forEach((post, index) => {
      console.log(`Post ${index}:`, {
        name: post.name,
        has_custom_schedule: post.has_custom_schedule,
        working_days: post.working_days,
        custom_hours: post.custom_hours
      });
    });
  }

  // Функция добавления нового поста
  const addNewPost = () => {
    const newPost: ServicePost = {
      id: Date.now(), // Временный ID для новых постов
      post_number: activePosts.length + 1,
      name: `Пост ${activePosts.length + 1}`,
      description: '',
      slot_duration: 30,
      is_active: true,
      has_custom_schedule: false,
      working_days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      custom_hours: {
        start: '09:00',
        end: '18:00',
      },
    };
    
    formik.setFieldValue('service_posts', [
      ...(formik.values.service_posts || []), 
      newPost
    ]);
  };

  // Функция удаления поста
  const removePost = (index: number) => {
    const updatedPosts = [...(formik.values.service_posts || [])];
    const postToRemove = updatedPosts[index];
    
    // Если пост имеет реальный ID (существует в БД), помечаем для удаления
    if (postToRemove.id && postToRemove.id < 1000000000000) {
      updatedPosts[index] = { ...postToRemove, _destroy: true };
    } else {
      // Для новых постов с временными ID просто удаляем из массива
      updatedPosts.splice(index, 1);
    }
    
    formik.setFieldValue('service_posts', updatedPosts);
  };

  // Функция обновления поста
  const updatePost = (index: number, field: keyof ServicePost, value: any) => {
    console.log(`updatePost: обновляем пост ${index}, поле ${String(field)}, значение:`, value);
    
    const updatedPosts = [...(formik.values.service_posts || [])];
    const currentPost = updatedPosts[index];
    
    console.log(`updatePost: текущий пост ${index} до изменений:`, currentPost);
    
    const updatedPost = {
      ...currentPost,
      [field]: value
    };
    
    updatedPosts[index] = updatedPost;
    
    console.log(`updatePost: обновленный пост ${index}:`, updatedPost);
    
    // Используем setFieldValue для обновления конкретного поста
    formik.setFieldValue('service_posts', updatedPosts);
    
    // Принудительно обновляем компонент
    forceUpdate({});
    
    console.log(`updatePost: все посты после обновления:`, formik.values.service_posts);
  };

  // Функции для работы с диалогом расписания
  const openScheduleDialog = (postIndex: number) => {
    setScheduleDialog({
      open: true,
      postIndex,
    });
  };

  const closeScheduleDialog = () => {
    setScheduleDialog({
      open: false,
      postIndex: null,
    });
  };

  const savePostSchedule = (updatedSchedule: Partial<ServicePost>) => {
    if (scheduleDialog.postIndex !== null) {
      console.log('savePostSchedule: начинаем сохранение для индекса', scheduleDialog.postIndex);
      console.log('savePostSchedule: данные для сохранения:', updatedSchedule);
      
      const updatedPosts = [...(formik.values.service_posts || [])];
      const currentPost = updatedPosts[scheduleDialog.postIndex];
      
      // Обновляем весь пост за один раз
      const updatedPost = {
        ...currentPost,
        ...updatedSchedule
      };
      
      // Если индивидуальное расписание отключено, обнуляем связанные поля
      if (!updatedSchedule.has_custom_schedule) {
        updatedPost.working_days = undefined;
        updatedPost.custom_hours = undefined;
      }
      
      updatedPosts[scheduleDialog.postIndex] = updatedPost;
      
      console.log('savePostSchedule: обновленный пост:', updatedPost);
      
      // Обновляем всю форму за один раз
      formik.setFieldValue('service_posts', updatedPosts);
      
      // Принудительно обновляем компонент
      forceUpdate({});
      
      console.log('savePostSchedule: сохранение завершено');
    }
  };

  // Функция получения ошибок валидации для конкретного поста
  const getPostError = (index: number, field: keyof ServicePost) => {
    const errors = formik.errors.service_posts;
    if (Array.isArray(errors) && errors[index] && typeof errors[index] === 'object') {
      return (errors[index] as any)[field];
    }
    return undefined;
  };

  const isPostTouched = (index: number, field: keyof ServicePost) => {
    const touched = formik.touched.service_posts;
    if (Array.isArray(touched) && touched[index] && typeof touched[index] === 'object') {
      return (touched[index] as any)[field];
    }
    return false;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Посты обслуживания
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Посты обслуживания определяют количество одновременных рабочих мест в сервисной точке. 
        Каждый пост может обслуживать одного клиента в заданное время.
      </Typography>

      {/* Кнопка добавления нового поста */}
      <Button
        variant="outlined"
        onClick={addNewPost}
        startIcon={<AddIcon />}
        sx={{ mb: 3 }}
        disabled={activePosts.length >= 10} // Ограничиваем максимальное количество постов
      >
        Добавить пост
      </Button>

      {activePosts.length >= 10 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Достигнуто максимальное количество постов (10)
        </Alert>
      )}

      {/* Список постов */}
      {activePosts.length > 0 ? (
        <Grid container spacing={3}>
          {formik.values.service_posts?.map((post, index) => {
            // Пропускаем посты, помеченные для удаления
            if (post._destroy) {
              return null;
            }
            
            return (
              <Grid item xs={12} md={6} key={post.id || index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" color="primary">
                        Пост №{post.post_number}
                      </Typography>
                      <Tooltip title="Удалить пост">
                        <IconButton
                          color="error"
                          onClick={() => removePost(index)}
                          size="small"
                          disabled={activePosts.length === 1} // Не позволяем удалить последний пост
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Название поста"
                      value={post.name}
                      onChange={(e) => updatePost(index, 'name', e.target.value)}
                      onBlur={() => formik.setFieldTouched(`service_posts.${index}.name`, true)}
                      error={isPostTouched(index, 'name') && Boolean(getPostError(index, 'name'))}
                      helperText={isPostTouched(index, 'name') && getPostError(index, 'name')}
                      margin="normal"
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Описание"
                      value={post.description || ''}
                      onChange={(e) => updatePost(index, 'description', e.target.value)}
                      multiline
                      rows={2}
                      margin="normal"
                      placeholder="Краткое описание поста обслуживания"
                    />
                    
                    <TextField
                      fullWidth
                      type="number"
                      label="Длительность слота"
                      value={post.slot_duration}
                      onChange={(e) => updatePost(index, 'slot_duration', Number(e.target.value))}
                      onBlur={() => formik.setFieldTouched(`service_posts.${index}.slot_duration`, true)}
                      error={isPostTouched(index, 'slot_duration') && Boolean(getPostError(index, 'slot_duration'))}
                      helperText={
                        isPostTouched(index, 'slot_duration') && getPostError(index, 'slot_duration') ||
                        'Стандартная продолжительность одного слота записи'
                      }
                      InputProps={{
                        inputProps: { min: 5, max: 480 },
                        endAdornment: <InputAdornment position="end">мин</InputAdornment>
                      }}
                      margin="normal"
                      required
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={post.is_active}
                          onChange={(e) => updatePost(index, 'is_active', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Пост активен"
                      sx={{ mt: 1 }}
                    />

                    {/* Настройки индивидуального расписания */}
                    <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color={post.has_custom_schedule ? 'primary' : 'disabled'} />
                          <Typography variant="subtitle2">
                            Индивидуальное расписание
                          </Typography>
                          <Chip 
                            label={post.has_custom_schedule ? 'Включено' : 'Выключено'}
                            color={post.has_custom_schedule ? 'primary' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<SettingsIcon />}
                          onClick={() => openScheduleDialog(index)}
                        >
                          Настроить
                        </Button>
                      </Box>
                      
                      {post.has_custom_schedule && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            <strong>Рабочие дни:</strong> {
                              post.working_days 
                                ? Object.entries(post.working_days)
                                    .filter(([_, isWorking]) => isWorking)
                                    .map(([day]) => {
                                      const dayNames: { [key: string]: string } = {
                                        monday: 'Пн', tuesday: 'Вт', wednesday: 'Ср',
                                        thursday: 'Чт', friday: 'Пт', saturday: 'Сб', sunday: 'Вс'
                                      };
                                      return dayNames[day];
                                    })
                                    .join(', ')
                                : 'Не настроены'
                            }
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            <strong>Время работы:</strong> {
                              post.custom_hours 
                                ? `${post.custom_hours.start} - ${post.custom_hours.end}`
                                : 'Не настроено'
                            }
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Пока не добавлено ни одного поста обслуживания
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Добавьте хотя бы один пост для определения рабочих мест в сервисной точке. 
            Каждый пост может одновременно обслуживать одного клиента.
          </Typography>
        </Alert>
      )}

      {/* Валидационные ошибки на уровне всего массива */}
      {formik.touched.service_posts && typeof formik.errors.service_posts === 'string' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {formik.errors.service_posts}
        </Alert>
      )}

      {/* Информационная подсказка */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💡 <strong>Совет:</strong> Количество постов определяет пропускную способность сервисной точки. 
          Рекомендуется создавать посты с разной специализацией (например, "Легковые автомобили", "Грузовые автомобили").
        </Typography>
      </Alert>

      {/* Предварительный просмотр расписания слотов */}
      {activePosts.length > 0 && formik.values.working_hours && (
        <SlotSchedulePreview 
          workingHours={formik.values.working_hours}
          activePosts={activePosts}
        />
      )}

      {/* Диалог настройки индивидуального расписания */}
      {scheduleDialog.open && scheduleDialog.postIndex !== null && (
        <PostScheduleDialog
          open={scheduleDialog.open}
          onClose={closeScheduleDialog}
          post={formik.values.service_posts![scheduleDialog.postIndex]}
          onSave={savePostSchedule}
        />
      )}
    </Box>
  );
};

// Компонент для предварительного просмотра расписания слотов
interface SlotSchedulePreviewProps {
  workingHours: any;
  activePosts: ServicePost[];
}

const SlotSchedulePreview: React.FC<SlotSchedulePreviewProps> = ({ workingHours, activePosts }) => {
  const [selectedDay, setSelectedDay] = useState<string>('monday');

  // Генерируем временные слоты для выбранного дня
  const generateTimeSlots = (dayKey: string) => {
    const dayHours = workingHours[dayKey] as WorkingHours;
    if (!dayHours.is_working_day) {
      return [];
    }

    // Получаем посты, которые работают в этот день
    const availablePostsForDay = activePosts.filter(post => {
      if (!post.is_active) return false;
      
      // Если у поста есть индивидуальное расписание, проверяем его рабочие дни
      if (post.has_custom_schedule && post.working_days) {
        return post.working_days[dayKey as keyof typeof post.working_days];
      }
      
      // Если нет индивидуального расписания, используем расписание точки
      return true;
    });

    if (availablePostsForDay.length === 0) {
      return [];
    }

    const slots = [];
    
    // Определяем общее время работы для дня (берем пересечение всех рабочих времен)
    let earliestStart = new Date(`2024-01-01 ${dayHours.start}:00`);
    let latestEnd = new Date(`2024-01-01 ${dayHours.end}:00`);
    
    // Корректируем время с учетом индивидуальных расписаний постов
    availablePostsForDay.forEach(post => {
      if (post.has_custom_schedule && post.custom_hours) {
        const postStart = new Date(`2024-01-01 ${post.custom_hours.start}:00`);
        const postEnd = new Date(`2024-01-01 ${post.custom_hours.end}:00`);
        
        // Начало - максимальное из всех начал (пересечение)
        if (postStart > earliestStart) {
          earliestStart = postStart;
        }
        // Конец - минимальное из всех концов (пересечение)
        if (postEnd < latestEnd) {
          latestEnd = postEnd;
        }
      }
    });
    
    // Генерируем слоты с интервалом 15 минут
    const current = new Date(earliestStart);
    while (current < latestEnd) {
      const timeString = current.toTimeString().substring(0, 5);
      
      // Подсчитываем доступные посты на это время
      const availablePostsAtTime = availablePostsForDay.filter(post => {
        if (!post.is_active) return false;
        
        // Проверяем, работает ли пост в это время
        if (post.has_custom_schedule && post.custom_hours) {
          const postStart = new Date(`2024-01-01 ${post.custom_hours.start}:00`);
          const postEnd = new Date(`2024-01-01 ${post.custom_hours.end}:00`);
          return current >= postStart && current < postEnd;
        }
        
        // Если нет индивидуального расписания, используем расписание точки
        const pointStart = new Date(`2024-01-01 ${dayHours.start}:00`);
        const pointEnd = new Date(`2024-01-01 ${dayHours.end}:00`);
        return current >= pointStart && current < pointEnd;
      });
      
      slots.push({
        time: timeString,
        availablePosts: availablePostsAtTime.length,
        totalPosts: activePosts.length,
        isAvailable: availablePostsAtTime.length > 0,
        postDetails: availablePostsAtTime.map(post => ({
          name: post.name,
          number: post.post_number,
          hasCustomSchedule: post.has_custom_schedule || false
        }))
      });
      
      current.setMinutes(current.getMinutes() + 15);
    }
    
    return slots;
  };

  const workingDays = DAYS_OF_WEEK.filter(day => {
    const dayHours = workingHours[day.key] as WorkingHours;
    return dayHours.is_working_day;
  });

  const selectedDayInfo = DAYS_OF_WEEK.find(day => day.key === selectedDay);
  const timeSlots = generateTimeSlots(selectedDay);

  if (workingDays.length === 0) {
    return null;
  }

  return (
    <Accordion sx={{ mt: 3 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="schedule-preview-content"
        id="schedule-preview-header"
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Предварительный просмотр расписания слотов
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Здесь показано как будет выглядеть расписание доступности постов обслуживания на основе 
          настроенного графика работы и количества активных постов.
        </Typography>

        {/* Выбор дня недели */}
        <FormControl sx={{ mb: 3, minWidth: 200 }}>
          <InputLabel>День недели</InputLabel>
          <Select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            label="День недели"
          >
            {workingDays.map((day) => (
              <MenuItem key={day.key} value={day.key}>
                {day.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {timeSlots.length > 0 ? (
          <>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6">
                {selectedDayInfo?.name} - Доступность постов
              </Typography>
              <Chip 
                label={`${activePosts.filter(p => p.is_active).length} активных постов`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Время</strong></TableCell>
                    <TableCell><strong>Доступные посты</strong></TableCell>
                    <TableCell><strong>Детали постов</strong></TableCell>
                    <TableCell><strong>Статус</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSlots.map((slot, index) => (
                    <TableRow 
                      key={slot.time}
                      sx={{ 
                        backgroundColor: index % 2 === 0 ? 'grey.50' : 'transparent',
                        '&:hover': { backgroundColor: 'grey.100' }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {slot.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {slot.availablePosts} из {slot.totalPosts}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {slot.postDetails?.map((post) => (
                            <Chip
                              key={post.number}
                              label={`${post.name}${post.hasCustomSchedule ? ' (инд.)' : ''}`}
                              size="small"
                              variant="outlined"
                              color={post.hasCustomSchedule ? 'secondary' : 'default'}
                            />
                          ))}
                          {slot.availablePosts === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Нет доступных постов
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={slot.isAvailable ? 'Доступно' : 'Недоступно'}
                          color={slot.isAvailable ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                📅 Слоты генерируются с учетом индивидуальной длительности слота каждого поста в рамках рабочего времени. 
                Количество доступных постов зависит от активных постов обслуживания и их индивидуальных расписаний.
                <br />
                💡 Посты с пометкой "(инд.)" работают по индивидуальному расписанию, которое может отличаться от графика точки обслуживания.
              </Typography>
            </Alert>
          </>
        ) : (
          <Alert severity="warning">
            <Typography variant="body2">
              {selectedDayInfo?.name} - выходной день. Выберите рабочий день для просмотра расписания.
            </Typography>
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default PostsStep; 