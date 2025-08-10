import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Grid,
  Paper,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ArrowBack, Save, Add, Edit, Delete } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { getTablePageStyles } from '../../styles/tablePageStyles';
import Notification from '../../components/Notification';
import ExceptionsManagerNew from './components/ExceptionsManagerNew';
import { 
  useGetAgreementQuery,
  useUpdateAgreementMutation, 
  useGetAgreementPartnersQuery,
  useGetAgreementSuppliersQuery,
  Agreement,
  AgreementException 
} from '../../api/agreements.api';

// Схема валидации (улучшенная версия как в создании)
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

const AgreementEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // API hooks
  const { data: agreementResponse, isLoading: agreementLoading, error: agreementError } = useGetAgreementQuery(Number(id!));
  
  const agreement = agreementResponse?.data;
  const [updateAgreement, { isLoading: isUpdating }] = useUpdateAgreementMutation();
  const { data: partnersResponse, isLoading: partnersLoading } = useGetAgreementPartnersQuery();
  const { data: suppliersResponse, isLoading: suppliersLoading } = useGetAgreementSuppliersQuery();
  
  const partners = partnersResponse?.data || [];
  const suppliers = suppliersResponse?.data || [];

  // Formik
  const formik = useFormik({
    initialValues: {
      partner_id: '',
      supplier_id: '',
      start_date: '',
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

        await updateAgreement({ id: id!, agreement: agreementData }).unwrap();
        
        setNotification({
          open: true,
          message: 'Договоренность успешно обновлена',
          severity: 'success',
        });

        // Редирект на страницу списка договоренностей после успешного сохранения
        setTimeout(() => {
          navigate('/admin/agreements');
        }, 1000); // Небольшая задержка чтобы пользователь увидел уведомление
      } catch (error: any) {
        console.error('Ошибка при обновлении договоренности:', error);
        
        let errorMessage = 'Ошибка при обновлении договоренности';
        
        if (error?.data) {
          if (error.data.errors && Array.isArray(error.data.errors)) {
            // Если есть массив ошибок валидации
            errorMessage = `Ошибки валидации:\n${error.data.errors.join('\n')}`;
          } else if (error.data.message) {
            // Если есть конкретное сообщение
            errorMessage = error.data.message;
          } else if (error.data.error) {
            // Альтернативный формат ошибки
            errorMessage = error.data.error;
          } else if (typeof error.data === 'string') {
            // Если ошибка в виде строки
            errorMessage = error.data;
          }
        } else if (error?.message) {
          // Сетевые или другие ошибки
          errorMessage = `Сетевая ошибка: ${error.message}`;
        } else if (error?.status) {
          // HTTP статус коды
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
            case 404:
              errorMessage = 'Договоренность не найдена';
              break;
            case 422:
              errorMessage = 'Ошибка валидации данных. Проверьте правильность заполнения полей';
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

  // Заполнение формы данными из API
  useEffect(() => {
    if (agreement) {
      formik.setValues({
        partner_id: agreement.partner_id.toString(),
        supplier_id: agreement.supplier_id.toString(),
        start_date: agreement.start_date,
        end_date: agreement.end_date || '',
        commission_type: agreement.commission_type,
        commission_amount: agreement.commission_amount?.toString() || '',
        commission_percentage: agreement.commission_percentage?.toString() || '',
        commission_unit: agreement.commission_unit || 'per_order',
        order_types: agreement.order_types,
        active: agreement.active,
        description: agreement.description || '',
      });
    }
  }, [agreement]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (agreementLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (agreementError) {
    return (
      <Box sx={tablePageStyles.pageContainer}>
        <Alert severity="error">
          Ошибка загрузки договоренности. Проверьте правильность ID или попробуйте позже.
        </Alert>
      </Box>
    );
  }

  const renderBasicInfoTab = () => (
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
            {partnersLoading && (
              <MenuItem value="" disabled>
                Загрузка партнеров...
              </MenuItem>
            )}
            {!partnersLoading && partners.length === 0 && (
              <MenuItem value="" disabled>
                Партнеры не найдены
              </MenuItem>
            )}
            {partners.map((partner) => (
              <MenuItem 
                key={partner.id} 
                value={partner.id}
                sx={{ 
                  opacity: partner.is_active ? 1 : 0.6,
                  fontStyle: partner.is_active ? 'normal' : 'italic'
                }}
              >
                {partner.company_name} ({partner.contact_person})
                {!partner.is_active && <span style={{ color: '#f44336', marginLeft: '8px' }}>[НЕАКТИВЕН]</span>}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.partner_id && formik.errors.partner_id && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {formik.errors.partner_id}
            </Typography>
          )}
          {/* Отладочная информация только в dev режиме */}
          {process.env.NODE_ENV === 'development' && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              DEBUG: partnersLoading={partnersLoading.toString()}, partners.length={partners.length}, 
              current_value={formik.values.partner_id}
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

  const renderCommissionTab = () => (
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
            При выборе индивидуальных правил, условия комиссии определяются через исключения во вкладке "Исключения".
          </Alert>
        </Grid>
      )}
    </Grid>
  );

      const renderExceptionsTab = () => (
      <ExceptionsManagerNew agreementId={Number(id!)} />
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
            Редактирование договоренности #{id}
          </Typography>
        </Box>
      </Box>

      {agreement && (
        <Paper sx={{ mb: 2, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Партнер:</strong> {agreement.partner_info?.company_name} | 
            <strong> Поставщик:</strong> {agreement.supplier_info?.name} | 
            <strong> Создано:</strong> {agreement.formatted_created_at}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Основная информация" />
          <Tab label="Условия комиссии" />
          <Tab label="Исключения" />
        </Tabs>

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 4 }}>
            {activeTab === 0 && renderBasicInfoTab()}
            {activeTab === 1 && renderCommissionTab()}
            {activeTab === 2 && renderExceptionsTab()}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={isUpdating}
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
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

export default AgreementEditPage;