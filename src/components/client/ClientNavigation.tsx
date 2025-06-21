import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Login as LoginIcon,
  Person as PersonIcon,
  BookOnline as BookOnlineIcon,
  RateReview as ReviewIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Article as ArticleIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { UserRole } from '../../types';

interface ClientNavigationProps {
  colors: any;
  secondaryButtonStyles: any;
}

const ClientNavigation: React.FC<ClientNavigationProps> = ({ 
  colors, 
  secondaryButtonStyles 
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };
  
  const handleLogout = async () => {
    handleProfileMenuClose();
    await dispatch(logoutUser());
    // Остаемся на клиентской странице после выхода
  };
  
  const handleNavigateToAdmin = () => {
    handleProfileMenuClose();
    navigate('/admin');
  };
  
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;
  
  return (
    <AppBar position="static" sx={{ bgcolor: colors.backgroundCard, boxShadow: 1 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ flexGrow: 1, color: colors.textPrimary, fontWeight: 700 }}
          component={Link}
          to="/client"
          style={{ textDecoration: 'none' }}
        >
          🚗 Твоя Шина
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Публичные ссылки */}
          <Button 
            color="inherit" 
            component={Link} 
            to="/knowledge-base"
            sx={{ color: colors.textSecondary }}
            startIcon={<ArticleIcon />}
          >
            База знань
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/client/services"
            sx={{ color: colors.textSecondary }}
            startIcon={<BuildIcon />}
          >
            Послуги
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/client/booking/new-with-availability"
            sx={{ color: colors.textSecondary }}
            startIcon={<BookOnlineIcon />}
          >
            Записатися
          </Button>
          
          {/* Авторизация/Профиль */}
          {!isAuthenticated ? (
            <Button 
              variant="outlined" 
              component={Link} 
              to="/login"
              startIcon={<LoginIcon />}
              sx={secondaryButtonStyles}
            >
              Увійти
            </Button>
          ) : (
            <>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary }}>
                  {user?.first_name?.[0] || user?.email?.[0] || 'У'}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: { mt: 1, minWidth: 200 }
                }}
              >
                {/* Информация о пользователе */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user?.email}
                  </Typography>
                  {isAdmin && (
                    <Chip 
                      size="small" 
                      label="Адміністратор" 
                      color="primary" 
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
                
                <Divider />
                
                {/* Клиентские функции */}
                <MenuItem 
                  component={Link} 
                  to="/client/profile"
                  onClick={handleProfileMenuClose}
                >
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Профіль</ListItemText>
                </MenuItem>
                
                <MenuItem 
                  component={Link} 
                  to="/client/bookings"
                  onClick={handleProfileMenuClose}
                >
                  <ListItemIcon><BookOnlineIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Мої записи</ListItemText>
                </MenuItem>
                
                <MenuItem 
                  component={Link} 
                  to="/client/reviews"
                  onClick={handleProfileMenuClose}
                >
                  <ListItemIcon><ReviewIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Мої відгуки</ListItemText>
                </MenuItem>
                
                {/* Админские функции */}
                {isAdmin && (
                  <>
                    <Divider />
                    <MenuItem onClick={handleNavigateToAdmin}>
                      <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Адмін-панель</ListItemText>
                    </MenuItem>
                  </>
                )}
                
                <Divider />
                
                {/* Выход */}
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Вийти</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ClientNavigation;
