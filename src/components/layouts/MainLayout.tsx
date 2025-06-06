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
// Импорт централизованной системы стилей
import { 
  SIZES, 
  getButtonStyles,
  getNavigationStyles,
  getFormStyles
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
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { getCurrentUser, logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { User } from '../../types/user';

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
    navigate('/login');
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
            path: '/dashboard',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER],
            description: 'Общая статистика и показатели',
          },
          {
            text: 'Главная страница',
            icon: <DashboardIcon />,
            path: '/dashboard',
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
            path: '/users',
            roles: [UserRole.ADMIN],
            description: 'Управление пользователями системы',
          },
          {
            text: 'Партнеры',
            icon: <CompanyIcon />,
            path: '/partners',
            roles: [UserRole.ADMIN],
            description: 'Управление партнерами сервиса',
          },
          {
            text: 'Точки обслуживания',
            icon: <LocationOnIcon />,
            path: '/service-points',
            roles: [UserRole.ADMIN, UserRole.PARTNER],
            description: 'Управление шиномонтажными мастерскими',
          },
          {
            text: 'Клиенты',
            icon: <PeopleIcon />,
            path: '/clients',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER],
            description: 'Управление клиентской базой',
          },
        ],
      },
      {
        title: 'Шиномонтаж',
        items: [
          {
            text: 'Все бронирования',
            icon: <EventNoteIcon />,
            path: '/bookings',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER],
            description: 'Просмотр и управление бронированиями',
          },
          {
            text: 'Мои записи',
            icon: <EventNoteIcon />,
            path: '/my-bookings',
            roles: [UserRole.CLIENT],
            description: 'Ваши текущие и прошлые записи',
          },
          {
            text: 'Создать бронирование',
            icon: <EventNoteIcon />,
            path: '/bookings/new',
            roles: [UserRole.MANAGER, UserRole.CLIENT],
            description: 'Создание нового бронирования',
          },
          {
            text: 'Записаться на шиномонтаж',
            icon: <EventNoteIcon />,
            path: '/bookings/new',
            roles: [UserRole.CLIENT],
            description: 'Запись на сервис',
          },
        ],
      },
      {
        title: 'Отзывы',
        items: [
          {
            text: 'Все отзывы',
            icon: <StarIcon />,
            path: '/reviews',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER],
            description: 'Просмотр и модерация отзывов',
          },
          {
            text: 'Мои отзывы',
            icon: <StarIcon />,
            path: '/my-reviews',
            roles: [UserRole.CLIENT],
            description: 'Ваши отзывы о сервисах',
          },
        ],
      },
      {
        title: 'Мое авто',
        items: [
          {
            text: 'Мои автомобили',
            icon: <CarIcon />,
            path: '/my-cars',
            roles: [UserRole.CLIENT],
            description: 'Управление списком ваших автомобилей',
          },
          {
            text: 'Добавить автомобиль',
            icon: <CarIcon />,
            path: '/my-cars/new',
            roles: [UserRole.CLIENT],
            description: 'Добавить новый автомобиль',
          },
        ],
      },
      {
        title: 'Сервисные центры',
        items: [
          {
            text: 'Найти центр',
            icon: <LocationOnIcon />,
            path: '/service-points/search',
            roles: [UserRole.CLIENT],
            description: 'Поиск ближайших сервисных центров',
          },
          {
            text: 'Избранные центры',
            icon: <LocationOnIcon />,
            path: '/service-points/favorites',
            roles: [UserRole.CLIENT],
            description: 'Ваши избранные сервисные центры',
          },
        ],
      },
      {
        title: 'Справочники',
        items: [
          {
            text: 'Области и Города',
            icon: <MapIcon />,
            path: '/regions',
            roles: [UserRole.ADMIN],
            description: 'Управление областями и городами',
          },
          {
            text: 'Бренды авто',
            icon: <CarIcon />,
            path: '/car-brands',
            roles: [UserRole.ADMIN],
            description: 'Управление брендами автомобилей',
          },
          {
            text: 'Автомобили',
            icon: <CarIcon />,
            path: '/cars',
            roles: [UserRole.ADMIN],
            description: 'Управление списком автомобилей',
          },
          {
            text: 'Услуги',
            icon: <ServiceIcon />,
            path: '/services',
            roles: [UserRole.ADMIN, UserRole.PARTNER],
            description: 'Управление каталогом услуг',
          },
        ],
      },
      {
        title: 'Отчеты',
        items: [
          {
            text: 'Аналитика',
            icon: <ReportIcon />,
            path: '/analytics',
            roles: [UserRole.ADMIN, UserRole.PARTNER],
            description: 'Отчеты и аналитика',
          },
          {
            text: 'История поездок',
            icon: <ReportIcon />,
            path: '/trip-history',
            roles: [UserRole.CLIENT],
            description: 'История ваших поездок и обслуживания',
          },
        ],
      },
      {
        title: 'Администрирование',
        items: [
          {
            text: 'Пользователи',
            icon: <UserIcon />,
            path: '/users',
            roles: [UserRole.ADMIN],
            description: 'Управление пользователями системы',
          },
          {
            text: 'Настройки',
            icon: <SettingsIcon />,
            path: '/settings',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER, UserRole.CLIENT],
            description: 'Настройки системы и профиля',
          },
          {
            text: 'Профиль',
            icon: <AccountIcon />,
            path: '/profile',
            roles: [UserRole.ADMIN, UserRole.PARTNER, UserRole.MANAGER, UserRole.CLIENT],
            description: 'Управление личным профилем',
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
        item.roles.some(role => role.valueOf() === userRole)
      );
      
      // Возвращаем секцию только если в ней остались пункты меню
      return {
        ...section,
        items: filteredItems
      };
    }).filter(section => section.items.length > 0);
    
    console.log('Количество отфильтрованных секций:', filteredSections.length);
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
        'Просмотр всех данных'
      ],
      [UserRole.PARTNER]: [
        'Управление своими точками обслуживания',
        'Управление сотрудниками',
        'Просмотр статистики',
        'Настройка услуг'
      ],
      [UserRole.MANAGER]: [
        'Управление бронированиями',
        'Работа с клиентами',
        'Просмотр расписания'
      ],
      [UserRole.CLIENT]: [
        'Запись на шиномонтаж',
        'Управление своими автомобилями',
        'Просмотр истории записей'
      ]
    };

    // Проверяем, что user.role валидный и существует в списке возможностей
    const userRole = (user as User).role as UserRole;
    if (!capabilities[userRole]) {
      return null;
    }

    return (
      <Box sx={{ 
        ...formStyles.container, // Использование централизованных стилей для контейнера
        bgcolor: theme.palette.action.selected, 
        borderRadius: SIZES.borderRadius.md, // Консистентный border radius
        mb: SIZES.spacing.md // Унифицированные отступы
      }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Ваша роль: {getRoleName(userRole)}
        </Typography>
        <List dense disablePadding>
          {capabilities[userRole].map((capability, index) => (
            <ListItem dense disablePadding key={index}>
              <Typography variant="caption">• {capability}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  // Перевод названия роли на русский
  const getRoleName = (role?: UserRole): string => {
    if (!role) return 'Пользователь';
    
    const roleNames = {
      [UserRole.ADMIN]: 'Администратор',
      [UserRole.PARTNER]: 'Партнер',
      [UserRole.MANAGER]: 'Менеджер',
      [UserRole.CLIENT]: 'Клиент'
    };
    return roleNames[role] || 'Пользователь';
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
                background: `rgba(${theme.palette.primary.main.replace('#', '')}, 0.08)`, // Тематический фон
                color: theme.palette.primary.main,
                borderRadius: SIZES.borderRadius.sm, // Консистентный border radius
                margin: `${SIZES.spacing.xs}px 0`, // Унифицированные отступы
                fontWeight: 'bold',
                fontSize: SIZES.fontSize.sm // Унифицированный размер шрифта
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
                        '&:hover': {
                          backgroundColor: `rgba(${theme.palette.primary.main.replace('#', '')}, 0.08)`
                        }
                      }}
                    >
                      <ListItemButton 
                        onClick={() => handleNavigate(item.path)}
                        sx={{ 
                          borderRadius: SIZES.borderRadius.sm,
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
          {user ? (
            <>
              <Button 
                color="inherit" 
                onClick={handleUserMenuOpen} 
                endIcon={<AccountIcon />}
                sx={{
                  ...buttonStyles,
                  color: 'inherit',
                  borderColor: 'currentColor',
                  '&:hover': {
                    borderColor: 'currentColor',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
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
                ...buttonStyles,
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