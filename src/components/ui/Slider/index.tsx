import React from 'react';
import { Slider as MuiSlider, SliderProps as MuiSliderProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface SliderProps extends Omit<MuiSliderProps, 'onChange'> {
  value: number | [number, number];
  onChange: (event: Event, value: number | number[]) => void;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  marks?: { value: number; label: string }[];
}

const StyledSlider = styled(MuiSlider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}20`,
    },
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: theme.palette.primary.main,
  },
}));

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  showValue = false,
  valueFormatter = (value) => `${value}`,
  marks,
  ...props
}) => {
  const handleChange = (event: Event, newValue: number | number[]) => {
    onChange(event, newValue);
  };

  return (
    <StyledSlider
      value={value}
      onChange={handleChange}
      valueLabelDisplay={showValue ? 'auto' : 'off'}
      valueLabelFormat={valueFormatter}
      marks={marks}
      {...props}
    />
  );
};