import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  Alert,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,

  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import type { ServicePointFormDataNew, ServicePost, ServicePoint } from '../../../types/models';
import type { WorkingHours } from '../../../types/working-hours';
import { DAYS_OF_WEEK } from '../../../types/working-hours';
import PostScheduleDialog from './PostScheduleDialog';
import { useGetSchedulePreviewQuery, useCalculateSchedulePreviewMutation } from '../../../api/servicePoints.api';
import { useGetServiceCategoriesQuery } from '../../../api/serviceCategories.api';
import { 
  SIZES, 
  getCardStyles, 
  getButtonStyles, 
  getTextFieldStyles, 
  getChipStyles, 
  getFormStyles,
  getTableStyles 
} from '../../../styles';
import { Table } from '../../../components/ui';
import type { Column } from '../../../components/ui';
import { useTranslation } from 'react-i18next';

interface PostsStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const PostsStep: React.FC<PostsStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { t } = useTranslation();
  // Хук темы для использования централизованных стилей
  const theme = useTheme();
  
  // Получаем категории услуг
  const { data: categoriesData, isLoading: categoriesLoading } = useGetServiceCategoriesQuery({});
  const categories = categoriesData?.data || [];
  
  // Получаем стили из централизованной системы
  const cardStyles = getCardStyles(theme);
  const buttonStyles = getButtonStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);
  const chipStyles = getChipStyles(theme);
  const formStyles = getFormStyles(theme);
  const tableStyles = getTableStyles(theme);

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

  // Функция для пересчета номеров постов (если есть дубликаты)
  const recalculatePostNumbers = () => {
    const allPosts = formik.values.service_posts || [];
    const postNumbers = new Set<number>();
    let needsUpdate = false;
    
    const updatedPosts = allPosts.map((post, index) => {
      if (post._destroy) return post; // Не изменяем удаленные посты
      
      if (postNumbers.has(post.post_number)) {
        // Есть дубликат, нужно найти новый номер
        let newNumber = 1;
        while (postNumbers.has(newNumber)) {
          newNumber++;
        }
        postNumbers.add(newNumber);
        needsUpdate = true;
        console.log(`Обнаружен дубликат post_number ${post.post_number}, заменяем на ${newNumber}`);
        return { ...post, post_number: newNumber, name: `Пост ${newNumber}` };
      } else {
        postNumbers.add(post.post_number);
        return post;
      }
    });
    
    if (needsUpdate) {
      console.log('Пересчитываем номера постов для устранения дубликатов');
      formik.setFieldValue('service_posts', updatedPosts);
    }
  };

  // Проверяем на дубликаты при изменении постов
  useEffect(() => {
    recalculatePostNumbers();
  }, [formik.values.service_posts?.length]);

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
    // Находим максимальный post_number среди всех постов (включая помеченные для удаления)
    const allPosts = formik.values.service_posts || [];
    const maxPostNumber = allPosts.length > 0 
      ? Math.max(...allPosts.map(post => post.post_number || 0))
      : 0;
    
    const newPostNumber = maxPostNumber + 1;
    
    // Используем первую доступную категорию или категорию по умолчанию
    const defaultCategoryId = categories.length > 0 ? categories[0].id : 1;
    
    const newPost: ServicePost = {
      id: Date.now(), // Временный ID для новых постов
      post_number: newPostNumber,
      name: `Пост ${newPostNumber}`,
      description: '',
      slot_duration: 30,
      is_active: true,
      service_category_id: defaultCategoryId,
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
    
    console.log('addNewPost: создаем новый пост с номером', newPostNumber, 'максимальный был', maxPostNumber);
    
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
    <Box sx={formStyles.container}>
      {/* Заголовок секции с иконкой */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: SIZES.spacing.lg }}>
        <BuildIcon sx={{ mr: SIZES.spacing.sm, color: 'primary.main' }} />
        <Typography 
          variant="h6"
          sx={{
            fontSize: SIZES.fontSize.lg,
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          {t('forms.servicePoint.posts.title')}
        </Typography>
      </Box>

      {/* Описание секции */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: SIZES.spacing.lg,
          fontSize: SIZES.fontSize.sm
        }}
      >
        {t('forms.servicePoint.posts.description')}
      </Typography>

      {/* Кнопка добавления нового поста */}
      <Button
        variant="outlined"
        onClick={addNewPost}
        startIcon={<AddIcon />}
        sx={{ 
          ...buttonStyles,
          mb: SIZES.spacing.lg,
          borderRadius: SIZES.borderRadius.sm
        }}
        disabled={activePosts.length >= 10} // Ограничиваем максимальное количество активных постов
      >
        {t('forms.servicePoint.posts.addPost')}
      </Button>

      {/* Предупреждение о максимальном количестве постов */}
      {activePosts.length >= 10 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: SIZES.spacing.md,
            borderRadius: SIZES.borderRadius.sm,
            fontSize: SIZES.fontSize.sm
          }}
        >
          {t('forms.servicePoint.posts.maxPostsWarning')}
        </Alert>
      )}

      {/* Список постов */}
      {activePosts.length > 0 ? (
        <Grid container spacing={SIZES.spacing.lg}>
          {formik.values.service_posts?.map((post, index) => {
            // Пропускаем посты, помеченные для удаления
            if (post._destroy) {
              return null;
            }
            
            return (
              <Grid item xs={12} md={6} key={post.id || index}>
                <Card sx={{ 
                  ...cardStyles,
                  height: '100%',
                  borderRadius: SIZES.borderRadius.md
                }}>
                  <CardContent sx={{ p: SIZES.spacing.lg }}>
                    {/* Заголовок карточки поста */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: SIZES.spacing.md 
                    }}>
                      <Typography 
                        variant="h6" 
                        color="primary"
                        sx={{
                          fontSize: SIZES.fontSize.md,
                          fontWeight: 'bold'
                        }}
                      >
                        {t('forms.servicePoint.posts.postNumber', { postNumber: post.post_number })}
                      </Typography>
                      <Tooltip title={t('forms.servicePoint.posts.deletePost')}>
                        <IconButton
                          color="error"
                          onClick={() => removePost(index)}
                          size="small"
                          disabled={activePosts.length === 1} // Не позволяем удалить последний пост
                          sx={{
                            borderRadius: SIZES.borderRadius.sm
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    {/* Название поста */}
                    <TextField
                      fullWidth
                      label={t('forms.servicePoint.posts.postNameLabel')}
                      value={post.name}
                      onChange={(e) => updatePost(index, 'name', e.target.value)}
                      onBlur={() => formik.setFieldTouched(`service_posts.${index}.name`, true)}
                      error={isPostTouched(index, 'name') && Boolean(getPostError(index, 'name'))}
                      helperText={isPostTouched(index, 'name') && getPostError(index, 'name')}
                      margin="normal"
                      required
                      sx={textFieldStyles}
                    />
                    
                    {/* Описание поста */}
                    <TextField
                      fullWidth
                      label={t('forms.servicePoint.posts.descriptionLabel')}
                      value={post.description || ''}
                      onChange={(e) => updatePost(index, 'description', e.target.value)}
                      multiline
                      rows={2}
                      margin="normal"
                      placeholder={t('forms.servicePoint.posts.descriptionPlaceholder')}
                      sx={textFieldStyles}
                    />
                    
                    {/* Категория услуг */}
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id={`category-label-${index}`}>
                        {t('forms.servicePoint.posts.categoryLabel')}
                      </InputLabel>
                      <Select
                        labelId={`category-label-${index}`}
                        value={post.service_category_id || ''}
                        onChange={(e) => updatePost(index, 'service_category_id', Number(e.target.value))}
                        onBlur={() => formik.setFieldTouched(`service_posts.${index}.service_category_id`, true)}
                        error={isPostTouched(index, 'service_category_id') && Boolean(getPostError(index, 'service_category_id'))}
                        label={t('forms.servicePoint.posts.categoryLabel')}
                        disabled={categoriesLoading}
                        startAdornment={
                          <InputAdornment position="start">
                            <CategoryIcon fontSize="small" />
                          </InputAdornment>
                        }
                      >
                        {categoriesLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            {t('forms.servicePoint.posts.loadingCategories')}
                          </MenuItem>
                        ) : categories.length === 0 ? (
                          <MenuItem disabled>
                            {t('forms.servicePoint.posts.noCategoriesFound')}
                          </MenuItem>
                        ) : (
                          categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                              {category.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  - {category.description}
                                </Typography>
                              )}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {isPostTouched(index, 'service_category_id') && getPostError(index, 'service_category_id') && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {getPostError(index, 'service_category_id')}
                        </Typography>
                      )}
                    </FormControl>
                    
                    {/* Длительность слота */}
                    <TextField
                      fullWidth
                      type="number"
                      label={t('forms.servicePoint.posts.slotDurationLabel')}
                      value={post.slot_duration}
                      onChange={(e) => updatePost(index, 'slot_duration', Number(e.target.value))}
                      onBlur={() => formik.setFieldTouched(`service_posts.${index}.slot_duration`, true)}
                      error={isPostTouched(index, 'slot_duration') && Boolean(getPostError(index, 'slot_duration'))}
                      helperText={
                        (isPostTouched(index, 'slot_duration') && getPostError(index, 'slot_duration')) ||
                        t('forms.servicePoint.posts.defaultSlotDuration')
                      }
                      InputProps={{
                        inputProps: { min: 5, max: 480 },
                        endAdornment: <InputAdornment position="end">{t('forms.servicePoint.posts.slotDurationUnit')}</InputAdornment>
                      }}
                      margin="normal"
                      required
                      sx={textFieldStyles}
                    />
                    
                    {/* Переключатель активности поста */}
                    <FormControlLabel
                      control={
                        <Switch
                          checked={post.is_active}
                          onChange={(e) => updatePost(index, 'is_active', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: SIZES.fontSize.sm }}>
                          {t('forms.servicePoint.posts.postActive')}
                        </Typography>
                      }
                      sx={{ mt: SIZES.spacing.sm }}
                    />

                    {/* Настройки индивидуального расписания */}
                    <Box sx={{ 
                      mt: SIZES.spacing.lg, 
                      p: SIZES.spacing.md, 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: SIZES.borderRadius.sm, 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.02)'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        mb: SIZES.spacing.sm 
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: SIZES.spacing.sm }}>
                          <ScheduleIcon 
                            fontSize="small" 
                            color={post.has_custom_schedule ? 'primary' : 'disabled'} 
                          />
                          <Typography 
                            variant="subtitle2"
                            sx={{
                              fontSize: SIZES.fontSize.sm,
                              fontWeight: 'bold'
                            }}
                          >
                            {t('forms.servicePoint.posts.customSchedule')}
                          </Typography>
                          <Chip 
                            label={post.has_custom_schedule ? t('forms.servicePoint.posts.customScheduleEnabled') : t('forms.servicePoint.posts.customScheduleDisabled')}
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
                          {t('forms.servicePoint.posts.configureSchedule')}
                        </Button>
                      </Box>
                      
                      {post.has_custom_schedule && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            <strong>{t('forms.servicePoint.posts.workingDays')}:</strong> {
                              post.working_days 
                                ? Object.entries(post.working_days)
                                    .filter(([_, isWorking]) => isWorking)
                                    .map(([day]) => {
                                      const dayNames: { [key: string]: string } = {
                                        monday: t('forms.servicePoint.posts.monday'), tuesday: t('forms.servicePoint.posts.tuesday'), wednesday: t('forms.servicePoint.posts.wednesday'),
                                        thursday: t('forms.servicePoint.posts.thursday'), friday: t('forms.servicePoint.posts.friday'), saturday: t('forms.servicePoint.posts.saturday'), sunday: t('forms.servicePoint.posts.sunday')
                                      };
                                      return dayNames[day];
                                    })
                                    .join(', ')
                                : t('forms.servicePoint.posts.noSchedule')
                            }
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            <strong>{t('forms.servicePoint.posts.workingHours')}:</strong> {
                              post.custom_hours 
                                ? `${post.custom_hours.start} - ${post.custom_hours.end}`
                                : t('forms.servicePoint.posts.noSchedule')
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
            {t('forms.servicePoint.posts.noPostsMessage')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('forms.servicePoint.posts.addPostHint')}
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
          💡 <strong>{t('forms.servicePoint.posts.tip')}:</strong> {t('forms.servicePoint.posts.tipDescription')}
        </Typography>
      </Alert>

      {/* Предварительный просмотр расписания слотов */}
      {activePosts.length > 0 && formik.values.working_hours && (
        <SlotSchedulePreview 
          workingHours={formik.values.working_hours}
          activePosts={activePosts}
          servicePointId={servicePoint?.id?.toString()}
          formData={formik.values}
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

// Компонент для предварительного просмотра расписания слотов (обновленная версия с API)
interface SlotSchedulePreviewProps {
  workingHours: any;
  activePosts: ServicePost[];
  servicePointId?: string;
  formData?: any; // Данные формы для live preview
}

const SlotSchedulePreview: React.FC<SlotSchedulePreviewProps> = ({ 
  workingHours, 
  activePosts, 
  servicePointId,
  formData 
}) => {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [livePreviewData, setLivePreviewData] = useState<any>(null);
  
  // Получаем категории услуг для фильтра
  const { data: categoriesData } = useGetServiceCategoriesQuery({});
  const categories = categoriesData?.data || [];
  
  // Фильтруем посты по выбранной категории
  const filteredPosts = selectedCategoryId 
    ? activePosts.filter(post => post.service_category_id === selectedCategoryId)
    : activePosts;
  
  // Хуки для API
  const {
    data: schedulePreview,
    isLoading,
    error
  } = useGetSchedulePreviewQuery(
    { 
      servicePointId: servicePointId || '', 
      date: getCurrentDateForDay(selectedDay) 
    },
    { 
      skip: !servicePointId || !workingHours || !!livePreviewData // Пропускаем если есть live preview 
    }
  );

  const [calculatePreview, { 
    data: livePreview, 
    isLoading: isLiveLoading, 
    error: liveError 
  }] = useCalculateSchedulePreviewMutation();

  // Отладочная информация
  console.log('SlotSchedulePreview: render with', {
    servicePointId,
    selectedDay,
    activePosts: activePosts?.length,
    workingHours: workingHours ? Object.keys(workingHours) : 'null',
    hasFormData: !!formData,
    hasLivePreview: !!livePreviewData,
    isExpanded
  });
  
  // Вспомогательная функция для получения даты для выбранного дня недели
  function getCurrentDateForDay(dayKey: string): string {
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = воскресенье, 1 = понедельник, ...
    
    const dayIndexMap = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    const targetDayIndex = dayIndexMap[dayKey as keyof typeof dayIndexMap];
    if (targetDayIndex === undefined) {
      console.warn(`Unknown day key: ${dayKey}, defaulting to monday`);
      return getCurrentDateForDay('monday');
    }
    
    // Вычисляем количество дней до целевого дня
    let daysUntilTarget = targetDayIndex - currentDayIndex;
    
    // Если целевой день уже прошел на этой неделе или сегодня, берем следующую неделю
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    return targetDate.toISOString().split('T')[0];
  }

  // Функция для расчета live preview с данными формы
  const handleLivePreview = async () => {
    if (!servicePointId || !formData) return;

    try {
      const result = await calculatePreview({
        servicePointId,
        date: getCurrentDateForDay(selectedDay),
        formData: {
          working_hours: workingHours,
          service_posts_attributes: filteredPosts.map(post => ({
            id: post.id,
            name: post.name,
            slot_duration: post.slot_duration,
            is_active: post.is_active,
            post_number: post.post_number,
            service_category_id: post.service_category_id,
            has_custom_schedule: post.has_custom_schedule,
            working_days: post.working_days,
            custom_hours: post.custom_hours
          }))
        }
      });

      if (result.data) {
        setLivePreviewData(result.data);
        console.log('Live preview data received:', result.data);
      }
    } catch (error) {
      console.error('Error calculating live preview:', error);
    }
  };

  // Сброс live preview данных
  const clearLivePreview = () => {
    setLivePreviewData(null);
  };

  // Обработчик открытия/закрытия аккордеона
  const handleAccordionChange = (event: React.SyntheticEvent, expanded: boolean) => {
    setIsExpanded(expanded);
    
    if (expanded && formData && servicePointId) {
      // При открытии рассчитываем live preview для существующих точек
      handleLivePreview();
    } else if (!expanded) {
      // При закрытии очищаем live preview
      clearLivePreview();
    }
    // Для новых точек (без servicePointId) используем локальную генерацию слотов
  };

  // Эффект для пересчета при изменении дня
  useEffect(() => {
    if (isExpanded && livePreviewData) {
      handleLivePreview();
    }
  }, [selectedDay]);

  // Эффект для пересчета при изменении категории
  useEffect(() => {
    if (isExpanded && livePreviewData) {
      handleLivePreview();
    }
  }, [selectedCategoryId]);

  // Эффект для пересчета при изменении данных формы
  useEffect(() => {
    if (isExpanded && formData) {
      const timeoutId = setTimeout(() => {
        handleLivePreview();
      }, 500); // Дебаунс для избежания частых запросов

      return () => clearTimeout(timeoutId);
    }
  }, [formData, workingHours, activePosts]);

  // Генерируем временные слоты для выбранного дня
  const generateTimeSlots = (dayKey: string) => {
    const dayHours = workingHours[dayKey] as WorkingHours;
    console.log('generateTimeSlots: dayKey=', dayKey, 'dayHours=', dayHours);
    
    if (!dayHours.is_working_day) {
      console.log('generateTimeSlots: не рабочий день');
      return [];
    }

    // Получаем посты, которые работают в этот день
    const availablePostsForDay = filteredPosts.filter(post => {
      console.log('generateTimeSlots: проверяем пост', post.name, 'is_active=', post.is_active);
      
      if (!post.is_active) return false;
      
      // Если у поста есть индивидуальное расписание, проверяем его рабочие дни
      if (post.has_custom_schedule && post.working_days) {
        const isWorking = post.working_days[dayKey as keyof typeof post.working_days];
        console.log('generateTimeSlots: пост', post.name, 'с инд. расписанием, работает в', dayKey, '=', isWorking);
        return isWorking;
      }
      
      // Если нет индивидуального расписания, используем расписание точки
      console.log('generateTimeSlots: пост', post.name, 'без инд. расписания - работает');
      return true;
    });
    
    console.log('generateTimeSlots: availablePostsForDay.length=', availablePostsForDay.length);

    if (availablePostsForDay.length === 0) {
      return [];
    }

    const slots = [];
    
    // Определяем общее время работы для дня (берем объединение времени работы всех постов)
    let earliestStart = new Date(`2024-01-01 ${dayHours.start}:00`);
    let latestEnd = new Date(`2024-01-01 ${dayHours.end}:00`);
    
    // Корректируем время с учетом индивидуальных расписаний постов
    availablePostsForDay.forEach(post => {
      if (post.has_custom_schedule && post.custom_hours) {
        const postStart = new Date(`2024-01-01 ${post.custom_hours.start}:00`);
        const postEnd = new Date(`2024-01-01 ${post.custom_hours.end}:00`);
        
        // Начало - минимальное из всех начал (объединение)
        if (postStart < earliestStart) {
          earliestStart = postStart;
        }
        // Конец - максимальное из всех концов (объединение)
        if (postEnd > latestEnd) {
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
        totalPosts: filteredPosts.filter(p => p.is_active).length,
        isAvailable: availablePostsAtTime.length > 0,
        postDetails: availablePostsAtTime.map(post => ({
          name: post.name,
          number: post.post_number,
          hasCustomSchedule: post.has_custom_schedule || false
        }))
      });
      
      current.setMinutes(current.getMinutes() + 15);
    }
    
    console.log('generateTimeSlots: возвращаем', slots.length, 'слотов. Первые несколько:', slots.slice(0, 3));
    return slots;
  };

  const workingDays = DAYS_OF_WEEK.filter(day => {
    const dayHours = workingHours[day.key] as WorkingHours;
    const isWorkingDayBySchedule = dayHours.is_working_day;
    
    // Проверяем, есть ли активные посты с индивидуальным расписанием для этого дня
    const hasActivePostsWithCustomSchedule = activePosts.some(post => {
      if (!post.is_active || !post.has_custom_schedule || !post.working_days) {
        return false;
      }
      
      // Проверяем, работает ли пост в этот день недели
      const workingDayValue = post.working_days[day.key as keyof typeof post.working_days];
      return workingDayValue === true;
    });
    
    // Показываем день, если он рабочий по основному расписанию ИЛИ есть активные посты с индивидуальным расписанием
    return isWorkingDayBySchedule || hasActivePostsWithCustomSchedule;
  });

  const selectedDayInfo = DAYS_OF_WEEK.find(day => day.key === selectedDay);
  
  // Если нет servicePointId, используем fallback логику
  const timeSlots = livePreviewData
    ? livePreviewData.preview_slots
    : (servicePointId && schedulePreview
      ? schedulePreview.preview_slots
      : generateTimeSlots(selectedDay));
    
  // Определяем, используем ли данные из API
  const isUsingApiData = !!(livePreviewData || (servicePointId && schedulePreview));
  const isUsingLivePreview = !!livePreviewData;
  
  console.log('SlotSchedulePreview: состояние перед генерацией слотов:', {
    isUsingApiData,
    isUsingLivePreview,
    hasSchedulePreview: !!schedulePreview,
    hasLivePreview: !!livePreviewData,
    timeSlotsLength: timeSlots?.length,
    workingHoursForSelectedDay: workingHours?.[selectedDay]
  });
  
  const activePreviewData = livePreviewData || schedulePreview;
  
  if (activePreviewData) {
    console.log('SlotSchedulePreview: данные из API:', {
      preview_slots_count: activePreviewData.preview_slots?.length,
      first_few_slots: activePreviewData.preview_slots?.slice(0, 5)?.map((s: any) => ({
        time: s.time,
        available_posts: s.available_posts,
        total_posts: s.total_posts,
        is_available: s.is_available
      })),
      service_point_id: activePreviewData.service_point_id,
      date: activePreviewData.date,
      is_preview_calculation: activePreviewData.is_preview_calculation,
      form_data_applied: activePreviewData.form_data_applied
    });
  }

  // Конфигурация колонок для централизованного компонента Table
  const scheduleTableColumns: Column[] = [
    {
      id: 'time',
      label: t('forms.servicePoint.posts.timeLabel'),
      minWidth: 100,
      align: 'left',
      format: (value: string) => (
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      )
    },
    {
      id: 'availablePosts',
      label: t('forms.servicePoint.posts.availablePostsLabel'),
      minWidth: 150,
      align: 'center',
      format: (value: string) => (
        <Typography variant="body2">
          {value}
        </Typography>
      )
    },
    {
      id: 'postDetails',
      label: t('forms.servicePoint.posts.postDetailsLabel'),
      minWidth: 250,
      align: 'left',
      wrap: true,
      format: (value: any[]) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value?.length > 0 ? (
            value.map((post: any, idx: number) => (
              <Chip
                key={idx}
                label={post.label}
                size="small"
                variant="outlined"
                color={post.hasCustomSchedule ? 'secondary' : 'default'}
              />
            ))
          ) : (
            <Typography variant="caption" color="text.secondary">
              {t('forms.servicePoint.posts.noAvailablePosts')}
            </Typography>
          )}
        </Box>
      )
    },
    {
      id: 'status',
      label: t('forms.servicePoint.posts.statusLabel'),
      minWidth: 120,
      align: 'center',
      format: (value: { isAvailable: boolean; label: string }) => (
        <Chip
          label={value.label}
          color={value.isAvailable ? 'success' : 'default'}
          size="small"
        />
      )
    }
  ];

  // Преобразование данных timeSlots в формат для Table
  const scheduleTableRows = timeSlots.map((slot: any) => {
    const isUsingApiDataForSlot = isUsingApiData;
    const availablePostsCount = isUsingApiDataForSlot 
      ? slot.available_posts 
      : slot.availablePosts;
    const totalPostsCount = isUsingApiDataForSlot 
      ? slot.total_posts 
      : slot.totalPosts;
    const isAvailable = isUsingApiDataForSlot 
      ? slot.is_available 
      : slot.isAvailable;
    const postDetails = isUsingApiDataForSlot 
      ? slot.post_details 
      : slot.postDetails;

    return {
      time: slot.time,
      availablePosts: `${availablePostsCount} из ${totalPostsCount}`,
      postDetails: postDetails?.map((post: any) => ({
        label: isUsingApiDataForSlot
          ? `${post.name} (${post.duration_minutes}мин)`
          : `${post.name}${post.hasCustomSchedule ? ' (инд.)' : ''}`,
        hasCustomSchedule: post.hasCustomSchedule || false
      })) || [],
      status: {
        isAvailable,
        label: isAvailable ? t('forms.servicePoint.posts.available') : t('forms.servicePoint.posts.notAvailable')
      }
    };
  });

  if (workingDays.length === 0) {
    return null;
  }

  return (
    <Accordion sx={{ mt: 3 }} expanded={isExpanded} onChange={handleAccordionChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="schedule-preview-content"
        id="schedule-preview-header"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            {t('forms.servicePoint.posts.schedulePreviewTitle')}
          </Typography>
          {isUsingLivePreview && (
            <Chip 
              label={t('forms.servicePoint.posts.livePreview')} 
              color="success" 
              size="small" 
              variant="outlined" 
            />
          )}
          {(isLiveLoading || isLoading) && (
            <CircularProgress size={16} />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('forms.servicePoint.posts.schedulePreviewDescription')}
        </Typography>

        {/* Информационное сообщение для новых точек */}
        {!servicePointId && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>{t('forms.servicePoint.posts.previewModeInfo')}:</strong> {t('forms.servicePoint.posts.previewModeDescription')}
            </Typography>
          </Alert>
        )}

        {/* Выбор дня недели и категории */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('forms.servicePoint.posts.dayOfWeekLabel')}</InputLabel>
            <Select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              label={t('forms.servicePoint.posts.dayOfWeekLabel')}
            >
              {workingDays.map((day) => (
                <MenuItem key={day.key} value={day.key}>
                  {day.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('forms.servicePoint.posts.categoryLabel')}</InputLabel>
            <Select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
              label={t('forms.servicePoint.posts.categoryLabel')}
              startAdornment={
                <InputAdornment position="start">
                  <CategoryIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>{t('forms.servicePoint.posts.allCategories')}</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                  {category.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      - {category.description}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Проверка на отсутствие постов для выбранной категории */}
        {selectedCategoryId && filteredPosts.filter(p => p.is_active).length === 0 ? (
          <Alert severity="warning">
            <Typography variant="body2">
              {t('forms.servicePoint.posts.noActivePostsWarning', { categoryName: categories.find(c => c.id === selectedCategoryId)?.name || t('forms.servicePoint.posts.unknownCategory') })}
            </Typography>
          </Alert>
        ) : timeSlots.length > 0 ? (
          <>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6">
                {selectedDayInfo?.name} - {t('forms.servicePoint.posts.postAvailability')}
              </Typography>
              <Chip 
                label={`${filteredPosts.filter(p => p.is_active).length} ${t('forms.servicePoint.posts.activePosts')}${selectedCategoryId ? ` (${t('forms.servicePoint.posts.filtered')})` : ''}`} 
                color="primary" 
                variant="outlined" 
              />
              {selectedCategoryId && (
                <Chip 
                  label={categories.find(c => c.id === selectedCategoryId)?.name || t('forms.servicePoint.posts.category')}
                  color="secondary" 
                  variant="outlined" 
                  size="small"
                />
              )}
            </Box>

            <Table
              columns={scheduleTableColumns}
              rows={scheduleTableRows}
              responsive={true}
              stickyHeader={false}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('forms.servicePoint.posts.slotGenerationInfo', {
                  previewMode: isUsingLivePreview ? t('forms.servicePoint.posts.livePreview') : isUsingApiData ? t('forms.servicePoint.posts.apiPreview') : t('forms.servicePoint.posts.localPreview'),
                  isUsingApiData: isUsingApiData,
                  isUsingLivePreview: isUsingLivePreview
                })}
                <br />
                💡 {t('forms.servicePoint.posts.postDetailsHint')}
                {isUsingLivePreview && (
                  <>
                    <br />
                    🔄 {t('forms.servicePoint.posts.livePreviewAutoUpdate')}
                  </>
                )}
                {!servicePointId && (
                  <>
                    <br />
                    ⚠️ {t('forms.servicePoint.posts.previewModeHint')}
                  </>
                )}
              </Typography>
            </Alert>
          </>
        ) : (
          <Alert severity="warning">
            <Typography variant="body2">
              {selectedCategoryId && filteredPosts.filter(p => p.is_active).length === 0
                ? t('forms.servicePoint.posts.noActivePostsForCategory', { categoryName: categories.find(c => c.id === selectedCategoryId)?.name || t('forms.servicePoint.posts.unknownCategory') })
                : `${selectedDayInfo?.name} - ${t('forms.servicePoint.posts.weekend')}. ${t('forms.servicePoint.posts.selectWorkingDay')}`
              }
            </Typography>
          </Alert>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default PostsStep; 