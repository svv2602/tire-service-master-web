import React, { useState, useEffect } from 'react';
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
  const [drawerWidth, setDrawerWidth] = useState(DEFAULT_DRAWER_WIDTH);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
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

  // Инициализация состояния открытия секций меню - ВСЕ СЕКЦИИ СВЕРНУТЫ ПО УМОЛЧАНИЮ
  useEffect(() => {
    // Получаем все секции меню
    const sections = getMenuSections();
    // Создаем объект с состоянием "закрыто" для всех секций
    const initialOpenSections = sections.reduce((acc, section) => {
      acc[section.title] = false; // устанавливаем false для сворачивания всех секций
      return acc;
    }, {} as {[key: string]: boolean});
    
    // Устанавливаем состояние
    setOpenSections(initialOpenSections);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Функции управления панелью
  const toggleDrawerCollapse = () => {
    setIsDrawerCollapsed(!isDrawerCollapsed);
  };

  // Функции для изменения ширины мышью
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(drawerWidth);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = startWidth + (e.clientX - startX);
      if (newWidth >= MIN_DRAWER_WIDTH && newWidth <= MAX_DRAWER_WIDTH) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth, drawerWidth]);

  const collapseAllSections = () => {
    const sections = getMenuSections();
    const collapsedSections = sections.reduce((acc, section) => {
      acc[section.title] = false;
      return acc;
    }, {} as {[key: string]: boolean});
    setOpenSections(collapsedSections);
  };

  const expandAllSections = () => {
    const sections = getMenuSections();
    const expandedSections = sections.reduce((acc, section) => {
      acc[section.title] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    setOpenSections(expandedSections);
  };

  // Определяем структуру меню по разделам
  const getMenuSections = (): MenuSection[] => {
    return [
      {
        title: 'Обзор',
        items: [
          {
            text: 'Дашборд',
            icon: <DashboardIcon />,
            path: '/admin/dashboard',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER],
            description: 'Общая статистика и показатели',
          },
          {
            text: 'Главная страница',
            icon: <DashboardIcon />,
            path: '/admin/dashboard',
            roles: [UserRole.CLIENT],
            description: 'Ваша персональная панель',
          },
        ],
      },
      {
        title: 'Управление',
        items: [
          {
            text: 'Пользователи',
            icon: <PeopleIcon />,
            path: '/admin/users',
            roles: [UserRole.ADMIN],
            description: 'Управление пользователями системы',
          },
          {
            text: 'Партнеры',
            icon: <CompanyIcon />,
            path: '/admin/partners',
            roles: [UserRole.ADMIN],
            description: 'Управление партнерами',
          },
          {
            text: 'Клиенты',
            icon: <PeopleIcon />,
            path: '/admin/clients',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: 'Управление клиентами',
          },
        ],
      },
      {
        title: 'Сервис',
        items: [
          {
            text: 'Сервисные точки',
            icon: <LocationOnIcon />,
            path: '/admin/service-points',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER],
            description: 'Управление точками обслуживания',
          },
          {
            text: 'Мои точки',
            icon: <LocationOnIcon />,
            path: '/admin/my-service-points',
            roles: [UserRole.PARTNER, UserRole.MANAGER],
            description: 'Управление собственными точками',
          },
        ],
      },
      {
        title: 'Контент',
        items: [
          {
            text: 'Статьи',
            icon: <ArticleIcon />,
            path: '/admin/articles',
            roles: [UserRole.ADMIN],
            description: 'Управление статьями базы знаний',
          },
          {
            text: 'Весь контент',
            icon: <WebIcon />,
            path: '/admin/page-content',
            roles: [UserRole.ADMIN],
            description: 'Просмотр всего контента страниц',
          },
          {
            text: 'Создать контент',
            icon: <AddIcon />,
            path: '/admin/page-content/new',
            roles: [UserRole.ADMIN],
            description: 'Создание нового контента',
          },
          {
            text: 'Расширенное управление',
            icon: <ManageIcon />,
            path: '/admin/page-content/management',
            roles: [UserRole.ADMIN],
            description: 'Продвинутые инструменты управления контентом',
          },
          {
            text: 'SEO настройки',
            icon: <WebIcon />,
            path: '/admin/seo',
            roles: [UserRole.ADMIN],
            description: 'Управление SEO-параметрами',
          },
          {
            text: 'StyleGuide',
            icon: <StyleGuideIcon />,
            path: '/admin/styleguide',
            roles: [UserRole.ADMIN],
            description: 'Руководство по стилям и компонентам UI',
          },
        ],
      },
      {
        title: 'Бронирования',
        items: [
          {
            text: 'Все бронирования',
            icon: <EventNoteIcon />,
            path: '/admin/bookings',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER],
            description: 'Управление бронированиями',
          },
          {
            text: 'Мои бронирования',
            icon: <EventNoteIcon />,
            path: '/admin/my-bookings',
            roles: [UserRole.CLIENT],
            description: 'Ваши бронирования',
          },
        ],
      },
      {
        title: 'Отзывы',
        items: [
          {
            text: 'Все отзывы',
            icon: <StarIcon />,
            path: '/admin/reviews',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER],
            description: 'Управление отзывами клиентов',
          },
        ],
      },
      {
        title: 'Справочники',
        items: [
          {
            text: 'Регионы и города',
            icon: <MapIcon />,
            path: '/admin/regions',
            roles: [UserRole.ADMIN],
            description: 'Управление регионами и городами',
          },
          {
            text: 'Автомобили',
            icon: <CarIcon />,
            path: '/admin/car-brands',
            roles: [UserRole.ADMIN],
            description: 'Управление марками и моделями автомобилей',
          },
        ],
      },
      {
        title: 'Настройки',
        items: [
          {
            text: 'Профиль',
            icon: <SettingsIcon />,
            path: '/admin/profile',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER, UserRole.CLIENT],
            description: 'Настройки профиля',
          },
          {
            text: 'Системные настройки',
            icon: <SettingsIcon />,
            path: '/admin/settings',
            roles: [UserRole.ADMIN],
            description: 'Общие настройки системы',
          },
        ],
      },
    ];
  };

  // Фильтрация пунктов меню в зависимости от роли пользователя
  const getFilteredMenuSections = () => {
    if (!user) {
      console.log('Пользователь не аутентифицирован, не отображаем пункты меню');
      return [];
    }

    // Получаем роль пользователя
    const userRole = (user as User).role;
    console.log('Роль пользователя:', userRole);
    
    // Получаем все секции меню
    const allSections = getMenuSections();
    
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
  const currentDrawerWidth = isDrawerCollapsed ? MIN_DRAWER_WIDTH : drawerWidth;

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
          width: isDrawerCollapsed ? MIN_DRAWER_WIDTH : drawerWidth,
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
          {!isDrawerCollapsed && (
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ fontWeight: 'bold' }}
            >
              Твоя шина
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isDrawerCollapsed && (
              <>
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
              </>
            )}
            
            <Tooltip title={isDrawerCollapsed ? "Развернуть панель" : "Свернуть панель"}>
              <IconButton 
                onClick={toggleDrawerCollapse}
                size="small"
                sx={{ color: 'inherit' }}
              >
                {isDrawerCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
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
          {getFilteredMenuSections().map((section) => (
            <React.Fragment key={section.title}>
              <ListSubheader 
                onClick={() => !isDrawerCollapsed && toggleSection(section.title)} 
                sx={{ 
                  cursor: isDrawerCollapsed ? 'default' : 'pointer',
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
                    backgroundColor: isDrawerCollapsed ? 'transparent' : (theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)'),
                  },
                }}
              >
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isDrawerCollapsed ? section.title.charAt(0) : section.title}
                </Box>
                {!isDrawerCollapsed && (openSections[section.title] ? <ExpandLess /> : <ExpandMore />)}
              </ListSubheader>
              
              <Collapse in={!isDrawerCollapsed && openSections[section.title] !== false} timeout="auto" unmountOnExit>
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
      
      {/* Граница для изменения ширины мышью */}
      {!isDrawerCollapsed && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            right: -2,
            top: 0,
            bottom: 0,
            width: '4px',
            cursor: 'col-resize',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              opacity: 0.3,
            },
            zIndex: 1200,
          }}
        />
      )}
    </Box>
  );

  // Корневой layout
  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh' }}>
      {/* Боковая панель */}
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
          title="Твоя шина - Администратор"
          onDrawerToggle={handleDrawerToggle}
          onTitleClick={() => navigate('/admin')}
          profileActions={getProfileActions({
            user,
            isAuthenticated,
            navigate,
            isAdminPanel: true,
            onLogout: handleLogout,
          })}
          username={user ? `${user.first_name} ${user.last_name}` : ''}
          rightContent={<ThemeToggle />}
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