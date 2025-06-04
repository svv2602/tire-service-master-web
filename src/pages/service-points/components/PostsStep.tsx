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
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import type { ServicePointFormDataNew, ServicePost, ServicePoint } from '../../../types/models';
import type { WorkingHours } from '../../../types/working-hours';
import { DAYS_OF_WEEK } from '../../../types/working-hours';

interface PostsStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const PostsStep: React.FC<PostsStepProps> = ({ formik, isEditMode, servicePoint }) => {
  // Получаем посты из формы (исключая помеченные для удаления)
  const activePosts = formik.values.service_posts?.filter(post => !post._destroy) || [];

  // Функция добавления нового поста
  const addNewPost = () => {
    const newPost: ServicePost = {
      id: Date.now(), // Временный ID для новых постов
      post_number: activePosts.length + 1,
      name: `Пост ${activePosts.length + 1}`,
      description: '',
      slot_duration: 30,
      is_active: true,
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
    const updatedPosts = [...(formik.values.service_posts || [])];
    updatedPosts[index] = { ...updatedPosts[index], [field]: value };
    formik.setFieldValue('service_posts', updatedPosts);
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
          {formik.values.service_posts
            ?.filter(post => !post._destroy) // Показываем только не удаленные посты
            ?.map((post, filteredIndex) => {
              // Находим оригинальный индекс в полном массиве
              const originalIndex = formik.values.service_posts?.findIndex(p => p.id === post.id) ?? -1;
              
              return (
                <Grid item xs={12} md={6} key={post.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="primary">
                          Пост №{post.post_number}
                        </Typography>
                        <Tooltip title="Удалить пост">
                          <IconButton
                            color="error"
                            onClick={() => removePost(originalIndex)}
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
                        onChange={(e) => updatePost(originalIndex, 'name', e.target.value)}
                        onBlur={() => formik.setFieldTouched(`service_posts.${originalIndex}.name`, true)}
                        error={isPostTouched(originalIndex, 'name') && Boolean(getPostError(originalIndex, 'name'))}
                        helperText={isPostTouched(originalIndex, 'name') && getPostError(originalIndex, 'name')}
                        margin="normal"
                        required
                      />
                      
                      <TextField
                        fullWidth
                        label="Описание"
                        value={post.description || ''}
                        onChange={(e) => updatePost(originalIndex, 'description', e.target.value)}
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
                        onChange={(e) => updatePost(originalIndex, 'slot_duration', Number(e.target.value))}
                        onBlur={() => formik.setFieldTouched(`service_posts.${originalIndex}.slot_duration`, true)}
                        error={isPostTouched(originalIndex, 'slot_duration') && Boolean(getPostError(originalIndex, 'slot_duration'))}
                        helperText={
                          isPostTouched(originalIndex, 'slot_duration') && getPostError(originalIndex, 'slot_duration') ||
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
                            onChange={(e) => updatePost(originalIndex, 'is_active', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Пост активен"
                        sx={{ mt: 1 }}
                      />
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

    const slots = [];
    const startTime = new Date(`2024-01-01 ${dayHours.start}:00`);
    const endTime = new Date(`2024-01-01 ${dayHours.end}:00`);
    
    // Генерируем слоты с интервалом 15 минут
    const current = new Date(startTime);
    while (current < endTime) {
      const timeString = current.toTimeString().substring(0, 5);
      
      // Подсчитываем доступные посты на это время
      const availablePosts = activePosts.filter(post => post.is_active).length;
      
      slots.push({
        time: timeString,
        availablePosts,
        totalPosts: activePosts.length,
        isAvailable: availablePosts > 0
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
                📅 Слоты генерируются с интервалом 15 минут в рамках рабочего времени. 
                Количество доступных постов зависит от активных постов обслуживания.
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