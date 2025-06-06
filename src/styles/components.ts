// styles/components.ts
// Переиспользуемые стили для компонентов

import { Theme, SxProps } from '@mui/material';
import { 
  SIZES, 
  ANIMATIONS, 
  GRADIENTS, 
  THEME_COLORS,
  getThemeColors,
  getGradient
} from './theme';
import { getTabStyles as getTabStylesInternal } from './components/tabStyles';

export { getTabStylesInternal as getTabStyles };

// Типы для стилей компонентов
export type CardVariant = 'primary' | 'secondary' | 'glass' | 'success' | 'error' | 'warning' | 'info' | 'alert';
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error';
export type ChipVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type TextFieldVariant = 'filled' | 'minimal' | 'glass';

// Стили для карточек
export const getCardStyles = (theme: Theme, variant: CardVariant = 'primary'): SxProps<Theme> => {
  const colors = getThemeColors(theme);
  
  const baseStyles = {
    borderRadius: SIZES.borderRadius.sm,
    transition: ANIMATIONS.transition.medium,
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    border: `1px solid ${theme.palette.divider}`,
  };

  const styles = {
    primary: {
      ...baseStyles,
      background: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      padding: theme.spacing(SIZES.spacing.lg),
      '&:hover': {
        boxShadow: theme.shadows[2],
      },
    },
    secondary: {
      ...baseStyles,
      background: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.01)',
      boxShadow: 'none',
      padding: theme.spacing(SIZES.spacing.lg),
      '&:hover': {
        background: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(0, 0, 0, 0.02)',
      },
    },
    glass: {
      ...baseStyles,
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(255, 255, 255, 0.8)',
      boxShadow: theme.shadows[1],
      padding: theme.spacing(SIZES.spacing.lg),
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      '&:hover': {
        boxShadow: theme.shadows[2],
      },
    },
    success: {
      ...baseStyles,
      background: colors.successBg,
      borderColor: colors.success,
      color: colors.success,
      padding: theme.spacing(SIZES.spacing.lg),
    },
    error: {
      ...baseStyles,
      background: colors.errorBg,
      borderColor: colors.error,
      color: colors.error,
      padding: theme.spacing(SIZES.spacing.lg),
    },
    warning: {
      ...baseStyles,
      background: colors.warningBg,
      borderColor: colors.warning,
      color: colors.warning,
      padding: theme.spacing(SIZES.spacing.lg),
    },
    info: {
      ...baseStyles,
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(0, 0, 0, 0.02)',
      color: colors.textPrimary,
      padding: theme.spacing(SIZES.spacing.lg),
    },
    alert: {
      ...baseStyles,
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.01)',
      boxShadow: 'none',
      padding: theme.spacing(SIZES.spacing.lg),
    },
  };

  return styles[variant] || styles.primary;
};

// Стили для кнопок
export const getButtonStyles = (theme: Theme, variant: ButtonVariant = 'primary'): SxProps<Theme> => {
  const colors = getThemeColors(theme);
  
  const baseStyles = {
    borderRadius: SIZES.borderRadius.sm,
    transition: ANIMATIONS.transition.medium,
    textTransform: 'none' as const,
    fontWeight: 500,
    letterSpacing: '0.02em',
    padding: theme.spacing(1, 3),
  };

  const styles = {
    primary: {
      ...baseStyles,
      background: GRADIENTS.primary,
      color: '#fff',
      boxShadow: theme.shadows[1],
      border: 'none',
      '&:hover': {
        background: GRADIENTS.primary,
        filter: 'brightness(1.1)',
        boxShadow: theme.shadows[2],
      },
      '&:active': {
        boxShadow: theme.shadows[1],
        filter: 'brightness(0.95)',
      },
    },
    secondary: {
      ...baseStyles,
      background: 'transparent',
      border: `1px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
      '&:hover': {
        background: theme.palette.mode === 'dark'
          ? 'rgba(25, 118, 210, 0.08)'
          : 'rgba(25, 118, 210, 0.04)',
      },
    },
    success: {
      ...baseStyles,
      background: colors.success,
      color: '#fff',
      '&:hover': {
        background: theme.palette.success.dark,
      },
    },
    error: {
      ...baseStyles,
      background: colors.error,
      color: '#fff',
      '&:hover': {
        background: theme.palette.error.dark,
      },
    },
  };

  return styles[variant] || styles.primary;
};

// Стили для текстовых полей
export const getTextFieldStyles = (theme: Theme, variant: TextFieldVariant = 'filled') => {
  const baseStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: SIZES.borderRadius.sm,
      transition: ANIMATIONS.transition.medium,
    },
  };

  const styles = {
    filled: {
      ...baseStyles,
      '& .MuiOutlinedInput-root': {
        ...baseStyles['& .MuiOutlinedInput-root'],
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.02)'
          : 'rgba(0, 0, 0, 0.01)',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(0, 0, 0, 0.02)',
        },
        '&.Mui-focused': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.04)'
            : 'rgba(0, 0, 0, 0.03)',
        },
      },
    },
    minimal: {
      ...baseStyles,
      '& .MuiOutlinedInput-root': {
        ...baseStyles['& .MuiOutlinedInput-root'],
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.02)'
            : 'rgba(0, 0, 0, 0.01)',
        },
      },
    },
    glass: {
      ...baseStyles,
      '& .MuiOutlinedInput-root': {
        ...baseStyles['& .MuiOutlinedInput-root'],
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      },
    },
  };

  return styles[variant] || styles.filled;
};

// Стили для чипов
export const getChipStyles = (theme: Theme, variant: ChipVariant = 'primary'): SxProps<Theme> => {
  const colors = getThemeColors(theme);
  
  const baseStyles = {
    borderRadius: SIZES.borderRadius.sm,
    transition: ANIMATIONS.transition.medium,
    fontWeight: 500,
    height: 24,
  };

  const styles = {
    primary: {
      ...baseStyles,
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
      color: colors.textPrimary,
    },
    success: {
      ...baseStyles,
      background: colors.successBg,
      color: colors.success,
    },
    warning: {
      ...baseStyles,
      background: colors.warningBg,
      color: colors.warning,
    },
    error: {
      ...baseStyles,
      background: colors.errorBg,
      color: colors.error,
    },
    info: {
      ...baseStyles,
      background: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
      color: colors.textPrimary,
    },
  };

  return styles[variant] || styles.primary;
};

// Стили для таблиц
export const getTableStyles = (theme: Theme) => {
  const colors = getThemeColors(theme);
  
  return {
    tableContainer: {
      borderRadius: SIZES.borderRadius.md,
      background: theme.palette.background.paper,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${theme.palette.divider}`,
      overflow: 'hidden',
    },
    tableHead: {
      backgroundColor: theme.palette.background.default,
      '& .MuiTableCell-head': {
        color: theme.palette.text.primary,
        fontWeight: 700,
        borderBottom: `2px solid ${theme.palette.divider}`,
      },
    },
    tableRow: {
      background: theme.palette.background.paper,
      transition: ANIMATIONS.transition.fast,
      '&:hover': {
        background: theme.palette.action.hover,
      },
    },
    tableCell: {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  };
};

// Стили для форм
export const getFormStyles = (theme: Theme) => {
  return {
    container: {
      background: theme.palette.background.paper,
      borderRadius: SIZES.borderRadius.md,
      padding: theme.spacing(SIZES.spacing.lg),
      border: `1px solid ${theme.palette.divider}`,
      backdropFilter: 'blur(10px)',
    },
    section: {
      marginBottom: theme.spacing(SIZES.spacing.xl),
      '&:last-child': {
        marginBottom: 0,
      },
    },
    sectionTitle: {
      color: theme.palette.text.primary,
      fontWeight: 700,
      marginBottom: theme.spacing(SIZES.spacing.md),
      borderBottom: `2px solid ${theme.palette.divider}`,
      paddingBottom: theme.spacing(SIZES.spacing.sm),
    },
    grid: {
      spacing: SIZES.spacing.lg,
    },
    field: {
      marginBottom: theme.spacing(SIZES.spacing.md),
    },
  };
};

// Стили для модальных окон
export const getModalStyles = (theme: Theme) => ({
  paper: {
    borderRadius: SIZES.borderRadius.lg,
    padding: theme.spacing(SIZES.spacing.lg),
    backdropFilter: 'blur(10px)',
    background: theme.palette.mode === 'dark' 
      ? 'rgba(30, 30, 46, 0.9)'
      : 'rgba(255, 255, 255, 0.9)',
    boxShadow: theme.shadows[5],
  },
  overlay: {
    backdropFilter: 'blur(5px)',
  },
});

// Стили для навигации
export const getNavigationStyles = (theme: Theme) => {
  return {
    drawer: {
      width: 280,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: 280,
        boxSizing: 'border-box',
        background: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      },
    },
    listItem: {
      borderRadius: SIZES.borderRadius.sm,
      margin: theme.spacing(0.5, 1),
      transition: ANIMATIONS.transition.fast,
      '&.Mui-selected': {
        background: theme.palette.primary.main + '20',
        color: theme.palette.primary.main,
        '&:hover': {
          background: theme.palette.primary.main + '30',
        },
      },
      '&:hover': {
        background: theme.palette.action.hover,
      },
    },
    listItemIcon: {
      minWidth: 40,
      '&.Mui-selected': {
        color: theme.palette.primary.main,
      },
    },
  };
};
