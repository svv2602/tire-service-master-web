import React from 'react';
import MuiDrawer from '@mui/material/Drawer';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { DrawerProps } from './types';

/**
 * Компонент Drawer - боковая панель с поддержкой различных режимов отображения
 */
const Drawer: React.FC<DrawerProps> = ({
  variant = 'temporary',
  width = 240,
  miniWidth = 56,
  overlay = true,
  anchor = 'left',
  open = false,
  onClickAway,
  onClose,
  sx,
  children,
  ...rest
}) => {
  // Определяем базовую ширину в зависимости от варианта
  const drawerWidth = variant === 'mini' && !open ? miniWidth : width;

  // Определяем вариант для MUI Drawer
  const muiVariant = variant === 'mini' ? 'permanent' : variant === 'persistent' ? 'persistent' : 'temporary';

  // Обработчик клика вне drawer
  const handleClickAway = () => {
    if (variant === 'temporary' && open) {
      onClickAway?.();
      onClose?.({}, 'backdropClick');
    }
  };

  const drawer = (
    <MuiDrawer
      variant={muiVariant}
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: (theme) =>
            theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </MuiDrawer>
  );

  // Оборачиваем в ClickAwayListener только temporary вариант
  return variant === 'temporary' && overlay ? (
    <ClickAwayListener onClickAway={handleClickAway}>{drawer}</ClickAwayListener>
  ) : (
    drawer
  );
};

export default Drawer; 