import React from 'react';
import MuiMenu from '@mui/material/Menu';
import MenuItem from './MenuItem';
import { MenuProps } from './types';
import { styled, useTheme } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный компонент меню
const StyledMenu = styled(MuiMenu)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiPaper-root': {
      backgroundColor: themeColors.backgroundCard,
      boxShadow: tokens.shadows.md,
      borderRadius: tokens.borderRadius.md,
      border: `1px solid ${themeColors.borderPrimary}`,
      marginTop: tokens.spacing.xs,
      minWidth: 180,
    },
    '& .MuiList-root': {
      padding: `${tokens.spacing.xs} 0`,
    },
    '& .MuiMenuItem-root': {
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      transition: tokens.transitions.duration.normal,
      
      '&:hover': {
        backgroundColor: themeColors.backgroundHover,
      },
      
      '&.Mui-selected': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(25, 118, 210, 0.15)'
          : 'rgba(25, 118, 210, 0.08)',
        
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(25, 118, 210, 0.25)'
            : 'rgba(25, 118, 210, 0.12)',
        },
      },
      
      '&.Mui-disabled': {
        opacity: 0.6,
      },
    },
    '& .MuiDivider-root': {
      margin: `${tokens.spacing.xs} 0`,
      backgroundColor: themeColors.borderPrimary,
    },
  };
});

/**
 * Компонент Menu - контекстное меню с поддержкой иконок и разделителей
 */
const Menu: React.FC<MenuProps> = ({
  items,
  onSelect,
  anchorEl,
  open,
  onClose,
  ...rest
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  const handleClose = () => {
    if (onClose) {
      onClose({}, 'backdropClick');
    }
  };

  return (
    <StyledMenu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      elevation={0}
      {...rest}
    >
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          onSelect={(selectedItem) => {
            onSelect(selectedItem);
            handleClose();
          }}
        />
      ))}
    </StyledMenu>
  );
};

export default Menu; 