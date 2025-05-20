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
  Divider,
  Collapse,
} from '@mui/material';
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
  BuildOutlined as BuildOutlinedIcon,
} from '@mui/icons-material';

interface SideNavProps {
  open: boolean;
}

const SideNav: React.FC<SideNavProps> = ({ open }) => {
  const { pathname } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || '';
  
  const [openServicePoints, setOpenServicePoints] = useState(false);
  const [openBookings, setOpenBookings] = useState(false);
  const [openCatalogs, setOpenCatalogs] = useState(false);
  const [openLocations, setOpenLocations] = useState(false);
  const [openCars, setOpenCars] = useState(false);

  const isAdmin = userRole === 'admin';
  const isPartner = userRole === 'partner';
  const isManager = userRole === 'manager';

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
        transition: 'width 0.3s',
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <List component="nav">
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            to="/" 
            selected={pathname === '/'}
          >
            <ListItemIcon>
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
            >
              <ListItemIcon>
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
          >
            <ListItemIcon>
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
            >
              <ListItemIcon>
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
              <ListItemButton onClick={handleServicePointsClick}>
                <ListItemIcon>
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
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
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
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>
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
          <ListItemButton onClick={handleBookingsClick}>
            <ListItemIcon>
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
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
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
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
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
              <ListItemButton onClick={handleCatalogsClick}>
                <ListItemIcon>
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
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
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
                        sx={{ pl: 6 }}
                      >
                        <ListItemIcon>
                          <MapIcon />
                        </ListItemIcon>
                        <ListItemText primary="Регионы" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/cities"
                        selected={pathname === '/cities'}
                        sx={{ pl: 6 }}
                      >
                        <ListItemIcon>
                          <LocationOnIcon />
                        </ListItemIcon>
                        <ListItemText primary="Города" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
                
                {/* Подраздел Автомобили */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleCarsClick}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
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
                        sx={{ pl: 6 }}
                      >
                        <ListItemIcon>
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
                        sx={{ pl: 6 }}
                      >
                        <ListItemIcon>
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
          >
            <ListItemIcon>
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