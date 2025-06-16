import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Slider } from './Slider';
import { SliderProps } from './types';
import { Box, Typography, Grid, Stack, Paper } from '@mui/material';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    docs: {
      description: {
        component: 'Компонент Slider - слайдер для выбора числовых значений в заданном диапазоне.',
      },
    },
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
      description: 'Цвет слайдера',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Размер слайдера',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Ориентация слайдера',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключен ли слайдер',
    },
    showMarks: {
      control: 'boolean',
      description: 'Отображать метки со значениями',
    },
    showValue: {
      control: 'boolean',
      description: 'Отображать текущее значение над ползунком',
    },
  },
} as Meta;

// Компонент-обертка для демонстрации
const Template: Story<SliderProps> = (args) => {
  const [value, setValue] = useState<number | number[]>(args.value ?? 50);

  const handleChange = (newValue: number | number[]) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: 300, p: 2 }}>
      <Slider {...args} value={value} onChange={handleChange} />
      <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
        Значение: {Array.isArray(value) ? `[${value.join(', ')}]` : value}
      </Typography>
    </Box>
  );
};

/**
 * Базовый пример использования слайдера
 */
export const Basic = Template.bind({});
Basic.args = {
  value: 50,
};

/**
 * Слайдер с метками
 */
export const WithMarks = Template.bind({});
WithMarks.args = {
  value: 50,
  showMarks: true,
  step: 20,
};

/**
 * Слайдер с кастомными метками
 */
export const WithCustomMarks = Template.bind({});
WithCustomMarks.args = {
  value: 50,
  marks: [
    { value: 0, label: 'Мин' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: 'Макс' },
  ],
};

/**
 * Range слайдер
 */
export const Range = Template.bind({});
Range.args = {
  value: [20, 80],
};

/**
 * Слайдер с отображением значения
 */
export const WithValue = Template.bind({});
WithValue.args = {
  value: 50,
  showValue: true,
  valueFormatter: (value: number) => `${value}%`,
};

/**
 * Вертикальный слайдер
 */
export const Vertical = Template.bind({});
Vertical.args = {
  value: 50,
  orientation: 'vertical',
  showMarks: true,
  step: 20,
};

/**
 * Слайдер с разными цветами
 */
export const Colors = () => {
  const colors: Array<SliderProps['color']> = ['primary', 'secondary', 'error', 'info', 'success', 'warning'];
  
  return (
    <Stack spacing={3} sx={{ width: 300 }}>
      {colors.map((color) => (
        <Box key={color}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
            {color ? color.charAt(0).toUpperCase() + color.slice(1) : 'Primary'}
          </Typography>
          <Slider value={50} color={color} />
        </Box>
      ))}
    </Stack>
  );
};

/**
 * Слайдер с разными размерами
 */
export const Sizes = () => {
  return (
    <Stack spacing={4} sx={{ width: 300 }}>
      <Box>
        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
          Small
        </Typography>
        <Slider value={50} size="small" />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
          Medium
        </Typography>
        <Slider value={50} size="medium" />
      </Box>
    </Stack>
  );
};

/**
 * Отключенный слайдер
 */
export const Disabled = Template.bind({});
Disabled.args = {
  value: 50,
  disabled: true,
  showMarks: true,
  step: 25,
};

/**
 * Практические примеры использования
 */
export const Examples = () => {
  const [volume, setVolume] = useState<number>(30);
  const [brightness, setBrightness] = useState<number>(70);
  const [priceRange, setPriceRange] = useState<number[]>([1000, 5000]);
  
  // Форматирование цены
  const formatPrice = (value: number) => {
    return `${value.toLocaleString('ru-RU')} ₽`;
  };
  
  return (
    <Stack spacing={4} sx={{ width: 350 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Регулировка громкости
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VolumeDown />
          <Slider 
            value={volume} 
            onChange={(value) => setVolume(value as number)} 
            showValue
            valueFormatter={(value) => `${value}%`}
          />
          <VolumeUp />
        </Box>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Настройка яркости
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Brightness1Icon />
          <Slider 
            value={brightness} 
            onChange={(value) => setBrightness(value as number)} 
            color="warning"
            showValue
          />
          <Brightness7Icon />
        </Box>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Фильтр по цене
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider 
            value={priceRange} 
            onChange={(value) => setPriceRange(value as number[])} 
            min={0}
            max={10000}
            step={500}
            showMarks
            marks={[
              { value: 0, label: '0 ₽' },
              { value: 5000, label: '5 000 ₽' },
              { value: 10000, label: '10 000 ₽' },
            ]}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="body2">
              От: {formatPrice(priceRange[0])}
            </Typography>
            <Typography variant="body2">
              До: {formatPrice(priceRange[1])}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Stack>
  );
}; 