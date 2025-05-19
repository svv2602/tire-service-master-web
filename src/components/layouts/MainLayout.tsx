import React, { useState } from 'react';
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
import { logout } from '../../store/slices/authSlice';
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
        title: 'Бронирования',
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
        ],
      },
      {
        title: 'Справочники',
        items: [
          {
            text: 'Автомобили',
            icon: <CarIcon />,
            path: '/cars',
            roles: [UserRole.ADMIN, UserRole.CLIENT],
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
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Твоя шина
        </Typography>
      </Toolbar>
      <Divider />
      
      {user && getRoleCapabilities()}
      
      <List>
        {getFilteredMenuSections().map((section) => (
          <React.Fragment key={section.title}>
            <ListSubheader 
              onClick={() => toggleSection(section.title)} 
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {section.title}
              {openSections[section.title] ? <ExpandLess /> : <ExpandMore />}
            </ListSubheader>
            
            <Collapse in={openSections[section.title] !== false} timeout="auto" unmountOnExit>
              {section.items.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton onClick={() => handleNavigate(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} secondary={item.description} />
                  </ListItemButton>
                </ListItem>
              ))}
            </Collapse>
            <Divider />
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
              component={RouterLink}
              to="/login"
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