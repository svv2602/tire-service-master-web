import React from 'react';
import { Container } from '@mui/material';
import NotificationCenter from '../../components/notifications/NotificationCenter';

const NotificationCenterPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <NotificationCenter />
    </Container>
  );
};

export default NotificationCenterPage; 