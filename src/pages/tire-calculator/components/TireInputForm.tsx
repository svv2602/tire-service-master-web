import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Chip,
  Autocomplete
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { 
  TireSize, 
  TireSearchParams, 
  TIRE_CONSTANTS
} from '../../../types/tire-calculator';
import { getPopularTireSizes, formatTireSize, parseTireSize } from '../../../utils/tire-calculator';

interface TireInputFormProps {
  originalTire: TireSize;
  searchParams: TireSearchParams;
  onTireSizeChange: (tireSize: TireSize) => void;
  onSearchParamsChange: (params: Partial<TireSearchParams>) => void;
  onCalculate: () => void;
  onReset: () => void;
  isCalculating: boolean;
  hasValidationErrors: boolean;
}

const TireInputForm: React.FC<TireInputFormProps> = ({
  originalTire,
  searchParams,
  onTireSizeChange,
  onSearchParamsChange,
  onCalculate,
  onReset,
  isCalculating,
  hasValidationErrors
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tireInputMode, setTireInputMode] = useState<'manual' | 'autocomplete'>('manual');
  const { t } = useTranslation();
  
  // Популярные размеры для автозаполнения
  const popularSizes = getPopularTireSizes();
  const popularSizeOptions = popularSizes.map(size => ({
    label: formatTireSize(size),
    value: size
  }));

  // Обработчики изменения полей
  const handleTireFieldChange = (field: keyof TireSize, value: number | string) => {
    const newTire = { ...originalTire, [field]: value };
    onTireSizeChange(newTire);
  };

  const handleAutocompleteChange = (value: string) => {
    const parsedSize = parseTireSize(value);
    if (parsedSize) {
      onTireSizeChange(parsedSize);
    }
  };

  const handleAdvancedParamChange = (field: keyof TireSearchParams, value: any) => {
    onSearchParamsChange({ [field]: value });
  };

  // Генерация опций для селектов
  const generateWidthOptions = () => {
    const options = [];
    for (let width = TIRE_CONSTANTS.MIN_WIDTH; width <= TIRE_CONSTANTS.MAX_WIDTH; width += 5) {
      // Исключаем все размеры кратные 10
      if (width % 10 === 0) {
        continue;
      }
      options.push(width);
    }
    return options;
  };

  const generateProfileOptions = () => {
    const options = [];
    for (let profile = TIRE_CONSTANTS.MIN_PROFILE; profile <= TIRE_CONSTANTS.MAX_PROFILE; profile += 5) {
      options.push(profile);
    }
    return options;
  };

  const generateDiameterOptions = () => {
    const options = [];
    for (let diameter = TIRE_CONSTANTS.MIN_DIAMETER; diameter <= TIRE_CONSTANTS.MAX_DIAMETER; diameter++) {
      options.push(diameter);
    }
    return options;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        {t('tireCalculator.title')}
      </Typography>

      {/* Переключатель режима ввода */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label={t('tireCalculator.inputMode.manual')}
          clickable
          color={tireInputMode === 'manual' ? 'primary' : 'default'}
          onClick={() => setTireInputMode('manual')}
          sx={{ mr: 1 }}
        />
        <Chip
          label={t('tireCalculator.inputMode.popular')}
          clickable
          color={tireInputMode === 'autocomplete' ? 'primary' : 'default'}
          onClick={() => setTireInputMode('autocomplete')}
        />
      </Box>

      {/* Ввод размера шины */}
      {tireInputMode === 'manual' ? (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('tireCalculator.fields.width')}</InputLabel>
              <Select
                value={originalTire.width}
                label={t('tireCalculator.fields.width')}
                onChange={(e) => handleTireFieldChange('width', Number(e.target.value))}
              >
                {generateWidthOptions().map(width => (
                  <MenuItem key={width} value={width}>{width}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('tireCalculator.fields.profile')}</InputLabel>
              <Select
                value={originalTire.profile}
                label={t('tireCalculator.fields.profile')}
                onChange={(e) => handleTireFieldChange('profile', Number(e.target.value))}
              >
                {generateProfileOptions().map(profile => (
                  <MenuItem key={profile} value={profile}>{profile}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('tireCalculator.fields.diameter')}</InputLabel>
              <Select
                value={originalTire.diameter}
                label={t('tireCalculator.fields.diameter')}
                onChange={(e) => handleTireFieldChange('diameter', Number(e.target.value))}
              >
                {generateDiameterOptions().map(diameter => (
                  <MenuItem key={diameter} value={diameter}>{diameter}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('tireCalculator.result.finalSize')}
            </Typography>
            <Typography variant="h6" color="primary">
              {formatTireSize(originalTire)}
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            options={popularSizeOptions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
            value={popularSizeOptions.find(opt => 
              opt.value.width === originalTire.width &&
              opt.value.profile === originalTire.profile &&
              opt.value.diameter === originalTire.diameter
            ) || null}
            onChange={(_, value) => handleAutocompleteChange(value?.label || '')}
            renderInput={(params) => (
              <TextField {...params} label={t('tireCalculator.inputMode.popular')} variant="outlined" />
            )}
          />
        </Box>
      )}

      {/* Расширенные настройки */}
      <Accordion expanded={showAdvanced} onChange={(_, expanded) => setShowAdvanced(expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {t('tireCalculator.advancedSettings.title')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                {t('tireCalculator.advancedSettings.maxDeviation')} {searchParams.maxDeviationPercent}%
              </Typography>
              <Slider
                value={searchParams.maxDeviationPercent}
                onChange={(_, value) => handleAdvancedParamChange('maxDeviationPercent', value)}
                min={1}
                max={5}
                step={0.5}
                marks={[
                  { value: 1, label: t('tireCalculator.advancedSettings.deviation1') },
                  { value: 3, label: t('tireCalculator.advancedSettings.deviation3') },
                  { value: 5, label: t('tireCalculator.advancedSettings.deviation5') }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                {t('tireCalculator.advancedSettings.allowedWidthRange')} ±{searchParams.allowedWidthRange} {t('tireCalculator.advancedSettings.mm')}
              </Typography>
              <Slider
                value={searchParams.allowedWidthRange}
                onChange={(_, value) => handleAdvancedParamChange('allowedWidthRange', value)}
                min={10}
                max={50}
                step={5}
                marks={[
                  { value: 10, label: t('tireCalculator.advancedSettings.widthRange10') },
                  { value: 20, label: t('tireCalculator.advancedSettings.widthRange20') },
                  { value: 50, label: t('tireCalculator.advancedSettings.widthRange50') }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                {t('tireCalculator.advancedSettings.allowedDiameterRange')} ±{searchParams.allowedDiameterRange} {t('tireCalculator.advancedSettings.inch')}
              </Typography>
              <Slider
                value={searchParams.allowedDiameterRange}
                onChange={(_, value) => handleAdvancedParamChange('allowedDiameterRange', value)}
                min={0}
                max={3}
                step={1}
                marks={[
                  { value: 0, label: t('tireCalculator.advancedSettings.diameterRange0') },
                  { value: 1, label: t('tireCalculator.advancedSettings.diameterRange1') },
                  { value: 2, label: t('tireCalculator.advancedSettings.diameterRange2') },
                  { value: 3, label: t('tireCalculator.advancedSettings.diameterRange3') }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Кнопки управления */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onReset}
          startIcon={<RefreshIcon />}
          disabled={isCalculating}
        >
          {t('tireCalculator.buttons.reset')}
        </Button>
        <Button
          variant="contained"
          onClick={onCalculate}
          startIcon={<CalculateIcon />}
          disabled={isCalculating || hasValidationErrors}
          size="large"
        >
          {isCalculating ? t('tireCalculator.buttons.calculating') : t('tireCalculator.buttons.calculate')}
        </Button>
      </Box>
    </Box>
  );
};

export default TireInputForm;
