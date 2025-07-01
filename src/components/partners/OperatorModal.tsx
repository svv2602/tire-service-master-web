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
  FormControlLabel
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import type { Operator } from '../../api/operators.api';
import { PhoneField } from '../ui/PhoneField';

interface OperatorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  operator: Operator | null;
}

const validationSchema = (isEdit: boolean) =>
  yup.object({
    first_name: yup.string().required('Имя обязательно'),
    last_name: yup.string().required('Фамилия обязательна'),
    email: yup.string().email('Некорректный email').required('Email обязателен'),
    phone: yup.string().required('Телефон обязателен'),
    password: isEdit ? yup.string() : yup.string().min(6, 'Минимум 6 символов').required('Пароль обязателен'),
    position: yup.string().required('Должность обязательна'),
    access_level: yup.number().min(1).max(5).required('Уровень доступа обязателен'),
    is_active: yup.boolean(),
  });

export const OperatorModal: React.FC<OperatorModalProps> = ({ open, onClose, onSave, operator }) => {
  const isEdit = Boolean(operator);
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
    validationSchema: validationSchema(isEdit),
    onSubmit: (values) => {
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
      onSave(data);
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</DialogTitle>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="first_name"
                label="Имя"
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
                label="Фамилия"
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
                label="Email"
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
                label="Телефон"
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
                  label="Пароль"
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
                  label="Новый пароль (опционально)"
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
                label="Должность"
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
                label="Уровень доступа (1-5)"
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
                label="Активен"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
