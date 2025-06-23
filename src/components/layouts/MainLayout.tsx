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
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { getCurrentUser, logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { User } from '../../types/user';
import ThemeToggle from '../ui/ThemeToggle';

const drawerWidth = 240;

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

  // Инициализация состояния открытия секций меню
  useEffect(() => {
    // Получаем все секции меню
    const sections = getMenuSections();
    // Создаем объект с состоянием "открыто" для всех секций
    const initialOpenSections = sections.reduce((acc, section) => {
      acc[section.title] = true; // устанавливаем true для открытия всех секций
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
            text: 'Клиенты',
            icon: <UserIcon />,
            path: '/admin/clients',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: 'Управление клиентами',
          },
          {
            text: 'Партнеры',
            icon: <CompanyIcon />,
            path: '/admin/partners',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: 'Управление партнерами',
          },
          {
            text: 'Сервисные точки',
            icon: <LocationOnIcon />,
            path: '/admin/service-points',
            roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.PARTNER],
            description: 'Управление сервисными точками',
          },
          {
            text: 'Автомобили',
            icon: <CarIcon />,
            path: '/admin/cars',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: 'Управление марками и моделями',
          },
        ],
      },
      {
        title: 'Справочники',
        items: [
          {
            text: 'Регионы',
            icon: <MapIcon />,
            path: '/admin/regions',
            roles: [UserRole.ADMIN],
            description: 'Управление регионами',
          },
          {
            text: 'Бренды авто',
            icon: <CarIcon />,
            path: '/admin/car-brands',
            roles: [UserRole.ADMIN],
            description: 'Управление брендами автомобилей',
          },
          {
            text: 'Услуги',
            icon: <ServiceIcon />,
            path: '/admin/services',
            roles: [UserRole.ADMIN, UserRole.MANAGER],
            description: 'Управление услугами',
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

  // Разрешенные действия для каждой роли (информационный блок)
  // Использует централизованные стили для консистентного отображения
  const getRoleCapabilities = () => {
    if (!user || !(user as User).role) return null;

    const capabilities: { [key in UserRole]: string[] } = {
      [UserRole.ADMIN]: [
        'Полный доступ ко всем функциям',
        'Управление партнерами',
        'Управление пользователями',
        'Управление справочниками',
        'Просмотр статистики'
      ],
      [UserRole.PARTNER]: [
        'Управление своими точками обслуживания',
        'Просмотр бронирований',
        'Управление расписанием',
        'Просмотр статистики'
      ],
      [UserRole.MANAGER]: [
        'Управление бронированиями',
        'Просмотр статистики',
        'Работа с клиентами'
      ],
      [UserRole.OPERATOR]: [
        'Обработка бронирований',
        'Работа с клиентами',
        'Базовые операции'
      ],
      [UserRole.CLIENT]: [
        'Управление бронированиями',
        'Просмотр истории',
        'Управление профилем'
      ]
    };

    return capabilities[(user as User).role] || [];
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

  const drawer = (
    <div>
      {/* Заголовок боковой панели с использованием централизованных стилей */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: SIZES.spacing.md, // Консистентные отступы
          background: theme.palette.primary.main, // Тематический цвет
          color: theme.palette.primary.contrastText
        }}
      >
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ fontWeight: 'bold', fontSize: SIZES.fontSize.lg }} // Унифицированный размер шрифта
        >
          Твоя шина
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* Блок возможностей роли с централизованными стилями */}
      {user && getRoleCapabilities()}
      
      {/* Навигационное меню с применением централизованных стилей */}
      <List sx={{ padding: SIZES.spacing.xs }}> {/* Консистентные отступы */}
        {getFilteredMenuSections().map((section) => (
          <React.Fragment key={section.title}>
            {/* Заголовок секции с централизованными стилями */}
            <ListSubheader 
              onClick={() => toggleSection(section.title)} 
              sx={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: SIZES.fontSize.lg, // Увеличиваем шрифт как просил пользователь
                fontWeight: 700,
                height: SIZES.navigation?.sectionTitleHeight || 44,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.03)',
                color: theme.palette.text.primary, // Убираем синий цвет как просил пользователь
                borderRadius: 0,
                margin: 0,
                padding: `${theme.spacing(SIZES.spacing.sm)} ${theme.spacing(SIZES.spacing.md)}`,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
                ...interactiveStyles.pressEffect,
              }}
            >
              <Box component="span">{section.title}</Box>
              {openSections[section.title] ? <ExpandLess /> : <ExpandMore />}
            </ListSubheader>
            
            <Collapse in={openSections[section.title] !== false} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.items.map((item) => {
                  // Получаем текущий путь для подсветки активного элемента
                  const location = window.location.pathname;
                  const isActive = location === item.path || location.startsWith(`${item.path}/`);
                  
                  return (
                    <ListItem 
                      key={item.text} 
                      disablePadding
                      sx={{
                        ...navigationStyles.listItem,
                        backgroundColor: isActive ? `rgba(${theme.palette.primary.main.replace('#', '')}, 0.12)` : 'transparent',
                        mb: SIZES.spacing.xs,
                        borderRadius: 0,
                        margin: 0,
                        '&:hover': {
                          backgroundColor: `rgba(${theme.palette.primary.main.replace('#', '')}, 0.08)`,
                          borderRadius: 0,
                        }
                      }}
                    >
                      <ListItemButton 
                        onClick={() => handleNavigate(item.path)}
                        sx={{ 
                          borderRadius: 0,
                          margin: 0,
                          pl: SIZES.spacing.md
                        }}
                      >
                        <ListItemIcon sx={{
                          ...navigationStyles.listItemIcon,
                          color: isActive ? theme.palette.primary.main : 'inherit'
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          secondary={item.description} 
                          primaryTypographyProps={{
                            fontWeight: isActive ? 'bold' : 'normal',
                            fontSize: SIZES.fontSize.md,
                            color: isActive ? theme.palette.primary.main : 'inherit'
                          }}
                          secondaryTypographyProps={{
                            fontSize: SIZES.fontSize.sm
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
            <Divider sx={{ my: SIZES.spacing.xs }} />
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: SIZES.spacing.md, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontSize: SIZES.fontSize.lg 
            }}
          >
            Твоя шина - {user ? getRoleName((user as User).role as UserRole) : 'Авторизация'}
          </Typography>
          
          {/* Кнопка возврата на сайт */}
          <Button
            color="inherit"
            onClick={() => navigate('/client')}
            startIcon={<WebIcon />}
            sx={{
              mr: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            На сайт
          </Button>
          {user ? (
            <>
              <Button 
                color="inherit" 
                onClick={handleUserMenuOpen} 
                endIcon={<AccountIcon />}
                sx={{
                  ...userButtonStyles.primary,
                  ...interactiveStyles.pressEffect,
                }}
              >
                {(user as User).first_name
                  ? `${(user as User).first_name} ${(user as User).last_name || ''}`
                  : (user as User).email}
              </Button>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={userButtonStyles.menu}
              >
                <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <AccountIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Профиль</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Выйти</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{
                ...userButtonStyles.primary,
                color: 'inherit',
                borderColor: 'currentColor',
                '&:hover': {
                  borderColor: 'currentColor',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Войти
            </Button>
          )}
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: SIZES.spacing.lg, 
          width: { sm: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;