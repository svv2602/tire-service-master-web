import React, { useState, useEffect } from 'react';
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
import { useGetRegionsQuery } from '../../../api/regions.api';
import { useGetCitiesQuery } from '../../../api/cities.api';
import { SIZES, getFormStyles, getTextFieldStyles } from '../../../styles';
import type { ServicePointFormDataNew, Region, City, ServicePoint } from '../../../types/models';

interface LocationStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const LocationStep: React.FC<LocationStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { t } = useTranslation();
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);

  const { data: regions, isLoading: regionsLoading } = useGetRegionsQuery({});
  
  // Определяем region_id для загрузки городов
  const regionIdForCities = selectedRegionId || servicePoint?.city?.region_id || 0;
  
  const { data: cities, isLoading: citiesLoading, refetch: refetchCities } = useGetCitiesQuery(
    { region_id: regionIdForCities },
    { 
      skip: !regionIdForCities,
      refetchOnMountOrArgChange: true
    }
  );

  const regionsData = regions?.data || [];
  const citiesData = cities?.data || [];

  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('LocationStep: regionsData:', regionsData);
    console.log('LocationStep: citiesData:', citiesData);
    console.log('LocationStep: selectedRegionId:', selectedRegionId);
    console.log('LocationStep: regionIdForCities:', regionIdForCities);
    console.log('LocationStep: formik.values.city_id:', formik.values.city_id);
    console.log('LocationStep: formik.values.region_id:', formik.values.region_id);
  }

  // Устанавливаем регион при загрузке точки обслуживания
  useEffect(() => {
    if (servicePoint?.city?.region_id && !selectedRegionId) {
      setSelectedRegionId(servicePoint.city.region_id);
      formik.setFieldValue('region_id', servicePoint.city.region_id);
    }
  }, [servicePoint?.city?.region_id, selectedRegionId]); // Убираем formik из зависимостей

  // Синхронизируем selectedRegionId с formik.values.region_id
  useEffect(() => {
    if (formik.values.region_id && formik.values.region_id > 0 && !selectedRegionId) {
      setSelectedRegionId(formik.values.region_id);
    }
  }, [formik.values.region_id, selectedRegionId]);

  const handleRegionChange = (regionId: number) => {
    setSelectedRegionId(regionId);
    formik.setFieldValue('city_id', 0); // Сбрасываем город при смене региона
    
    // Принудительно обновляем список городов только если запрос активен
    // Проверяем что regionId > 0 и запрос не пропущен (skip: false)
    if (regionId > 0) {
      // Не вызываем refetch сразу, позволим RTK Query автоматически
      // перезапустить запрос при изменении regionIdForCities
      console.log('Регион изменен на:', regionId, 'Города будут загружены автоматически');
    }
  };

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
        {t('forms.servicePoint.steps.location')}
      </Typography>
      
      <Grid container spacing={SIZES.spacing.lg}>
        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            required
            sx={{
              ...formStyles.field,
              '& .MuiOutlinedInput-root': {
                borderRadius: SIZES.borderRadius.sm,
              },
            }}
          >
            <InputLabel id="region-id-label">{t('forms.servicePoint.fields.region')}</InputLabel>
            <Select
              labelId="region-id-label"
              id="region_id"
              name="region_id"
              value={selectedRegionId?.toString() || formik.values.region_id?.toString() || '0'}
              onChange={(e) => {
                const regionId = Number(e.target.value);
                handleRegionChange(regionId);
                formik.setFieldValue('region_id', regionId);
              }}
              onBlur={formik.handleBlur}
              label={t('forms.servicePoint.fields.region')}
              disabled={regionsLoading}
            >
              <MenuItem value="0" disabled>
                {regionsLoading ? t('forms.servicePoint.messages.loading') : t('forms.servicePoint.selectRegion')}
              </MenuItem>
              {regionsData.map((region: Region) => (
                <MenuItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            error={formik.touched.city_id && Boolean(formik.errors.city_id)}
            required
            sx={{
              ...formStyles.field,
              '& .MuiOutlinedInput-root': {
                borderRadius: SIZES.borderRadius.sm,
              },
            }}
          >
            <InputLabel id="city-id-label">{t('forms.servicePoint.fields.city')}</InputLabel>
            <Select
              labelId="city-id-label"
              id="city_id"
              name="city_id"
              value={formik.values.city_id > 0 ? formik.values.city_id.toString() : '0'}
              onChange={(e) => {
                formik.setFieldValue('city_id', Number(e.target.value));
              }}
              onBlur={formik.handleBlur}
              label={t('forms.servicePoint.fields.city')}
              disabled={!selectedRegionId || citiesLoading}
            >
              <MenuItem value="0" disabled>
                {citiesLoading ? t('forms.servicePoint.messages.loading') : t('forms.servicePoint.selectCity')}
              </MenuItem>
              {citiesData.map((city: City) => (
                <MenuItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.city_id && formik.errors.city_id && (
              <FormHelperText error>{formik.errors.city_id as string}</FormHelperText>
            )}
            {!selectedRegionId && (
              <FormHelperText>{t('forms.servicePoint.messages.selectRegionFirst')}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address"
            name="address"
            label={t('forms.servicePoint.fields.address')}
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
            placeholder={t('forms.servicePoint.fields.addressPlaceholder')}
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
          <TextField
            fullWidth
            id="latitude"
            name="latitude"
            label={t('forms.servicePoint.fields.latitude')}
            type="number"
            value={formik.values.latitude || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.latitude && Boolean(formik.errors.latitude)}
            helperText={formik.touched.latitude && formik.errors.latitude}
            InputProps={{
              inputProps: { 
                step: "0.000001",
                min: -90,
                max: 90
              }
            }}
            sx={{
              ...textFieldStyles,
              '& .MuiOutlinedInput-root': {
                borderRadius: SIZES.borderRadius.sm,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="longitude"
            name="longitude"
            label={t('forms.servicePoint.fields.longitude')}
            type="number"
            value={formik.values.longitude || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.longitude && Boolean(formik.errors.longitude)}
            helperText={formik.touched.longitude && formik.errors.longitude}
            InputProps={{
              inputProps: { 
                step: "0.000001",
                min: -180,
                max: 180
              }
            }}
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

export default LocationStep; 