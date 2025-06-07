import React from 'react';
import { Box, Typography, Grid, Card } from '@mui/material';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export const BadgeSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Бейджи
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card title="Простые бейджи">
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Badge badgeContent={4} color="primary">
                <NotificationsIcon />
              </Badge>
              <Badge badgeContent={100} max={99} color="error">
                <MailIcon />
              </Badge>
              <Badge badgeContent={0} color="success" showZero>
                <ShoppingCartIcon />
              </Badge>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card title="Размеры бейджей">
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Badge badgeContent={4} size="small" color="primary">
                <NotificationsIcon />
              </Badge>
              <Badge badgeContent={4} size="medium" color="primary">
                <NotificationsIcon />
              </Badge>
              <Badge badgeContent={4} size="large" color="primary">
                <NotificationsIcon />
              </Badge>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card title="Варианты бейджей">
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Badge badgeContent={4} color="primary">
                <NotificationsIcon />
              </Badge>
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
              <Badge badgeContent={4} color="success">
                <NotificationsIcon />
              </Badge>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
              <Badge badgeContent={4} color="warning">
                <NotificationsIcon />
              </Badge>
              <Badge badgeContent={4} color="info">
                <NotificationsIcon />
              </Badge>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card title="Пульсирующие бейджи">
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Badge badgeContent={1} color="error" pulse>
                <NotificationsIcon />
              </Badge>
              <Badge color="success" pulse>
                <MailIcon />
              </Badge>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BadgeSection; 