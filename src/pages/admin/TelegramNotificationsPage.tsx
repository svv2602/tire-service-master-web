import React from 'react';
import { Container } from '@mui/material';
import TelegramNotificationManager from '../../components/telegram/TelegramNotificationManager';

/**
 * Админская страница для управления Telegram уведомлениями
 * Позволяет отправлять уведомления, просматривать статистику и управлять подписками
 */
export const TelegramNotificationsPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <TelegramNotificationManager />
    </Container>
  );
};

export default TelegramNotificationsPage; 