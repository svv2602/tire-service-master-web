import React from 'react';
import MuiSlider from '@mui/material/Slider';
import { styled, useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { SliderProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

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
})(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    [`& .MuiTooltip-tooltip`]: {
      backgroundColor: themeColors.primary,
      color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
      fontSize: tokens.typography.fontSize.xs,
      fontFamily: tokens.typography.fontFamily,
      padding: `${tokens.spacing.xxs} ${tokens.spacing.xs}`,
      borderRadius: tokens.borderRadius.sm,
    },
    [`& .MuiTooltip-arrow`]: {
      color: themeColors.primary,
    },
  };
});

// Стилизованный слайдер
const StyledSlider = styled(MuiSlider)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    height: 4,
    borderRadius: tokens.borderRadius.pill,
    transition: tokens.transitions.duration.normal,
    
    '&.MuiSlider-colorPrimary': {
      color: themeColors.primary,
    },
    
    '&.MuiSlider-colorSecondary': {
      color: theme.palette.secondary.main,
    },
    
    '&.MuiSlider-colorError': {
      color: themeColors.error,
    },
    
    '&.MuiSlider-colorInfo': {
      color: theme.palette.info.main,
    },
    
    '&.MuiSlider-colorSuccess': {
      color: theme.palette.success.main,
    },
    
    '&.MuiSlider-colorWarning': {
      color: theme.palette.warning.main,
    },
    
    '& .MuiSlider-rail': {
      opacity: 0.3,
      backgroundColor: theme.palette.mode === 'dark' 
        ? themeColors.borderSecondary 
        : themeColors.borderPrimary,
    },
    
    '& .MuiSlider-track': {
      border: 'none',
      transition: tokens.transitions.duration.normal,
    },
    
    '& .MuiSlider-thumb': {
      width: 14,
      height: 14,
      backgroundColor: 'currentColor',
      boxShadow: tokens.shadows.sm,
      transition: tokens.transitions.duration.normal,
      
      '&:hover, &.Mui-focusVisible': {
        boxShadow: tokens.shadows.md,
      },
      
      '&.Mui-active': {
        boxShadow: tokens.shadows.md,
      },
    },
    
    '&.MuiSlider-sizeSmall': {
      height: 2,
      
      '& .MuiSlider-thumb': {
        width: 10,
        height: 10,
      },
    },
    
    '& .MuiSlider-valueLabel': {
      fontSize: tokens.typography.fontSize.xs,
      fontFamily: tokens.typography.fontFamily,
    },
    
    '& .MuiSlider-mark': {
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: theme.palette.mode === 'dark' 
        ? themeColors.borderSecondary 
        : themeColors.borderPrimary,
    },
    
    '& .MuiSlider-markActive': {
      backgroundColor: 'currentColor',
      opacity: 0.8,
    },
    
    '& .MuiSlider-markLabel': {
      fontSize: tokens.typography.fontSize.xs,
      fontFamily: tokens.typography.fontFamily,
      color: themeColors.textSecondary,
    },
  };
});

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

  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return (
    <StyledSlider
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