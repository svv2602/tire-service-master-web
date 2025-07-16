import React from 'react';
import { Container } from '@mui/material';
import { PushNotificationManager } from '../../components/admin/PushNotificationManager/PushNotificationManager';

/**
 * Админская страница для управления push-уведомлениями
 * Позволяет отправлять уведомления, просматривать статистику и историю
 */
export const PushNotificationsPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <PushNotificationManager />
    </Container>
  );
};

export default PushNotificationsPage; 