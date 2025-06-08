import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const sectionStyle = {
  p: 3,
  mb: 2,
  borderRadius: 1,
  bgcolor: 'background.paper',
  boxShadow: 1,
};

const appBarContainerStyle = {
  p: 2,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  bgcolor: 'background.default',
};

// Стилизованный компонент для поиска
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export const AppBarSection: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMoreAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        AppBar & Toolbar
      </Typography>

      <Paper sx={sectionStyle}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
          Примеры навигационной панели
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={appBarContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Простая навигационная панель
              </Typography>
              <AppBar position="static" sx={{ mb: 2 }}>
                <Toolbar>
                  <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                  >
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

          <Grid item xs={12}>
            <Box sx={appBarContainerStyle}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Расширенная навигационная панель
              </Typography>
              <AppBar position="static" sx={{ mb: 2 }}>
                <Toolbar>
                  <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    sx={{ mr: 2 }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ display: { xs: 'none', sm: 'block' } }}
                  >
                    Tire Service Pro
                  </Typography>
                  <Search>
                    <SearchIconWrapper>
                      <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                      placeholder="Поиск..."
                      inputProps={{ 'aria-label': 'search' }}
                    />
                  </Search>
                  <Box sx={{ flexGrow: 1 }} />
                  <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <IconButton size="large" aria-label="show notifications" color="inherit">
                      <Badge badgeContent={4} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                    <IconButton
                      size="large"
                      edge="end"
                      aria-label="account of current user"
                      aria-controls={menuId}
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                      color="inherit"
                    >
                      <AccountCircle />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <IconButton
                      size="large"
                      aria-label="show more"
                      aria-controls={mobileMenuId}
                      aria-haspopup="true"
                      onClick={handleMobileMenuOpen}
                      color="inherit"
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </Toolbar>
              </AppBar>

              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                id={menuId}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Профиль</MenuItem>
                <MenuItem onClick={handleMenuClose}>Мой аккаунт</MenuItem>
                <MenuItem onClick={handleMenuClose}>Выйти</MenuItem>
              </Menu>

              <Menu
                anchorEl={mobileMoreAnchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                id={mobileMenuId}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(mobileMoreAnchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem>
                  <IconButton size="large" aria-label="show notifications" color="inherit">
                    <Badge badgeContent={4} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <p>Уведомления</p>
                </MenuItem>
                <MenuItem onClick={handleProfileMenuOpen}>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                  <p>Профиль</p>
                </MenuItem>
              </Menu>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AppBarSection;