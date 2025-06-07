import React from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/** Типы вариантов алертов */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'standard' | 'filled' | 'outlined';

export interface AlertAction {
  label: string;
  onClick: () => void;
}

/** Пропсы алерта */
export interface AlertProps extends Omit<MuiAlertProps, 'variant' | 'action'> {
  /** Вариант алерта */
  variant?: AlertVariant;
  /** Можно ли закрыть */
  closable?: boolean;
  title?: string;
  onClose?: () => void;
  actions?: AlertAction[];
  children: React.ReactNode;
}

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
  title,
  actions,
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

  const actionButtons = (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {actions?.map((action, index) => (
        <IconButton
          key={index}
          size="small"
          onClick={action.onClick}
          sx={{ color: 'inherit' }}
        >
          {action.label}
        </IconButton>
      ))}
      {onClose && (
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'inherit' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );

  return (
    <MuiAlert
      variant={muiVariant}
      severity={severity}
      onClose={closable ? onClose : undefined}
      action={actionButtons}
      sx={{
        '& .MuiAlert-message': {
          width: '100%'
        },
        ...props.sx
      }}
    >
      {title && (
        <Box component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {title}
        </Box>
      )}
      {children}
    </MuiAlert>
  );
};

export default Alert;