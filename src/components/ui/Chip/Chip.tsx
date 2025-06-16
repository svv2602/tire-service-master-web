import React from 'react';
import {
  Chip as MuiChip,
  ChipProps as MuiChipProps,
  styled,
  useTheme
} from '@mui/material';
import { tokens } from '../../../styles/theme/tokens';

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

const StyledChip = styled(MuiChip)(({ theme }) => {
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
  
  return {
    borderRadius: tokens.borderRadius.pill,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: tokens.transitions.duration.normal,
    
    '&.MuiChip-filled': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? themeColors.backgroundSecondary 
        : themeColors.backgroundLight,
    },
    
    '&.MuiChip-outlined': {
      borderColor: theme.palette.mode === 'dark'
        ? themeColors.borderSecondary
        : themeColors.borderPrimary,
      backgroundColor: 'transparent',
    },
    
    '&.MuiChip-filledPrimary': {
      backgroundColor: themeColors.primary,
      color: '#fff',
    },
    
    '&.MuiChip-outlinedPrimary': {
      borderColor: themeColors.primary,
      color: themeColors.primary,
    },
    
    '&.MuiChip-filledSecondary': {
      backgroundColor: theme.palette.secondary.main,
      color: '#fff',
    },
    
    '&.MuiChip-outlinedSecondary': {
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
    },
    
    '&.MuiChip-filledError': {
      backgroundColor: themeColors.error,
      color: '#fff',
    },
    
    '&.MuiChip-outlinedError': {
      borderColor: themeColors.error,
      color: themeColors.error,
    },
    
    '&.MuiChip-filledSuccess': {
      backgroundColor: theme.palette.success.main,
      color: '#fff',
    },
    
    '&.MuiChip-outlinedSuccess': {
      borderColor: theme.palette.success.main,
      color: theme.palette.success.main,
    },
    
    '&.MuiChip-filledInfo': {
      backgroundColor: theme.palette.info.main,
      color: '#fff',
    },
    
    '&.MuiChip-outlinedInfo': {
      borderColor: theme.palette.info.main,
      color: theme.palette.info.main,
    },
    
    '&.MuiChip-filledWarning': {
      backgroundColor: theme.palette.warning.main,
      color: '#fff',
    },
    
    '&.MuiChip-outlinedWarning': {
      borderColor: theme.palette.warning.main,
      color: theme.palette.warning.main,
    },
    
    '& .MuiChip-label': {
      padding: `0 ${tokens.spacing.sm}`,
    },
    
    '& .MuiChip-icon': {
      color: 'inherit',
      marginLeft: tokens.spacing.xs,
      marginRight: -tokens.spacing.xxs,
    },
    
    '& .MuiChip-deleteIcon': {
      color: 'inherit',
      opacity: 0.7,
      transition: tokens.transitions.duration.normal,
      marginRight: tokens.spacing.xs,
      '&:hover': {
        opacity: 1,
        color: 'inherit',
      },
    },
    
    '&.MuiChip-sizeSmall': {
      height: 24,
      fontSize: tokens.typography.fontSize.xxs,
      
      '& .MuiChip-label': {
        padding: `0 ${tokens.spacing.xs}`,
      },
      
      '& .MuiChip-icon': {
        fontSize: tokens.typography.fontSize.sm,
      },
      
      '& .MuiChip-deleteIcon': {
        fontSize: tokens.typography.fontSize.sm,
      },
    },
  };
});

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
  const theme = useTheme();
  const themeColors = theme.palette.mode === 'dark' ? tokens.colors.dark : tokens.colors.light;
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
        '&:hover': {
          opacity: 0.9
        },
        ...props.sx
      }}
    />
  );
};

export default Chip; 