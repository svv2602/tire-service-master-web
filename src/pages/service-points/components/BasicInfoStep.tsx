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
  useTheme,
} from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGetPartnersQuery } from '../../../api/partners.api';
import { SIZES, getFormStyles, getTextFieldStyles } from '../../../styles';
import type { ServicePointFormDataNew, Partner, ServicePoint } from '../../../types/models';

interface BasicInfoStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { t } = useTranslation();
  const { data: partners, isLoading: partnersLoading } = useGetPartnersQuery({});
  const partnersData = partners?.data || [];
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);

  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('BasicInfoStep: partnersData:', partnersData);
    console.log('BasicInfoStep: formik.values.partner_id:', formik.values.partner_id);
    console.log('BasicInfoStep: partnersLoading:', partnersLoading);
  }

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
        {t('forms.servicePoint.steps.basic')}
      </Typography>
      
      <Grid container spacing={SIZES.spacing.lg}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label={t('forms.servicePoint.fields.name')}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            required
            sx={{
              ...textFieldStyles,
              '& .MuiOutlinedInput-root': {
                borderRadius: SIZES.borderRadius.sm,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            error={formik.touched.partner_id && Boolean(formik.errors.partner_id)}
            required
            sx={{
              ...formStyles.field,
              '& .MuiOutlinedInput-root': {
                borderRadius: SIZES.borderRadius.sm,
              },
            }}
          >
            <InputLabel id="partner-id-label">{t('forms.servicePoint.fields.partner')}</InputLabel>
            <Select
              labelId="partner-id-label"
              id="partner_id"
              name="partner_id"
              value={formik.values.partner_id > 0 ? formik.values.partner_id.toString() : '0'}
              onChange={(e) => {
                formik.setFieldValue('partner_id', Number(e.target.value));
              }}
              onBlur={formik.handleBlur}
              label={t('forms.servicePoint.fields.partner')}
              disabled={partnersLoading || isEditMode}
            >
              <MenuItem value="0" disabled>
                {partnersLoading ? t('forms.servicePoint.messages.loading') : t('forms.servicePoint.selectPartner')}
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
            {isEditMode && (
              <FormHelperText sx={{ color: 'text.secondary' }}>
                {t('forms.servicePoint.messages.partnerCannotBeChanged')}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label={t('forms.servicePoint.fields.description')}
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            placeholder={t('forms.servicePoint.fields.descriptionPlaceholder')}
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

export default BasicInfoStep; 