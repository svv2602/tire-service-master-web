import React from 'react';
import MuiSlider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { SliderProps } from './types';

// Стилизованный компонент для отображения значения над ползунком
const ValueLabel = styled((props: {
  children: React.ReactElement;
  value: number;
  formatter?: (value: number) => string;
}) => {
  const { children, value, formatter } = props;
  const formattedValue = formatter ? formatter(value) : value;

  return (
    <Tooltip open arrow placement="top" title={formattedValue}>
      {children}
    </Tooltip>
  );
})(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 4,
  },
  [`& .MuiTooltip-arrow`]: {
    color: theme.palette.primary.main,
  },
}));

/**
 * Компонент Slider - слайдер для выбора числовых значений
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showMarks = false,
  marks,
  showValue = false,
  valueFormatter,
  size = 'medium',
  color = 'primary',
  orientation = 'horizontal',
  disabled = false,
  sx,
  ...props
}) => {
  // Обработчик изменения значения
  const handleChange = (_: Event, newValue: number | number[], activeThumb?: number) => {
    onChange?.(newValue, activeThumb);
  };

  // Генерация меток
  const sliderMarks = showMarks
    ? marks || Array.from({ length: (max - min) / step + 1 }, (_, i) => ({
        value: min + i * step,
        label: String(min + i * step),
      }))
    : undefined;

  // Компонент для отображения значения
  const ValueLabelComponent = showValue
    ? (props: any) => (
        <ValueLabel {...props} formatter={valueFormatter} />
      )
    : undefined;

  return (
    <MuiSlider
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      marks={sliderMarks}
      size={size}
      color={color}
      orientation={orientation}
      disabled={disabled}
      components={{
        ValueLabel: ValueLabelComponent,
      }}
      sx={{
        // Для вертикального слайдера
        ...(orientation === 'vertical' && {
          height: 200,
        }),
        ...sx,
      }}
      {...props}
    />
  );
}; 