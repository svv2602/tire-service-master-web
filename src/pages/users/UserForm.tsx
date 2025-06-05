import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '../../api';

import { UserFormData } from '../../types/user';
import { getRoleId } from '../../utils/roles.utils';

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const userId = isEditMode ? parseInt(id!, 10) : 0;

  const navigate = useNavigate();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const { 
    data: userData,
    isLoading: isLoadingUser,
  } = useGetUserByIdQuery(userId.toString(), {
    skip: !isEditMode
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isLoading = isLoadingUser || isCreating || isUpdating;

  // Схема валидации с Yup
  const validationSchema = yup.object({
    email: yup
      .string()
      .email('Введите корректный email')
      .required('Email обязателен'),
    first_name: yup
      .string()
      .required('Имя обязательно'),
    last_name: yup
      .string()
      .required('Фамилия обязательна'),
    role_id: yup
      .number()
      .required('Роль обязательна'),
    is_active: yup
      .boolean(),
    password: isEditMode
      ? yup.string().min(6, 'Пароль должен содержать минимум 6 символов')
      : yup.string().min(6, 'Пароль должен содержать минимум 6 символов').required('Пароль обязателен'),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password')], 'Пароли не совпадают')
  });

  // Начальные значения формы
  const initialFormValues: UserFormData = {
    email: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '',
    role_id: 5, // По умолчанию клиент (role_id = 5)
    is_active: true,
    password: '',
    password_confirmation: ''
  };
  
  // Formik хук для управления формой
  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setApiError(null);
        
        // Подготавливаем данные для API
        const userData: UserFormData = {
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          middle_name: values.middle_name || '',
          phone: values.phone || '',
          role_id: values.role_id,
          is_active: values.is_active,
          ...(values.password && { password: values.password }),
          ...(values.password_confirmation && { password_confirmation: values.password_confirmation })
        };

        if (isEditMode) {
          await updateUser({ id: userId.toString(), data: userData }).unwrap();
        } else {
          await createUser(userData).unwrap();
        }
        navigate('/users');
      } catch (error: any) {
        console.error('Ошибка при сохранении пользователя:', error);
        if (error.data?.errors) {
          const apiErrors: Record<string, string> = {};
          
          // Преобразование ошибок API в формат, который можно использовать с Formik
          Object.entries(error.data.errors).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              apiErrors[key] = value.join(', ');
            } else if (typeof value === 'string') {
              apiErrors[key] = value as string;
            } else if (value && typeof value === 'object') {
              apiErrors[key] = JSON.stringify(value);
            }
          });
          
          // Устанавливаем ошибки для полей формы
          Object.keys(apiErrors).forEach(key => {
            formik.setFieldError(key, apiErrors[key]);
          });
          
          setApiError('Пожалуйста, исправьте ошибки в форме');
        } else if (error.message) {
          setApiError(error.message);
        } else {
          setApiError('Произошла ошибка при сохранении пользователя');
        }
      }
    },
  });
  
  // Обновление значений формы при получении данных пользователя
  useEffect(() => {
    if (isEditMode && userData?.data) {
      const user = userData.data;
      formik.setValues({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        phone: user.phone || '',
        role_id: user.role_id,
        is_active: user.is_active === true,
        password: '',
        password_confirmation: ''
      });
    }
  }, [isEditMode, userData]);
  
  // Функция для отмены редактирования
  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? 'Редактирование пользователя' : 'Создание пользователя'}
        </Typography>

        {isLoadingUser ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {apiError}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Телефон"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="first_name"
                  name="first_name"
                  label="Имя"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="last_name"
                  name="last_name"
                  label="Фамилия"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="middle_name"
                  name="middle_name"
                  label="Отчество"
                  value={formik.values.middle_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.middle_name && Boolean(formik.errors.middle_name)}
                  helperText={formik.touched.middle_name && formik.errors.middle_name}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Роль</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role_id"
                    name="role_id"
                    value={formik.values.role_id}
                    label="Роль"
                    onChange={formik.handleChange}
                    error={formik.touched.role_id && Boolean(formik.errors.role_id)}
                  >
                    <MenuItem value={1}>Администратор</MenuItem>
                    <MenuItem value={2}>Менеджер</MenuItem>
                    <MenuItem value={3}>Партнер</MenuItem>
                    <MenuItem value={4}>Оператор</MenuItem>
                    <MenuItem value={5}>Клиент</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="is_active"
                      name="is_active"
                      checked={formik.values.is_active}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Активен"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              {isEditMode ? 'Изменить пароль' : 'Пароль'}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type="password"
                  label="Пароль"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  required={!isEditMode}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  label="Подтверждение пароля"
                  value={formik.values.password_confirmation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password_confirmation && Boolean(formik.errors.password_confirmation)}
                  helperText={formik.touched.password_confirmation && formik.errors.password_confirmation}
                  required={!isEditMode}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
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
                {isLoading 
                  ? 'Сохранение...' 
                  : (isEditMode ? 'Сохранить' : 'Создать')
                }
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default UserForm;