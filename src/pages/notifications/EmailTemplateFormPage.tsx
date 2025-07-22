import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Chip,
  Grid,
  useTheme,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Visibility as PreviewIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import Notification from '../../components/Notification';
import { getTablePageStyles } from '../../styles';

import {
  useGetEmailTemplateQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useGetTemplateTypesQuery,
  type EmailTemplate,
  type EmailTemplateResponse,
} from '../../api/emailTemplates.api';

import {
  useGetCustomVariablesQuery,
  useGetVariablesByCategoryQuery,
  useGetVariableCategoriesQuery,
  useAddVariableToTemplateMutation,
  useRemoveVariableFromTemplateMutation,
  type CustomVariable as ApiCustomVariable,
  type VariablesByCategory,
} from '../../api/customVariables.api';

interface EmailTemplateFormData {
  name: string;
  subject: string;
  body: string;
  template_type: string;
  language: string;
  channel_type?: 'email' | 'telegram' | 'push';
  is_active: boolean;
  description: string;
  variables: string[];
}

interface CustomVariable {
  id: string;
  name: string;
  description: string;
  example_value: string;
}

const EmailTemplateFormPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const tablePageStyles = getTablePageStyles(theme);

  // Состояния
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });


  const [previewData, setPreviewData] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [variableDialog, setVariableDialog] = useState<{ open: boolean; variable: string }>({ open: false, variable: '' });
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Состояния для кастомных переменных убраны - управление на отдельной странице

  // API хуки
  const { data: templateData, isLoading: templateLoading } = useGetEmailTemplateQuery(
    parseInt(id || '0'),
    { skip: !isEditMode }
  );
  const { data: templateTypesData } = useGetTemplateTypesQuery();
  const { data: customVariablesData } = useGetCustomVariablesQuery({});
  const [createTemplate] = useCreateEmailTemplateMutation();
  const [updateTemplate] = useUpdateEmailTemplateMutation();

  const templateTypes = templateTypesData?.data || [];
  const customVariables = customVariablesData?.data || [];

  // Валидация
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Название обязательно')
      .max(255, 'Максимум 255 символов'),
    subject: Yup.string()
      .required('Тема обязательна')
      .max(500, 'Максимум 500 символов'),
    body: Yup.string()
      .required('Тело письма обязательно'),
    template_type: Yup.string()
      .required('Тип шаблона обязателен'),
    language: Yup.string()
      .required('Язык обязателен'),
    description: Yup.string()
      .max(1000, 'Максимум 1000 символов'),
  });

  // Formik
  const formik = useFormik<EmailTemplateFormData>({
    initialValues: {
      name: '',
      subject: '',
      body: '',
      template_type: '',
      language: 'uk',
      channel_type: 'email',
      is_active: true,
      description: '',
      variables: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const templateData = {
          ...values,
          variables: values.variables,
          channel_type: values.channel_type || 'email' as const, // Дефолтное значение
        };

        if (isEditMode && id) {
          await updateTemplate({ 
            id: parseInt(id), 
            data: templateData 
          }).unwrap();
          setNotification({
            open: true,
            message: 'Шаблон успешно обновлен',
            severity: 'success'
          });
        } else {
          await createTemplate(templateData).unwrap();
          setNotification({
            open: true,
            message: 'Шаблон успешно создан',
            severity: 'success'
          });
        }

        setTimeout(() => {
          navigate('/admin/notifications/email-templates');
        }, 1500);
      } catch (error: any) {
        setNotification({
          open: true,
          message: error?.data?.message || 'Ошибка при сохранении шаблона',
          severity: 'error'
        });
      }
    },
  });

  // Загрузка данных для редактирования
  useEffect(() => {
    if (isEditMode && templateData?.data) {
      const template = templateData.data;
      formik.setValues({
        name: template.name || '',
        subject: template.subject || '',
        body: template.body || '',
        template_type: template.template_type || '',
        language: template.language || 'uk',
        is_active: template.is_active ?? true,
        description: template.description || '',
        variables: template.variables_array || [],
      });
    }
  }, [templateData, isEditMode]);

  // Обработчики (старая функция удалена, используем таблицу кастомных переменных)

  const handleRemoveVariable = (variable: string) => {
    formik.setFieldValue(
      'variables',
      formik.values.variables.filter(v => v !== variable)
    );
  };

  const handleVariableClick = (variable: string) => {
    setVariableDialog({ open: true, variable });
  };

  const handleCopyVariable = async (variable: string) => {
    const variableText = `{${variable}}`;
    try {
      await navigator.clipboard.writeText(variableText);
      setNotification({
        open: true,
        message: `Переменная ${variableText} скопирована в буфер обмена`,
        severity: 'success'
      });
      setVariableDialog({ open: false, variable: '' });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Ошибка копирования в буфер обмена',
        severity: 'error'
      });
    }
  };

  // Функции для кастомных переменных убраны - теперь управление на отдельной странице

  const handlePreview = () => {
    if (!formik.values.subject || !formik.values.body) {
      setNotification({
        open: true,
        message: 'Заполните тему и тело письма для предварительного просмотра',
        severity: 'warning'
      });
      return;
    }

    // Системные переменные
    const systemVariables: Record<string, string> = {
      // Клиент
      'client_name': 'Іван Петренко',
      'client_email': 'ivan.petrenko@example.com', 
      'client_phone': '+38 (067) 123-45-67',
      'client_first_name': 'Іван',
      'client_last_name': 'Петренко',
      
      // Бронирование
      'booking_id': '#12345',
      'booking_date': '25.07.2025',
      'booking_time': '14:30',
      'booking_status': 'Підтверджено',
      'booking_notes': 'Додаткові побажання клієнта',
      
      // Сервисная точка
      'service_point_name': 'СТО Центральний',
      'service_point_address': 'вул. Хрещатик, 1, Київ',
      'service_point_phone': '+38 (044) 555-12-34',
      'service_point_city': 'Київ',
      
      // Услуги
      'service_name': 'Заміна шин',
      'service_category': 'Шиномонтаж',
      'service_price': '1200 грн',
      'service_duration': '60 хвилин',
      
      // Автомобиль
      'car_brand': 'Toyota',
      'car_model': 'Camry',
      'car_year': '2020',
      'license_plate': 'АА1234ВВ',
      
      // Система
      'company_name': 'Tire Service Master',
      'support_email': 'support@tireservice.ua',
      'support_phone': '+38 (044) 111-22-33',
      'website_url': 'https://tireservice.ua',
      'current_date': new Date().toLocaleDateString('uk-UA'),
      'current_time': new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };
    
    // Кастомные переменные
    const customVariablesMap: Record<string, string> = {};
    customVariables.forEach(customVar => {
      customVariablesMap[customVar.name] = customVar.example_value || `[${customVar.name}]`;
    });
    
    // Объединяем все переменные (кастомные могут перезаписать системные)
    const allVariables = { ...systemVariables, ...customVariablesMap };

    // Локальная замена переменных
    let previewSubject = formik.values.subject;
    let previewBody = formik.values.body;

    // Заменяем переменные в фигурных скобках
    Object.entries(allVariables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      previewSubject = previewSubject.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      previewBody = previewBody.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    setPreviewData({
      subject: previewSubject,
      body: previewBody,
      variables: formik.values.variables,
    });
    setPreviewOpen(true);
    
    // Автоматический скролл к окну предварительного просмотра
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        previewRef.current.focus();
      }
    }, 100); // Небольшая задержка для завершения рендеринга
  };

  if (templateLoading) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/notifications/email-templates')}
        >
          Назад к списку
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Редактирование шаблона' : 'Создание шаблона'}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Основная информация */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Название шаблона"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Тип шаблона</InputLabel>
                      <Select
                        name="template_type"
                        value={formik.values.template_type}
                        onChange={formik.handleChange}
                        label="Тип шаблона"
                        error={formik.touched.template_type && Boolean(formik.errors.template_type)}
                      >
                        {templateTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Язык</InputLabel>
                      <Select
                        name="language"
                        value={formik.values.language}
                        onChange={formik.handleChange}
                        label="Язык"
                      >
                        <MenuItem value="ru">Русский</MenuItem>
                        <MenuItem value="uk">Українська</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Тема письма"
                      name="subject"
                      value={formik.values.subject}
                      onChange={formik.handleChange}
                      error={formik.touched.subject && Boolean(formik.errors.subject)}
                      helperText={formik.touched.subject && formik.errors.subject}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={10}
                      label="Тело письма"
                      name="body"
                      value={formik.values.body}
                      onChange={formik.handleChange}
                      error={formik.touched.body && Boolean(formik.errors.body)}
                      helperText={formik.touched.body && formik.errors.body}
                      required
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
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Настройки и переменные */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Настройки
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.is_active}
                      onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    />
                  }
                  label="Активный шаблон"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Переменные
                </Typography>






                {/* Популярные переменные */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Популярные переменные:
                </Typography>
                
                {/* Группы переменных */}
                <Box sx={{ mb: 2 }}>
                  {/* Клиент */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                      Клиент:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['client_name', 'client_email', 'client_phone'].map((variable) => (
                        <Chip
                          key={variable}
                          label={variable}
                          size="small"
                          clickable
                          variant="outlined"
                          color="primary"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleVariableClick(variable)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Бронирование */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="secondary" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                      Бронирование:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['booking_id', 'booking_date', 'booking_time', 'booking_status', 'booking_notes'].map((variable) => (
                        <Chip
                          key={variable}
                          label={variable}
                          size="small"
                          clickable
                          variant="outlined"
                          color="secondary"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleVariableClick(variable)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Сервисная точка */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="success" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                      Сервисная точка:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['service_point_name', 'service_point_address', 'service_point_phone', 'service_point_city'].map((variable) => (
                        <Chip
                          key={variable}
                          label={variable}
                          size="small"
                          clickable
                          variant="outlined"
                          color="success"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleVariableClick(variable)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Услуги */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="warning" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                      Услуги:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['service_name', 'service_category', 'service_price', 'service_duration'].map((variable) => (
                        <Chip
                          key={variable}
                          label={variable}
                          size="small"
                          clickable
                          variant="outlined"
                          color="warning"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleVariableClick(variable)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Автомобиль */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="info" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                      Автомобиль:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['car_brand', 'car_model', 'car_year', 'license_plate'].map((variable) => (
                        <Chip
                          key={variable}
                          label={variable}
                          size="small"
                          clickable
                          variant="outlined"
                          color="info"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleVariableClick(variable)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Система */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block', color: 'text.secondary' }}>
                      Система:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {['company_name', 'support_email', 'support_phone', 'website_url'].map((variable) => (
                        <Chip
                          key={variable}
                          label={variable}
                          size="small"
                          clickable
                          variant="outlined"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleVariableClick(variable)}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Ваши переменные */}
                  {customVariables.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="error" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                        Ваши переменные:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {customVariables.map((variable) => (
                          <Chip
                            key={variable.id}
                            label={variable.name}
                            size="small"
                            clickable
                            variant="outlined"
                            color="error"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleVariableClick(variable.name)}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Действия */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={handlePreview}
                disabled={!formik.values.subject || !formik.values.body}
              >
                Предварительный просмотр
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={!formik.isValid || formik.isSubmitting}
              >
                {isEditMode ? 'Обновить' : 'Создать'} шаблон
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Предварительный просмотр */}
      {previewOpen && previewData && (
        <Card 
          ref={previewRef}
          tabIndex={-1}
          sx={{ 
            mt: 3,
            outline: 'none',
            '&:focus': {
              boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}`,
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Предварительный просмотр
              </Typography>
              <Button onClick={() => setPreviewOpen(false)}>
                Закрыть
              </Button>
            </Box>
            
            {/* Информация о переменных */}
            {previewData.variables && previewData.variables.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Используемые переменные:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {previewData.variables.map((variable: string) => (
                    <Chip key={variable} label={`{${variable}}`} size="small" />
                  ))}
                </Box>
              </Alert>
            )}
            
            <Paper sx={{ 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900'
              }}>
                <strong>Тема:</strong> {previewData.subject}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ 
                color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900'
              }}>
                <strong>Содержимое:</strong>
              </Typography>
              <Typography
                variant="body1"
                component="div"
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: 1.6,
                  color: theme.palette.mode === 'dark' ? 'grey.200' : 'grey.800'
                }}
              >
                {previewData.body}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Диалог переменной */}
      <Dialog
        open={variableDialog.open}
        onClose={() => setVariableDialog({ open: false, variable: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Переменная для копирования
          </Typography>
          <IconButton
            onClick={() => setVariableDialog({ open: false, variable: '' })}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Как использовать:</strong><br/>
              1. Скопируйте переменную кнопкой ниже<br/>
              2. Вставьте в нужное место в теме или теле письма<br/>
              3. При отправке письма она заменится на реальные данные
            </Typography>
          </Alert>
          <Paper 
            sx={{ 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Переменная для копирования:
            </Typography>
            <Typography 
              variant="h5" 
              component="code" 
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: theme.palette.primary.main
              }}
            >
              {`{${variableDialog.variable}}`}
            </Typography>
            
            {/* Показываем пример значения для переменных */}
            {(() => {
              // Сначала проверяем кастомные переменные
              const customVariable = customVariables.find(cv => cv.name === variableDialog.variable);
              if (customVariable && customVariable.example_value) {
                return (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                      Пример значения:
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontStyle: 'italic',
                        color: theme.palette.error.main, // Красный цвет для кастомных переменных
                        fontWeight: 500
                      }}
                    >
                      "{customVariable.example_value}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {customVariable.description}
                    </Typography>
                  </>
                );
              }
              
              // Если не кастомная, проверяем системные переменные
              const exampleValues: Record<string, string> = {
                client_name: 'Іван Петренко',
                client_email: 'ivan.petrenko@example.com',
                client_phone: '+38 (067) 123-45-67',
                booking_date: '25.07.2025',
                booking_time: '14:30',
                service_name: 'Заміна шин',
                service_point_name: 'СТО Центральний',
                car_brand: 'Toyota',
                car_model: 'Camry',
                company_name: 'Tire Service Master'
              };
              
              const exampleValue = exampleValues[variableDialog.variable];
              if (exampleValue) {
                return (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                      Пример значения:
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontStyle: 'italic',
                        color: theme.palette.success.main,
                        fontWeight: 500
                      }}
                    >
                      "{exampleValue}"
                    </Typography>
                  </>
                );
              }
              return null;
            })()}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setVariableDialog({ open: false, variable: '' })}
            color="inherit"
          >
            Отмена
          </Button>
          <Button
            onClick={() => handleCopyVariable(variableDialog.variable)}
            variant="contained"
            startIcon={<CopyIcon />}
          >
            Копировать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог для переменных убран - управление на отдельной странице */}

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default EmailTemplateFormPage; 