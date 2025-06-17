import React, { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Grid,
  CircularProgress,
  useTheme,
  Alert,
} from '@mui/material';
import { useGetClientByIdQuery, useCreateClientMutation, useUpdateClientMutation, clientsApi } from '../../api/clients.api';
import { ClientFormData } from '../../types/client';

// Импорты UI компонентов
import {
  Box,
  Typography,
  TextField,
  Button,
} from '../../components/ui';

// Импорт централизованных стилей
import { getFormStyles } from '../../styles/components';

/**
 * Схема валидации для формы клиента
 * Определяет правила валидации полей клиента:
 * - Имя и фамилия: обязательные поля
 * - Телефон: проверка формата (10-15 цифр с возможным +)
 * - Email: проверка формата email
 */
const validationSchema = Yup.object({
  first_name: Yup.string().required('Обязательное поле'),
  last_name: Yup.string().required('Обязательное поле'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Неверный формат телефона'),
  email: Yup.string()
    .email('Неверный формат email'),
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

  // Инициализация централизованных стилей
  const formStyles = getFormStyles(theme);

  // RTK Query хуки
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(id || '', {
    skip: !isEditMode,
    refetchOnMountOrArgChange: true,
  });

  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();

  const isLoading = isLoadingClient || isCreating || isUpdating;

  // Мемоизированные начальные значения
  const initialValues = useMemo(() => {
    if (client && isEditMode) {
      return {
        first_name: client.first_name,
        last_name: client.last_name,
        middle_name: client.middle_name || '',
        phone: client.phone || '',
        email: client.email || '',
        is_active: client.is_active,
      };
    }
    return {
      first_name: '',
      last_name: '',
      middle_name: '',
      phone: '',
      email: '',
      is_active: true,
    };
  }, [client, isEditMode]);

  // Инициализация формы
  const formik = useFormik<ClientFormData>({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setApiError(null);
        setSuccessMessage(null);
        
        if (isEditMode && id) {
          // Для обновления клиента отправляем данные в формате { user: {...} }
          const updateData = {
            user: {
              first_name: values.first_name,
              last_name: values.last_name,
              middle_name: values.middle_name || '',
              phone: values.phone || '',
              email: values.email || '',
            }
          };
          
          await updateClient({ id, client: updateData }).unwrap();
          // Принудительно инвалидируем кэш
          dispatch(clientsApi.util.invalidateTags([{ type: 'Client', id }, 'Client']));
          setSuccessMessage('Клиент успешно обновлен');
        } else {
          await createClient(values).unwrap();
          // Принудительно инвалидируем кэш
          dispatch(clientsApi.util.invalidateTags(['Client']));
          setSuccessMessage('Клиент успешно создан');
        }
        
        // Переходим к списку клиентов через небольшую задержку
        setTimeout(() => {
          navigate('/clients');
        }, 1500);
      } catch (error: any) {
        console.error('Ошибка при сохранении клиента:', error);
        setApiError(extractErrorMessage(error));
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
    <Box sx={{ padding: theme.spacing(3) }}>
      <Box sx={formStyles.container}>
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
                name="first_name"
                label="Имя"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
                sx={formStyles.field}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="last_name"
                label="Фамилия"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
                sx={formStyles.field}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="middle_name"
                label="Отчество"
                value={formik.values.middle_name}
                onChange={formik.handleChange}
                error={formik.touched.middle_name && Boolean(formik.errors.middle_name)}
                helperText={formik.touched.middle_name && formik.errors.middle_name}
                sx={formStyles.field}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone"
                label="Телефон"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                sx={formStyles.field}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={formStyles.field}
              />
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
    </Box>
  );
};

export default ClientFormPage; 