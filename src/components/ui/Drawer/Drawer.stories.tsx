import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MuiDrawer from '@mui/material/Drawer';
import Drawer from './Drawer';
import { DrawerProps } from './types';

export default {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Боковая панель с поддержкой различных режимов отображения: временная, постоянная и мини-вариант.',
      },
    },
  },
} as Meta;

const DrawerContent = () => (
  <List>
    {['Входящие', 'Помеченные', 'Отправленные', 'Черновики'].map((text, index) => (
      <ListItem button key={text}>
        <ListItemIcon>
          {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItem>
    ))}
  </List>
);

const Template: Story<DrawerProps> = (args) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Button onClick={() => setOpen(true)} sx={{ m: 2 }}>
        Открыть drawer
      </Button>
      <Drawer {...args} open={open} onClose={() => setOpen(false)}>
        <DrawerContent />
      </Drawer>
    </Box>
  );
};

export const Temporary = Template.bind({});
Temporary.args = {
  variant: 'temporary',
};

export const Persistent = Template.bind({});
Persistent.args = {
  variant: 'persistent',
};

export const Mini = Template.bind({});
Mini.args = {
  variant: 'mini',
};

export const RightSide = Template.bind({});
RightSide.args = {
  anchor: 'right',
};

export const CustomWidth = Template.bind({});
CustomWidth.args = {
  width: 320,
};

// Расширенные примеры
export const WithHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Button onClick={() => setOpen(true)} sx={{ m: 2 }}>
        Открыть с заголовком
      </Button>
      <Drawer 
        open={open} 
        onClose={() => setOpen(false)}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white' 
        }}>
          <Typography variant="h6">Меню</Typography>
          <IconButton color="inherit" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DrawerContent />
      </Drawer>
    </Box>
  );
};

export const NavigationDrawer = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Панель управления', icon: <DashboardIcon /> },
    { id: 'users', label: 'Пользователи', icon: <PeopleIcon /> },
    { id: 'settings', label: 'Настройки', icon: <SettingsIcon /> },
    { id: 'home', label: 'Главная', icon: <HomeIcon /> }
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => setOpen(!open)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Приложение
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Drawer 
          variant="persistent"
          open={open} 
          onClose={() => setOpen(false)}
        >
          <Box sx={{ width: 240 }}>
            <List>
              {navItems.map((item) => (
                <ListItem 
                  button 
                  key={item.id}
                  selected={selected === item.id}
                  onClick={() => setSelected(item.id)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                    }
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        
        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          transition: 'margin 0.2s',
          ml: open ? '240px' : 0 
        }}>
          <Typography variant="h5" gutterBottom>
            {navItems.find(item => item.id === selected)?.label || 'Выберите раздел'}
          </Typography>
          <Typography paragraph>
            Содержимое выбранного раздела. Нажмите на иконку меню в верхнем левом углу, 
            чтобы открыть или закрыть боковую панель навигации.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export const ResponsiveDrawer = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState('dashboard');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { id: 'dashboard', label: 'Панель управления', icon: <DashboardIcon /> },
    { id: 'users', label: 'Пользователи', icon: <PeopleIcon /> },
    { id: 'settings', label: 'Настройки', icon: <SettingsIcon /> },
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          Админ-панель
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.id}
            selected={selected === item.id}
            onClick={() => {
              setSelected(item.id);
              if (mobileOpen) setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Адаптивное меню
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box component="nav">
        {/* Мобильный вариант */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Десктопный вариант - используем MuiDrawer напрямую */}
        <MuiDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawer}
        </MuiDrawer>
      </Box>
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3,
        width: { sm: `calc(100% - 240px)` },
        ml: { sm: '240px' },
        mt: '64px'
      }}>
        <Typography variant="h5" gutterBottom>
          {navItems.find(item => item.id === selected)?.label}
        </Typography>
        <Typography paragraph>
          Это адаптивное меню, которое показывает постоянную боковую панель на больших экранах 
          и временную панель на мобильных устройствах. Попробуйте изменить размер окна браузера, 
          чтобы увидеть, как меняется поведение.
        </Typography>
      </Box>
    </Box>
  );
}; 