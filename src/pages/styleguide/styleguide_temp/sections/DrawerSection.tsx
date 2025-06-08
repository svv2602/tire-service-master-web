import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Drawer,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Mail as MailIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export const DrawerSection: React.FC = () => {
  const [state, setState] = useState({
    left: false,
    right: false,
    top: false,
    bottom: false,
  });

  const toggleDrawer = (anchor: 'left' | 'right' | 'top' | 'bottom', open: boolean) => {
    setState({ ...state, [anchor]: open });
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Главная" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Профиль" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Входящие" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Сообщения" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Настройки" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Drawer
      </Typography>

      <Grid container spacing={4}>
        {/* Разные позиции Drawer */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Разные позиции Drawer
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {(['left', 'right', 'top', 'bottom'] as const).map((anchor) => (
              <React.Fragment key={anchor}>
                <Button
                  variant="outlined"
                  onClick={() => toggleDrawer(anchor, true)}
                  startIcon={<MenuIcon />}
                >
                  {anchor.charAt(0).toUpperCase() + anchor.slice(1)} Drawer
                </Button>
                <Drawer
                  anchor={anchor}
                  open={state[anchor]}
                  onClose={() => toggleDrawer(anchor, false)}
                >
                  {drawerContent}
                </Drawer>
              </React.Fragment>
            ))}
          </Box>
        </Grid>

        {/* Временный Drawer */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Временный Drawer
          </Typography>
          <Button
            variant="contained"
            onClick={() => toggleDrawer('left', true)}
            startIcon={<MenuIcon />}
          >
            Открыть временный Drawer
          </Button>
          <Drawer
            anchor="left"
            open={state.left}
            onClose={() => toggleDrawer('left', false)}
            variant="temporary"
          >
            {drawerContent}
          </Drawer>
        </Grid>

        {/* Постоянный Drawer */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Постоянный Drawer
          </Typography>
          <Box sx={{ display: 'flex', height: 300, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Drawer
              variant="permanent"
              sx={{
                position: 'relative',
                '& .MuiDrawer-paper': {
                  position: 'relative',
                  height: '100%',
                },
              }}
              open
            >
              {drawerContent}
            </Drawer>
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="h6">Основной контент</Typography>
              <Typography>
                Это пример постоянного Drawer, который всегда виден рядом с основным контентом.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DrawerSection;