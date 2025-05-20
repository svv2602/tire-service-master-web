import React, { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import { logout, getCurrentUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Добавляем useEffect для проверки токена и загрузки данных пользователя при монтировании компонента
  useEffect(() => {
    const token = localStorage.getItem('tvoya_shina_token');
    
    // Если токен существует, но данных пользователя нет, загружаем их
    if (token && !user) {
      console.log('Token exists but user data is missing. Loading user data...');
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

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
    await dispatch(logout());
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

  // Фильтруем разделы и пункты меню в зависимости от роли пользователя
  const getFilteredMenuSections = () => {
    // Всегда показываем пункты меню в зависимости от прав пользователя, без необходимости включать режим отладки
    if (!user || !user.role) {
      return [];
    }

    const allSections = getMenuSections();
    
    return allSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.roles.includes(user.role as UserRole))
      }))
      .filter(section => section.items.length > 0);
  };

  // Разрешенные действия для каждой роли (информационный блок)
  const getRoleCapabilities = () => {
    if (!user || !user.role) return null;

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
    const userRole = user.role as UserRole;
    if (!capabilities[userRole]) {
      return null;
    }

    return (
      <Box sx={{ p: 2, bgcolor: 'action.selected', borderRadius: 1, mb: 2 }}>
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
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          background: 'linear-gradient(to right, #1976d2, #2196f3)',
          color: 'white'
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Твоя шина
        </Typography>
      </Toolbar>
      <Divider />
      
      {user && getRoleCapabilities()}
      
      <List sx={{ padding: 1 }}>
        {getFilteredMenuSections().map((section) => (
          <React.Fragment key={section.title}>
            <ListSubheader 
              onClick={() => toggleSection(section.title)} 
              sx={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(25, 118, 210, 0.08)',
                color: 'primary.main',
                borderRadius: 1,
                margin: '4px 0',
                fontWeight: 'bold'
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
                        backgroundColor: isActive ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)'
                        }
                      }}
                    >
                      <ListItemButton 
                        onClick={() => handleNavigate(item.path)}
                        sx={{ 
                          borderRadius: 1,
                          pl: 2
                        }}
                      >
                        <ListItemIcon sx={{ 
                          color: isActive ? 'primary.main' : 'inherit',
                          minWidth: '40px'
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          secondary={item.description} 
                          primaryTypographyProps={{
                            fontWeight: isActive ? 'bold' : 'normal',
                            fontSize: '0.95rem',
                            color: isActive ? 'primary.main' : 'inherit'
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.75rem'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
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
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Твоя шина - {user ? getRoleName(user.role as UserRole) : 'Авторизация'}
          </Typography>
          {user ? (
            <>
              <Button color="inherit" onClick={handleUserMenuOpen} endIcon={<AccountIcon />}>
                {user.first_name
                  ? `${user.first_name} ${user.last_name || ''}`
                  : user.email}
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
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;