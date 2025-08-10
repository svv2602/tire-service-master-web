import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ArrowBack, Save, Add } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { getTablePageStyles } from '../../styles/tablePageStyles';
import Notification from '../../components/Notification';
import { 
  useCreateAgreementMutation,
  useGetActiveAgreementPartnersQuery,
  useGetAgreementSuppliersQuery,
  Agreement,
  AgreementException 
} from '../../api/agreements.api';

// Схема валидации
const validationSchema = yup.object({
  partner_id: yup.number().required('Партнер обязателен для выбора'),
  supplier_id: yup.number().required('Поставщик обязателен для выбора'),
  start_date: yup.string()
    .required('Дата начала обязательна')
    .test('valid-date', 'Некорректная дата начала', function(value) {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  end_date: yup.string()
    .nullable()
    .test('valid-date', 'Некорректная дата окончания', function(value) {
      if (!value) return true; // Дата окончания опциональна
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('end-after-start', 'Дата окончания должна быть после даты начала', function(value) {
      const { start_date } = this.parent;
      if (!value || !start_date) return true;
      return new Date(value) > new Date(start_date);
    }),
  commission_type: yup.string().required('Тип комиссии обязателен'),
  order_types: yup.string().required('Тип заказов обязателен'),
  commission_amount: yup.number().when('commission_type', {
    is: 'fixed_amount',
    then: (schema) => schema.required('Сумма комиссии обязательна').min(0.01, 'Сумма должна быть больше 0'),
    otherwise: (schema) => schema.nullable(),
  }),
  commission_percentage: yup.number().when('commission_type', {
    is: 'percentage',
    then: (schema) => schema.required('Процент комиссии обязателен').min(0.01, 'Процент должен быть больше 0').max(100, 'Процент не может быть больше 100'),
    otherwise: (schema) => schema.nullable(),
  }),
  commission_unit: yup.string().when('commission_type', {
    is: (value: string) => ['fixed_amount', 'percentage'].includes(value),
    then: (schema) => schema.required('Единица применения обязательна'),
    otherwise: (schema) => schema.nullable(),
  }),
});

const steps = ['Основная информация', 'Условия комиссии', 'Исключения'];

const AgreementCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [exceptions, setExceptions] = useState<Partial<AgreementException>[]>([]);

  // API hooks
  const [createAgreement, { isLoading: isCreating }] = useCreateAgreementMutation();
  const { data: partnersResponse, isLoading: partnersLoading } = useGetActiveAgreementPartnersQuery();
  const { data: suppliersResponse, isLoading: suppliersLoading } = useGetAgreementSuppliersQuery();
  
  const partners = partnersResponse?.data || [];
  const suppliers = suppliersResponse?.data || [];

  // Formik
  const formik = useFormik({
    initialValues: {
      partner_id: '',
      supplier_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      commission_type: 'fixed_amount',
      commission_amount: '',
      commission_percentage: '',
      commission_unit: 'per_order',
      order_types: 'both',
      active: true,
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const agreementData = {
          ...values,
          partner_id: Number(values.partner_id),
          supplier_id: Number(values.supplier_id),
          commission_type: values.commission_type as 'fixed_amount' | 'percentage' | 'custom',
          commission_unit: values.commission_unit as 'per_order' | 'per_item',
          order_types: values.order_types as 'cart_orders' | 'pickup_orders' | 'both',
          commission_amount: values.commission_amount ? Number(values.commission_amount) : undefined,
          commission_percentage: values.commission_percentage ? Number(values.commission_percentage) : undefined,
          end_date: values.end_date || undefined,
        };

        await createAgreement({ agreement: agreementData }).unwrap();
        
        setNotification({
          open: true,
          message: 'Договоренность успешно создана',
          severity: 'success',
        });
        
        setTimeout(() => {
          navigate('/admin/agreements');
        }, 2000);
      } catch (error: any) {
        console.error('Ошибка при создании договоренности:', error);
        
        let errorMessage = 'Ошибка при создании договоренности';
        
        if (error?.data) {
          // Обработка ошибок валидации Rails
          if (error.data.errors) {
            if (Array.isArray(error.data.errors)) {
              // Массив ошибок
              errorMessage = error.data.errors.join('\n');
            } else if (typeof error.data.errors === 'object') {
              // Объект ошибок валидации Rails {field: [errors]}
              const errorLines = Object.entries(error.data.errors)
                .map(([field, fieldErrors]: [string, any]) => {
                  const errorsArray = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
                  return `${field}: ${errorsArray.join(', ')}`;
                });
              errorMessage = errorLines.join('\n');
            }
          } else if (error.data.message) {
            errorMessage = error.data.message;
          } else if (error.data.error) {
            errorMessage = error.data.error;
          } else if (typeof error.data === 'string') {
            errorMessage = error.data;
          }
        } else if (error?.message) {
          errorMessage = `Сетевая ошибка: ${error.message}`;
        } else if (error?.status) {
          switch (error.status) {
            case 400:
              errorMessage = 'Некорректные данные. Проверьте заполнение полей';
              break;
            case 401:
              errorMessage = 'Ошибка авторизации. Пожалуйста, войдите в систему заново';
              break;
            case 403:
              errorMessage = 'Недостаточно прав для выполнения операции';
              break;
            case 422:
              if (!error.data) {
                errorMessage = 'Уже существует активная договоренность для выбранной комбинации партнера, поставщика и типа заказов. Проверьте существующие договоренности или измените параметры.';
              }
              break;
            case 500:
              errorMessage = 'Внутренняя ошибка сервера. Обратитесь к администратору';
              break;
            default:
              errorMessage = `HTTP ошибка ${error.status}: ${error.statusText || 'Неизвестная ошибка'}`;
          }
        }

        setNotification({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    },
  });

  const handleNext = () => {
    if (activeStep === 0) {
      // Валидация основной информации
      const basicErrors = ['partner_id', 'supplier_id', 'start_date', 'order_types'].some(
        field => formik.errors[field as keyof typeof formik.errors]
      );
      if (basicErrors) {
        formik.setTouched({
          partner_id: true,
          supplier_id: true,
          start_date: true,
          order_types: true,
        });
        return;
      }
    }
    
    if (activeStep === 1) {
      // Валидация условий комиссии
      if (formik.values.commission_type !== 'custom') {
        const commissionErrors = formik.values.commission_type === 'fixed_amount' 
          ? ['commission_amount', 'commission_unit'].some(field => formik.errors[field as keyof typeof formik.errors])
          : ['commission_percentage', 'commission_unit'].some(field => formik.errors[field as keyof typeof formik.errors]);
        
        if (commissionErrors) {
          formik.setTouched({
            commission_amount: true,
            commission_percentage: true,
            commission_unit: true,
          });
          return;
        }
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderBasicInfoStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={formik.touched.partner_id && Boolean(formik.errors.partner_id)}>
          <InputLabel>Партнер *</InputLabel>
          <Select
            name="partner_id"
            value={formik.values.partner_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={partnersLoading}
          >
            {partners.map((partner) => (
              <MenuItem key={partner.id} value={partner.id}>
                {partner.company_name} ({partner.contact_person})
              </MenuItem>
            ))}
          </Select>
          {formik.touched.partner_id && formik.errors.partner_id && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {formik.errors.partner_id}
            </Typography>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={formik.touched.supplier_id && Boolean(formik.errors.supplier_id)}>
          <InputLabel>Поставщик *</InputLabel>
          <Select
            name="supplier_id"
            value={formik.values.supplier_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={suppliersLoading}
          >
            {suppliers.map((supplier) => (
              <MenuItem key={supplier.id} value={supplier.id}>
                {supplier.name} (ID: {supplier.firm_id})
              </MenuItem>
            ))}
          </Select>
          {formik.touched.supplier_id && formik.errors.supplier_id && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {formik.errors.supplier_id}
            </Typography>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <DatePicker
          label="Дата начала *"
          value={formik.values.start_date ? new Date(formik.values.start_date) : null}
          onChange={(date) => {
            if (date && !isNaN(date.getTime())) {
              formik.setFieldValue('start_date', date.toISOString().split('T')[0]);
            } else {
              formik.setFieldValue('start_date', '');
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
            if (date && !isNaN(date.getTime())) {
              formik.setFieldValue('end_date', date.toISOString().split('T')[0]);
            } else {
              formik.setFieldValue('end_date', '');
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
        <FormControl fullWidth>
          <InputLabel>Тип заказов *</InputLabel>
          <Select
            name="order_types"
            value={formik.values.order_types}
            onChange={formik.handleChange}
          >
            <MenuItem value="cart_orders">Заказ товара (корзина)</MenuItem>
            <MenuItem value="pickup_orders">Выдача товара (точка выдачи)</MenuItem>
            <MenuItem value="both">Оба типа</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Switch
              checked={formik.values.active}
              onChange={(e) => formik.setFieldValue('active', e.target.checked)}
            />
          }
          label="Активная договоренность"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          name="description"
          label="Описание"
          value={formik.values.description}
          onChange={formik.handleChange}
        />
      </Grid>
    </Grid>
  );

  const renderCommissionStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Тип комиссии *</InputLabel>
          <Select
            name="commission_type"
            value={formik.values.commission_type}
            onChange={(e) => {
              formik.handleChange(e);
              // Сброс значений при смене типа
              if (e.target.value === 'custom') {
                formik.setFieldValue('commission_amount', '');
                formik.setFieldValue('commission_percentage', '');
                formik.setFieldValue('commission_unit', '');
              }
            }}
          >
            <MenuItem value="fixed_amount">Фиксированная сумма</MenuItem>
            <MenuItem value="percentage">Процент от суммы</MenuItem>
            <MenuItem value="custom">Индивидуальные правила</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {formik.values.commission_type !== 'custom' && (
        <>
          {formik.values.commission_type === 'fixed_amount' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                name="commission_amount"
                label="Сумма комиссии (грн) *"
                value={formik.values.commission_amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.commission_amount && Boolean(formik.errors.commission_amount)}
                helperText={formik.touched.commission_amount && formik.errors.commission_amount}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          )}

          {formik.values.commission_type === 'percentage' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                name="commission_percentage"
                label="Процент комиссии (%) *"
                value={formik.values.commission_percentage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.commission_percentage && Boolean(formik.errors.commission_percentage)}
                helperText={formik.touched.commission_percentage && formik.errors.commission_percentage}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Единица применения *</InputLabel>
              <Select
                name="commission_unit"
                value={formik.values.commission_unit}
                onChange={formik.handleChange}
              >
                <MenuItem value="per_order">За весь заказ</MenuItem>
                <MenuItem value="per_item">За каждую единицу товара</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </>
      )}

      {formik.values.commission_type === 'custom' && (
        <Grid item xs={12}>
          <Alert severity="info">
            При выборе индивидуальных правил, условия комиссии будут определяться через исключения на следующем шаге.
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  const renderExceptionsStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Исключения и особые условия
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Исключения позволяют настроить особые условия комиссии для конкретных брендов шин и диаметров.
        На данном этапе создается базовая договоренность. Исключения можно будет добавить после создания.
      </Alert>
      
      {/* TODO: Добавить таблицу исключений в будущих обновлениях */}
      <Typography variant="body2" color="text.secondary">
        Функционал добавления исключений будет доступен на странице редактирования договоренности.
      </Typography>
    </Box>
  );

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Box sx={tablePageStyles.headerContainer}>
        <Box sx={tablePageStyles.titleContainer}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/agreements')}
            sx={{ mr: 2 }}
          >
            Назад к списку
          </Button>
          <Typography variant="h4" component="h1">
            Создание договоренности
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 4 }}>
            {activeStep === 0 && renderBasicInfoStep()}
            {activeStep === 1 && renderCommissionStep()}
            {activeStep === 2 && renderExceptionsStep()}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Назад
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Далее
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={isCreating}
                >
                  {isCreating ? 'Создание...' : 'Создать договоренность'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default AgreementCreatePage;