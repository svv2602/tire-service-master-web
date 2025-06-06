import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  useTheme,
} from '@mui/material';
// Импорт централизованной системы стилей
import { 
  SIZES, 
  getNavigationStyles,
  ANIMATIONS
} from '../../styles';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
  Settings as SettingsIcon,
  ListAlt as ListAltIcon,
  DirectionsCar as DirectionsCarIcon,
  Map as MapIcon,
  ExpandLess,
  ExpandMore,
  PlaceOutlined as PlaceOutlinedIcon,
} from '@mui/icons-material';

interface SideNavProps {
  open: boolean;
}

const SideNav: React.FC<SideNavProps> = ({ open }) => {
  // Хуки для централизованной системы стилей - обеспечивают консистентность навигации
  const theme = useTheme();
  const navigationStyles = getNavigationStyles(theme); // Централизованные стили навигации
  
  const { pathname } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || '';
  
  // Состояние раскрытия разделов меню - логика остается прежней
  const [openServicePoints, setOpenServicePoints] = useState(false);
  const [openBookings, setOpenBookings] = useState(false);
  const [openCatalogs, setOpenCatalogs] = useState(false);
  const [openLocations, setOpenLocations] = useState(false);
  const [openCars, setOpenCars] = useState(false);

  // Проверки ролей пользователей
  const isAdmin = userRole === 'admin';
  const isPartner = userRole === 'partner';
  const isManager = userRole === 'manager';

  // Обработчики для переключения состояния разделов меню
  const handleServicePointsClick = () => {
    setOpenServicePoints(!openServicePoints);
  };

  const handleBookingsClick = () => {
    setOpenBookings(!openBookings);
  };

  const handleCatalogsClick = () => {
    setOpenCatalogs(!openCatalogs);
  };

  const handleLocationsClick = () => {
    setOpenLocations(!openLocations);
  };

  const handleCarsClick = () => {
    setOpenCars(!openCars);
  };

  return (
    <Box 
      sx={{ 
        width: open ? 280 : 72,
        overflow: 'hidden',
        transition: ANIMATIONS.transition.medium, // Централизованная анимация
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.paper, // Тематический фон
        borderRight: `1px solid ${theme.palette.divider}`, // Тематическая граница
      }}
    >
      <List component="nav">
        {/* Главная страница - дашборд */}
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/" 
            selected={pathname === '/'}
            sx={{
              ...navigationStyles.listItem,
              borderRadius: SIZES.borderRadius.sm,
              margin: SIZES.spacing.xs,
            }}
          >
            <ListItemIcon sx={navigationStyles.listItemIcon}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Дашборд" />
          </ListItemButton>
        </ListItem>

        {/* Партнеры (доступно админам) */}
        {isAdmin && (
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/partners" 
              selected={pathname === '/partners'}
              sx={{
                ...navigationStyles.listItem,
                borderRadius: SIZES.borderRadius.sm,
                margin: SIZES.spacing.xs,
              }}
            >
              <ListItemIcon sx={navigationStyles.listItemIcon}>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Партнеры" />
            </ListItemButton>
          </ListItem>
        )}

        {/* Клиенты */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/clients"
            selected={pathname === '/clients'}
            sx={{
              ...navigationStyles.listItem,
              borderRadius: SIZES.borderRadius.sm,
              margin: SIZES.spacing.xs,
            }}
          >
            <ListItemIcon sx={navigationStyles.listItemIcon}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Клиенты" />
          </ListItemButton>
        </ListItem>

        {/* Пользователи (доступно админам) */}
        {isAdmin && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/users"
              selected={pathname === '/users'}
              sx={{
                ...navigationStyles.listItem,
                borderRadius: SIZES.borderRadius.sm,
                margin: SIZES.spacing.xs,
              }}
            >
              <ListItemIcon sx={navigationStyles.listItemIcon}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Пользователи" />
            </ListItemButton>
          </ListItem>
        )}

        {/* Сервисные точки */}
        {(isAdmin || isPartner || isManager) && (
          <>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleServicePointsClick}
                sx={{
                  ...navigationStyles.listItem,
                  borderRadius: SIZES.borderRadius.sm,
                  margin: SIZES.spacing.xs,
                }}
              >
                <ListItemIcon sx={navigationStyles.listItemIcon}>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText primary="Сервисные точки" />
                {openServicePoints ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openServicePoints} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/service-points"
                    selected={pathname === '/service-points'}
                    sx={{ 
                      ...navigationStyles.listItem,
                      pl: SIZES.spacing.xl, // Увеличенный отступ для вложенности
                      borderRadius: SIZES.borderRadius.sm,
                      margin: SIZES.spacing.xs,
                    }}
                  >
                    <ListItemIcon sx={navigationStyles.listItemIcon}>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText primary="Все точки" />
                  </ListItemButton>
                </ListItem>
                {(isPartner || isManager) && (
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to="/my-service-points"
                      selected={pathname === '/my-service-points'}
                      sx={{ 
                        ...navigationStyles.listItem,
                        pl: SIZES.spacing.xl, // Увеличенный отступ для вложенности
                        borderRadius: SIZES.borderRadius.sm,
                        margin: SIZES.spacing.xs,
                      }}
                    >
                      <ListItemIcon sx={navigationStyles.listItemIcon}>
                        <LocationOnIcon />
                      </ListItemIcon>
                      <ListItemText primary="Мои точки" />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </Collapse>
          </>
        )}
        
        {/* Бронирования */}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleBookingsClick}
            sx={{
              ...navigationStyles.listItem,
              borderRadius: SIZES.borderRadius.sm,
              margin: SIZES.spacing.xs,
            }}
          >
            <ListItemIcon sx={navigationStyles.listItemIcon}>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary="Бронирования" />
            {openBookings ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openBookings} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/bookings"
                selected={pathname === '/bookings'}
                sx={{ 
                  ...navigationStyles.listItem,
                  pl: SIZES.spacing.xl, // Увеличенный отступ для вложенности
                  borderRadius: SIZES.borderRadius.sm,
                  margin: SIZES.spacing.xs,
                }}
              >
                <ListItemIcon sx={navigationStyles.listItemIcon}>
                  <CalendarMonthIcon />
                </ListItemIcon>
                <ListItemText primary="Все бронирования" />
              </ListItemButton>
            </ListItem>
            {(isPartner || isManager) && (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/my-bookings"
                  selected={pathname === '/my-bookings'}
                  sx={{ 
                    ...navigationStyles.listItem,
                    pl: SIZES.spacing.xl, // Увеличенный отступ для вложенности
                    borderRadius: SIZES.borderRadius.sm,
                    margin: SIZES.spacing.xs,
                  }}
                >
                  <ListItemIcon sx={navigationStyles.listItemIcon}>
                    <CalendarMonthIcon />
                  </ListItemIcon>
                  <ListItemText primary="Бронирования моих точек" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Collapse>

        {/* Справочники (доступно админам) */}
        {isAdmin && (
          <>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleCatalogsClick}
                sx={{
                  ...navigationStyles.listItem,
                  borderRadius: SIZES.borderRadius.sm,
                  margin: SIZES.spacing.xs,
                }}
              >
                <ListItemIcon sx={navigationStyles.listItemIcon}>
                  <ListAltIcon />
                </ListItemIcon>
                <ListItemText primary="Справочники" />
                {openCatalogs ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openCatalogs} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Подраздел Местоположения */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleLocationsClick}
                    sx={{ 
                      ...navigationStyles.listItem,
                      pl: SIZES.spacing.xl, // Первый уровень вложенности
                      borderRadius: SIZES.borderRadius.sm,
                      margin: SIZES.spacing.xs,
                    }}
                  >
                    <ListItemIcon sx={navigationStyles.listItemIcon}>
                      <PlaceOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Местоположения" />
                    {openLocations ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openLocations} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/regions"
                        selected={pathname === '/regions'}
                        sx={{ 
                          ...navigationStyles.listItem,
                          pl: SIZES.spacing.xxl, // Второй уровень вложенности
                          borderRadius: SIZES.borderRadius.sm,
                          margin: SIZES.spacing.xs,
                        }}
                      >
                        <ListItemIcon sx={navigationStyles.listItemIcon}>
                          <MapIcon />
                        </ListItemIcon>
                        <ListItemText primary="Области и Города" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
                
                {/* Подраздел Автомобили */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleCarsClick}
                    sx={{ 
                      ...navigationStyles.listItem,
                      pl: SIZES.spacing.xl, // Первый уровень вложенности
                      borderRadius: SIZES.borderRadius.sm,
                      margin: SIZES.spacing.xs,
                    }}
                  >
                    <ListItemIcon sx={navigationStyles.listItemIcon}>
                      <DirectionsCarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Автомобили" />
                    {openCars ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openCars} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/car-brands"
                        selected={pathname === '/car-brands'}
                        sx={{ 
                          ...navigationStyles.listItem,
                          pl: SIZES.spacing.xxl, // Второй уровень вложенности
                          borderRadius: SIZES.borderRadius.sm,
                          margin: SIZES.spacing.xs,
                        }}
                      >
                        <ListItemIcon sx={navigationStyles.listItemIcon}>
                          <DirectionsCarIcon />
                        </ListItemIcon>
                        <ListItemText primary="Бренды авто" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/car-models"
                        selected={pathname === '/car-models'}
                        sx={{ 
                          ...navigationStyles.listItem,
                          pl: SIZES.spacing.xxl, // Второй уровень вложенности
                          borderRadius: SIZES.borderRadius.sm,
                          margin: SIZES.spacing.xs,
                        }}
                      >
                        <ListItemIcon sx={navigationStyles.listItemIcon}>
                          <DirectionsCarIcon />
                        </ListItemIcon>
                        <ListItemText primary="Модели авто" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              </List>
            </Collapse>
          </>
        )}

        {/* Настройки */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/settings"
            selected={pathname === '/settings'}
            sx={{
              ...navigationStyles.listItem,
              borderRadius: SIZES.borderRadius.sm,
              margin: SIZES.spacing.xs,
            }}
          >
            <ListItemIcon sx={navigationStyles.listItemIcon}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Настройки" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default SideNav;