import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

/** Типы вариантов кнопок */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'text' | 'contained' | 'outlined';

/** Пропсы кнопки */
export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  /** Вариант кнопки */
  variant?: ButtonVariant;
  /** Состояние загрузки */
  loading?: boolean;
}

/** Стилизованная кнопка */
const StyledButton = styled(MuiButton, {
  // Исключаем кастомные пропы из передачи в DOM
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'loading',
})<ButtonProps>(({ theme, variant }) => {
  // Маппинг наших вариантов на варианты MUI
  const variantMapping: Record<ButtonVariant, MuiButtonProps['variant']> = {
    primary: 'contained',
    secondary: 'outlined',
    success: 'contained',
    error: 'contained',
    text: 'text',
    contained: 'contained',
    outlined: 'outlined'
  };

  // Маппинг цветов для наших вариантов
  const colorMapping: Record<ButtonVariant, MuiButtonProps['color']> = {
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    error: 'error',
    text: 'primary',
    contained: 'primary',
    outlined: 'primary'
  };

  return {
    textTransform: 'none',
    borderRadius: tokens.borderRadius.lg,
    fontWeight: tokens.typography.fontWeights.medium,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    transition: tokens.transitions.duration.normal,
    
    // Стили для состояний
    '&:hover': {
      boxShadow: tokens.shadows.md,
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
    
    // Стили для disabled состояния
    '&.Mui-disabled': {
      opacity: 0.7,
    },
  };
});

/** 
 * Компонент кнопки с поддержкой кастомных вариантов
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...props 
}, ref) => {
  // Определяем соответствующие MUI варианты и цвета
  const muiVariant = ['text', 'contained', 'outlined'].includes(variant) 
    ? variant as MuiButtonProps['variant']
    : variant === 'secondary' ? 'outlined' : 'contained';

  const muiColor = variant === 'success' ? 'success' 
    : variant === 'error' ? 'error'
    : variant === 'secondary' ? 'secondary'
    : 'primary';

  return (
    <StyledButton
      ref={ref}
      variant={muiVariant}
      color={muiColor}
      disabled={loading || disabled}
      {...props}
    >
      {children}
    </StyledButton>
  );
});

Button.displayName = 'Button';

export default Button;