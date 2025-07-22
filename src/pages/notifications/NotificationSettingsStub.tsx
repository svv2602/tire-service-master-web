import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { NotificationsActive as NotificationsIcon } from '@mui/icons-material';

interface NotificationSettingsStubProps {
  title: string;
  description: string;
}

const NotificationSettingsStub: React.FC<NotificationSettingsStubProps> = ({ 
  title, 
  description 
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4">
          {title}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Функциональность будет восстановлена в ближайшее время.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationSettingsStub; 