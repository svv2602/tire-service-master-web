import React, { useState } from 'react';
import { Box, Typography, useTheme, MenuItem, Select, SelectChangeEvent, FormControl } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetRegionsQuery } from '../../api/regions.api';
import { getTablePageStyles } from '../../styles/components';
import CitiesList from '../../components/CitiesList';
import { Region } from '../../types/models';
import { useLocalizedName } from '../../utils/localizationHelpers';

const CitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  const localizedName = useLocalizedName();
  
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  
  const { data: regionsResponse, isLoading: regionsLoading } = useGetRegionsQuery({});
  const regions = regionsResponse?.data || [];

  const handleRegionChange = (event: SelectChangeEvent) => {
    setSelectedRegionId(event.target.value as string);
  };

  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={tablePageStyles.pageTitle}
      >
        {t('pages.cities.title')}
      </Typography>

      {/* Селектор региона */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <Select
            value={selectedRegionId}
            onChange={handleRegionChange}
            displayEmpty
            disabled={regionsLoading}
          >
            <MenuItem value="">
              {regionsLoading ? t('common.loading') : t('admin.cities.selectRegion')}
            </MenuItem>
            {regions.map((region: Region) => (
              <MenuItem key={region.id} value={region.id}>
                {localizedName(region)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Список городов */}
      {selectedRegionId && (
        <CitiesList regionId={selectedRegionId} />
      )}
      
      {!selectedRegionId && !regionsLoading && (
        <Box sx={tablePageStyles.emptyStateContainer}>
          <Typography variant="h6" sx={tablePageStyles.emptyStateTitle}>
            {t('admin.cities.noRegionSelected')}
          </Typography>
          <Typography variant="body2" sx={tablePageStyles.emptyStateDescription}>
            {t('admin.cities.selectRegionDescription')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CitiesPage;
