import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Badge,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

export const AppBarSection: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        AppBar
      </Typography>

      <Grid container spacing={4}>
        {/* Простая навигационная панель */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Простая навигационная панель
          </Typography>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <AppBar position="static">
              <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Tire Service
                </Typography>
                <Button color="inherit">Войти</Button>
              </Toolbar>
            </AppBar>
          </Box>
        </Grid>

        {/* Навигационная панель с поиском */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С поиском и уведомлениями
          </Typography>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <AppBar position="static">
              <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Tire Service
                </Typography>
                <IconButton color="inherit">
                  <SearchIcon />
                </IconButton>
                <IconButton color="inherit">
                  <Badge badgeContent={4} color="error">
                    <MailIcon />
                  </Badge>
                </IconButton>
                <IconButton color="inherit">
                  <Badge badgeContent={17} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="primary-search-account-menu"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Toolbar>
            </AppBar>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              id="primary-search-account-menu"
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={isMenuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Профиль</MenuItem>
              <MenuItem onClick={handleMenuClose}>Мой аккаунт</MenuItem>
              <MenuItem onClick={handleMenuClose}>Выйти</MenuItem>
            </Menu>
          </Box>
        </Grid>

        {/* Навигационная панель с вкладками */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            С навигационными кнопками
          </Typography>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Tire Service
                </Typography>
                <Button color="inherit">Главная</Button>
                <Button color="inherit">Услуги</Button>
                <Button color="inherit">О нас</Button>
                <Button color="inherit">Контакты</Button>
              </Toolbar>
            </AppBar>
          </Box>
        </Grid>

        {/* Темная навигационная панель */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Темная тема
          </Typography>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <AppBar position="static" color="inherit" sx={{ bgcolor: 'grey.800' }}>
              <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>T</Avatar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Tire Service Pro
                </Typography>
                <Button color="inherit">Панель управления</Button>
                <IconButton color="inherit">
                  <MoreIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppBarSection;