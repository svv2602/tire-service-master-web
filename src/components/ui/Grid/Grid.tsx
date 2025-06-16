import React from 'react';
import { Grid as MuiGrid, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { GridProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный Grid с поддержкой темной темы и адаптивности
const StyledGrid = styled(MuiGrid)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    display: 'flex',
    flexWrap: 'wrap',
    boxSizing: 'border-box',
    transition: tokens.transitions.duration.normal,
    
    '&.MuiGrid-container': {
      width: '100%',
      margin: 0,
      padding: tokens.spacing.sm,
    },
    
    '&.MuiGrid-item': {
      padding: tokens.spacing.sm,
    },
    
    // Адаптивные отступы для разных размеров экрана
    [theme.breakpoints.up('sm')]: {
      '&.MuiGrid-container': {
        padding: tokens.spacing.sm,
      },
      '&.MuiGrid-item': {
        padding: tokens.spacing.sm,
      },
    },
    
    [theme.breakpoints.up('md')]: {
      '&.MuiGrid-container': {
        padding: tokens.spacing.md,
      },
      '&.MuiGrid-item': {
        padding: tokens.spacing.md,
      },
    },
  };
});

/**
 * Универсальный компонент Grid для создания адаптивных макетов
 */
export const Grid: React.FC<GridProps> = ({
  children,
  container = false,
  item = false,
  spacing = 2,
  justifyContent = 'flex-start',
  alignItems = 'flex-start',
  direction = 'row',
  wrap = 'wrap',
  xs,
  sm,
  md,
  lg,
  xl,
  className,
  ...props
}) => {
  const theme = useTheme();

  return (
    <StyledGrid
      container={container}
      item={item}
      spacing={spacing}
      justifyContent={justifyContent}
      alignItems={alignItems}
      direction={direction}
      wrap={wrap}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      className={className}
      {...props}
    >
      {children}
    </StyledGrid>
  );
};

/**
 * Контейнер Grid с предустановленными свойствами
 */
export const GridContainer: React.FC<Omit<GridProps, 'container' | 'item'>> = (props) => (
  <Grid container {...props} />
);

/**
 * Элемент Grid с предустановленными свойствами
 */
export const GridItem: React.FC<Omit<GridProps, 'container' | 'item'>> = (props) => (
  <Grid item {...props} />
);