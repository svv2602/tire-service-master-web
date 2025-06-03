import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { FormikProps } from 'formik';
import { useGetPartnersQuery } from '../../../api/partners.api';
import type { ServicePointFormDataNew, Partner, ServicePoint } from '../../../types/models';

interface BasicInfoStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { data: partners, isLoading: partnersLoading } = useGetPartnersQuery({});
  const partnersData = partners?.data || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Основная информация
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Название точки"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            error={formik.touched.partner_id && Boolean(formik.errors.partner_id)}
            required
          >
            <InputLabel id="partner-id-label">Партнер</InputLabel>
            <Select
              labelId="partner-id-label"
              id="partner_id"
              name="partner_id"
              value={(formik.values.partner_id || 0).toString()}
              onChange={(e) => {
                formik.setFieldValue('partner_id', Number(e.target.value));
              }}
              onBlur={formik.handleBlur}
              label="Партнер"
              disabled={partnersLoading}
            >
              <MenuItem value="0" disabled>
                {partnersLoading ? 'Загрузка...' : 'Выберите партнера'}
              </MenuItem>
              {partnersData.map((partner: Partner) => (
                <MenuItem key={partner.id} value={partner.id.toString()}>
                  {partner.company_name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.partner_id && formik.errors.partner_id && (
              <FormHelperText>{formik.errors.partner_id}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Описание"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            placeholder="Введите описание сервисной точки"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BasicInfoStep; 