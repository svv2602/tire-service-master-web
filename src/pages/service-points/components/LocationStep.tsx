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
} from '@mui/material';
import { FormikProps } from 'formik';
import { useGetRegionsQuery } from '../../../api/regions.api';
import { useGetCitiesQuery } from '../../../api/cities.api';
import type { ServicePointFormDataNew, Region, City, ServicePoint } from '../../../types/models';

interface LocationStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

const LocationStep: React.FC<LocationStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  const { data: regions, isLoading: regionsLoading } = useGetRegionsQuery({});
  
  // Определяем region_id для загрузки городов
  const regionIdForCities = selectedRegionId || servicePoint?.city?.region_id || 0;
  
  const { data: cities, isLoading: citiesLoading } = useGetCitiesQuery(
    { region_id: regionIdForCities },
    { skip: !regionIdForCities }
  );

  const regionsData = regions?.data || [];
  const citiesData = cities?.data || [];

  // Устанавливаем регион при загрузке точки обслуживания
  useEffect(() => {
    if (servicePoint?.city?.region_id && !selectedRegionId) {
      setSelectedRegionId(servicePoint.city.region_id);
    }
  }, [servicePoint, selectedRegionId]);

  const handleRegionChange = (regionId: number) => {
    setSelectedRegionId(regionId);
    formik.setFieldValue('city_id', 0); // Сбрасываем город при смене региона
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Адрес и местоположение
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            required
          >
            <InputLabel id="region-id-label">Регион</InputLabel>
            <Select
              labelId="region-id-label"
              id="region_id"
              name="region_id"
              value={selectedRegionId?.toString() || '0'}
              onChange={(e) => {
                const regionId = Number(e.target.value);
                handleRegionChange(regionId);
              }}
              onBlur={formik.handleBlur}
              label="Регион"
              disabled={regionsLoading}
            >
              <MenuItem value="0" disabled>
                {regionsLoading ? 'Загрузка...' : 'Выберите регион'}
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
          >
            <InputLabel id="city-id-label">Город</InputLabel>
            <Select
              labelId="city-id-label"
              id="city_id"
              name="city_id"
              value={formik.values.city_id?.toString() || '0'}
              onChange={(e) => {
                formik.setFieldValue('city_id', Number(e.target.value));
              }}
              onBlur={formik.handleBlur}
              label="Город"
              disabled={!selectedRegionId || citiesLoading}
            >
              <MenuItem value="0" disabled>
                {citiesLoading ? 'Загрузка...' : 'Выберите город'}
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
              <FormHelperText>Сначала выберите регион</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address"
            name="address"
            label="Адрес"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
            placeholder="Введите полный адрес сервисной точки"
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="latitude"
            name="latitude"
            label="Широта"
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
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="longitude"
            name="longitude"
            label="Долгота"
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
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationStep; 