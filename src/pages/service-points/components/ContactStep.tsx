import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
} from '@mui/material';
import { FormikProps } from 'formik';
import type { ServicePointFormDataNew, ServicePoint } from '../../../types/models';

interface ContactStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const ContactStep: React.FC<ContactStepProps> = ({ formik, isEditMode, servicePoint }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Контактная информация
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="contact_phone"
            name="contact_phone"
            label="Контактный телефон"
            value={formik.values.contact_phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.contact_phone && Boolean(formik.errors.contact_phone)}
            helperText={formik.touched.contact_phone && formik.errors.contact_phone}
            placeholder="+380 XX XXX XX XX"
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactStep; 