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
import { useGetClientByIdQuery } from '../../api/clients.api';
import { useGetClientCarByIdQuery, useCreateClientCarMutation, useUpdateClientCarMutation } from '../../api/clients.api';
import { ClientCar, ClientCarFormData } from '../../types/client';

// Схема валидации
const validationSchema = Yup.object({
  brand: Yup.string().required('Обязательное поле'),
  model: Yup.string().required('Обязательное поле'),
  year: Yup.number()
    .min(1900, 'Год должен быть не раньше 1900')
    .max(new Date().getFullYear(), 'Год не может быть больше текущего')
    .required('Обязательное поле'),
  vin: Yup.string().required('Обязательное поле'),
  license_plate: Yup.string()
    .matches(/^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/, 'Неверный формат номера')
    .required('Обязательное поле'),
});

const ClientCarFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { clientId, carId } = useParams<{ clientId: string; carId: string }>();
  const isEditMode = Boolean(carId);

  // RTK Query хуки
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(clientId || '');
  const { data: car, isLoading: isLoadingCar } = useGetClientCarByIdQuery(
    { clientId: clientId || '', carId: carId || '' },
    { skip: !isEditMode }
  );

  const [createCar, { isLoading: isCreating }] = useCreateClientCarMutation();
  const [updateCar, { isLoading: isUpdating }] = useUpdateClientCarMutation();

  const isLoading = isLoadingClient || isLoadingCar || isCreating || isUpdating;

  // Инициализация формы
  const formik = useFormik<ClientCarFormData>({
    initialValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      license_plate: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode && carId && clientId) {
          await updateCar({ clientId, carId, data: values }).unwrap();
        } else if (clientId) {
          await createCar({ clientId, data: values }).unwrap();
        }
        navigate(`/clients/${clientId}/cars`);
      } catch (error) {
        console.error('Ошибка при сохранении автомобиля:', error);
      }
    },
  });

  // Заполнение формы данными при редактировании
  useEffect(() => {
    if (car) {
      formik.setValues({
        brand: car.brand,
        model: car.model,
        year: car.year,
        vin: car.vin,
        license_plate: car.license_plate,
      });
    }
  }, [car]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Клиент не найден
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? 'Редактирование автомобиля' : 'Новый автомобиль'}
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="brand"
                label="Марка"
                value={formik.values.brand}
                onChange={formik.handleChange}
                error={formik.touched.brand && Boolean(formik.errors.brand)}
                helperText={formik.touched.brand && formik.errors.brand}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="model"
                label="Модель"
                value={formik.values.model}
                onChange={formik.handleChange}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={formik.touched.model && formik.errors.model}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="year"
                label="Год выпуска"
                type="number"
                value={formik.values.year}
                onChange={formik.handleChange}
                error={formik.touched.year && Boolean(formik.errors.year)}
                helperText={formik.touched.year && formik.errors.year}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="vin"
                label="VIN номер"
                value={formik.values.vin}
                onChange={formik.handleChange}
                error={formik.touched.vin && Boolean(formik.errors.vin)}
                helperText={formik.touched.vin && formik.errors.vin}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="license_plate"
                label="Гос. номер"
                value={formik.values.license_plate}
                onChange={formik.handleChange}
                error={formik.touched.license_plate && Boolean(formik.errors.license_plate)}
                helperText={formik.touched.license_plate && formik.errors.license_plate}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/clients/${clientId}/cars`)}
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

export default ClientCarFormPage; 