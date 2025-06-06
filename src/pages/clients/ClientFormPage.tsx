import React, { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useGetClientByIdQuery, useCreateClientMutation, useUpdateClientMutation } from '../../api/clients.api';
import { ClientFormData } from '../../types/client';
import { getCardStyles, getButtonStyles, getTextFieldStyles } from '../../styles/components';
import { SIZES } from '../../styles/theme';

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
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Централизованные стили
  const cardStyles = getCardStyles(theme);
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme);

  // RTK Query хуки
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(id || '', {
    skip: !isEditMode,
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
    initialValues,
    enableReinitialize: true, // Позволяет переинициализировать форму при изменении initialValues
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode && id) {
          await updateClient({ id, client: values }).unwrap();
        } else {
          await createClient(values).unwrap();
        }
        navigate('/clients');
      } catch (error) {
        console.error('Ошибка при сохранении клиента:', error);
      }
    },
  });

  // Мемоизированный обработчик навигации
  const handleCancel = useCallback(() => {
    navigate('/clients');
  }, [navigate]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: SIZES.spacing.xl }}>
      <Paper sx={cardStyles}>
        <Typography 
          variant="h5" 
          sx={{ 
            marginBottom: SIZES.spacing.lg,
            fontSize: SIZES.fontSize.xl,
            fontWeight: 600,
          }}
        >
          {isEditMode ? 'Редактирование клиента' : 'Новый клиент'}
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={SIZES.spacing.lg}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="first_name"
                label="Имя"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
                sx={textFieldStyles}
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
                sx={textFieldStyles}
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
                sx={textFieldStyles}
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
                sx={textFieldStyles}
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
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                gap: SIZES.spacing.md, 
                justifyContent: 'flex-end',
                marginTop: SIZES.spacing.lg,
              }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={secondaryButtonStyles}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={primaryButtonStyles}
                >
                  {isEditMode ? 'Сохранить' : 'Создать'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ClientFormPage; 