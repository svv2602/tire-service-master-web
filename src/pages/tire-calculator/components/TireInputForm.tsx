import React, { useState } from 'react';
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
  TireSeason, 
  CarType,
  TIRE_CONSTANTS,
  SPEED_INDEXES 
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

  const generateLoadIndexOptions = () => {
    const options = [];
    for (let index = 70; index <= 120; index++) {
      options.push(index);
    }
    return options;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Параметры расчета
      </Typography>

      {/* Переключатель режима ввода */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label="Ручной ввод"
          clickable
          color={tireInputMode === 'manual' ? 'primary' : 'default'}
          onClick={() => setTireInputMode('manual')}
          sx={{ mr: 1 }}
        />
        <Chip
          label="Популярные размеры"
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
              <InputLabel>Ширина (мм)</InputLabel>
              <Select
                value={originalTire.width}
                label="Ширина (мм)"
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
              <InputLabel>Профиль (%)</InputLabel>
              <Select
                value={originalTire.profile}
                label="Профиль (%)"
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
              <InputLabel>Диаметр (дюймы)</InputLabel>
              <Select
                value={originalTire.diameter}
                label="Диаметр (дюймы)"
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
              Итоговый размер:
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
            onChange={(_, value) => {
              if (value && typeof value === 'object') {
                onTireSizeChange(value.value);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите размер шины"
                placeholder="Например: 205/55 R16"
                fullWidth
              />
            )}
            freeSolo
            onInputChange={(_, value) => {
              if (value && value.includes('/') && value.includes('R')) {
                handleAutocompleteChange(value);
              }
            }}
          />
        </Box>
      )}

      {/* Дополнительные параметры шины */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Индекс нагрузки</InputLabel>
            <Select
              value={originalTire.loadIndex || 91}
              label="Индекс нагрузки"
              onChange={(e) => handleTireFieldChange('loadIndex', Number(e.target.value))}
            >
              {generateLoadIndexOptions().map(index => (
                <MenuItem key={index} value={index}>{index}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Индекс скорости</InputLabel>
            <Select
              value={originalTire.speedIndex || 'H'}
              label="Индекс скорости"
              onChange={(e) => handleTireFieldChange('speedIndex', e.target.value)}
            >
              {Object.entries(SPEED_INDEXES).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {key} ({value.description})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Расширенные настройки */}
      <Accordion expanded={showAdvanced} onChange={(_, expanded) => setShowAdvanced(expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Расширенные настройки
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Максимальное отклонение диаметра: {searchParams.maxDeviationPercent}%
              </Typography>
              <Slider
                value={searchParams.maxDeviationPercent}
                onChange={(_, value) => handleAdvancedParamChange('maxDeviationPercent', value)}
                min={1}
                max={5}
                step={0.5}
                marks={[
                  { value: 1, label: '1%' },
                  { value: 3, label: '3%' },
                  { value: 5, label: '5%' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Изменение ширины: ±{searchParams.allowedWidthRange} мм
              </Typography>
              <Slider
                value={searchParams.allowedWidthRange}
                onChange={(_, value) => handleAdvancedParamChange('allowedWidthRange', value)}
                min={10}
                max={50}
                step={5}
                marks={[
                  { value: 10, label: '±10мм' },
                  { value: 20, label: '±20мм' },
                  { value: 50, label: '±50мм' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Изменение диаметра диска: ±{searchParams.allowedDiameterRange}"
              </Typography>
              <Slider
                value={searchParams.allowedDiameterRange}
                onChange={(_, value) => handleAdvancedParamChange('allowedDiameterRange', value)}
                min={0}
                max={3}
                step={1}
                marks={[
                  { value: 0, label: '0"' },
                  { value: 1, label: '±1"' },
                  { value: 2, label: '±2"' },
                  { value: 3, label: '±3"' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Сезон</InputLabel>
                <Select
                  value={searchParams.season || ''}
                  label="Сезон"
                  onChange={(e) => handleAdvancedParamChange('season', e.target.value || undefined)}
                >
                  <MenuItem value="">Любой</MenuItem>
                  <MenuItem value={TireSeason.SUMMER}>Летние</MenuItem>
                  <MenuItem value={TireSeason.WINTER}>Зимние</MenuItem>
                  <MenuItem value={TireSeason.ALL_SEASON}>Всесезонные</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Тип автомобиля</InputLabel>
                <Select
                  value={searchParams.carType || ''}
                  label="Тип автомобиля"
                  onChange={(e) => handleAdvancedParamChange('carType', e.target.value || undefined)}
                >
                  <MenuItem value="">Любой</MenuItem>
                  <MenuItem value={CarType.PASSENGER}>Легковой</MenuItem>
                  <MenuItem value={CarType.SUV}>Внедорожник</MenuItem>
                  <MenuItem value={CarType.TRUCK}>Грузовой</MenuItem>
                  <MenuItem value={CarType.VAN}>Фургон</MenuItem>
                </Select>
              </FormControl>
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
          Сбросить
        </Button>
        <Button
          variant="contained"
          onClick={onCalculate}
          startIcon={<CalculateIcon />}
          disabled={isCalculating || hasValidationErrors}
          size="large"
        >
          {isCalculating ? 'Расчет...' : 'Рассчитать альтернативы'}
        </Button>
      </Box>
    </Box>
  );
};

export default TireInputForm;
