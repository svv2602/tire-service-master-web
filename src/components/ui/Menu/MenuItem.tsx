import React from 'react';
import MuiMenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { MenuItemComponentProps } from './types';
import { styled, useTheme } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный компонент иконки элемента меню
const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    color: themeColors.textSecondary,
    minWidth: 36,
    marginRight: tokens.spacing.sm,
    
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
  };
});

// Стилизованный компонент текста элемента меню
const StyledListItemText = styled(ListItemText)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiTypography-root': {
      fontSize: tokens.typography.fontSize.sm,
      fontFamily: tokens.typography.fontFamily,
      color: themeColors.textPrimary,
    },
  };
});

// Стилизованный разделитель
const StyledDivider = styled(Divider)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    backgroundColor: themeColors.borderPrimary,
    margin: `${tokens.spacing.xs} 0`,
  };
});

/**
 * Компонент элемента меню
 */
const MenuItem: React.FC<MenuItemComponentProps> = ({
  item,
  onSelect,
  ...rest
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  const handleClick = () => {
    onSelect(item);
  };

  return (
    <>
      <MuiMenuItem
        onClick={handleClick}
        disabled={item.disabled}
        {...rest}
      >
        {item.icon && (
          <StyledListItemIcon>
            {item.icon}
          </StyledListItemIcon>
        )}
        <StyledListItemText primary={item.label} />
      </MuiMenuItem>
      {item.divider && <StyledDivider />}
    </>
  );
};

export default MenuItem; 