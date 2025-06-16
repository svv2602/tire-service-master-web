import React from 'react';
import MuiListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { ListItemProps } from './types';
import { styled, useTheme } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный компонент элемента списка
const StyledListItem = styled(MuiListItem)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.borderRadius.sm,
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
  };
});

// Стилизованный компонент иконки элемента списка
const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    color: themeColors.textSecondary,
    minWidth: 40,
  };
});

/**
 * Компонент ListItem - элемент списка с поддержкой иконок и дополнительного текста
 */
const ListItem: React.FC<ListItemProps> = ({
  compact = false,
  disableGutters = false,
  startIcon,
  endIcon,
  secondaryText,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

  return (
    <StyledListItem
      dense={compact}
      disableGutters={disableGutters}
      {...rest}
    >
      {startIcon && (
        <StyledListItemIcon sx={{ minWidth: compact ? 36 : 40 }}>
          {startIcon}
        </StyledListItemIcon>
      )}
      
      <ListItemText
        primary={children}
        secondary={secondaryText}
        primaryTypographyProps={{
          variant: compact ? 'body2' : 'body1',
          sx: {
            color: themeColors.textPrimary,
            fontSize: compact ? tokens.typography.fontSize.xs : tokens.typography.fontSize.sm,
            fontFamily: tokens.typography.fontFamily,
          }
        }}
        secondaryTypographyProps={{
          variant: compact ? 'caption' : 'body2',
          sx: {
            color: themeColors.textSecondary,
            fontSize: compact ? tokens.typography.fontSize.xxs : tokens.typography.fontSize.xs,
            fontFamily: tokens.typography.fontFamily,
          }
        }}
      />

      {endIcon && (
        <StyledListItemIcon sx={{ minWidth: compact ? 36 : 40 }}>
          {endIcon}
        </StyledListItemIcon>
      )}
    </StyledListItem>
  );
};

export default ListItem; 