import React, { useState, useEffect } from 'react';
import {
  Drawer as MuiDrawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  styled,
  useTheme,
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Типы для компонента
interface DrawerItem {
  id?: string | number;
  text: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  variant?: 'temporary' | 'persistent' | 'mini';
  width?: number;
  miniWidth?: number;
  overlay?: boolean;
  header?: boolean;
  items?: DrawerItem[];
  activeItemId?: string | number;
  onItemClick?: (item: DrawerItem) => void;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  children?: React.ReactNode;
  sx?: any;
}

// Стилизованный Drawer
const StyledDrawer = styled(MuiDrawer)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    
    '& .MuiDrawer-paper': {
      backgroundColor: theme.palette.mode === 'dark' ? themeColors.backgroundSecondary : themeColors.backgroundCard,
      color: themeColors.textPrimary,
      borderRight: `1px solid ${themeColors.borderPrimary}`,
      transition: tokens.transitions.duration.normal,
      overflowX: 'hidden',
    },
  };
});

// Стилизованная шапка Drawer
const DrawerHeader = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    borderBottom: `1px solid ${themeColors.borderPrimary}`,
  };
});

// Стилизованный ListItem
const StyledListItem = styled(ListItem)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    margin: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.borderRadius.md,
    transition: tokens.transitions.duration.normal,
    cursor: 'pointer',
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? `${themeColors.backgroundHover}40` 
        : `${themeColors.backgroundHover}20`,
    },
    
    '&.Mui-selected': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? `${tokens.colors.primary.main}30` 
        : `${tokens.colors.primary.light}20`,
      
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? `${tokens.colors.primary.main}40` 
          : `${tokens.colors.primary.light}30`,
      },
    },
  };
});

/**
 * Компонент Drawer - боковая панель навигации
 * 
 * @example
 * <Drawer
 *   open={open}
 *   onClose={handleClose}
 *   items={[
 *     { text: 'Главная', icon: <HomeIcon />, onClick: () => navigate('/') },
 *     { text: 'Настройки', icon: <SettingsIcon />, onClick: () => navigate('/settings') },
 *   ]}
 * />
 */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  variant = 'temporary',
  width = 240,
  miniWidth = 64,
  overlay = true,
  header = true,
  items = [],
  activeItemId,
  onItemClick,
  headerContent,
  footerContent,
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const [isMini, setIsMini] = useState(variant === 'mini');
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  // Обработка изменения варианта
  useEffect(() => {
    setIsMini(variant === 'mini');
  }, [variant]);
  
  // Обработка клика по пункту меню
  const handleItemClick = (item: DrawerItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    
    if (item.onClick) {
      item.onClick();
    }
    
    if (variant === 'temporary' && onClose) {
      onClose();
    }
  };
  
  // Переключение мини-режима
  const toggleMini = () => {
    setIsMini(!isMini);
  };
  
  // Вычисление текущей ширины
  const currentWidth = variant === 'mini' ? (isMini ? miniWidth : width) : width;
  
  return (
    <StyledDrawer
      variant={variant === 'mini' ? 'permanent' : variant}
      open={variant === 'mini' ? true : open}
      onClose={onClose}
      sx={{
        width: currentWidth,
        '& .MuiDrawer-paper': {
          width: currentWidth,
        },
        ...sx,
      }}
      {...props}
    >
      {header && (
        <DrawerHeader>
          {headerContent || (
            variant === 'mini' && (
              <IconButton onClick={toggleMini} size="small">
                {isMini ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            )
          )}
        </DrawerHeader>
      )}
      
      {items.length > 0 && (
        <List sx={{ padding: tokens.spacing.xs }}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <StyledListItem
                onClick={() => {
                  handleItemClick(item);
                }}
                selected={activeItemId === item.id}
                sx={{
                  justifyContent: isMini ? 'center' : 'flex-start',
                }}
                {...(item.href ? { component: 'a', href: item.href } : {})}
              >
                {item.icon && (
                  <ListItemIcon
                    sx={{
                      minWidth: isMini ? 'auto' : 40,
                      color: activeItemId === item.id ? tokens.colors.primary.main : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                )}
                
                {(!isMini || variant !== 'mini') && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: tokens.typography.fontSize.md,
                        fontFamily: tokens.typography.fontFamily,
                        fontWeight: activeItemId === item.id ? 500 : 400,
                        color: activeItemId === item.id ? tokens.colors.primary.main : 'inherit',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                )}
              </StyledListItem>
            </React.Fragment>
          ))}
        </List>
      )}
      
      {children}
      
      {footerContent && (
        <Box
          sx={{
            marginTop: 'auto',
            borderTop: `1px solid ${themeColors.borderPrimary}`,
            padding: tokens.spacing.sm,
          }}
        >
          {footerContent}
        </Box>
      )}
    </StyledDrawer>
  );
};

export default Drawer; 