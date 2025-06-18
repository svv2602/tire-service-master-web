import React from 'react';
import { Grid as MuiGrid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { GridProps } from './types';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный Grid с поддержкой темной темы и адаптивности
const StyledGrid = styled(MuiGrid)(({ theme }) => {
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
  // Создаем объект пропсов, которые передаем в MUI Grid
  const gridProps: any = {
    container,
    item,
    justifyContent,
    alignItems,
    xs,
    sm,
    md,
    lg,
    xl,
    className,
    ...props
  };

  // Добавляем пропсы только для container
  if (container) {
    gridProps.spacing = spacing;
    gridProps.direction = direction;
    gridProps.wrap = wrap;
  }

  return (
    <StyledGrid {...gridProps}>
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