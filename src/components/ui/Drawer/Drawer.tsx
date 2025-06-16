import React from 'react';
import MuiDrawer from '@mui/material/Drawer';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { styled, useTheme } from '@mui/material';
import { DrawerProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный Drawer
const StyledDrawer = styled(MuiDrawer)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiDrawer-paper': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? themeColors.backgroundSecondary 
        : themeColors.backgroundPrimary,
      color: themeColors.textPrimary,
      borderRight: `1px solid ${themeColors.borderPrimary}`,
      boxShadow: theme.palette.mode === 'dark' ? tokens.shadows.md : 'none',
      transition: tokens.transitions.duration.normal,
    },
    '& .MuiBackdrop-root': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(0, 0, 0, 0.7)' 
        : 'rgba(0, 0, 0, 0.5)',
    },
  };
});

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
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
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
    <StyledDrawer
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
          transition: tokens.transitions.duration.normal,
          padding: tokens.spacing.none,
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