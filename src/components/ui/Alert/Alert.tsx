import React from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps, Box, IconButton, styled, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from '../../../styles/theme/tokens';

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

// Стилизованный MuiAlert
const StyledAlert = styled(MuiAlert)(({ theme, severity }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  // Определяем цвета в зависимости от severity
  const getColorsByType = () => {
    switch (severity) {
      case 'success':
        return {
          background: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(237, 247, 237, 1)',
          border: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.3)' : theme.palette.success.light,
          color: theme.palette.mode === 'dark' ? '#81c784' : theme.palette.success.dark,
        };
      case 'error':
        return {
          background: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.15)' : 'rgba(253, 237, 237, 1)',
          border: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.3)' : theme.palette.error.light,
          color: theme.palette.mode === 'dark' ? '#e57373' : theme.palette.error.dark,
        };
      case 'warning':
        return {
          background: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.15)' : 'rgba(255, 244, 229, 1)',
          border: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.3)' : theme.palette.warning.light,
          color: theme.palette.mode === 'dark' ? '#ffb74d' : theme.palette.warning.dark,
        };
      case 'info':
      default:
        return {
          background: theme.palette.mode === 'dark' ? 'rgba(2, 136, 209, 0.15)' : 'rgba(229, 246, 253, 1)',
          border: theme.palette.mode === 'dark' ? 'rgba(2, 136, 209, 0.3)' : theme.palette.info.light,
          color: theme.palette.mode === 'dark' ? '#4fc3f7' : theme.palette.info.dark,
        };
    }
  };
  
  const colors = getColorsByType();
  
  return {
    borderRadius: tokens.borderRadius.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily,
    border: '1px solid',
    borderColor: colors.border,
    transition: tokens.transitions.duration.normal,
    
    '&.MuiAlert-standardSuccess, &.MuiAlert-outlinedSuccess, &.MuiAlert-filledSuccess': {
      backgroundColor: colors.background,
      color: colors.color,
    },
    
    '&.MuiAlert-standardError, &.MuiAlert-outlinedError, &.MuiAlert-filledError': {
      backgroundColor: colors.background,
      color: colors.color,
    },
    
    '&.MuiAlert-standardWarning, &.MuiAlert-outlinedWarning, &.MuiAlert-filledWarning': {
      backgroundColor: colors.background,
      color: colors.color,
    },
    
    '&.MuiAlert-standardInfo, &.MuiAlert-outlinedInfo, &.MuiAlert-filledInfo': {
      backgroundColor: colors.background,
      color: colors.color,
    },
    
    '& .MuiAlert-icon': {
      color: 'inherit',
      marginRight: tokens.spacing.md,
    },
    
    '& .MuiAlert-message': {
      padding: 0,
      width: '100%',
    },
    
    '& .MuiAlert-action': {
      marginRight: 0,
      padding: 0,
      alignItems: 'center',
    },
  };
});

// Стилизованный IconButton для действий
const StyledIconButton = styled(IconButton)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    color: 'inherit',
    padding: tokens.spacing.xs,
    fontSize: tokens.typography.fontSize.sm,
    transition: tokens.transitions.duration.normal,
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    
    '& .MuiSvgIcon-root': {
      fontSize: tokens.typography.fontSize.md,
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
  title,
  actions,
  children,
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  // Определяем соответствующие MUI варианты
  const muiVariant = ['standard', 'filled', 'outlined'].includes(variant) 
    ? variant as MuiAlertProps['variant']
    : 'filled';

  // Определяем severity на основе варианта
  const severity = ['info', 'success', 'warning', 'error'].includes(variant) 
    ? variant as MuiAlertProps['severity']
    : undefined;

  const actionButtons = (
    <Box sx={{ display: 'flex', gap: tokens.spacing.xs, alignItems: 'center' }}>
      {actions?.map((action, index) => (
        <StyledIconButton
          key={index}
          size="small"
          onClick={action.onClick}
        >
          {action.label}
        </StyledIconButton>
      ))}
      {onClose && (
        <StyledIconButton
          size="small"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </StyledIconButton>
      )}
    </Box>
  );

  return (
    <StyledAlert
      variant={muiVariant}
      severity={severity}
      onClose={closable ? onClose : undefined}
      action={actionButtons}
      sx={{
        ...props.sx
      }}
    >
      {title && (
        <Box component="div" sx={{ 
          fontWeight: tokens.typography.fontWeight.bold, 
          marginBottom: tokens.spacing.xs,
          fontFamily: tokens.typography.fontFamily,
        }}>
          {title}
        </Box>
      )}
      {children}
    </StyledAlert>
  );
};

export default Alert;