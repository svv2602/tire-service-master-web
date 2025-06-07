import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Стилизованный компонент с кастомным скроллбаром
const StyledScrollbar = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  overflowX: 'hidden',
  height: '100%',
  
  // Стили для Firefox
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.palette.grey[400]} ${theme.palette.background.paper}`,
  
  // Стили для Webkit (Chrome, Safari, Edge)
  '&::-webkit-scrollbar': {
    width: '8px',
    backgroundColor: theme.palette.background.paper,
  },
  
  '&::-webkit-scrollbar-thumb': {
    borderRadius: '4px',
    backgroundColor: theme.palette.grey[400],
    
    '&:hover': {
      backgroundColor: theme.palette.grey[500],
    },
  },
  
  '&::-webkit-scrollbar-track': {
    borderRadius: '4px',
    backgroundColor: theme.palette.background.paper,
  },
}));

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