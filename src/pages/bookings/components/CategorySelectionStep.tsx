import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Skeleton,
  Chip,
  Autocomplete,
  TextField
} from '@mui/material';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';
import { useGetServiceCategoriesByCityIdQuery } from '../../../api/serviceCategories.api';
import { useGetCityByIdQuery, useGetCitiesWithServicePointsQuery } from '../../../api/cities.api';
import { BookingFormData } from '../../../types/booking';
import { useLocalizedName } from '../../../utils/localizationHelpers';

interface CategorySelectionStepProps {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
  formData,
  setFormData,
  onNext,
  isValid
}) => {
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  // Загружаем категории услуг по выбранному городу
  const { data: categoriesResponse, isLoading, error } = useGetServiceCategoriesByCityIdQuery(
    formData.city_id!,
    { skip: !formData.city_id }
  );

  const categories = categoriesResponse?.data || [];

  // Загружаем список городов с сервисными точками для селекта
  const { data: citiesResponse, isLoading: citiesLoading } = useGetCitiesWithServicePointsQuery();

  // Загружаем информацию о выбранном городе
  const { data: cityResponse, isLoading: isCityLoading } = useGetCityByIdQuery(
    formData.city_id!,
    { skip: !formData.city_id }
  );

  const cities = citiesResponse?.data || [];
  const selectedCity = cityResponse?.data;

  const handleCityChange = (newCity: any) => {
    setFormData((prev) => ({
      ...prev,
      city_id: newCity ? newCity.id : null,
      // Сбрасываем зависимые поля при смене города
      service_category_id: 0,
      service_point_id: null,
      booking_date: '',
      start_time: ''
    }));
  };

  const handleCategorySelect = (categoryId: number) => {
    setFormData((prev) => ({ 
      ...prev,
      service_category_id: categoryId,
      // Сбрасываем следующие шаги при смене категории
      service_point_id: null,
      booking_date: '',
      start_time: ''
    }));
    
    // Автоматически переходим к следующему шагу
    setTimeout(() => {
      onNext();
    }, 300);
  };

  if (isLoading && formData.city_id) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('bookingSteps.categorySelection.title')}
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error && formData.city_id) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('bookingSteps.categorySelection.title')}
        </Typography>
        <Alert severity="error">
          {t('bookingSteps.categorySelection.error')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('bookingSteps.categorySelection.title')}
      </Typography>
      
      {/* Селект для выбора города */}
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          value={selectedCity || null}
          onChange={(event, newValue) => handleCityChange(newValue)}
          options={cities}
          getOptionLabel={(option) => localizedName(option)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={citiesLoading || isCityLoading}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <Box component="li" key={key} {...otherProps}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body1">{localizedName(option)}</Typography>
                  {option.region && (
                    <Typography variant="caption" color="text.secondary">
                      {localizedName(option.region)}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('bookingSteps.categorySelection.citySelect')}
              placeholder={t('bookingSteps.categorySelection.cityPlaceholder')}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
          noOptionsText={t('bookingSteps.categorySelection.noCitiesFound')}
          loadingText={t('bookingSteps.categorySelection.loadingCities')}
          sx={{ minWidth: 300 }}
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {selectedCity 
          ? `${t('bookingSteps.categorySelection.availableCategories')} ${localizedName(selectedCity)} (${categories.length})`
          : t('bookingSteps.categorySelection.selectCityFirst')
        }
      </Typography>

      {/* Отображение категорий */}
      {selectedCity && (
        <>
          {categories.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('bookingSteps.categorySelection.noCategories')}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: 2,
                      borderColor: formData.service_category_id === category.id 
                        ? 'primary.main' 
                        : 'transparent',
                      backgroundColor: formData.service_category_id === category.id 
                        ? 'primary.50' 
                        : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.light',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {category.name}
                      </Typography>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {category.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {category.service_points_count && (
                          <Chip 
                            size="small" 
                            label={`${category.service_points_count} ${t('bookingSteps.categorySelection.pointsCount')}`}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {category.services_count && (
                          <Chip 
                            size="small" 
                            label={`${category.services_count} ${t('bookingSteps.categorySelection.servicesCount')}`}
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Сообщение о выборе категории */}
      {isValid && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {t('bookingSteps.categorySelection.allRequiredFieldsFilled')}
        </Alert>
      )}
    </Box>
  );
};

export default CategorySelectionStep; 