import React from 'react';
import { Box, Typography, Badge, Grid, IconButton } from '@mui/material';
import {
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

export const BadgeSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Badge
      </Typography>

      <Grid container spacing={4}>
        {/* Базовые значки */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Базовые значки
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Badge badgeContent={4} color="primary">
              <MailIcon />
            </Badge>
            <Badge badgeContent={100} color="secondary">
              <NotificationsIcon />
            </Badge>
            <Badge badgeContent={1000} max={999} color="error">
              <ShoppingCartIcon />
            </Badge>
          </Box>
        </Grid>

        {/* Значки с точкой */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Значки с точкой
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Badge variant="dot" color="primary">
              <MailIcon />
            </Badge>
            <Badge variant="dot" color="secondary">
              <NotificationsIcon />
            </Badge>
            <Badge variant="dot" color="error">
              <ShoppingCartIcon />
            </Badge>
          </Box>
        </Grid>

        {/* Значки на кнопках */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Значки на кнопках
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton aria-label="mail">
              <Badge badgeContent={4} color="primary">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton aria-label="notifications">
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton aria-label="cart">
              <Badge badgeContent={3} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Grid>

        {/* Позиционирование значков */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Позиционирование значков
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Badge badgeContent={4} color="primary" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
              <MailIcon />
            </Badge>
            <Badge badgeContent={4} color="primary" anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
              <MailIcon />
            </Badge>
            <Badge badgeContent={4} color="primary" anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
              <MailIcon />
            </Badge>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BadgeSection;