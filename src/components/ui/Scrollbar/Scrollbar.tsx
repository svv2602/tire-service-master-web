import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tokens } from '../../../styles/theme/tokens';

// Стилизованный компонент с кастомным скроллбаром
const StyledScrollbar = styled(Box)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  const scrollbarThumbColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
  const scrollbarThumbHoverColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
  const scrollbarTrackColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  
  return {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%',
    transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut}`,
    
    // Стили для Firefox
    scrollbarWidth: 'thin',
    scrollbarColor: `${scrollbarThumbColor} ${scrollbarTrackColor}`,
    
    // Стили для Webkit (Chrome, Safari, Edge)
    '&::-webkit-scrollbar': {
      width: tokens.spacing.sm,
      backgroundColor: 'transparent',
    },
    
    '&::-webkit-scrollbar-thumb': {
      borderRadius: tokens.borderRadius.sm,
      backgroundColor: scrollbarThumbColor,
      transition: `background-color ${tokens.transitions.duration.fast} ${tokens.transitions.easing.easeInOut}`,
      
      '&:hover': {
        backgroundColor: scrollbarThumbHoverColor,
      },
    },
    
    '&::-webkit-scrollbar-track': {
      borderRadius: tokens.borderRadius.sm,
      backgroundColor: scrollbarTrackColor,
      margin: tokens.spacing.xxs,
    },
  };
});

export interface ScrollbarProps {
  /** Содержимое компонента */
  children: React.ReactNode;
  /** Максимальная высота контейнера */
  maxHeight?: number | string;
  /** Дополнительный класс */
  className?: string;
  /** Дополнительные стили */
  sx?: object;
}

/**
 * Компонент с кастомной полосой прокрутки
 * 
 * @example
 * ```tsx
 * <Scrollbar maxHeight={400}>
 *   <Typography>
 *     Длинный текст с прокруткой...
 *   </Typography>
 * </Scrollbar>
 * ```
 */
export const Scrollbar: React.FC<ScrollbarProps> = ({
  children,
  maxHeight,
  className,
  sx,
  ...props
}) => {
  return (
    <StyledScrollbar
      className={className}
      sx={{
        maxHeight,
        ...sx,
      }}
      {...props}
    >
      {children}
    </StyledScrollbar>
  );
};

export default Scrollbar; 