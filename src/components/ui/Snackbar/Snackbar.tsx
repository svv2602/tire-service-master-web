import React from 'react';
import {
  Snackbar as MuiSnackbar,
  SnackbarProps as MuiSnackbarProps,
  Alert,
  AlertColor,
  styled,
  IconButton,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { tokens } from '../../../styles/theme/tokens';

/** Пропсы уведомления */
export interface SnackbarProps extends Omit<MuiSnackbarProps, 'children'> {
  /** Сообщение */
  message: string;
  /** Тип уведомления */
  severity?: AlertColor;
  /** Показать ли кнопку закрытия */
  showCloseButton?: boolean;
  /** Колбэк закрытия */
  onClose?: (event?: React.SyntheticEvent | Event, reason?: string) => void;
  /** Позиция на экране */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  /** Время автоскрытия в миллисекундах */
  autoHideDuration?: number | null;
  /** Открыто ли уведомление */
  open: boolean;
}

/** Стилизованное уведомление */
const StyledSnackbar = styled(MuiSnackbar)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiSnackbarContent-root': {
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.lg,
    },
    '& .MuiAlert-root': {
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.lg,
      width: '100%',
      transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
      
      '&.MuiAlert-standardSuccess': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? themeColors.successLight 
          : themeColors.successLight,
        color: theme.palette.mode === 'dark' 
          ? themeColors.textPrimary 
          : themeColors.success,
      },
      
      '&.MuiAlert-standardError': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? themeColors.errorLight 
          : themeColors.errorLight,
        color: theme.palette.mode === 'dark' 
          ? themeColors.textPrimary 
          : themeColors.error,
      },
      
      '&.MuiAlert-standardWarning': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? themeColors.warningLight 
          : themeColors.warningLight,
        color: theme.palette.mode === 'dark' 
          ? themeColors.textPrimary 
          : themeColors.warning,
      },
      
      '&.MuiAlert-standardInfo': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? themeColors.infoLight 
          : themeColors.infoLight,
        color: theme.palette.mode === 'dark' 
          ? themeColors.textPrimary 
          : themeColors.info,
      },
      
      '& .MuiAlert-icon': {
        alignItems: 'center',
        color: 'inherit',
      },
      
      '& .MuiAlert-message': {
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.medium,
        fontFamily: tokens.typography.fontFamily,
      },
      
      '& .MuiAlert-action': {
        alignItems: 'center',
        paddingTop: 0,
        color: 'inherit',
      },
    },
  };
});

/** Стилизованная кнопка закрытия */
const CloseButton = styled(IconButton)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: tokens.spacing.xxs,
    transition: tokens.transitions.duration.fast,
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)',
    },
  };
});

/**
 * Компонент уведомлений
 * 
 * @example
 * <Snackbar
 *   open={showNotification}
 *   message="Настройки сохранены"
 *   severity="success"
 *   onClose={() => setShowNotification(false)}
 *   autoHideDuration={6000}
 * />
 */
export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  severity = 'info',
  showCloseButton = true,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  autoHideDuration = 6000,
  open,
  ...props
}) => {
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose?.(event, reason);
  };

  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  const action = showCloseButton ? (
    <CloseButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </CloseButton>
  ) : undefined;

  return (
    <StyledSnackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
      {...props}
    >
      <Alert
        severity={severity}
        action={action}
        onClose={showCloseButton ? handleClose : undefined}
        sx={{ 
          width: '100%',
          animation: `${tokens.animations.fadeIn} ${tokens.transitions.duration.normal}ms ${tokens.transitions.easing.easeInOut}`,
        }}
      >
        {message}
      </Alert>
    </StyledSnackbar>
  );
};

export default Snackbar; 