import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  useTheme,
} from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGetWorkStatusesQuery } from '../../../api/servicePoints.api';
import { SIZES, getFormStyles } from '../../../styles';
import type { ServicePointFormDataNew, ServicePoint } from '../../../types/models';

interface SettingsStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const SettingsStep: React.FC<SettingsStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { t } = useTranslation();
  const { data: workStatusesData, isLoading: workStatusesLoading } = useGetWorkStatusesQuery();
  const workStatuses = workStatusesData || [];
  const theme = useTheme();
  const formStyles = getFormStyles(theme);

  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('SettingsStep: workStatusesData:', workStatusesData);
    console.log('SettingsStep: workStatuses:', workStatuses);
    console.log('SettingsStep: workStatusesLoading:', workStatusesLoading);
    console.log('SettingsStep: formik.values.work_status:', formik.values.work_status);
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
        {t('forms.servicePoint.steps.settings')}
      </Typography>
      
      <Grid container spacing={SIZES.spacing.lg}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.is_active}
                onChange={(e) => {
                  formik.setFieldValue('is_active', e.target.checked);
                }}
                name="is_active"
              />
            }
            label={t('forms.servicePoint.fields.isActive')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            error={formik.touched.work_status && Boolean(formik.errors.work_status)}
            required
            sx={{
              ...formStyles.field,
              '& .MuiOutlinedInput-root': {
                borderRadius: SIZES.borderRadius.sm,
              },
            }}
          >
            <InputLabel id="work-status-label">{t('forms.servicePoint.fields.workStatus')}</InputLabel>
            <Select
              labelId="work-status-label"
              id="work_status"
              name="work_status"
              value={formik.values.work_status || 'working'}
              onChange={(e) => {
                formik.setFieldValue('work_status', e.target.value);
              }}
              label={t('forms.servicePoint.fields.workStatus')}
              disabled={workStatusesLoading}
            >
              {workStatuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
            {workStatusesLoading && (
              <FormHelperText>
                {t('forms.servicePoint.messages.loadingWorkStatuses')}
              </FormHelperText>
            )}
            {formik.touched.work_status && formik.errors.work_status && (
              <FormHelperText error>
                {formik.errors.work_status as string}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        {/* Настройки подтверждения бронирований */}
        <Grid item xs={12}>
          <Typography 
            variant="h6" 
            sx={{ 
              mt: SIZES.spacing.lg,
              mb: SIZES.spacing.md,
              fontSize: SIZES.fontSize.md,
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {t('forms.servicePoint.bookingConfirmation.title')}
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.auto_confirmation || false}
                onChange={(e) => {
                  formik.setFieldValue('auto_confirmation', e.target.checked);
                }}
                name="auto_confirmation"
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {t('forms.servicePoint.bookingConfirmation.autoConfirmation')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {formik.values.auto_confirmation 
                    ? t('forms.servicePoint.bookingConfirmation.autoDescription')
                    : t('forms.servicePoint.bookingConfirmation.manualDescription')
                  }
                </Typography>
              </Box>
            }
            sx={{ 
              alignItems: 'flex-start',
              '& .MuiFormControlLabel-label': {
                pt: 1
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsStep; 