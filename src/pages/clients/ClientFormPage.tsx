import React, { useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import { useGetClientByIdQuery, useCreateClientMutation, useUpdateClientMutation } from '../../api/clients.api';
import { ClientFormData } from '../../types/client';

// Схема валидации
const validationSchema = Yup.object({
  first_name: Yup.string().required('Обязательное поле'),
  last_name: Yup.string().required('Обязательное поле'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Неверный формат телефона'),
  email: Yup.string()
    .email('Неверный формат email'),
});

const ClientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // RTK Query хуки
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(id || '', {
    skip: !isEditMode,
  });

  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();

  const isLoading = isLoadingClient || isCreating || isUpdating;

  // Инициализация формы
  const formik = useFormik<ClientFormData>({
    initialValues: {
      first_name: '',
      last_name: '',
      middle_name: '',
      phone: '',
      email: '',
      is_active: true,
    },
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

  // Заполнение формы данными при редактировании
  useEffect(() => {
    if (client) {
      formik.setValues({
        first_name: client.first_name,
        last_name: client.last_name,
        middle_name: client.middle_name || '',
        phone: client.phone || '',
        email: client.email || '',
        is_active: client.is_active,
      });
    }
  }, [client]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
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
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/clients')}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
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