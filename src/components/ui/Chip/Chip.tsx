import React from 'react';
import {
  Chip as MuiChip,
  ChipProps as MuiChipProps,
  styled
} from '@mui/material';

/** Пропсы чипа */
export interface ChipProps extends Omit<MuiChipProps, 'onDelete'> {
  /** Текст */
  label: string;
  /** Иконка */
  icon?: React.ReactElement;
  /** Вариант отображения */
  variant?: 'filled' | 'outlined';
  /** Размер */
  size?: 'small' | 'medium';
  /** Цвет */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /** Можно ли удалить */
  deletable?: boolean;
  /** Колбэк удаления */
  onDelete?: () => void;
  /** Обработчик клика */
  onClick?: () => void;
  /** Отключен */
  disabled?: boolean;
}

const StyledChip = styled(MuiChip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '&.MuiChip-filled': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[200],
  },
  '&.MuiChip-outlined': {
    borderColor: theme.palette.mode === 'dark'
      ? theme.palette.grey[700]
      : theme.palette.grey[300],
  },
  '& .MuiChip-deleteIcon': {
    color: 'inherit',
    opacity: 0.7,
    '&:hover': {
      opacity: 1,
    },
  },
}));

/**
 * Компонент чипа/тега
 * 
 * @example
 * <Chip
 *   label="Тег"
 *   color="primary"
 *   deletable
 *   onDelete={handleDelete}
 * />
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  variant = 'filled',
  size = 'medium',
  color = 'default',
  deletable = false,
  onDelete,
  onClick,
  disabled = false,
  ...props
}) => {
  return (
    <StyledChip
      label={label}
      icon={icon}
      variant={variant}
      size={size}
      color={color}
      onDelete={deletable ? onDelete : undefined}
      onClick={onClick}
      disabled={disabled}
      sx={{
        borderRadius: '16px',
        '&:hover': {
          opacity: 0.9
        },
        ...props.sx
      }}
    />
  );
};

export default Chip; 