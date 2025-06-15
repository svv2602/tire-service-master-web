import React, { useState, useEffect } from 'react';
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
import { StyledListItemButton } from '../styled/CommonComponents';
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
  Article as ArticleIcon,
  MenuBook as MenuBookIcon,
  Create as CreateIcon,
  Web as WebIcon,
  Edit as EditIcon,
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
  const [openArticles, setOpenArticles] = useState(false);
  const [openPageContent, setOpenPageContent] = useState(false);

  // Проверки ролей пользователей
  const isAdmin = userRole === 'admin';
  const isPartner = userRole === 'partner';
  const isManager = userRole === 'manager';

  // Отладочная информация (только в режиме разработки)
  console.log('🔍 SideNav Debug Info:');
  console.log('👤 User:', user);
  console.log('🎭 User Role:', userRole);
  console.log('👑 Is Admin:', isAdmin);
  console.log('🤝 Is Partner:', isPartner);
  console.log('👨‍💼 Is Manager:', isManager);
  console.log('🌐 Should show content management:', isAdmin);
  console.log('📍 Current pathname:', pathname);

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

  const handleArticlesClick = () => {
    setOpenArticles(!openArticles);
  };

  const handlePageContentClick = () => {
    setOpenPageContent(!openPageContent);
  };

  // Принудительное обновление при изменении пользователя
  useEffect(() => {
    console.log('🔄 SideNav: User changed, re-rendering with role:', userRole);
  }, [user, userRole]);

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
          <StyledListItemButton 
            component={Link} 
            to="/" 
            selected={pathname === '/'}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Дашборд" />
          </StyledListItemButton>
        </ListItem>

        {/* Партнеры (доступно админам) */}
        {isAdmin && (
          <ListItem disablePadding>
            <StyledListItemButton 
              component={Link} 
              to="/partners" 
              selected={pathname === '/partners'}
            >
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Партнеры" />
            </StyledListItemButton>
          </ListItem>
        )}

        {/* Клиенты */}
        <ListItem disablePadding>
          <StyledListItemButton
            component={Link}
            to="/clients"
            selected={pathname === '/clients'}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Клиенты" />
          </StyledListItemButton>
        </ListItem>

        {/* База знаний (доступно всем для просмотра) */}
        <ListItem disablePadding>
          <StyledListItemButton
            component={Link}
            to="/knowledge-base"
            selected={pathname === '/knowledge-base'}
          >
            <ListItemIcon>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText primary="База знаний" />
          </StyledListItemButton>
        </ListItem>

        {/* Управление статьями (доступно админам и партнерам) */}
        {(isAdmin || isPartner) && (
          <>
            <ListItem disablePadding>
              <StyledListItemButton onClick={handleArticlesClick}>
                <ListItemIcon>
                  <ArticleIcon />
                </ListItemIcon>
                <ListItemText primary="Статьи" />
                {openArticles ? <ExpandLess /> : <ExpandMore />}
              </StyledListItemButton>
            </ListItem>
            <Collapse in={openArticles} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <StyledListItemButton
                    component={Link}
                    to="/articles"
                    selected={pathname === '/articles'}
                    nested={1}
                  >
                    <ListItemIcon>
                      <ArticleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Все статьи" />
                  </StyledListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <StyledListItemButton
                    component={Link}
                    to="/articles/new"
                    selected={pathname === '/articles/new'}
                    nested={1}
                  >
                    <ListItemIcon>
                      <CreateIcon />
                    </ListItemIcon>
                    <ListItemText primary="Создать статью" />
                  </StyledListItemButton>
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* Пользователи (доступно админам) */}
        {isAdmin && (
          <ListItem disablePadding>
            <StyledListItemButton
              component={Link}
              to="/users"
              selected={pathname === '/users'}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Пользователи" />
            </StyledListItemButton>
          </ListItem>
        )}

        {/* Управление контентом (доступно админам) */}
        {isAdmin && (
          <>
            <ListItem disablePadding>
              <StyledListItemButton onClick={handlePageContentClick}>
                <ListItemIcon>
                  <WebIcon />
                </ListItemIcon>
                <ListItemText primary="Управление контентом" />
                {openPageContent ? <ExpandLess /> : <ExpandMore />}
              </StyledListItemButton>
            </ListItem>
            <Collapse in={openPageContent} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <StyledListItemButton
                    component={Link}
                    to="/page-content"
                    selected={pathname === '/page-content'}
                    nested={1}
                  >
                    <ListItemIcon>
                      <WebIcon />
                    </ListItemIcon>
                    <ListItemText primary="Весь контент" />
                  </StyledListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <StyledListItemButton
                    component={Link}
                    to="/page-content/new"
                    selected={pathname === '/page-content/new'}
                    nested={1}
                  >
                    <ListItemIcon>
                      <CreateIcon />
                    </ListItemIcon>
                    <ListItemText primary="Создать контент" />
                  </StyledListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <StyledListItemButton
                    component={Link}
                    to="/page-content/management"
                    selected={pathname === '/page-content/management'}
                    nested={1}
                  >
                    <ListItemIcon>
                      <EditIcon />
                    </ListItemIcon>
                    <ListItemText primary="Расширенное управление" />
                  </StyledListItemButton>
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* Сервисные точки */}
        {(isAdmin || isPartner || isManager) && (
          <>
            <ListItem disablePadding>
              <StyledListItemButton onClick={handleServicePointsClick}>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText primary="Сервисные точки" />
                {openServicePoints ? <ExpandLess /> : <ExpandMore />}
              </StyledListItemButton>
            </ListItem>
            <Collapse in={openServicePoints} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <StyledListItemButton
                    component={Link}
                    to="/service-points"
                    selected={pathname === '/service-points'}
                    nested={1}
                  >
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText primary="Все точки" />
                  </StyledListItemButton>
                </ListItem>
                {(isPartner || isManager) && (
                  <ListItem disablePadding>
                    <StyledListItemButton
                      component={Link}
                      to="/my-service-points"
                      selected={pathname === '/my-service-points'}
                      nested={1}
                    >
                      <ListItemIcon>
                        <LocationOnIcon />
                      </ListItemIcon>
                      <ListItemText primary="Мои точки" />
                    </StyledListItemButton>
                  </ListItem>
                )}
              </List>
            </Collapse>
          </>
        )}
        
        {/* Бронирования */}
        <ListItem disablePadding>
          <StyledListItemButton onClick={handleBookingsClick}>
            <ListItemIcon>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary="Бронирования" />
            {openBookings ? <ExpandLess /> : <ExpandMore />}
          </StyledListItemButton>
        </ListItem>
        <Collapse in={openBookings} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <StyledListItemButton
                component={Link}
                to="/bookings"
                selected={pathname === '/bookings'}
                nested={1}
              >
                <ListItemIcon>
                  <CalendarMonthIcon />
                </ListItemIcon>
                <ListItemText primary="Все бронирования" />
              </StyledListItemButton>
            </ListItem>
            {(isPartner || isManager) && (
              <ListItem disablePadding>
                <StyledListItemButton
                  component={Link}
                  to="/my-bookings"
                  selected={pathname === '/my-bookings'}
                  nested={1}
                >
                  <ListItemIcon>
                    <CalendarMonthIcon />
                  </ListItemIcon>
                  <ListItemText primary="Бронирования моих точек" />
                </StyledListItemButton>
              </ListItem>
            )}
          </List>
        </Collapse>

        {/* Справочники (доступно админам) */}
        {isAdmin && (
          <>
            <ListItem disablePadding>
              <StyledListItemButton onClick={handleCatalogsClick}>
                <ListItemIcon>
                  <ListAltIcon />
                </ListItemIcon>
                <ListItemText primary="Справочники" />
                {openCatalogs ? <ExpandLess /> : <ExpandMore />}
              </StyledListItemButton>
            </ListItem>
            <Collapse in={openCatalogs} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Подраздел Местоположения */}
                <ListItem disablePadding>
                  <StyledListItemButton
                    onClick={handleLocationsClick}
                    nested={1}
                  >
                    <ListItemIcon>
                      <PlaceOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Местоположения" />
                    {openLocations ? <ExpandLess /> : <ExpandMore />}
                  </StyledListItemButton>
                </ListItem>
                <Collapse in={openLocations} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding>
                      <StyledListItemButton
                        component={Link}
                        to="/regions"
                        selected={pathname === '/regions'}
                        nested={2}
                      >
                        <ListItemIcon>
                          <MapIcon />
                        </ListItemIcon>
                        <ListItemText primary="Области и Города" />
                      </StyledListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
                
                {/* Подраздел Автомобили */}
                <ListItem disablePadding>
                  <StyledListItemButton
                    onClick={handleCarsClick}
                    nested={1}
                  >
                    <ListItemIcon>
                      <DirectionsCarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Автомобили" />
                    {openCars ? <ExpandLess /> : <ExpandMore />}
                  </StyledListItemButton>
                </ListItem>
                <Collapse in={openCars} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding>
                      <StyledListItemButton
                        component={Link}
                        to="/car-brands"
                        selected={pathname === '/car-brands'}
                        nested={2}
                      >
                        <ListItemIcon>
                          <DirectionsCarIcon />
                        </ListItemIcon>
                        <ListItemText primary="Бренды авто" />
                      </StyledListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <StyledListItemButton
                        component={Link}
                        to="/car-models"
                        selected={pathname === '/car-models'}
                        nested={2}
                      >
                        <ListItemIcon>
                          <DirectionsCarIcon />
                        </ListItemIcon>
                        <ListItemText primary="Модели авто" />
                      </StyledListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              </List>
            </Collapse>
          </>
        )}

        {/* Настройки */}
        <ListItem disablePadding>
          <StyledListItemButton
            component={Link}
            to="/settings"
            selected={pathname === '/settings'}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Настройки" />
          </StyledListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default SideNav;