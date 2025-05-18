import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { fetchPartnerById, createPartner, updatePartner, clearError } from '../../store/slices/partnersSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

// Схема валидации
const validationSchema = yup.object({
  company_name: yup.string().required('Название компании обязательно'),
  contact_person: yup.string().required('Контактное лицо обязательно'),
  email: yup.string().email('Введите корректный email').required('Email обязателен'),
  phone: yup.string().required('Телефон обязателен'),
  company_description: yup.string(),
  website: yup.string().url('Введите корректный URL'),
  tax_number: yup.string(),
  legal_address: yup.string(),
});

interface PartnerFormData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  company_description: string;
  website: string;
  tax_number: string;
  legal_address: string;
}

const PartnerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedPartner, loading, error } = useSelector((state: RootState) => state.partners);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchPartnerById(Number(id)));
    }
  }, [isEditMode, id, dispatch]);

  const initialValues: PartnerFormData = {
    company_name: selectedPartner?.company_name || '',
    contact_person: selectedPartner?.contact_person || '',
    email: selectedPartner?.user?.email || '',
    phone: selectedPartner?.user?.phone || '',
    company_description: selectedPartner?.company_description || '',
    website: selectedPartner?.website || '',
    tax_number: selectedPartner?.tax_number || '',
    legal_address: selectedPartner?.legal_address || '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isEditMode && id) {
          await dispatch(updatePartner({ id: Number(id), data: values })).unwrap();
          setSuccessMessage('Партнер успешно обновлен');
        } else {
          await dispatch(createPartner(values)).unwrap();
          setSuccessMessage('Партнер успешно создан');
          setTimeout(() => {
            navigate('/partners');
          }, 1500);
        }
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    },
  });

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  const handleBack = () => {
    navigate('/partners');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {isEditMode ? 'Редактирование партнера' : 'Создание партнера'}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Назад к списку
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="company_name"
                  name="company_name"
                  label="Название компании"
                  value={formik.values.company_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                  helperText={formik.touched.company_name && formik.errors.company_name}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="contact_person"
                  name="contact_person"
                  label="Контактное лицо"
                  value={formik.values.contact_person}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.contact_person && Boolean(formik.errors.contact_person)}
                  helperText={formik.touched.contact_person && formik.errors.contact_person}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Дополнительная информация
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="company_description"
                  name="company_description"
                  label="Описание компании"
                  multiline
                  rows={4}
                  value={formik.values.company_description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.company_description && Boolean(formik.errors.company_description)}
                  helperText={formik.touched.company_description && formik.errors.company_description}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="website"
                  name="website"
                  label="Веб-сайт"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.website && Boolean(formik.errors.website)}
                  helperText={formik.touched.website && formik.errors.website}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="tax_number"
                  name="tax_number"
                  label="ИНН"
                  value={formik.values.tax_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tax_number && Boolean(formik.errors.tax_number)}
                  helperText={formik.touched.tax_number && formik.errors.tax_number}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="legal_address"
                  name="legal_address"
                  label="Юридический адрес"
                  value={formik.values.legal_address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.legal_address && Boolean(formik.errors.legal_address)}
                  helperText={formik.touched.legal_address && formik.errors.legal_address}
                />
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={handleBack}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PartnerFormPage; 