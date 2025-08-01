/**
 * Страница формы автомобиля клиента
 * Обеспечивает создание и редактирование автомобилей клиента с валидацией
 */
import React, { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useGetClientByIdQuery } from '../../api/clients.api';
import { useGetClientCarByIdQuery, useCreateClientCarMutation, useUpdateClientCarMutation } from '../../api/clients.api';
import { useGetCarBrandsQuery, useGetCarModelsByBrandIdQuery, useGetCarTypesQuery } from '../../api';
import { ClientCarFormData } from '../../types/client';
import { getCardStyles, getButtonStyles, getTextFieldStyles, getTablePageStyles } from '../../styles/components';
import { SIZES } from '../../styles/theme';
import { getBrandName, getModelName } from '../../utils/carUtils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Схема валидации полей формы автомобиля
 * Проверяет обязательность полей и форматы данных
 */
const createValidationSchema = (t: any) => Yup.object({
  brand_id: Yup.number().required(t('admin.clients.carsManagement.form.validation.required')),
  model_id: Yup.number().required(t('admin.clients.carsManagement.form.validation.required')),
  year: Yup.number()
    .min(1900, t('admin.clients.carsManagement.form.validation.yearMin'))
    .max(new Date().getFullYear(), t('admin.clients.carsManagement.form.validation.yearMax'))
    .required(t('admin.clients.carsManagement.form.validation.required')),
  license_plate: Yup.string()
    .required(t('admin.clients.carsManagement.form.validation.required')),
  car_type_id: Yup.number().nullable(),
  is_primary: Yup.boolean(),
});

/**
 * Компонент формы создания/редактирования автомобиля клиента
 * Поддерживает два режима: создание нового автомобиля и редактирование существующего
 */

const ClientCarFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { clientId, carId } = useParams<{ clientId: string; carId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isEditMode = Boolean(carId);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const tablePageStyles = getTablePageStyles(theme);

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
   * RTK Query хуки для загрузки справочников
   */
  const { data: carBrandsData, isLoading: isLoadingBrands } = useGetCarBrandsQuery({});
  const { data: carTypesData, isLoading: isLoadingTypes } = useGetCarTypesQuery({});

  const carBrands = carBrandsData?.data || [];
  const carTypes = carTypesData || [];

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
  const initialValues = useMemo((): ClientCarFormData => {
    if (car && isEditMode) {
      // Преобразуем данные из ClientCar в ClientCarFormData
      return {
        brand_id: car.brand_id,
        model_id: car.model_id,
        year: car.year,
        license_plate: car.license_plate || '',
        car_type_id: car.car_type_id || 0,
        is_primary: car.is_primary || false,
      };
    }
    return {
      brand_id: 0,
      model_id: 0,
      year: new Date().getFullYear(),
      license_plate: '',
      car_type_id: 0,
      is_primary: false,
    };
  }, [car, isEditMode]);

  /**
   * Инициализация формы с Formik
   * Поддерживает валидацию и автоматическую переинициализацию
   */
  const formik = useFormik<ClientCarFormData>({
    initialValues,
    enableReinitialize: true, // Позволяет переинициализировать форму при изменении initialValues
    validationSchema: createValidationSchema(t),
    onSubmit: async (values) => {
      try {
        setSuccessMessage('');
        if (isEditMode && carId && clientId) {
          await updateCar({ clientId, carId, data: { car: values } }).unwrap();
          setSuccessMessage(t('admin.clients.carsManagement.form.messages.carUpdated'));
        } else if (clientId) {
          await createCar({ clientId, data: { car: values } }).unwrap();
          setSuccessMessage(t('admin.clients.carsManagement.form.messages.carCreated'));
        }
        setTimeout(() => navigate(`/admin/clients/${clientId}/cars`), 1000);
      } catch (error) {
        console.error('Ошибка при сохранении автомобиля:', error);
        
        // Показываем сообщение об ошибке пользователю
        let errorMessage = 'Произошла ошибка при сохранении автомобиля';
        if (error && typeof error === 'object' && 'data' in error) {
          const errorData = error.data as any;
          if (errorData && errorData.errors) {
            errorMessage = Object.values(errorData.errors).flat().join(', ');
          } else if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        }
        setSuccessMessage(''); // Очищаем сообщение об успехе
        // Можно добавить состояние для ошибки или использовать alert
        alert(`Ошибка: ${errorMessage}`);
      }
    },
  });

  /**
   * API запрос для моделей автомобилей (зависит от выбранной марки)
   */
  const { data: carModelsData, isLoading: isLoadingModels } = useGetCarModelsByBrandIdQuery(
    { brandId: formik.values.brand_id.toString() },
    { skip: !formik.values.brand_id }
  );
  const carModels = carModelsData?.car_models || [];

  /**
   * Мемоизированный обработчик отмены операции
   */
  const handleCancel = useCallback(() => {
    navigate(`/admin/clients/${clientId}/cars`);
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
          {t('admin.clients.carsManagement.form.messages.clientNotFound')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          {t('admin.clients.carsManagement.form.buttons.back')}
        </Button>
        <Typography variant="h4">
          {isEditMode ? t('admin.clients.carsManagement.form.title.edit') : t('admin.clients.carsManagement.form.title.create')}
        </Typography>
      </Box>

      {/* Сообщение об успехе */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

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
          {isEditMode ? t('admin.clients.carsManagement.form.title.editHeader') : t('admin.clients.carsManagement.form.title.createHeader')}
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={SIZES.spacing.lg}>
            {/* Поле марки автомобиля */}
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.brand_id && Boolean(formik.errors.brand_id)}
                sx={textFieldStyles}
              >
                <InputLabel>{t('admin.clients.carsManagement.form.fields.brand')}</InputLabel>
                <Select
                  name="brand_id"
                  value={formik.values.brand_id || ''}
                  onChange={(e) => {
                    formik.setFieldValue('brand_id', Number(e.target.value));
                    // Сбрасываем модель при смене марки
                    formik.setFieldValue('model_id', 0);
                  }}
                  label={t('admin.clients.carsManagement.form.fields.brand')}
                  disabled={isLoadingBrands}
                >
                  <MenuItem value="">
                    <em>{t('admin.clients.carsManagement.form.placeholders.selectBrand')}</em>
                  </MenuItem>
                  {carBrands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.brand_id && formik.errors.brand_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formik.errors.brand_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Поле модели автомобиля */}
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.model_id && Boolean(formik.errors.model_id)}
                sx={textFieldStyles}
                disabled={!formik.values.brand_id || isLoadingModels}
              >
                <InputLabel>{t('admin.clients.carsManagement.form.fields.model')}</InputLabel>
                <Select
                  name="model_id"
                  value={formik.values.model_id || ''}
                  onChange={(e) => formik.setFieldValue('model_id', Number(e.target.value))}
                  label={t('admin.clients.carsManagement.form.fields.model')}
                  disabled={!formik.values.brand_id || isLoadingModels}
                >
                  <MenuItem value="">
                    <em>{t('admin.clients.carsManagement.form.placeholders.selectModel')}</em>
                  </MenuItem>
                  {carModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.model_id && formik.errors.model_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formik.errors.model_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Поле года выпуска */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="year"
                label={t('admin.clients.carsManagement.form.fields.year')}
                type="number"
                value={formik.values.year}
                onChange={formik.handleChange}
                error={formik.touched.year && Boolean(formik.errors.year)}
                helperText={formik.touched.year && formik.errors.year}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Поле государственного номера */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="license_plate"
                label={t('admin.clients.carsManagement.form.fields.licensePlate')}
                value={formik.values.license_plate}
                onChange={formik.handleChange}
                error={formik.touched.license_plate && Boolean(formik.errors.license_plate)}
                helperText={formik.touched.license_plate && formik.errors.license_plate}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Поле типа автомобиля */}
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.car_type_id && Boolean(formik.errors.car_type_id)}
                sx={textFieldStyles}
              >
                <InputLabel>{t('admin.clients.carsManagement.form.fields.carType')}</InputLabel>
                <Select
                  name="car_type_id"
                  value={formik.values.car_type_id || ''}
                  onChange={(e) => formik.setFieldValue('car_type_id', Number(e.target.value) || null)}
                  label={t('admin.clients.carsManagement.form.fields.carType')}
                  disabled={isLoadingTypes}
                >
                  <MenuItem value="">
                    <em>{t('admin.clients.carsManagement.form.placeholders.selectType')}</em>
                  </MenuItem>
                  {carTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.car_type_id && formik.errors.car_type_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formik.errors.car_type_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Поле основного автомобиля */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_primary"
                    checked={formik.values.is_primary}
                    onChange={formik.handleChange}
                  />
                }
                label={t('admin.clients.carsManagement.form.fields.isPrimary')}
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
                  {t('admin.clients.carsManagement.form.buttons.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={primaryButtonStyles}
                >
                  {isEditMode ? t('admin.clients.carsManagement.form.buttons.save') : t('admin.clients.carsManagement.form.buttons.create')}
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