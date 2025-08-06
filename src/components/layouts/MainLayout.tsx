import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListSubheader,
  Collapse,
  useTheme,
  Slider,
  Tooltip,
  Container,
} from '@mui/material';
// Импорт улучшенной централизованной системы стилей
import { 
  SIZES, 
  getButtonStyles,
  getNavigationStyles,
  getFormStyles,
  getUserButtonStyles,
  getInteractiveStyles
} from '../../styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
  EventNote as EventNoteIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon,
  DirectionsCar as CarIcon,
  Build as ServiceIcon,
  Business as CompanyIcon,
  Store as StoreIcon,
  ExpandLess,
  ExpandMore,
  Assessment as ReportIcon,
  Person as UserIcon,
  Map as MapIcon,
  Star as StarIcon,
  Article as ArticleIcon,
  Web as WebIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ManageAccounts as ManageIcon,
  Palette as StyleGuideIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  UnfoldLess as CollapseIcon,
  UnfoldMore as ExpandIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  NotificationImportant as PushIcon,
  Telegram as TelegramIcon,
  SmartToy as BotIcon,
  Google as GoogleIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  ShoppingCart as ShoppingCartIcon,
  Assignment,
  Analytics as DiagnosticsIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { getCurrentUser, logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { User } from '../../types/user';
import ThemeToggle from '../ui/ThemeToggle';
import { getProfileActions } from '../ui/AppBar/profileActions';
import { AppBar as CustomAppBar } from '../ui/AppBar/AppBar';
import { LanguageSelector } from '../LanguageSelector';

// Константы для управления панелью
const MIN_DRAWER_WIDTH = 72;
const DEFAULT_DRAWER_WIDTH = 280;
const MAX_DRAWER_WIDTH = 400;

interface MenuSection {
  title: string;
  items: MenuItemType[];
}

interface MenuItemType {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
  description?: string;
}

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  // Хуки для централизованной системы стилей - обеспечивают консистентность дизайна
  const theme = useTheme();
  const navigationStyles = getNavigationStyles(theme); // Стили для навигационных элементов
  const buttonStyles = getButtonStyles(theme); // Централизованные стили кнопок
  const formStyles = getFormStyles(theme); // Стили для форм и контейнеров
  const userButtonStyles = getUserButtonStyles(theme); // Новые стили для кнопок пользователя
  const interactiveStyles = getInteractiveStyles(theme); // Новые стили для интерактивных элементов
  
  // Состояние компонента
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});
  
  // Новые состояния для управления панелью
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const savedWidth = localStorage.getItem('adminDrawerWidth');
    return savedWidth ? parseInt(savedWidth, 10) : DEFAULT_DRAWER_WIDTH;
  });
  const [isDrawerHidden, setIsDrawerHidden] = useState(() => {
    const savedCollapsed = localStorage.getItem('adminDrawerHidden');
    return savedCollapsed === 'true';
  });
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(DEFAULT_DRAWER_WIDTH);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Добавляем useEffect для проверки токена и загрузки данных пользователя при монтировании компонента
  useEffect(() => {
    const token = localStorage.getItem('tvoya_shina_token');
    
    console.log('MainLayout: Checking auth state:', { 
      hasToken: !!token, 
      hasUserData: !!user,
      isAuthenticated 
    });
    
    // Если токен существует, но данных пользователя нет, загружаем их
    if (token && !user) {
      console.log('Token exists but user data is missing. Loading user data...');
      dispatch(getCurrentUser())
        .unwrap()
        .then(userData => {
          console.log('User data loaded successfully:', userData);
        })
        .catch(error => {
          console.error('Failed to load user data:', error);
          // Если произошла ошибка при загрузке данных, перенаправляем на страницу входа
          navigate('/login');
        });
    }
  }, [dispatch, user, navigate, isAuthenticated]);

  // Инициализация состояния открытия секций меню с сохранением в localStorage
  useEffect(() => {
    // Получаем все секции меню
    const sections = getMenuSections(t);
    
    // Пытаемся загрузить сохраненное состояние из localStorage
    const savedOpenSections = localStorage.getItem('adminMenuSections');
    
    if (savedOpenSections) {
      try {
        const parsedSections = JSON.parse(savedOpenSections);
        // Проверяем, что все секции из текущего меню присутствуют
        const allSectionsPresent = sections.every(section => 
          parsedSections.hasOwnProperty(section.title)
        );
        
        if (allSectionsPresent) {
          setOpenSections(parsedSections);
          return;
        }
      } catch (error) {
        console.error('Ошибка парсинга сохраненного состояния меню:', error);
      }
    }
    
    // Если нет сохраненного состояния или оно некорректно, создаем дефолтное
    const initialOpenSections = sections.reduce((acc, section) => {
      acc[section.title] = false; // все секции свернуты по умолчанию
      return acc;
    }, {} as {[key: string]: boolean});
    
    setOpenSections(initialOpenSections);
    localStorage.setItem('adminMenuSections', JSON.stringify(initialOpenSections));
  }, [t]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Функция для управления боковой панелью через гамбургер (показать/скрыть)
  const handleAdminDrawerToggle = () => {
    const newHiddenState = !isDrawerHidden;
    setIsDrawerHidden(newHiddenState);
    localStorage.setItem('adminDrawerHidden', String(newHiddenState));
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await dispatch(logoutUser());
    navigate('/client');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const toggleSection = (section: string) => {
    const newOpenSections = {
      ...openSections,
      [section]: !openSections[section]
    };
    setOpenSections(newOpenSections);
    localStorage.setItem('adminMenuSections', JSON.stringify(newOpenSections));
  };

  // Функция для обработки клика на заголовок секции
  const handleSectionHeaderClick = (section: MenuSection) => {
    // Просто переключаем состояние секции (разворачиваем/сворачиваем)
    toggleSection(section.title);
  };

  // Функции управления панелью
  const collapseAllSections = () => {
    const sections = getMenuSections(t);
    const collapsedSections = sections.reduce((acc, section) => {
      acc[section.title] = false;
      return acc;
    }, {} as {[key: string]: boolean});
    setOpenSections(collapsedSections);
    localStorage.setItem('adminMenuSections', JSON.stringify(collapsedSections));
  };

  const expandAllSections = () => {
    const sections = getMenuSections(t);
    const expandedSections = sections.reduce((acc, section) => {
      acc[section.title] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    setOpenSections(expandedSections);
    localStorage.setItem('adminMenuSections', JSON.stringify(expandedSections));
  };

  // Определяем структуру меню по разделам
  const getMenuSections = (t: any): MenuSection[] => {
    return [
      {
        title: t('navigation.sections.overview'),
        items: [
          {
            text: t('navigation.dashboard'),
            icon: <DashboardIcon />,
            path: '/admin/dashboard',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER],
            description: t('navigation.descriptions.dashboard'),
          },
          {
            text: t('navigation.homepage'),
            icon: <DashboardIcon />,
            path: '/admin/dashboard',
            roles: [UserRole.CLIENT],
            description: t('navigation.descriptions.homepage'),
          },
        ],
      },
      {
        title: t('navigation.sections.management'),
        items: [
          {
            text: t('navigation.users'),
            icon: <PeopleIcon />,
            path: '/admin/users',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.users'),
          },
          {
            text: t('navigation.partners'),
            icon: <CompanyIcon />,
            path: '/admin/partners',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.partners'),
          },
          {
            text: t('navigation.clients'),
            icon: <PeopleIcon />,
            path: '/admin/clients',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.clients'),
          },
          {
            text: t('navigation.partnerApplications'),
            icon: <Assignment />,
            path: '/admin/partner-applications',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.partnerApplications'),
          },
          {
            text: t('navigation.suppliers'),
            icon: <StoreIcon />,
            path: '/admin/suppliers',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.suppliers'),
          },
          {
            text: t('navigation.operators'),
            icon: <PeopleIcon />,
            path: '/admin/operators',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER],
            description: t('navigation.descriptions.operators'),
          },
        ],
      },
      {
        title: t('navigation.sections.service'),
        items: [
          {
            text: t('navigation.servicePoints'),
            icon: <LocationOnIcon />,
            path: '/admin/service-points',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.servicePoints'),
          },
          {
            text: t('navigation.myServicePoints'),
            icon: <LocationOnIcon />,
            path: '/admin/service-points',
            roles: [UserRole.PARTNER],
            description: t('navigation.descriptions.myServicePoints'),
          },
        ],
      },
      {
        title: t('navigation.sections.orders'),
        items: [
          {
            text: t('navigation.storeOrders'),
            icon: <ShoppingCartIcon />,
            path: '/admin/store-orders',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.storeOrders'),
          },
          {
            text: t('navigation.userOrders'),
            icon: <ShoppingCartIcon />,
            path: '/admin/user-orders',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.userOrders'),
          },
          {
            text: t('navigation.partnerUserOrders'),
            icon: <ShoppingCartIcon />,
            path: '/admin/partner-user-orders',
            roles: [UserRole.PARTNER, UserRole.OPERATOR],
            description: t('navigation.descriptions.partnerUserOrders'),
          },
          {
            text: t('navigation.userCarts'),
            icon: <ShoppingCartIcon />,
            path: '/admin/user-carts',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.userCarts'),
          },
        ],
      },
      {
        title: t('navigation.sections.content'),
        items: [
          {
            text: t('navigation.articles'),
            icon: <ArticleIcon />,
            path: '/admin/articles',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.articles'),
          },
          {
            text: t('navigation.allContent'),
            icon: <WebIcon />,
            path: '/admin/page-content',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.allContent'),
          },
          {
            text: t('navigation.createContent'),
            icon: <AddIcon />,
            path: '/admin/page-content/new',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.createContent'),
          },
          {
            text: t('navigation.advancedManagement'),
            icon: <ManageIcon />,
            path: '/admin/page-content/management',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.advancedManagement'),
          },
          {
            text: t('navigation.seoSettings'),
            icon: <WebIcon />,
            path: '/admin/seo',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.seoSettings'),
          },
          {
            text: t('navigation.styleGuide'),
            icon: <StyleGuideIcon />,
            path: '/admin/styleguide',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.styleGuide'),
          },
        ],
      },
      {
        title: t('navigation.sections.bookings'),
        items: [
          {
            text: t('navigation.allBookings'),
            icon: <EventNoteIcon />,
            path: '/admin/bookings',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER],
            description: t('navigation.descriptions.allBookings'),
          },
          {
            text: t('navigation.bookingCalendar'),
            icon: <EventNoteIcon />,
            path: '/admin/calendar',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER],
            description: t('navigation.descriptions.bookingCalendar'),
          },
          {
            text: t('navigation.analyticsReports'),
            icon: <ReportIcon />,
            path: '/admin/analytics',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER],
            description: t('navigation.descriptions.analyticsReports'),
          },
          {
            text: t('navigation.bookingConflicts'),
            icon: <ReportIcon />,
            path: '/admin/booking-conflicts',
            roles: [UserRole.ADMIN, UserRole.PARTNER],
            description: t('navigation.descriptions.bookingConflicts'),
          },
          {
            text: t('navigation.myBookings'),
            icon: <EventNoteIcon />,
            path: '/admin/my-bookings',
            roles: [UserRole.CLIENT],
            description: t('navigation.descriptions.myBookings'),
          },
        ],
      },
      {
        title: t('navigation.sections.reviews'),
        items: [
          {
            text: t('navigation.allReviews'),
            icon: <StarIcon />,
            path: '/admin/reviews',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER],
            description: t('navigation.descriptions.allReviews'),
          },
        ],
      },
      {
        title: t('navigation.sections.notificationManagement'),
        items: [
          {
            text: t('navigation.notificationTemplates'),
            icon: <EmailIcon />,
            path: '/admin/notifications/templates',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.notificationTemplates'),
          },
          {
            text: t('navigation.customVariables'),
            icon: <CodeIcon />,
            path: '/admin/notifications/custom-variables',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.customVariables'),
          },
        ],
      },
      {
        title: t('navigation.sections.references'),
        items: [
          {
            text: t('navigation.regionsAndCities'),
            icon: <MapIcon />,
            path: '/admin/regions',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.regionsAndCities'),
          },
          {
            text: t('navigation.vehicles'),
            icon: <CarIcon />,
            path: '/admin/car-brands',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.vehicles'),
          },
          {
            text: t('navigation.services'),
            icon: <ServiceIcon />,
            path: '/admin/services',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.services'),
          },
        ],
      },
      {
        title: t('navigation.sections.security'),
        items: [
          {
            text: t('navigation.auditLogs'),
            icon: <SecurityIcon />,
            path: '/admin/audit-logs',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.auditLogs'),
          },
          {
            text: t('navigation.userSuspensions'),
            icon: <BlockIcon />,
            path: '/admin/users/suspensions',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: t('navigation.descriptions.userSuspensions'),
          },
        ],
      },
      {
        title: t('navigation.sections.settings'),
        items: [
          {
            text: t('navigation.notifications'),
            icon: <NotificationsIcon />,
            path: '/admin/notifications',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER, UserRole.CLIENT],
            description: t('navigation.descriptions.notifications'),
          },
          {
            text: t('navigation.profile'),
            icon: <SettingsIcon />,
            path: '/admin/profile',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER, UserRole.CLIENT],
            description: t('navigation.descriptions.profile'),
          },
          {
            text: t('navigation.systemSettings'),
            icon: <SettingsIcon />,
            path: '/admin/settings',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.systemSettings'),
          },
          {
            text: 'Конфигурация системы',
            icon: <SettingsIcon />,
            path: '/admin/system-settings',
            roles: [UserRole.ADMIN],
            description: 'Управление переменными окружения и системными настройками',
          },
          {
            text: t('navigation.settingsDiagnostics'),
            icon: <DiagnosticsIcon />,
            path: '/admin/settings/diagnostics',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.settingsDiagnostics'),
          },
          {
            text: t('navigation.pushNotifications'),
            icon: <PushIcon />,
            path: '/admin/notifications/push-settings',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.pushNotifications'),
          },
          {
            text: t('navigation.telegramIntegration'),
            icon: <TelegramIcon />,
            path: '/admin/notifications/telegram',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.telegramIntegration'),
          },
          {
            text: t('navigation.channelSettings'),
            icon: <BotIcon />,
            path: '/admin/notifications/channels',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.channelSettings'),
          },
          {
            text: t('navigation.emailSettings'),
            icon: <EmailIcon />,
            path: '/admin/notifications/email',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.emailSettings'),
          },
          {
            text: t('navigation.googleOAuth'),
            icon: <GoogleIcon />,
            path: '/admin/notifications/google-oauth',
            roles: [UserRole.ADMIN],
            description: t('navigation.descriptions.googleOAuth'),
          },
        ],
      },
    ];
  };

  // Фильтрация пунктов меню в зависимости от роли пользователя
  const getFilteredMenuSections = (t: any) => {
    if (!user) {
      console.log('Пользователь не аутентифицирован, не отображаем пункты меню');
      return [];
    }

    // Получаем роль пользователя и приводим к enum
    const userRoleString = (user as User).role;
    const userRole = userRoleString as UserRole;
    console.log('Роль пользователя:', userRole);
    
    // Получаем все секции меню
    const allSections = getMenuSections(t);
    
    // Фильтруем секции и пункты меню в зависимости от роли пользователя
    const filteredSections = allSections.map(section => {
      // Фильтруем пункты меню в секции, оставляя только те, для которых у пользователя есть доступ
      const filteredItems = section.items.filter(item => 
        item.roles.includes(userRole)
      );

      // Если в секции есть доступные пункты меню, возвращаем секцию с отфильтрованными пунктами
      return filteredItems.length > 0 ? { ...section, items: filteredItems } : null;
    }).filter(Boolean) as MenuSection[];

    return filteredSections;
  };

  // Перевод названия роли на русский
  const getRoleName = (role?: UserRole): string => {
    const roleNames = {
      [UserRole.ADMIN]: 'Администратор',
      [UserRole.PARTNER]: 'Партнер',
      [UserRole.MANAGER]: 'Менеджер',
      [UserRole.OPERATOR]: 'Оператор',
      [UserRole.CLIENT]: 'Клиент'
    };

    return roleNames[role as UserRole] || 'Пользователь';
  };

  // Вычисляем текущую ширину панели
  const currentDrawerWidth = isDrawerHidden ? 0 : drawerWidth;

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      position: 'relative',
      width: '100%',
      overflowX: 'hidden',
    }}>
      {/* Зафиксированный заголовок боковой панели */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: drawerWidth,
          zIndex: 1200,
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px !important',
            px: 2,
            width: '100%',
          }}
        >
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ fontWeight: 'bold' }}
          >
            Твоя шина
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Свернуть все секции">
              <IconButton 
                onClick={collapseAllSections}
                size="small"
                sx={{ color: 'inherit' }}
              >
                <CollapseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Развернуть все секции">
              <IconButton 
                onClick={expandAllSections}
                size="small"
                sx={{ color: 'inherit' }}
              >
                <ExpandIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Box>

      {/* Контейнер для прокручиваемого контента */}
      <Box 
        sx={{ 
          mt: '64px',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          width: '100%',
        }}
      >
        <List sx={{ 
          p: 0,
          width: '100%',
          '& > *': {
            width: '100%',
          }
        }}>
          {getFilteredMenuSections(t).map((section) => (
            <React.Fragment key={section.title}>
              <ListSubheader 
                onClick={() => handleSectionHeaderClick(section)} 
                sx={{ 
                  cursor: 'pointer',
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  fontWeight: 700,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: theme.palette.text.primary,
                  p: 2,
                  m: 0,
                  borderRadius: 0,
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {section.title}
                </Box>
                {openSections[section.title] ? <ExpandLess /> : <ExpandMore />}
              </ListSubheader>
              
              <Collapse in={openSections[section.title] !== false} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.items.map((item) => {
                    const location = window.location.pathname;
                    const isActive = location === item.path || location.startsWith(`${item.path}/`);
                    
                    return (
                      <ListItem 
                        key={item.text} 
                        disablePadding
                        sx={{
                          backgroundColor: isActive ? `rgba(${theme.palette.primary.main.replace('#', '')}, 0.12)` : 'transparent',
                          borderRadius: 0,
                          '&:hover': {
                            backgroundColor: `rgba(${theme.palette.primary.main.replace('#', '')}, 0.08)`,
                          }
                        }}
                      >
                        <ListItemButton 
                          onClick={() => handleNavigate(item.path)}
                          sx={{ 
                            p: 2,
                          }}
                        >
                          <ListItemIcon sx={{
                            minWidth: 40,
                            color: isActive ? theme.palette.primary.main : 'inherit'
                          }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.text} 
                            secondary={item.description} 
                            primaryTypographyProps={{
                              fontWeight: isActive ? 'bold' : 'normal',
                              color: isActive ? theme.palette.primary.main : 'inherit'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );

  // Корневой layout
  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh' }}>
      {/* Боковая панель */}
      {!isDrawerHidden && (
        <Box
          component="nav"
          sx={{
            width: currentDrawerWidth,
            flexShrink: 0,
            zIndex: 1201,
          }}
        >
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                width: currentDrawerWidth,
                boxSizing: 'border-box',
                border: 'none',
                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
      )}

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100vw - ${currentDrawerWidth}px)`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Универсальная верхняя панель */}
        {/* Унифицированное меню пользователя для AppBar */}
        {/**
         * Используем getProfileActions для генерации пунктов меню,
         * чтобы меню пользователя было одинаковым в админке и клиентской части
         */}
        {/* Импортируем функцию генерации меню в начале файла */}
        {/* Унифицированное меню пользователя для AppBar */}
        <CustomAppBar
          title={t("navigation.appTitle")}
          onDrawerToggle={handleAdminDrawerToggle}
          onTitleClick={() => navigate('/admin')}
          profileActions={getProfileActions({
            user,
            isAuthenticated: !!user,
            navigate,
            isAdminPanel: true,
            onLogout: handleLogout,
            t: t as any, // Временный workaround для типов
          })}
          username={user ? `${user.first_name} ${user.last_name}` : ''}
          rightContent={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThemeToggle />
              <LanguageSelector />
            </Box>
          }
        />

        <Toolbar />
        <Container maxWidth="xl" sx={{ p: 3, flex: 1, boxSizing: 'border-box' }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;