import React from 'react';
import MuiPaper from '@mui/material/Paper';
import { PaperProps } from './types';

/**
 * Компонент Paper - базовый компонент для создания поверхностей с тенью
 */
const Paper: React.FC<PaperProps> = ({
  variant = 'elevated',
  elevation = 1,
  disablePadding = false,
  rounded = 'medium',
  sx,
  children,
  ...rest
}) => {
  // Определяем радиус скругления
  const borderRadius = {
    none: 0,
    small: 4,
    medium: 8,
    large: 16,
    full: 9999,
  }[rounded];

  return (
    <MuiPaper
      variant={variant === 'elevated' ? 'elevation' : variant === 'flat' ? 'elevation' : 'outlined'}
      elevation={variant === 'flat' ? 0 : variant === 'outlined' ? 0 : elevation}
      sx={{
        padding: disablePadding ? 0 : 2,
        borderRadius,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </MuiPaper>
  );
};

export default Paper; 