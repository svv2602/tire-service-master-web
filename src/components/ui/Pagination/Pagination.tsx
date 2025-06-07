import React, { ChangeEvent } from 'react';
import {
  Pagination as MuiPagination,
  PaginationProps as MuiPaginationProps,
  styled
} from '@mui/material';

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

const StyledPagination = styled(MuiPagination)(({ theme }) => ({
  '& .MuiPagination-ul': {
    gap: theme.spacing(0.5),
  },
  '& .MuiPaginationItem-root': {
    margin: 0,
    borderRadius: theme.shape.borderRadius,
    '&.Mui-selected': {
      fontWeight: theme.typography.fontWeightMedium,
    },
  },
}));

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
        '& .MuiPaginationItem-root': {
          borderRadius: '8px',
        },
        ...props.sx
      }}
      {...props}
    />
  );
};

export default Pagination; 