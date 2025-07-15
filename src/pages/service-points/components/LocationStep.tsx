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
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGetRegionsQuery } from '../../../api/regions.api';
import { useGetCitiesQuery } from '../../../api/cities.api';
import { SIZES, getFormStyles, getTextFieldStyles } from '../../../styles';
import type { ServicePointFormDataNew, Region, City } from '../../../types/models';

interface LocationStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`localization-tabpanel-${index}`}
      aria-labelledby={`localization-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `localization-tab-${index}`,
    'aria-controls': `localization-tabpanel-${index}`,
  };
}

const LocationStep: React.FC<LocationStepProps> = ({ formik }) => {
  const { t } = useTranslation(['forms', 'common']);
  const theme = useTheme();
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [localizationTab, setLocalizationTab] = useState(0);

  const formStyles = getFormStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);

  const { data: regionsData } = useGetRegionsQuery({});
  const { data: citiesData } = useGetCitiesQuery(
    { region_id: selectedRegionId || 0 },
    {
      skip: !selectedRegionId,
      refetchOnMountOrArgChange: true,
    }
  );

  const regions = regionsData?.data || [];
  const cities = citiesData?.data || [];

  // Инициализация выбранного региона на основе данных формы
  useEffect(() => {
    if (formik.values.region_id && !selectedRegionId) {
      setSelectedRegionId(formik.values.region_id);
    }
  }, [formik.values.region_id, selectedRegionId]);

  const handleRegionChange = (event: any) => {
    const regionId = Number(event.target.value);
    setSelectedRegionId(regionId);
    formik.setFieldValue('region_id', regionId);
    formik.setFieldValue('city_id', 0); // Сбрасываем выбранный город
  };

  const handleLocalizationTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setLocalizationTab(newValue);
  };

  return (
    <Box sx={formStyles.container}>
      <Typography variant="h6" sx={formStyles.sectionTitle}>
                 {t('forms.servicePoint.steps.location')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={formik.touched.region_id && Boolean(formik.errors.region_id)}>
            <InputLabel id="region-select-label">{t('forms.servicePoint.fields.region')}</InputLabel>
            <Select
              labelId="region-select-label"
              id="region_id"
              name="region_id"
              value={selectedRegionId || 0}
              label={t('forms.servicePoint.fields.region')}
              onChange={handleRegionChange}
              onBlur={formik.handleBlur}
              sx={{
                borderRadius: SIZES.borderRadius.sm,
              }}
            >
              <MenuItem value={0}>{t('forms.servicePoint.selectRegion')}</MenuItem>
              {regions.map((region: Region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.region_id && formik.errors.region_id && (
              <FormHelperText>{formik.errors.region_id}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={formik.touched.city_id && Boolean(formik.errors.city_id)} disabled={!selectedRegionId}>
            <InputLabel id="city-select-label">{t('forms.servicePoint.fields.city')}</InputLabel>
            <Select
              labelId="city-select-label"
              id="city_id"
              name="city_id"
              value={formik.values.city_id || 0}
              label={t('forms.servicePoint.fields.city')}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              sx={{
                borderRadius: SIZES.borderRadius.sm,
              }}
            >
              <MenuItem value={0}>{t('forms.servicePoint.selectCity')}</MenuItem>
              {cities.map((city: City) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.city_id && formik.errors.city_id && (
              <FormHelperText>{formik.errors.city_id}</FormHelperText>
            )}
            {!selectedRegionId && (
              <FormHelperText>{t('forms.servicePoint.messages.selectRegionFirst')}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Локализованные поля адреса */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ ...formStyles.sectionTitle, mt: 2, mb: 1 }}>
                         {t('forms.servicePoint.localization.address')}
          </Typography>
          
          <Paper elevation={1} sx={{ p: 2, borderRadius: SIZES.borderRadius.md }}>
            <Tabs
              value={localizationTab}
              onChange={handleLocalizationTabChange}
              aria-label="localization tabs"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
              }}
            >
                             <Tab label={t('forms.servicePoint.localization.russian')} {...a11yProps(0)} />
               <Tab label={t('forms.servicePoint.localization.ukrainian')} {...a11yProps(1)} />
            </Tabs>

            <TabPanel value={localizationTab} index={0}>
              <TextField
                fullWidth
                id="address_ru"
                name="address_ru"
                                 label={t('forms.servicePoint.localization.fields.address')}
                 value={formik.values.address_ru}
                 onChange={formik.handleChange}
                 onBlur={formik.handleBlur}
                 error={formik.touched.address_ru && Boolean(formik.errors.address_ru)}
                 helperText={formik.touched.address_ru && formik.errors.address_ru}
                 placeholder={t('forms.servicePoint.localization.placeholders.address')}
                required
                multiline
                rows={2}
                sx={{
                  ...textFieldStyles,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: SIZES.borderRadius.sm,
                  },
                }}
              />
            </TabPanel>

            <TabPanel value={localizationTab} index={1}>
              <TextField
                fullWidth
                id="address_uk"
                name="address_uk"
                                 label={t('forms.servicePoint.localization.fields.address')}
                 value={formik.values.address_uk}
                 onChange={formik.handleChange}
                 onBlur={formik.handleBlur}
                 error={formik.touched.address_uk && Boolean(formik.errors.address_uk)}
                 helperText={formik.touched.address_uk && formik.errors.address_uk}
                 placeholder={t('forms.servicePoint.localization.placeholders.address')}
                required
                multiline
                rows={2}
                sx={{
                  ...textFieldStyles,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: SIZES.borderRadius.sm,
                  },
                }}
              />
            </TabPanel>
          </Paper>
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
            placeholder={t('forms.servicePoint.fields.latitudePlaceholder')}
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
            placeholder={t('forms.servicePoint.fields.longitudePlaceholder')}
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