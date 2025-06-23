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

// Импорты UI компонентов
import {
  Box,
  Typography,
  TextField,
  Button,
} from '../../components/ui';

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
  first_name: Yup.string().required('Обязательное поле'),
  last_name: Yup.string().required('Обязательное поле'),
  phone: Yup.string()
    .required('Обязательное поле')
    .matches(/^\+?[0-9]{10,15}$/, 'Неверный формат телефона'),
  email: Yup.string()
    .email('Неверный формат email')
    .notRequired(),
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
          navigate('/clients');
        } else {
          // Создание нового клиента
          const createData: ClientCreateData = {
            user: {
              first_name: values.user_attributes.first_name,
              last_name: values.user_attributes.last_name,
              middle_name: values.user_attributes.middle_name || '',
              phone: values.user_attributes.phone || '',
              email: values.user_attributes.email || '',
              password: 'default_password', // Временный пароль
              password_confirmation: 'default_password'
            },
            client: {
              preferred_notification_method: values.preferred_notification_method,
              marketing_consent: values.marketing_consent
            }
          };
          
          await createClient(createData).unwrap();
          
          setSnackbarMessage('Клиент успешно создан');
          setSnackbarOpen(true);
          navigate('/clients');
        }
      } catch (error) {
        console.error('Error saving client:', error);
        setSnackbarMessage('Ошибка при сохранении клиента');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Мемоизированный обработчик навигации
  const handleCancel = useCallback(() => {
    navigate('/clients');
  }, [navigate]);

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
              <TextField
                fullWidth
                id="phone"
                name="user_attributes.phone"
                label="Телефон *"
                value={formik.values.user_attributes.phone}
                onChange={formik.handleChange}
                error={formik.touched.user_attributes?.phone && Boolean(formik.errors.user_attributes?.phone)}
                helperText={formik.touched.user_attributes?.phone && formik.errors.user_attributes?.phone}
                sx={formStyles.field}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="user_attributes.email"
                label="Email (необязательно)"
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
                  disabled={isLoading}
                >
                  {isLoading ? 'Сохранение...' : (isEditMode ? 'Сохранить' : 'Создать')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
    </Box>
  );
};

export default ClientFormPage; 