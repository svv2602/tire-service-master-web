import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ open, message, severity, onClose }) => {
  const { t } = useTranslation();
  // Если message — ключ перевода, используем t, иначе отображаем как есть
  const isTranslationKey = typeof message === 'string' && message.startsWith('notifications.');
  const displayMessage = isTranslationKey ? t(message) : message;
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {displayMessage}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 