import React from 'react';
import { getProfileActions } from '../ui/AppBar/profileActions';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getThemeColors, getButtonStyles } from '../../styles';
import { AppBar as CustomAppBar } from '../ui/AppBar/AppBar';
import ThemeToggle from '../ui/ThemeToggle';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { UserRole } from '../../types';
import {
  Article as ArticleIcon,
  Build as BuildIcon,
  BookOnline as BookOnlineIcon,
  Login as LoginIcon,
  Person as PersonIcon,
  RateReview as ReviewIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { Button, ListItemIcon, ListItemText, MenuItem, Divider } from '@mui/material';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  const buttonStyles = getButtonStyles(theme, 'secondary');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;


  const profileActions = getProfileActions({
    user,
    isAuthenticated,
    navigate,
    isAdminPanel: false,
    onLogout: async () => {
      await dispatch(logoutUser());
    },
  });

  // Публичные ссылки для AppBar
  const publicLinks = (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
        to="/client/booking"
        sx={{ color: colors.textSecondary }}
        startIcon={<BookOnlineIcon />}
      >
        Записатися
      </Button>
      <Button
        color="inherit"
        component={Link}
        to="/client/tire-calculator"
        sx={{ color: colors.textSecondary }}
        startIcon={<CalculateIcon />}
      >
        Калькулятор шин
      </Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.backgroundPrimary }}>
      <CustomAppBar
        title="🚗 Твоя Шина"
        onTitleClick={() => navigate('/client')}
        rightContent={
          <>
            {publicLinks}
            <ThemeToggle />
          </>
        }
        profileActions={profileActions}
        username={user ? `${user.first_name} ${user.last_name}` : ''}
      />
      <Box 
        component="main" 
        sx={{ 
          pt: { xs: 7, sm: 8 }, // Отступ сверху для фиксированной навигации
          minHeight: 'calc(100vh - 64px)' // Минимальная высота с учетом AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ClientLayout;
