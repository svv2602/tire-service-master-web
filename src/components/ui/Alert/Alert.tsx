import React from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps } from '@mui/material';
import { styled } from '@mui/material/styles';

/** Типы вариантов алертов */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'standard' | 'filled' | 'outlined';

/** Пропсы алерта */
export interface AlertProps extends Omit<MuiAlertProps, 'variant'> {
  /** Вариант алерта */
  variant?: AlertVariant;
  /** Можно ли закрыть */
  closable?: boolean;
}

/** Стилизованный алерт */
const StyledAlert = styled(MuiAlert)<AlertProps>(({ theme, variant }) => {
  // Маппинг наших вариантов на варианты MUI
  const variantMapping: Record<AlertVariant, MuiAlertProps['variant']> = {
    info: 'filled',
    success: 'filled',
    warning: 'filled',
    error: 'filled',
    standard: 'standard',
    filled: 'filled',
    outlined: 'outlined'
  };

  return {
    borderRadius: '8px',
    '& .MuiAlert-message': {
      padding: '8px 0',
    },
  };
});

/**
 * Компонент оповещения
 * 
 * @example
 * <Alert severity="success">Успешное действие</Alert>
 */
export const Alert: React.FC<AlertProps> = ({ 
  variant = 'standard',
  closable = false,
  onClose,
  children,
  ...props 
}) => {
  // Определяем соответствующие MUI варианты
  const muiVariant = ['standard', 'filled', 'outlined'].includes(variant) 
    ? variant as MuiAlertProps['variant']
    : 'filled';

  // Определяем severity на основе варианта
  const severity = ['info', 'success', 'warning', 'error'].includes(variant) 
    ? variant as MuiAlertProps['severity']
    : undefined;

  return (
    <StyledAlert
      variant={muiVariant}
      severity={severity}
      onClose={closable ? onClose : undefined}
      {...props}
    >
      {children}
    </StyledAlert>
  );
};

export default Alert;