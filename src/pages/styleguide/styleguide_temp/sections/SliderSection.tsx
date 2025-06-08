import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Card } from '../../../../components/ui/Card';
import { Slider } from '../../../../components/ui/Slider';

export const SliderSection: React.FC = () => {
  const [value, setValue] = useState(50);
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80]);

  const marks = [
    { value: 0, label: '0°C' },
    { value: 50, label: '50°C' },
    { value: 100, label: '100°C' },
  ];

  const defaultMarks = [
    { value: 0, label: '0' },
    { value: 20, label: '20' },
    { value: 40, label: '40' },
    { value: 60, label: '60' },
    { value: 80, label: '80' },
    { value: 100, label: '100' },
  ];

  const handleRangeChange = (newValue: number | number[]) => {
    if (Array.isArray(newValue) && newValue.length === 2) {
      setRangeValue([newValue[0], newValue[1]]);
    }
  };

  const handleSingleChange = (newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setValue(newValue);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Slider
      </Typography>

      <Card title="Примеры слайдеров">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Обычный слайдер</Typography>
            <Slider
              value={value}
              onChange={handleSingleChange}
              marks={marks}
              step={10}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Диапазон значений</Typography>
            <Slider
              value={rangeValue}
              onChange={handleRangeChange}
              showValue
              valueFormatter={(value) => `${value}%`}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Дискретный слайдер</Typography>
            <Slider
              value={value}
              onChange={handleSingleChange}
              step={10}
              marks={defaultMarks}
              min={0}
              max={100}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>С подписями значений</Typography>
            <Slider
              value={value}
              onChange={handleSingleChange}
              valueLabelDisplay="auto"
              step={10}
              marks={defaultMarks}
              min={0}
              max={100}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default SliderSection;