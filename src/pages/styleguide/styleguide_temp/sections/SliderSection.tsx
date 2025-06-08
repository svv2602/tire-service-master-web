import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Slider,
} from '@mui/material';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

const marks = [
  {
    value: 0,
    label: '0°C',
  },
  {
    value: 20,
    label: '20°C',
  },
  {
    value: 37,
    label: '37°C',
  },
  {
    value: 100,
    label: '100°C',
  },
];

function valuetext(value: number) {
  return `${value}°C`;
}

export const SliderSection: React.FC = () => {
  const [value, setValue] = useState<number>(30);
  const [rangeValue, setRangeValue] = useState<number[]>([20, 37]);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  const handleRangeChange = (event: Event, newValue: number | number[]) => {
    setRangeValue(newValue as number[]);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Sliders
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовый слайдер
          </Typography>
          <Box sx={{ width: '100%', px: 2 }}>
            <Slider
              aria-label="Базовый"
              defaultValue={30}
              valueLabelDisplay="auto"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Слайдер с метками
          </Typography>
          <Box sx={{ width: '100%', px: 2 }}>
            <Slider
              aria-label="С метками"
              defaultValue={20}
              valueLabelDisplay="auto"
              step={10}
              marks
              min={0}
              max={100}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Слайдер с кастомными метками
          </Typography>
          <Box sx={{ width: '100%', px: 2 }}>
            <Slider
              aria-label="Кастомные метки"
              defaultValue={37}
              getAriaValueText={valuetext}
              valueLabelDisplay="auto"
              step={null}
              marks={marks}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Диапазонный слайдер
          </Typography>
          <Box sx={{ width: '100%', px: 2 }}>
            <Slider
              value={rangeValue}
              onChange={handleRangeChange}
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
              min={0}
              max={100}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Слайдер с иконками
          </Typography>
          <Box sx={{ width: '100%', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VolumeDown sx={{ mr: 2 }} />
              <Slider
                aria-label="Громкость"
                value={value}
                onChange={handleChange}
                sx={{ mx: 2 }}
              />
              <VolumeUp sx={{ ml: 2 }} />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Отключенный слайдер
          </Typography>
          <Box sx={{ width: '100%', px: 2 }}>
            <Slider
              aria-label="Отключен"
              defaultValue={30}
              disabled
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SliderSection;