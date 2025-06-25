import React from 'react';
import {
  Box,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import { FormikProps } from 'formik';
import { SIZES, getFormStyles } from '../../../styles';
import { PhoneField } from '../../../components/ui';
import type { ServicePointFormDataNew, ServicePoint } from '../../../types/models';

interface ContactStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const ContactStep: React.FC<ContactStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const theme = useTheme();
  const formStyles = getFormStyles(theme);

  return (
    <Box sx={{ ...formStyles.container, padding: SIZES.spacing.lg }}>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          mb: SIZES.spacing.lg,
          fontSize: SIZES.fontSize.lg,
          fontWeight: 600,
          color: theme.palette.text.primary,
        }}
      >
        Контактная информация
      </Typography>
      
      <Grid container spacing={SIZES.spacing.lg}>
        <Grid item xs={12} md={6}>
          <PhoneField
            fullWidth
            id="contact_phone"
            name="contact_phone"
            value={formik.values.contact_phone}
            onChange={(value) => formik.setFieldValue('contact_phone', value)}
            onBlur={() => formik.setFieldTouched('contact_phone', true)}
            error={formik.touched.contact_phone && Boolean(formik.errors.contact_phone)}
            helperText={formik.touched.contact_phone && formik.errors.contact_phone}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactStep; 