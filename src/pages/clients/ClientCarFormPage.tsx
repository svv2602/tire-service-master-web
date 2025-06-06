/**
 * Страница формы автомобиля клиента
 * Обеспечивает создание и редактирование автомобилей клиента с валидацией
 */
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
  Alert,
  useTheme,
} from '@mui/material';
import { useGetClientByIdQuery } from '../../api/clients.api';
import { useGetClientCarByIdQuery, useCreateClientCarMutation, useUpdateClientCarMutation } from '../../api/clients.api';
import { ClientCarFormData } from '../../types/client';
import { getCardStyles, getButtonStyles, getTextFieldStyles } from '../../styles/components';
import { SIZES } from '../../styles/theme';

/**
 * Схема валидации полей формы автомобиля
 * Проверяет обязательность полей и форматы данных
 */
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

/**
 * Компонент формы создания/редактирования автомобиля клиента
 * Поддерживает два режима: создание нового автомобиля и редактирование существующего
 */

const ClientCarFormPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { clientId, carId } = useParams<{ clientId: string; carId: string }>();
  const isEditMode = Boolean(carId);

  /**
   * Получаем централизованные стили для консистентного дизайна
   */
  const cardStyles = getCardStyles(theme, 'primary');
  const primaryButtonStyles = getButtonStyles(theme, 'primary');
  const secondaryButtonStyles = getButtonStyles(theme, 'secondary');
  const textFieldStyles = getTextFieldStyles(theme, 'filled');

  /**
   * RTK Query хуки для загрузки данных клиента и автомобиля
   */
  const { data: client, isLoading: isLoadingClient } = useGetClientByIdQuery(clientId || '');
  const { data: car, isLoading: isLoadingCar } = useGetClientCarByIdQuery(
    { clientId: clientId || '', carId: carId || '' },
    { skip: !isEditMode }
  );

  /**
   * Мутации для создания и обновления автомобиля
   */
  const [createCar, { isLoading: isCreating }] = useCreateClientCarMutation();
  const [updateCar, { isLoading: isUpdating }] = useUpdateClientCarMutation();

  const isLoading = isLoadingClient || isLoadingCar || isCreating || isUpdating;

  /**
   * Мемоизированные начальные значения формы
   * В режиме редактирования используются данные автомобиля, иначе пустые значения
   */
  const initialValues = useMemo(() => {
    if (car && isEditMode) {
      return {
        brand: car.brand,
        model: car.model,
        year: car.year,
        vin: car.vin,
        license_plate: car.license_plate,
      };
    }
    return {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      license_plate: '',
    };
  }, [car, isEditMode]);

  /**
   * Инициализация формы с Formik
   * Поддерживает валидацию и автоматическую переинициализацию
   */
  const formik = useFormik<ClientCarFormData>({
    initialValues,
    enableReinitialize: true, // Позволяет переинициализировать форму при изменении initialValues
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

  /**
   * Мемоизированный обработчик отмены операции
   */
  const handleCancel = useCallback(() => {
    navigate(`/clients/${clientId}/cars`);
  }, [navigate, clientId]);

  /**
   * Индикатор загрузки с центрированным размещением
   */
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Сообщение об ошибке если клиент не найден
   */
  if (!client) {
    return (
      <Box sx={{ p: SIZES.spacing.xl }}>
        <Alert severity="error">
          Клиент не найден
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: SIZES.spacing.xl }}>
      <Paper sx={cardStyles}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontSize: SIZES.fontSize.xl,
            fontWeight: 600,
            mb: SIZES.spacing.lg 
          }}
        >
          {isEditMode ? 'Редактирование автомобиля' : 'Новый автомобиль'}
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={SIZES.spacing.lg}>
            {/* Поле марки автомобиля */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="brand"
                label="Марка"
                value={formik.values.brand}
                onChange={formik.handleChange}
                error={formik.touched.brand && Boolean(formik.errors.brand)}
                helperText={formik.touched.brand && formik.errors.brand}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Поле модели автомобиля */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="model"
                label="Модель"
                value={formik.values.model}
                onChange={formik.handleChange}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={formik.touched.model && formik.errors.model}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Поле года выпуска */}
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
                sx={textFieldStyles}
              />
            </Grid>

            {/* Поле VIN номера */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="vin"
                label="VIN номер"
                value={formik.values.vin}
                onChange={formik.handleChange}
                error={formik.touched.vin && Boolean(formik.errors.vin)}
                helperText={formik.touched.vin && formik.errors.vin}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Поле государственного номера */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="license_plate"
                label="Гос. номер"
                value={formik.values.license_plate}
                onChange={formik.handleChange}
                error={formik.touched.license_plate && Boolean(formik.errors.license_plate)}
                helperText={formik.touched.license_plate && formik.errors.license_plate}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Контейнер с кнопками управления формой */}
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                gap: SIZES.spacing.md, 
                justifyContent: 'flex-end',
                mt: SIZES.spacing.lg
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

export default ClientCarFormPage; 