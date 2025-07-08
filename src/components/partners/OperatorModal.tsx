import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import type { Operator } from '../../api/operators.api';
import { PhoneField } from '../ui/PhoneField';

interface OperatorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  operator: Operator | null;
}

const createValidationSchema = (isEdit: boolean, t: any) =>
  yup.object({
    first_name: yup.string().required(t('forms.partner.operators.validation.firstNameRequired')),
    last_name: yup.string().required(t('forms.partner.operators.validation.lastNameRequired')),
    email: yup.string().email(t('forms.partner.operators.validation.emailInvalid')).required(t('forms.partner.operators.validation.emailRequired')),
    phone: yup.string().required(t('forms.partner.operators.validation.phoneRequired')),
    password: isEdit ? yup.string() : yup.string().min(6, t('forms.partner.operators.validation.passwordMin')).required(t('forms.partner.operators.validation.passwordRequired')),
    position: yup.string().required(t('forms.partner.operators.validation.positionRequired')),
    access_level: yup.number().min(1).max(5).required(t('forms.partner.operators.validation.accessLevelRequired')),
    is_active: yup.boolean(),
  });

export const OperatorModal: React.FC<OperatorModalProps> = ({ open, onClose, onSave, operator }) => {
  const { t } = useTranslation();
  const isEdit = Boolean(operator);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (open) {
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [open]);
  
  const formik = useFormik({
    initialValues: {
      first_name: operator?.user.first_name || '',
      last_name: operator?.user.last_name || '',
      email: operator?.user.email || '',
      phone: operator?.user.phone || '',
      password: '',
      position: operator?.position || '',
      access_level: operator?.access_level || 1,
      is_active: operator?.is_active ?? true,
    },
    enableReinitialize: true,
    validationSchema: createValidationSchema(isEdit, t),
    onSubmit: async (values) => {
      try {
        setSuccessMessage(null);
        setErrorMessage(null);
        
        const data: any = {
          user: {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone,
            is_active: values.is_active,
          },
          operator: {
            position: values.position,
            access_level: values.access_level,
            is_active: values.is_active,
          },
        };
        if (!isEdit) data.user.password = values.password;
        if (isEdit && values.password) data.user.password = values.password;
        
        await onSave(data);
        
        setSuccessMessage(isEdit ? t('forms.partner.operators.messages.updateSuccess') : t('forms.partner.operators.messages.createSuccess'));
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error: any) {
        console.error('Ошибка при сохранении сотрудника:', error);
        
        let message = t('forms.partner.operators.errors.saveError');
        if (error.data?.errors) {
          message = Object.entries(error.data.errors)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } else if (error.error) {
          message = error.error;
        }
        
        setErrorMessage(message);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? t('forms.partner.operators.title.edit') : t('forms.partner.operators.title.create')}</DialogTitle>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <DialogContent>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="first_name"
                label={t('forms.partner.operators.fields.firstName')}
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="last_name"
                label={t('forms.partner.operators.fields.lastName')}
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label={t('forms.partner.operators.fields.email')}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PhoneField
                fullWidth
                required
                name="phone"
                label={t('forms.partner.operators.fields.phone')}
                value={formik.values.phone}
                onChange={(value) => formik.setFieldValue('phone', value)}
                onBlur={() => formik.setFieldTouched('phone', true)}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            {!isEdit && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password"
                  label={t('forms.partner.operators.fields.password')}
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
            )}
            {isEdit && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password"
                  label={t('forms.partner.operators.fields.newPassword')}
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="position"
                label={t('forms.partner.operators.fields.position')}
                value={formik.values.position}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.position && Boolean(formik.errors.position)}
                helperText={formik.touched.position && formik.errors.position}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="access_level"
                label={t('forms.partner.operators.fields.accessLevel')}
                type="number"
                value={formik.values.access_level}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.access_level && Boolean(formik.errors.access_level)}
                helperText={formik.touched.access_level && formik.errors.access_level}
                inputProps={{ min: 1, max: 5 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                    name="is_active"
                  />
                }
                label={t('forms.partner.operators.fields.isActive')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('forms.common.cancel')}</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? t('forms.common.save') : t('forms.common.add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
