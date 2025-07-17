import React from 'react';
import { Box, Container } from '@mui/material';
import NotificationCenter from '../../components/notifications/NotificationCenter';

const NotificationCenterPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <NotificationCenter />
      </Box>
    </Container>
  );
};

export default NotificationCenterPage;
