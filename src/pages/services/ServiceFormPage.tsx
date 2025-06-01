import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import {
  useGetServiceCategoryByIdQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
} from '../../api/serviceCategories.api';
import { ServiceCategoryFormData } from '../../types/service';
import ServicesList from '../../components/ServicesList';

const validationSchema = Yup.object({
  name: Yup.string().required('Название обязательно'),
  description: Yup.string(),
  is_active: Yup.boolean(),
  sort_order: Yup.number().min(0, 'Порядок сортировки должен быть неотрицательным'),
});

export const ServiceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [submitError, setSubmitError] = useState<string>('');

  const { data: category, isLoading } = useGetServiceCategoryByIdQuery(id!, {
    skip: !isEditing,
  });

  const [createCategory] = useCreateServiceCategoryMutation();
  const [updateCategory] = useUpdateServiceCategoryMutation();

  const formik = useFormik<ServiceCategoryFormData>({
    initialValues: {
      name: '',
      description: '',
      is_active: true,
      sort_order: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitError('');
        if (isEditing && id) {
          await updateCategory({ id, data: values }).unwrap();
        } else {
          await createCategory(values).unwrap();
        }
        navigate('/services');
      } catch (error: any) {
        setSubmitError(error?.data?.message || 'Произошла ошибка при сохранении');
      }
    },
  });

  useEffect(() => {
    if (category) {
      formik.setValues({
        name: category.name || '',
        description: category.description || '',
        is_active: category.is_active,
        sort_order: category.sort_order || 0,
      });
    }
  }, [category]);

  if (isEditing && isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/services')}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Редактировать категорию услуг' : 'Новая категория услуг'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Форма категории */}
        <Grid item xs={12} md={isEditing ? 6 : 12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Информация о категории
              </Typography>

              {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError}
                </Alert>
              )}

              <Box component="form" onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  name="name"
                  label="Название"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  name="description"
                  label="Описание"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  name="sort_order"
                  label="Порядок сортировки"
                  type="number"
                  value={formik.values.sort_order}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.sort_order && Boolean(formik.errors.sort_order)}
                  helperText={formik.touched.sort_order && formik.errors.sort_order}
                  margin="normal"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.is_active}
                      onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                      name="is_active"
                    />
                  }
                  label="Активна"
                  sx={{ mt: 2 }}
                />

                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={formik.isSubmitting}
                  >
                    {isEditing ? 'Сохранить' : 'Создать'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Список услуг (только при редактировании) */}
        {isEditing && id && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Услуги в категории
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ServicesList categoryId={id} />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ServiceFormPage;
