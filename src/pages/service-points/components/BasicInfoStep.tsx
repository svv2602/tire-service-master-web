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
  Divider,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGetPartnersQuery } from '../../../api/partners.api';
import { useGetRegionsQuery } from '../../../api/regions.api';
import { useGetCitiesQuery } from '../../../api/cities.api';
import { SIZES, getFormStyles, getTextFieldStyles } from '../../../styles';
import type { ServicePointFormDataNew, Partner, Region, City, ServicePoint } from '../../../types/models';
import { useLocalizedName } from '../../../utils/localizationHelpers';
import { useRoleAccess } from '../../../hooks/useRoleAccess';
import { useSelector } from 'react-redux';

interface BasicInfoStepProps {
  formik: FormikProps<ServicePointFormDataNew>;
  isEditMode: boolean;
  servicePoint?: ServicePoint;
}

// Компонент для отображения вкладок языков
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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formik, isEditMode, servicePoint }) => {
  const { t } = useTranslation();
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [localizationTab, setLocalizationTab] = useState(0); // 0 - русский, 1 - украинский
  const theme = useTheme();
  const formStyles = getFormStyles(theme);
  const textFieldStyles = getTextFieldStyles(theme);
  const localizedName = useLocalizedName();
  const { isPartner, canViewAllServicePoints } = useRoleAccess();
  
  // Получаем данные пользователя для отображения названия партнера
  const currentUser = useSelector((state: any) => state.auth?.user);

  // API запросы
  const { data: partners, isLoading: partnersLoading } = useGetPartnersQuery({});
  const { data: regions, isLoading: regionsLoading } = useGetRegionsQuery({});
  
  // Определяем region_id для загрузки городов
  const regionIdForCities = selectedRegionId || servicePoint?.city?.region_id || 0;
  
  const { data: cities, isLoading: citiesLoading } = useGetCitiesQuery(
    { region_id: regionIdForCities },
    { 
      skip: !regionIdForCities,
      refetchOnMountOrArgChange: true
    }
  );

  const partnersData = partners?.data || [];
  const regionsData = regions?.data || [];
  const citiesData = cities?.data || [];

  // Отладочная информация (только в режиме разработки)
  if (process.env.NODE_ENV === 'development') {
    console.log('BasicInfoStep: partnersData:', partnersData);
    console.log('BasicInfoStep: regionsData:', regionsData);
    console.log('BasicInfoStep: citiesData:', citiesData);
    console.log('BasicInfoStep: selectedRegionId:', selectedRegionId);
    console.log('BasicInfoStep: formik.values.partner_id:', formik.values.partner_id);
    console.log('BasicInfoStep: formik.values.city_id:', formik.values.city_id);
  }

  // Устанавливаем регион при загрузке точки обслуживания
  useEffect(() => {
    if (servicePoint?.city?.region_id && !selectedRegionId) {
      setSelectedRegionId(servicePoint.city.region_id);
      formik.setFieldValue('region_id', servicePoint.city.region_id);
    }
  }, [servicePoint?.city?.region_id, selectedRegionId]);

  // Синхронизируем selectedRegionId с formik.values.region_id
  useEffect(() => {
    if (formik.values.region_id && formik.values.region_id > 0 && !selectedRegionId) {
      setSelectedRegionId(formik.values.region_id);
    }
  }, [formik.values.region_id, selectedRegionId]);

  const handleRegionChange = (regionId: number) => {
    setSelectedRegionId(regionId);
    formik.setFieldValue('city_id', 0); // Сбрасываем город при смене региона
    
    if (regionId > 0) {
      console.log('Регион изменен на:', regionId, 'Города будут загружены автоматически');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setLocalizationTab(newValue);
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
        {t('forms.servicePoint.steps.basic')}
      </Typography>
      
      <Grid container spacing={SIZES.spacing.lg}>
        {/* Селект партнера - только для админов и менеджеров */}
        {canViewAllServicePoints && (
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
        )}
        
        {/* Информация о партнере для партнеров */}
        {isPartner && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('forms.servicePoint.fields.partner')}
              value={currentUser?.partner?.name || currentUser?.partner?.company_name || 'Ваша компания'}
              disabled
              sx={{
                ...textFieldStyles,
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: theme.palette.text.secondary,
                },
              }}
              helperText="Партнеры могут создавать только свои сервисные точки"
            />
          </Grid>
        )}

        {/* Локализованные поля */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: SIZES.borderRadius.md,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('forms.servicePoint.localization.title')}
            </Typography>
            
            <Tabs 
              value={localizationTab} 
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <Tab 
                label={t('forms.servicePoint.localization.russian')} 
                id="localization-tab-0"
                aria-controls="localization-tabpanel-0"
              />
              <Tab 
                label={t('forms.servicePoint.localization.ukrainian')} 
                id="localization-tab-1"
                aria-controls="localization-tabpanel-1"
              />
            </Tabs>

            {/* Русская локализация */}
            <TabPanel value={localizationTab} index={0}>
              <Grid container spacing={SIZES.spacing.md}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name_ru"
                    name="name_ru"
                    label={t('forms.servicePoint.localization.fields.name')}
                    value={formik.values.name_ru || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name_ru && Boolean(formik.errors.name_ru)}
                    helperText={formik.touched.name_ru && formik.errors.name_ru}
                    placeholder={t('forms.servicePoint.localization.placeholders.name')}
                    required
                    sx={{
                      ...textFieldStyles,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: SIZES.borderRadius.sm,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description_ru"
                    name="description_ru"
                    label={t('forms.servicePoint.localization.fields.description')}
                    multiline
                    rows={4}
                    value={formik.values.description_ru || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description_ru && Boolean(formik.errors.description_ru)}
                    helperText={formik.touched.description_ru && formik.errors.description_ru}
                    placeholder={t('forms.servicePoint.localization.placeholders.description')}
                    sx={{
                      ...textFieldStyles,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: SIZES.borderRadius.sm,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address_ru"
                    name="address_ru"
                    label={t('forms.servicePoint.localization.fields.address')}
                    value={formik.values.address_ru || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address_ru && Boolean(formik.errors.address_ru)}
                    helperText={formik.touched.address_ru && formik.errors.address_ru}
                    placeholder={t('forms.servicePoint.localization.placeholders.address')}
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
            </TabPanel>

            {/* Украинская локализация */}
            <TabPanel value={localizationTab} index={1}>
              <Grid container spacing={SIZES.spacing.md}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name_uk"
                    name="name_uk"
                    label={t('forms.servicePoint.localization.fields.name')}
                    value={formik.values.name_uk || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name_uk && Boolean(formik.errors.name_uk)}
                    helperText={formik.touched.name_uk && formik.errors.name_uk}
                    placeholder={t('forms.servicePoint.localization.placeholders.name')}
                    required
                    sx={{
                      ...textFieldStyles,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: SIZES.borderRadius.sm,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description_uk"
                    name="description_uk"
                    label={t('forms.servicePoint.localization.fields.description')}
                    multiline
                    rows={4}
                    value={formik.values.description_uk || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description_uk && Boolean(formik.errors.description_uk)}
                    helperText={formik.touched.description_uk && formik.errors.description_uk}
                    placeholder={t('forms.servicePoint.localization.placeholders.description')}
                    sx={{
                      ...textFieldStyles,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: SIZES.borderRadius.sm,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address_uk"
                    name="address_uk"
                    label={t('forms.servicePoint.localization.fields.address')}
                    value={formik.values.address_uk || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address_uk && Boolean(formik.errors.address_uk)}
                    helperText={formik.touched.address_uk && formik.errors.address_uk}
                    placeholder={t('forms.servicePoint.localization.placeholders.address')}
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
            </TabPanel>
          </Paper>
        </Grid>

        {/* Разделитель */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Местоположение */}
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
                  {localizedName(region)}
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
                  {localizedName(city)}
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

export default BasicInfoStep; 