import React from 'react';
import { styled } from '@mui/material/styles';
import MuiSnackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { SnackbarProps } from './types';

// Стилизованный компонент Alert
const StyledAlert = styled(Alert)(({ theme }) => ({
  width: '100%',
  '& .MuiAlert-message': {
    flex: 1,
  },
}));

/**
 * Компонент Snackbar - уведомление с поддержкой разных типов сообщений
 */
const Snackbar: React.FC<SnackbarProps> = ({
  message,
  onClose,
  alertProps,
  anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
  ...rest
}) => {
  // Обработчик закрытия
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <MuiSnackbar
      open={true}
      autoHideDuration={message.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
      {...rest}
    >
      <StyledAlert
        onClose={handleClose}
        severity={message.type}
        variant="filled"
        elevation={6}
        {...alertProps}
      >
        {message.message}
      </StyledAlert>
    </MuiSnackbar>
  );
};

export default Snackbar; 