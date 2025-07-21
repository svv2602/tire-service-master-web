import React, { useState, useEffect } from 'react';
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
} from '../../api/emailTemplates.api';

import {
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
  
  // Состояния для кастомных переменных
  const [customVariables, setCustomVariables] = useState<CustomVariable[]>([]);
  const [variableFormDialog, setVariableFormDialog] = useState<{
    open: boolean;
    editingVariable: CustomVariable | null;
  }>({ open: false, editingVariable: null });
  const [variableForm, setVariableForm] = useState({
    name: '',
    description: '',
    example_value: ''
  });

  // API хуки
  const { data: templateData, isLoading: templateLoading } = useGetEmailTemplateQuery(
    parseInt(id || '0'),
    { skip: !isEditMode }
  );
  const { data: templateTypesData } = useGetTemplateTypesQuery();
  const [createTemplate] = useCreateEmailTemplateMutation();
  const [updateTemplate] = useUpdateEmailTemplateMutation();

  const templateTypes = templateTypesData?.data || [];

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
    if (isEditMode && templateData) {
      formik.setValues({
        name: templateData.name || '',
        subject: templateData.subject || '',
        body: templateData.body || '',
        template_type: templateData.template_type || '',
        language: templateData.language || 'uk',
        is_active: templateData.is_active ?? true,
        description: templateData.description || '',
        variables: templateData.variables_array || [],
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

  // Функции для кастомных переменных
  const handleAddCustomVariable = () => {
    setVariableForm({ name: '', description: '', example_value: '' });
    setVariableFormDialog({ open: true, editingVariable: null });
  };

  const handleEditCustomVariable = (variable: CustomVariable) => {
    setVariableForm({
      name: variable.name,
      description: variable.description,
      example_value: variable.example_value
    });
    setVariableFormDialog({ open: true, editingVariable: variable });
  };

  const handleDeleteCustomVariable = (variableId: string) => {
    setCustomVariables(prev => prev.filter(v => v.id !== variableId));
    // Также удаляем из переменных шаблона
    const variableToDelete = customVariables.find(v => v.id === variableId);
    if (variableToDelete) {
      formik.setFieldValue(
        'variables',
        formik.values.variables.filter(v => v !== variableToDelete.name)
      );
    }
  };

  const handleSaveCustomVariable = () => {
    if (!variableForm.name.trim()) {
      setNotification({
        open: true,
        message: 'Название переменной обязательно',
        severity: 'warning'
      });
      return;
    }

    // Проверка на валидность названия (только английские буквы и подчеркивания)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableForm.name)) {
      setNotification({
        open: true,
        message: 'Название должно содержать только английские буквы, цифры и подчеркивания',
        severity: 'warning'
      });
      return;
    }

    const isEditing = variableFormDialog.editingVariable !== null;
    
    if (isEditing) {
      // Редактирование существующей переменной
      setCustomVariables(prev => prev.map(v => 
        v.id === variableFormDialog.editingVariable!.id 
          ? { ...v, ...variableForm }
          : v
      ));
      
      // Обновляем в переменных шаблона, если название изменилось
      if (variableFormDialog.editingVariable!.name !== variableForm.name) {
        const updatedVariables = formik.values.variables.map(v => 
          v === variableFormDialog.editingVariable!.name ? variableForm.name : v
        );
        formik.setFieldValue('variables', updatedVariables);
      }
    } else {
      // Проверка на дублирование
      if (customVariables.some(v => v.name === variableForm.name)) {
        setNotification({
          open: true,
          message: 'Переменная с таким названием уже существует',
          severity: 'warning'
        });
        return;
      }
      
      // Добавление новой переменной
      const newCustomVariable: CustomVariable = {
        id: Date.now().toString(),
        ...variableForm
      };
      setCustomVariables(prev => [...prev, newCustomVariable]);
    }

    setVariableFormDialog({ open: false, editingVariable: null });
    setNotification({
      open: true,
      message: isEditing ? 'Переменная обновлена' : 'Переменная добавлена',
      severity: 'success'
    });
  };

  const handleUseCustomVariable = (variable: CustomVariable) => {
    if (!formik.values.variables.includes(variable.name)) {
      formik.setFieldValue('variables', [...formik.values.variables, variable.name]);
    }
    handleVariableClick(variable.name);
  };

  const handlePreview = () => {
    if (!formik.values.subject || !formik.values.body) {
      setNotification({
        open: true,
        message: 'Заполните тему и тело письма для предварительного просмотра',
        severity: 'warning'
      });
      return;
    }

    const mockVariables: Record<string, string> = {};
    
    // Добавляем значения кастомных переменных
    customVariables.forEach(customVar => {
      mockVariables[customVar.name] = customVar.example_value || `[${customVar.name}]`;
    });
    
    formik.values.variables.forEach(variable => {
      // Если переменная уже есть в кастомных, пропускаем
      if (mockVariables[variable]) return;
      
      switch (variable) {
        // Клиент
        case 'client_name':
          mockVariables[variable] = 'Іван Петренко';
          break;
        case 'client_email':
          mockVariables[variable] = 'ivan.petrenko@example.com';
          break;
        case 'client_phone':
          mockVariables[variable] = '+38 (067) 123-45-67';
          break;
        
        // Бронирование
        case 'booking_id':
          mockVariables[variable] = '#12345';
          break;
        case 'booking_date':
          mockVariables[variable] = '25.07.2025';
          break;
        case 'booking_time':
          mockVariables[variable] = '14:30';
          break;
        case 'booking_status':
          mockVariables[variable] = 'Підтверджено';
          break;
        case 'booking_notes':
          mockVariables[variable] = 'Додаткові побажання клієнта';
          break;
        
        // Сервисная точка
        case 'service_point_name':
          mockVariables[variable] = 'СТО Центральний';
          break;
        case 'service_point_address':
          mockVariables[variable] = 'вул. Хрещатик, 1, Київ';
          break;
        case 'service_point_phone':
          mockVariables[variable] = '+38 (044) 123-45-67';
          break;
        case 'service_point_city':
          mockVariables[variable] = 'Київ';
          break;
        
        // Услуги
        case 'service_name':
          mockVariables[variable] = 'Заміна шин';
          break;
        case 'service_category':
          mockVariables[variable] = 'Шиномонтаж';
          break;
        case 'service_price':
          mockVariables[variable] = '1200 грн';
          break;
        case 'service_duration':
          mockVariables[variable] = '60 хвилин';
          break;
        
        // Автомобиль
        case 'car_brand':
          mockVariables[variable] = 'Toyota';
          break;
        case 'car_model':
          mockVariables[variable] = 'Camry';
          break;
        case 'car_year':
          mockVariables[variable] = '2020';
          break;
        case 'license_plate':
          mockVariables[variable] = 'АА1234ВВ';
          break;
        
        // Система
        case 'company_name':
          mockVariables[variable] = 'Tire Service Master';
          break;
        case 'support_email':
          mockVariables[variable] = 'support@tireservice.ua';
          break;
        case 'support_phone':
          mockVariables[variable] = '+38 (044) 111-22-33';
          break;
        case 'website_url':
          mockVariables[variable] = 'https://tireservice.ua';
          break;
        
        default:
          mockVariables[variable] = `[${variable}]`;
      }
    });

    // Локальная замена переменных
    let previewSubject = formik.values.subject;
    let previewBody = formik.values.body;

    // Заменяем переменные в фигурных скобках
    Object.entries(mockVariables).forEach(([key, value]) => {
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Переменные заключаются в фигурные скобки: {'{client_name}'}
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Как использовать переменные:</strong><br/>
                    • Кликните на чип переменной ниже, чтобы скопировать её в буфер обмена<br/>
                    • Вставьте переменную в тему или тело письма (формат: <code>{'{client_name}'}</code>)<br/>
                    • Или добавьте свою переменную в поле ниже<br/>
                    • При отправке письма переменные заменятся на реальные данные
                  </Typography>
                </Alert>

                                {/* Таблица кастомных переменных */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Ваши переменные:</strong>
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddCustomVariable}
                  >
                    Добавить переменную
                  </Button>
                </Box>
                
                {customVariables.length > 0 ? (
                  <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Название</TableCell>
                          <TableCell>Описание</TableCell>
                          <TableCell>Пример значения</TableCell>
                          <TableCell align="center" sx={{ width: 120 }}>Действия</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customVariables.map((variable) => (
                          <TableRow key={variable.id} hover>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                component="code" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {`{${variable.name}}`}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {variable.description || 'Без описания'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: theme.palette.success.main }}>
                                "{variable.example_value || 'Не указано'}"
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Использовать в шаблоне">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleUseCustomVariable(variable)}
                                  >
                                    <CopyIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Редактировать">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleEditCustomVariable(variable)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Удалить">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteCustomVariable(variable.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      У вас пока нет своих переменных. Нажмите "Добавить переменную" чтобы создать первую.
                    </Typography>
                  </Alert>
                )}

                {/* Список переменных */}
                {formik.values.variables.length > 0 && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Переменные в шаблоне:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formik.values.variables.map((variable, index) => (
                        <Chip
                          key={index}
                          label={variable}
                          onDelete={() => handleRemoveVariable(variable)}
                          deleteIcon={<DeleteIcon />}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}

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
        <Card sx={{ mt: 3 }}>
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
            
            {/* Показываем пример значения для популярных переменных */}
            {(() => {
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

      {/* Диалог создания/редактирования переменной */}
      <Dialog
        open={variableFormDialog.open}
        onClose={() => setVariableFormDialog({ open: false, editingVariable: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {variableFormDialog.editingVariable ? 'Редактировать переменную' : 'Добавить переменную'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Правила создания переменных:</strong><br/>
              • Используйте только английские буквы, цифры и подчеркивания<br/>
              • Название должно начинаться с буквы<br/>
              • Пример: <code>weather_warning</code>, <code>current_promotion</code>
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название переменной"
              value={variableForm.name}
              onChange={(e) => setVariableForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="weather_warning"
              helperText="Только английские буквы, цифры и подчеркивания"
              fullWidth
              required
            />
            
            <TextField
              label="Описание"
              value={variableForm.description}
              onChange={(e) => setVariableForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Предупреждение о погодных условиях"
              helperText="Краткое описание назначения переменной"
              fullWidth
            />
            
            <TextField
              label="Пример значения"
              value={variableForm.example_value}
              onChange={(e) => setVariableForm(prev => ({ ...prev, example_value: e.target.value }))}
              placeholder="Увага! Завтра очікується дощ. Рекомендуємо зимові шини."
              helperText="Пример того, что будет отображаться вместо переменной"
              fullWidth
              multiline
              rows={2}
            />
          </Box>
          
          {variableForm.name && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Переменная будет выглядеть так:
              </Typography>
              <Paper sx={{ p: 1, bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                <Typography component="code" sx={{ fontFamily: 'monospace', color: theme.palette.primary.main }}>
                  {`{${variableForm.name}}`}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setVariableFormDialog({ open: false, editingVariable: null })}
            color="inherit"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSaveCustomVariable}
            variant="contained"
            disabled={!variableForm.name.trim()}
          >
            {variableFormDialog.editingVariable ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

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