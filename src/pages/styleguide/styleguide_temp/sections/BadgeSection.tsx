import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '../../../../components/ui/Badge';
import { Card } from '../../../../components/ui/Card';

export const BadgeSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Бейджи
      </Typography>

      <Grid container spacing={3}>
        {/* Простые бейджи */}
        <Grid item xs={12} md={6}>
          <Card title="Простые бейджи">
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Badge badgeContent={4}>
                <MailIcon />
              </Badge>
              <Badge badgeContent={10}>
                <ShoppingCartIcon />
              </Badge>
            </Box>
          </Card>
        </Grid>

        {/* Бейджи с разными размерами */}
        <Grid item xs={12} md={6}>
          <Card title="Размеры бейджей">
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Badge badgeContent={4}>
                <Box sx={{ transform: 'scale(0.8)' }}>
                  <MailIcon />
                </Box>
              </Badge>
              <Badge badgeContent={10}>
                <Box sx={{ transform: 'scale(1.2)' }}>
                  <ShoppingCartIcon />
                </Box>
              </Badge>
            </Box>
          </Card>
        </Grid>

        {/* Бейджи с разными вариантами */}
        <Grid item xs={12} md={6}>
          <Card title="Варианты бейджей">
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Badge dot>
                <MailIcon />
              </Badge>
              <Badge badgeContent={10}>
                <ShoppingCartIcon />
              </Badge>
            </Box>
          </Card>
        </Grid>

        {/* Пульсирующие бейджи */}
        <Grid item xs={12} md={6}>
          <Card title="Пульсирующие бейджи">
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Badge badgeContent={4} pulse>
                <MailIcon />
              </Badge>
              <Badge dot pulse>
                <ShoppingCartIcon />
              </Badge>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BadgeSection;