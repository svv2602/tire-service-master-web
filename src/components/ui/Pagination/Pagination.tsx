import React, { ChangeEvent } from 'react';
import {
  Pagination as MuiPagination,
  PaginationProps as MuiPaginationProps,
  styled,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

/** Пропсы пагинации */
export interface PaginationProps extends Omit<MuiPaginationProps, 'onChange'> {
  /** Текущая страница */
  page: number;
  /** Общее количество страниц */
  count: number;
  /** Колбэк изменения страницы */
  onChange: (page: number) => void;
  /** Размер */
  size?: 'small' | 'medium' | 'large';
  /** Форма кнопок */
  shape?: 'circular' | 'rounded';
  /** Вариант отображения */
  variant?: 'text' | 'outlined';
  /** Цвет */
  color?: 'primary' | 'secondary' | 'standard';
  /** Показывать границы страниц */
  showFirstButton?: boolean;
  /** Показывать границы страниц */
  showLastButton?: boolean;
  /** Отключено */
  disabled?: boolean;
}

const StyledPagination = styled(MuiPagination)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    '& .MuiPagination-ul': {
      gap: tokens.spacing.xs,
      fontFamily: tokens.typography.fontFamily,
    },
    
    '& .MuiPaginationItem-root': {
      margin: 0,
      borderRadius: tokens.borderRadius.md,
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize.sm,
      transition: tokens.transitions.duration.normal,
      
      '&.Mui-selected': {
        fontWeight: tokens.typography.fontWeight.medium,
        backgroundColor: theme.palette.mode === 'dark' 
          ? themeColors.primaryDark 
          : themeColors.primaryLight,
        color: theme.palette.mode === 'dark' 
          ? themeColors.textPrimary 
          : themeColors.primary,
      },
      
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.04)',
      },
      
      '&.Mui-disabled': {
        opacity: 0.5,
        color: themeColors.textSecondary,
      },
    },
    
    '& .MuiPaginationItem-page': {
      color: themeColors.textPrimary,
    },
    
    '& .MuiPaginationItem-icon': {
      fontSize: tokens.typography.fontSize.md,
      color: themeColors.textSecondary,
    },
    
    // Стили для различных вариантов
    '& .MuiPaginationItem-outlined': {
      border: `1px solid ${themeColors.borderPrimary}`,
      
      '&.Mui-selected': {
        border: `1px solid ${themeColors.primary}`,
      },
    },
    
    // Стили для разных размеров
    '& .MuiPaginationItem-sizeSmall': {
      minWidth: 28,
      height: 28,
      fontSize: tokens.typography.fontSize.xs,
    },
    
    '& .MuiPaginationItem-sizeLarge': {
      minWidth: 44,
      height: 44,
      fontSize: tokens.typography.fontSize.md,
    },
  };
});

/**
 * Компонент пагинации
 * 
 * @example
 * <Pagination
 *   page={currentPage}
 *   count={totalPages}
 *   onChange={handlePageChange}
 *   color="primary"
 * />
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  count,
  onChange,
  size = 'medium',
  shape = 'rounded',
  variant = 'text',
  color = 'primary',
  showFirstButton = false,
  showLastButton = false,
  disabled = false,
  ...props
}) => {
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  const handleChange = (_: ChangeEvent<unknown>, value: number) => {
    onChange(value);
  };

  return (
    <StyledPagination
      page={page}
      count={count}
      onChange={handleChange}
      size={size}
      shape={shape}
      variant={variant}
      color={color}
      showFirstButton={showFirstButton}
      showLastButton={showLastButton}
      disabled={disabled}
      sx={{
        ...props.sx
      }}
      {...props}
    />
  );
};

export default Pagination; 