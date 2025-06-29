import React, { useMemo, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Grid,
  CircularProgress,
  useTheme,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useGetClientByIdQuery, useCreateClientMutation, useUpdateClientMutation, clientsApi } from '../../api/clients.api';
import { ClientFormData, ClientUpdateData, ClientCreateData } from '../../types/client';
import { clientToFormData } from '../../utils/clientExtensions';
import { phoneValidation } from '../../utils/validation';

// Импорты UI компонентов
import {
  Box,
  Typography,
  TextField,
  Button,
  PhoneField,
} from '../../components/ui';
import Notification from '../../components/Notification';

// Импорт централизованных стилей
import { getFormStyles, getTablePageStyles } from '../../styles/components';

/**
 * Схема валидации для формы клиента
 * Определяет правила валидации полей клиента:
 * - Имя и фамилия: обязательные поля
 * - Телефон: обязательное поле, проверка формата (10-15 цифр с возможным +)
 * - Email: необязательное поле, проверка формата email если заполнено
 */
const validationSchema = Yup.object({
  user_attributes: Yup.object({
    first_name: Yup.string()
      .required('Имя обязательно')
      .min(2, 'Имя должно быть не менее 2 символов'),
    last_name: Yup.string()
      .required('Фамилия обязательна')
      .min(2, 'Фамилия должна быть не менее 2 символов'),
    phone: phoneValidation,
         email: Yup.string()
       .email('Введите корректный email'),
    is_active: Yup.boolean()
  }),
  preferred_notification_method: Yup.string(),
  marketing_consent: Yup.boolean()
});

/**
 * Компонент формы создания/редактирования клиента
 * Поддерживает два режима работы:
 * - Создание нового клиента (без ID в URL)
 * - Редактирование существующего клиента (с ID в URL)
 * 
 * Использует централизованную систему стилей для консистентного UI
 */

const ClientFormPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Состояния для уведомлений
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Инициализация централизованных стилей
  const formStyles = getFormStyles(theme);
  const tablePageStyles = getTablePageStyles(theme);

  // RTK Query хуки
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(id || '', {
    skip: !isEditMode,
    refetchOnMountOrArgChange: true,
  });

  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();

  const isLoading = isLoadingClient || isCreating || isUpdating;

  // Получение начальных значений формы
  const initialValues = useMemo(() => {
    if (client && isEditMode) {
      return clientToFormData(client);
    }
    return {
      user_attributes: {
        first_name: '',
        last_name: '',
        middle_name: '',
        phone: '',
        email: '',
        is_active: true
      },
      preferred_notification_method: 'push',
      marketing_consent: false
    };
  }, [client, isEditMode]);

  // Инициализация формы
  const formik = useFormik<ClientFormData>({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (isEditMode && client) {
          // Обновление существующего клиента
          const updateData: ClientUpdateData = {
            user: {
              first_name: values.user_attributes.first_name,
              last_name: values.user_attributes.last_name,
              middle_name: values.user_attributes.middle_name || '',
              phone: values.user_attributes.phone || '',
              email: values.user_attributes.email || '',
              is_active: values.user_attributes.is_active,
            }
          };
          
          await updateClient({
            id: client.id.toString(),
            client: updateData
          }).unwrap();
          
          setSnackbarMessage('Клиент успешно обновлен');
          setSnackbarOpen(true);
          navigate('/admin/clients');
        } else {
          // Создание нового клиента
          // Создаем объект пользователя, исключая пустой email
          const userData: any = {
            first_name: values.user_attributes.first_name,
            last_name: values.user_attributes.last_name,
            middle_name: values.user_attributes.middle_name || '',
            phone: values.user_attributes.phone || '',
            password: 'default_password', // Временный пароль
            password_confirmation: 'default_password'
          };

          // Добавляем email только если он заполнен (избегаем пустой строки)
          if (values.user_attributes.email && values.user_attributes.email.trim() !== '') {
            userData.email = values.user_attributes.email.trim();
          }

          const createData: ClientCreateData = {
            user: userData,
            client: {
              preferred_notification_method: values.preferred_notification_method,
              marketing_consent: values.marketing_consent
            }
          };
          
          console.log('🚀 Sending client data:', JSON.stringify(createData, null, 2));
          
          await createClient(createData).unwrap();
          
          setSnackbarMessage('Клиент успешно создан');
          setSnackbarOpen(true);
          navigate('/admin/clients');
        }
      } catch (error: any) {
        console.error('Error saving client:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error data:', error?.data);
        console.error('Error status:', error?.status);
        
        const errorMessage = extractErrorMessage(error);
        setApiError(errorMessage);
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Мемоизированный обработчик навигации
  const handleCancel = useCallback(() => {
    navigate('/admin/clients');
  }, [navigate]);

  // Функция для проверки валидности формы
  const isFormValid = useCallback(() => {
    const { user_attributes } = formik.values;
    return (
      user_attributes.first_name.trim() !== '' &&
      user_attributes.last_name.trim() !== '' &&
      (user_attributes.phone || '').trim() !== '' &&
      Object.keys(formik.errors).length === 0
    );
  }, [formik.values, formik.errors]);

  // Функция для получения списка незаполненных полей
  const getRequiredFieldErrors = useCallback(() => {
    const errors: string[] = [];
    const { user_attributes } = formik.values;
    
    if (!user_attributes.first_name.trim()) errors.push('Имя');
    if (!user_attributes.last_name.trim()) errors.push('Фамилия');
    if (!(user_attributes.phone || '').trim()) errors.push('Номер телефона');
    
    return errors;
  }, [formik.values]);

  // Обработчик закрытия уведомлений
  const handleCloseNotification = useCallback(() => {
    setSnackbarOpen(false);
    setSnackbarMessage(null);
    setApiError(null);
    setSuccessMessage(null);
  }, []);

  // Функция для извлечения сообщения об ошибке
  const extractErrorMessage = useCallback((error: any): string => {
    if (error?.data?.message) {
      return error.data.message;
    }
    if (error?.data?.errors) {
      const errors = Object.values(error.data.errors).flat();
      return errors.join(', ');
    }
    if (error?.message) {
      return error.message;
    }
    return 'Произошла неизвестная ошибка';
  }, []);

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
        <Typography 
          variant="h5" 
          sx={formStyles.sectionTitle}
        >
          {isEditMode ? 'Редактирование клиента' : 'Новый клиент'}
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="first_name"
                name="user_attributes.first_name"
                label="Имя *"
                value={formik.values.user_attributes.first_name}
                onChange={formik.handleChange}
                error={formik.touched.user_attributes?.first_name && Boolean(formik.errors.user_attributes?.first_name)}
                helperText={formik.touched.user_attributes?.first_name && formik.errors.user_attributes?.first_name}
                sx={formStyles.field}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="last_name"
                name="user_attributes.last_name"
                label="Фамилия *"
                value={formik.values.user_attributes.last_name}
                onChange={formik.handleChange}
                error={formik.touched.user_attributes?.last_name && Boolean(formik.errors.user_attributes?.last_name)}
                helperText={formik.touched.user_attributes?.last_name && formik.errors.user_attributes?.last_name}
                sx={formStyles.field}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="middle_name"
                name="user_attributes.middle_name"
                label="Отчество"
                value={formik.values.user_attributes.middle_name}
                onChange={formik.handleChange}
                error={formik.touched.user_attributes?.middle_name && Boolean(formik.errors.user_attributes?.middle_name)}
                helperText={formik.touched.user_attributes?.middle_name && formik.errors.user_attributes?.middle_name}
                sx={formStyles.field}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <PhoneField
                fullWidth
                id="phone"
                name="user_attributes.phone"
                value={formik.values.user_attributes.phone}
                onChange={(value: string) => formik.setFieldValue('user_attributes.phone', value)}
                error={formik.touched.user_attributes?.phone && Boolean(formik.errors.user_attributes?.phone)}
                helperText={formik.touched.user_attributes?.phone && formik.errors.user_attributes?.phone}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="user_attributes.email"
                label="Email"
                placeholder="example@email.com (необязательно)"
                value={formik.values.user_attributes.email}
                onChange={formik.handleChange}
                error={formik.touched.user_attributes?.email && Boolean(formik.errors.user_attributes?.email)}
                helperText={formik.touched.user_attributes?.email && formik.errors.user_attributes?.email}
                sx={formStyles.field}
              />
            </Grid>

            {/* Переключатель активности */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                height: '100%',
                paddingTop: theme.spacing(1)
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.user_attributes.is_active}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        formik.setFieldValue('user_attributes.is_active', e.target.checked)
                      }
                      name="user_attributes.is_active"
                      color="primary"
                    />
                  }
                  label="Активный клиент"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              {/* Уведомления */}
              {apiError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {apiError}
                </Alert>
              )}
              
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}

              {/* Уведомление о незаполненных обязательных полях */}
              {(!isFormValid()) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Заполните все обязательные поля:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                    {getRequiredFieldErrors().map((field, index) => (
                      <Typography variant="body2" component="li" key={index}>
                        {field}
                      </Typography>
                    ))}
                  </Box>
                </Alert>
              )}

              {/* Информационное сообщение при заполненной форме */}
              {isFormValid() && !apiError && !successMessage && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Все обязательные поля заполнены. Можете создать клиента.
                </Alert>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
                marginTop: theme.spacing(3),
              }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? 'Сохранение...' : (isEditMode ? 'Сохранить' : 'Создать')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        <Notification
          open={snackbarOpen}
          message={snackbarMessage || ''}
          severity={snackbarSeverity}
          onClose={handleCloseNotification}
        />
    </Box>
  );
};

export default ClientFormPage; 