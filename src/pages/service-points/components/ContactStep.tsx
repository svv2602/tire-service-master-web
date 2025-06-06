import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  useTheme,
} from '@mui/material';
import { FormikProps } from 'formik';
import { SIZES, getFormStyles, getTextFieldStyles } from '../../../styles';
import type { ServicePointFormDataNew, ServicePoint } from '../../../types/models';

interface ContactStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const ContactStep: React.FC<ContactStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);

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
            sx={{
              ...textFieldStyles,
              '& .MuiOutlinedInput-root': {
                borderRadius: SIZES.borderRadius.sm,
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactStep; 