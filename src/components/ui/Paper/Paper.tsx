import React from 'react';
import MuiPaper from '@mui/material/Paper';
import { styled, useTheme } from '@mui/material/styles';
import { PaperProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный компонент Paper с поддержкой темной темы
const StyledPaper = styled(MuiPaper, {
  shouldForwardProp: (prop) => 
    !['disablePadding', 'rounded'].includes(prop as string),
})<{
  disablePadding?: boolean;
  rounded?: 'none' | 'small' | 'medium' | 'large' | 'full';
}>(({ theme, disablePadding, rounded = 'medium' }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  // Определяем радиус скругления из токенов
  const borderRadiusMap = {
    none: tokens.borderRadius.none,
    small: tokens.borderRadius.sm,
    medium: tokens.borderRadius.md,
    large: tokens.borderRadius.lg,
    full: tokens.borderRadius.full,
  };
  
  return {
    backgroundColor: themeColors.backgroundCard,
    color: themeColors.textPrimary,
    padding: disablePadding ? 0 : tokens.spacing.md,
    borderRadius: borderRadiusMap[rounded],
    transition: tokens.transitions.duration.normal,
    border: theme.palette.mode === 'dark' ? `1px solid ${themeColors.borderPrimary}` : 'none',
  };
});

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
  const theme = useTheme();
  
  return (
    <StyledPaper
      variant={variant === 'elevated' ? 'elevation' : variant === 'flat' ? 'elevation' : 'outlined'}
      elevation={variant === 'flat' ? 0 : variant === 'outlined' ? 0 : elevation}
      disablePadding={disablePadding}
      rounded={rounded}
      sx={sx}
      {...rest}
    >
      {children}
    </StyledPaper>
  );
};

export default Paper; 