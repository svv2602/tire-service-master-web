import React, { useState } from 'react';
import {
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Badge,
  useMediaQuery,
  useTheme,
  SxProps,
  Theme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreIcon from '@mui/icons-material/MoreVert';
import { tokens } from '../../../styles/theme/tokens';
import { StyledAppBar, StyledTitle } from './styles';

/**
 * Интерфейс для действий в меню
 */
export interface AppBarAction {
  /** Текст действия */
  label: string;
  /** Иконка */
  icon?: React.ElementType;
  /** Обработчик клика */
  onClick: () => void;
  /** Отключено ли действие */
  disabled?: boolean;
}

/**
 * Интерфейс для пропсов компонента AppBar
 */
export interface AppBarProps {
  /** Заголовок */
  title: string;
  /** Открыт ли боковой drawer */
  drawerOpen?: boolean;
  /** Обработчик открытия/закрытия drawer */
  onDrawerToggle?: () => void;
  /** Обработчик клика по заголовку */
  onTitleClick?: () => void;
  /** Действия для меню профиля */
  profileActions?: AppBarAction[];
  /** Действия для меню уведомлений */
  notificationActions?: AppBarAction[];
  /** Навигационные ссылки для мобильного меню */
  navigationActions?: AppBarAction[];
  /** Количество непрочитанных уведомлений */
  notificationCount?: number;
  /** URL аватара пользователя */
  avatarUrl?: string;
  /** Имя пользователя */
  username?: string;
  /** Дополнительные компоненты для размещения в правой части */
  rightContent?: React.ReactNode;
  /** Компонент корзины для отображения на мобильных устройствах */
  mobileCartContent?: React.ReactNode;
  /** Дополнительные стили */
  sx?: SxProps<Theme>;
}

/**
 * Универсальный AppBar компонент с поддержкой профиля, уведомлений и навигации
 * 
 * @example
 * <AppBar 
 *   title="Панель управления"
 *   drawerOpen={drawerOpen}
 *   onDrawerToggle={handleDrawerToggle}
 *   profileActions={[{ label: 'Выйти', onClick: handleLogout }]}
 * />
 */
export const AppBar: React.FC<AppBarProps> = ({
  title,
  drawerOpen,
  onDrawerToggle,
  onTitleClick,
  profileActions = [],
  notificationActions = [],
  navigationActions = [],
  notificationCount = 0,
  avatarUrl,
  username,
  rightContent,
  mobileCartContent,
  sx,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Проверяем, что элемент существует и присутствует в DOM
    const target = event.currentTarget;
    if (target && target.parentElement) {
      setProfileAnchorEl(target);
    }
  };
  
  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Проверяем, что элемент существует и присутствует в DOM
    const target = event.currentTarget;
    if (target && target.parentElement) {
      setNotificationsAnchorEl(target);
    }
  };
  
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Проверяем, что элемент существует и присутствует в DOM
    const target = event.currentTarget;
    if (target && target.parentElement) {
      setMobileMenuAnchorEl(target);
    }
  };
  
  const handleMenuClose = () => {
    setProfileAnchorEl(null);
    setNotificationsAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };
  
  return (
    <StyledAppBar position="fixed" sx={sx}>
      <Toolbar>
        {/* Кнопка меню для открытия/закрытия drawer */}
        {onDrawerToggle && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Заголовок */}
        <StyledTitle 
          variant="h6"
          onClick={onTitleClick}
          sx={{
            cursor: onTitleClick ? 'pointer' : 'default',
            '&:hover': onTitleClick ? {
              opacity: 0.8,
              transition: 'opacity 0.2s ease'
            } : {}
          }}
        >
          {title}
        </StyledTitle>

        <Box sx={{ flexGrow: 1 }} />
        
        {/* Дополнительный контент справа */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 4 }}>
          {rightContent}
        </Box>
        
        {/* Десктопные иконки */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          {/* Уведомления */}
          {notificationActions.length > 0 && (
            <IconButton
              color="inherit"
              aria-label="show notifications"
              onClick={handleNotificationsMenuOpen}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}
          
          {/* Профиль */}
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {avatarUrl ? (
              <Avatar src={avatarUrl} alt={username} sx={{ width: 40, height: 40 }} />
            ) : (
              <AccountCircleIcon sx={{ fontSize: 40 }} />
            )}
          </IconButton>
        </Box>
        
        {/* Мобильные иконки */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
          {/* Корзина на мобильных */}
          {mobileCartContent}
          
          <IconButton
            aria-label="show more"
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Toolbar>
      
      {/* Меню профиля - отображаем только если есть действия или имя пользователя */}
      {(profileActions.length > 0 || username) && (
        <Menu
          anchorEl={profileAnchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(profileAnchorEl) && Boolean(profileAnchorEl?.parentElement)}
          onClose={handleMenuClose}
        >
          {username && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">{username}</Typography>
              <Divider sx={{ my: 1 }} />
            </Box>
          )}
          {profileActions.map((action, index) => (
            <MenuItem 
              key={index} 
              onClick={() => {
                handleMenuClose();
                action.onClick();
              }}
              disabled={action.disabled}
            >
              {action.icon && (
                <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  {React.createElement(action.icon, { fontSize: 'small' })}
                </Box>
              )}
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      )}
      
      {/* Меню уведомлений - отображаем только если есть действия */}
      {notificationActions.length > 0 && (
        <Menu
          anchorEl={notificationsAnchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(notificationsAnchorEl) && Boolean(notificationsAnchorEl?.parentElement)}
          onClose={handleMenuClose}
        >
          {notificationActions.map((action, index) => (
            <MenuItem 
              key={index} 
              onClick={() => {
                handleMenuClose();
                action.onClick();
              }}
              disabled={action.disabled}
            >
              {action.icon && (
                <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  {React.createElement(action.icon, { fontSize: 'small' })}
                </Box>
              )}
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      )}
      
      {/* Мобильное меню - отображаем только если есть контент */}
      {(navigationActions.length > 0 || notificationActions.length > 0 || profileActions.length > 0 || username) && (
        <Menu
          anchorEl={mobileMenuAnchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(mobileMenuAnchorEl) && Boolean(mobileMenuAnchorEl?.parentElement)}
          onClose={handleMenuClose}
        >
          {/* Навигационные ссылки (только на мобильных) */}
          {navigationActions.length > 0 && (
            <>
              {navigationActions.map((action, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    handleMenuClose();
                    action.onClick();
                  }}
                  disabled={action.disabled}
                >
                  {action.icon && (
                    <Box component="span" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                      {React.createElement(action.icon, { fontSize: 'medium' })}
                    </Box>
                  )}
                  {action.label}
                </MenuItem>
              ))}
              {(notificationActions.length > 0 || profileActions.length > 0 || username) && (
                <Divider sx={{ my: 1 }} />
              )}
            </>
          )}
          
          {/* Уведомления */}
          {notificationActions.length > 0 && (
            <MenuItem onClick={handleNotificationsMenuOpen}>
              <IconButton color="inherit" aria-label="show notifications" size="large">
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <p>Уведомления</p>
            </MenuItem>
          )}
          
          {/* Профиль - отображаем как отдельные пункты меню на мобильных */}
          {profileActions.length > 0 && (
            <>
              {(notificationActions.length > 0 || navigationActions.length > 0) && (
                <Divider sx={{ my: 1 }} />
              )}
              {profileActions.map((action, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    handleMenuClose();
                    action.onClick();
                  }}
                  disabled={action.disabled}
                >
                  {action.icon && (
                    <Box component="span" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                      {React.createElement(action.icon, { fontSize: 'medium' })}
                    </Box>
                  )}
                  {action.label}
                </MenuItem>
              ))}
            </>
          )}
        </Menu>
      )}
    </StyledAppBar>
  );
};

export default AppBar;