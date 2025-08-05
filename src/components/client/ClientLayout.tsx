import React, { useEffect, useState } from 'react';
import { getProfileActions } from '../ui/AppBar/profileActions';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getThemeColors, getButtonStyles } from '../../styles';
import { AppBar as CustomAppBar } from '../ui/AppBar/AppBar';
import ThemeToggle from '../ui/ThemeToggle';
import { LanguageSelector } from '../LanguageSelector';
import { useTranslation } from 'react-i18next';
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
  Calculate as CalculateIcon,
  Search as SearchIcon,
  LocalOffer as LocalOfferIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { Button, ListItemIcon, ListItemText, MenuItem, Divider } from '@mui/material';
import ClientFooter from './ClientFooter';
import CartIndicator from './CartIndicator';

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
  const { t } = useTranslation();

  const profileActions = getProfileActions({
    user,
    isAuthenticated: !!user,
    navigate,
    isAdminPanel: false,
    onLogout: async () => {
      await dispatch(logoutUser());
      navigate('/client');
    },
    t: t as any, // Временный workaround для типов
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
        {t('navigation.knowledgeBase')}
      </Button>
      <Button
        color="inherit"
        component={Link}
        to="/client/services"
        sx={{ color: colors.textSecondary }}
        startIcon={<BuildIcon />}
      >
        {t('navigation.services')}
      </Button>
      <Button
        color="inherit"
        component={Link}
        to="/client/booking"
        sx={{ color: colors.textSecondary }}
        startIcon={<BookOnlineIcon />}
      >
        {t('navigation.booking')}
      </Button>
      <Button
        color="inherit"
        component={Link}
        to="/client/tire-calculator"
        sx={{ color: colors.textSecondary }}
        startIcon={<CalculateIcon />}
      >
        {t('navigation.tireCalculator')}
      </Button>
      <Button
        color="inherit"
        component={Link}
        to="/client/tire-search"
        sx={{ color: colors.textSecondary }}
        startIcon={<SearchIcon />}
      >
        {t('navigation.tireSearch')}
      </Button>
      <Button
        color="inherit"
        component={Link}
        to="/client/tire-offers"
        sx={{ color: colors.textSecondary }}
        startIcon={<LocalOfferIcon />}
      >
        Предложения шин
      </Button>
      {isAuthenticated && (
        <Button
          color="inherit"
          component={Link}
          to="/client/orders"
          sx={{ color: colors.textSecondary }}
          startIcon={<ReceiptIcon />}
        >
          Мои заказы
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: colors.backgroundPrimary,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CustomAppBar
        title="🚗 Твоя Шина"
        onTitleClick={() => navigate('/client')}
        rightContent={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {publicLinks}
            <CartIndicator />
            <ThemeToggle />
            <LanguageSelector />
          </Box>
        }
        profileActions={profileActions}
        username={user ? `${user.first_name} ${user.last_name}` : ''}
      />
      <Box 
        component="main" 
        sx={{ 
          pt: { xs: 7, sm: 8 }, // Отступ сверху для фиксированной навигации
          pb: 8, // ✅ УВЕЛИЧЕНО: Отступ снизу перед футером (64px)
          flex: 1, // Занимаем все доступное место
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
      <ClientFooter />
    </Box>
  );
};

export default ClientLayout;
