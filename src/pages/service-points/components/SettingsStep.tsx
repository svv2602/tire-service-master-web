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
import { useGetWorkStatusesQuery } from '../../../api/servicePoints.api';
import { SIZES, getFormStyles } from '../../../styles';
import type { ServicePointFormDataNew, ServicePoint } from '../../../types/models';

interface SettingsStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const SettingsStep: React.FC<SettingsStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { data: workStatusesData, isLoading: workStatusesLoading } = useGetWorkStatusesQuery();
  const workStatuses = workStatusesData || [];
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
        Параметры работы
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
            label="Точка активна"
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
            <InputLabel id="work-status-label">Статус работы</InputLabel>
            <Select
              labelId="work-status-label"
              id="work_status"
              name="work_status"
              value={formik.values.work_status || 'working'}
              onChange={(e) => {
                formik.setFieldValue('work_status', e.target.value);
              }}
              label="Статус работы"
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
                Загрузка статусов работы...
              </FormHelperText>
            )}
            {formik.touched.work_status && formik.errors.work_status && (
              <FormHelperText error>
                {formik.errors.work_status as string}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsStep; 