import React from 'react';
import MuiList from '@mui/material/List';
import { ListProps } from './types';
import { styled, useTheme } from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный компонент списка
const StyledList = styled(MuiList)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    backgroundColor: 'transparent',
    padding: tokens.spacing.sm,
    color: themeColors.textPrimary,
    fontFamily: tokens.typography.fontFamily,
    transition: tokens.transitions.duration.normal,
    
    '& .MuiListItem-root': {
      borderRadius: tokens.borderRadius.sm,
      
      '&:hover': {
        backgroundColor: themeColors.backgroundHover,
      },
    },
  };
});

/**
 * Компонент List - контейнер для элементов списка
 */
const List: React.FC<ListProps> = ({
  compact = false,
  disableGutters = false,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;

  return (
    <StyledList
      dense={compact}
      disablePadding={disableGutters}
      {...rest}
    >
      {children}
    </StyledList>
  );
};

export default List; 