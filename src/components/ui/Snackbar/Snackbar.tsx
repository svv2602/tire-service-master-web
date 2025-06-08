import React from 'react';
import {
  Snackbar as MuiSnackbar,
  SnackbarProps as MuiSnackbarProps,
  Alert,
  AlertColor,
  styled,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

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
const StyledSnackbar = styled(MuiSnackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[6],
  },
  '& .MuiAlert-root': {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[6],
    width: '100%',
    '& .MuiAlert-icon': {
      alignItems: 'center',
    },
    '& .MuiAlert-message': {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    '& .MuiAlert-action': {
      alignItems: 'center',
      paddingTop: 0,
    },
  },
}));

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

  const action = showCloseButton ? (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
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
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </StyledSnackbar>
  );
};

export default Snackbar; 