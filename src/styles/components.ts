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
      padding: theme.spacing(SIZES.spacing.xl),
      maxWidth: '100%',
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(SIZES.spacing.xl),
    },
    formCard: {
      background: theme.palette.background.paper,
      borderRadius: SIZES.borderRadius.md,
      padding: theme.spacing(SIZES.spacing.xl),
      border: `1px solid ${theme.palette.divider}`,
      backdropFilter: 'blur(10px)',
      boxShadow: theme.shadows[1],
    },
    paper: {
      background: theme.palette.background.paper,
      borderRadius: SIZES.borderRadius.md,
      padding: theme.spacing(SIZES.spacing.lg),
      border: `1px solid ${theme.palette.divider}`,
      backdropFilter: 'blur(10px)',
      boxShadow: theme.shadows[1],
    },
    title: {
      fontSize: SIZES.fontSize.xl,
      fontWeight: 600,
      mb: theme.spacing(3),
      color: theme.palette.text.primary,
    },
    section: {
      marginBottom: theme.spacing(SIZES.spacing.xl),
      '&:last-child': {
        marginBottom: 0,
      },
    },
    sectionTitle: {
      color: theme.palette.text.primary,
      fontWeight: 600,
      marginBottom: theme.spacing(2),
      fontSize: SIZES.fontSize.lg,
    },
    grid: {
      spacing: SIZES.spacing.lg,
    },
    field: {
      marginBottom: theme.spacing(SIZES.spacing.md),
    },
    switchField: {
      marginTop: theme.spacing(SIZES.spacing.md),
      marginBottom: theme.spacing(SIZES.spacing.lg),
    },
    checkboxLabel: {
      marginTop: theme.spacing(1),
    },
    divider: {
      my: theme.spacing(3),
      borderColor: theme.palette.divider,
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      padding: theme.spacing(SIZES.spacing.xl),
    },
    errorAlert: {
      mb: theme.spacing(3),
      borderRadius: SIZES.borderRadius.md,
    },
    actionsContainer: {
      mt: theme.spacing(3),
      display: 'flex',
      justifyContent: 'flex-end',
      gap: theme.spacing(2),
    },
    primaryButton: {
      ...getButtonStyles(theme, 'primary'),
    },
    secondaryButton: {
      ...getButtonStyles(theme, 'secondary'),
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

// Стили для контейнеров
export const getContainerStyles = (theme: Theme) => {
  return {
    centerContent: {
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pageContainer: {
      padding: theme.spacing(SIZES.spacing.lg),
      minHeight: '100vh',
    },
    sectionContainer: {
      padding: theme.spacing(SIZES.spacing.md),
      marginBottom: theme.spacing(SIZES.spacing.lg),
    },
  };
};

// Специальные стили для аутентификации
export const getAuthStyles = (theme: Theme) => {
  return {
    authCard: {
      ...getCardStyles(theme, 'primary'),
      padding: theme.spacing(4),
      width: '100%',
      maxWidth: 400,
    },
    authHeader: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: theme.spacing(3),
    },
    authIcon: {
      fontSize: 40,
      marginBottom: theme.spacing(1),
    },
    authField: {
      marginBottom: theme.spacing(2),
    },
    authSubmit: {
      ...getButtonStyles(theme, 'primary'),
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
      height: 48,
    },
    alert: {
      marginBottom: theme.spacing(3),
    },
    buttonProgress: {
      color: '#fff',
    },
  };
};

// Специальные стили для dashboard
export const getDashboardStyles = (theme: Theme) => {
  return {
    pageContainer: {
      padding: theme.spacing(3),
    },
    pageTitle: {
      marginBottom: theme.spacing(3),
      color: theme.palette.text.primary,
      fontWeight: 700,
    },
    statsContainer: {
      marginBottom: theme.spacing(4),
    },
    statsGrid: {
      spacing: 3,
    },
    chartCard: {
      ...getCardStyles(theme, 'primary'),
      padding: theme.spacing(2),
      height: '100%',
    },
    chartTitle: {
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
      fontWeight: 600,
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    },
    errorContainer: {
      padding: theme.spacing(3),
    },
    errorAlert: {
      marginBottom: theme.spacing(2),
    },
  };
};

// Специальные стили для страниц с таблицами и карточками
export const getTablePageStyles = (theme: Theme) => {
  return {
    // Основные контейнеры
    container: {
      padding: theme.spacing(SIZES.spacing.lg),
      maxWidth: '100%',
    },
    pageContainer: {
      padding: theme.spacing(1, 2),
      maxWidth: '100%',
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(SIZES.spacing.md),
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
    },
    
    // Заголовки
    title: {
      fontSize: SIZES.fontSize.xl,
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
    pageTitle: {
      color: theme.palette.text.primary,
      fontWeight: 700,
    },
    
    // Фильтры и поиск
    filtersContainer: {
      display: 'flex',
      gap: theme.spacing(SIZES.spacing.md),
      alignItems: 'center',
      flexWrap: 'wrap',
      width: '100%',
      marginBottom: theme.spacing(SIZES.spacing.md),
      paddingTop: theme.spacing(SIZES.spacing.md),
      paddingBottom: theme.spacing(SIZES.spacing.md),
    },
    searchContainer: {
      marginBottom: theme.spacing(2),
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.divider}`,
    },
    searchField: {
      minWidth: 300,
      flex: 1,
      '& .MuiOutlinedInput-root': {
        height: 40,
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      },
    },
    filterSelect: {
      minWidth: 120,
      '& .MuiOutlinedInput-root': {
        height: 40,
      },
    },
    
    // Таблицы
    tableContainer: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: 'none',
      borderRadius: 0,
      overflow: 'visible',
    },
    tableHeader: {
      backgroundColor: theme.palette.grey[50],
      '& .MuiTableCell-head': {
        fontWeight: 600,
        color: theme.palette.text.primary,
        padding: theme.spacing(2),
      },
    },
    tableRow: {
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '& .MuiTableCell-root': {
        padding: theme.spacing(1.5, 2),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '200px',
      },
    },
    tableCell: {
      padding: theme.spacing(1.5, 2),
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '200px',
    },
    tableCellWrap: {
      padding: theme.spacing(1.5, 2),
      whiteSpace: 'normal',
      wordBreak: 'break-word',
    },
    loadingCell: {
      padding: theme.spacing(4),
    },
    emptyCell: {
      padding: theme.spacing(4),
    },
    
    // Карточки
    card: {
      ...getCardStyles(theme, 'primary'),
      borderRadius: SIZES.borderRadius.md,
      border: `1px solid ${theme.palette.divider}`,
      backdropFilter: 'blur(10px)',
      boxShadow: theme.shadows[1],
    },
    cardTitle: {
      fontSize: SIZES.fontSize.lg,
      fontWeight: 500,
      marginBottom: theme.spacing(SIZES.spacing.xs),
      color: theme.palette.text.primary,
    },
    cardDescription: {
      fontSize: SIZES.fontSize.md,
      color: theme.palette.text.secondary,
      lineHeight: 1.5,
    },
    
    // Чипы и статусы
    statusChip: {
      borderRadius: SIZES.borderRadius.sm,
      fontWeight: 500,
      height: 24,
    },
    metricChip: {
      borderRadius: SIZES.borderRadius.sm,
      fontWeight: 500,
      height: 24,
      '& .MuiChip-icon': {
        fontSize: '16px !important',
      },
    },
    
    // Аватары и контейнеры
    avatarContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    actionsContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: theme.spacing(1),
    },
    
    // Пагинация
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme.spacing(SIZES.spacing.lg),
    },
    
    // Состояния загрузки и ошибок
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    },
    errorContainer: {
      padding: theme.spacing(3),
    },
    errorAlert: {
      marginBottom: theme.spacing(SIZES.spacing.md),
      borderRadius: SIZES.borderRadius.md,
    },
    
    // Пустое состояние
    emptyStateContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(SIZES.spacing.xl),
      marginTop: theme.spacing(SIZES.spacing.md),
      minHeight: '200px',
      backgroundColor: theme.palette.background.paper,
      borderRadius: SIZES.borderRadius.md,
      border: `1px solid ${theme.palette.divider}`,
    },
    emptyStateIcon: {
      fontSize: 64,
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(SIZES.spacing.md),
    },
    emptyStateTitle: {
      fontSize: SIZES.fontSize.lg,
      fontWeight: 500,
      marginBottom: theme.spacing(SIZES.spacing.sm),
      color: theme.palette.text.primary,
    },
    emptyStateDescription: {
      fontSize: SIZES.fontSize.md,
      color: theme.palette.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing(SIZES.spacing.md),
    },
    
    // Кнопки
    primaryButton: {
      ...getButtonStyles(theme, 'primary'),
    },
    secondaryButton: {
      ...getButtonStyles(theme, 'secondary'),
    },
    dangerButton: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    },
    createButton: {
      ...getButtonStyles(theme, 'primary'),
    },
    actionButton: {
      minWidth: 'auto',
      padding: theme.spacing(0.5),
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: `${theme.palette.primary.main}15`,
        color: theme.palette.primary.main,
      },
    },
    
    // Диалоги
    dialogPaper: {
      borderRadius: SIZES.borderRadius.md,
      backdropFilter: 'blur(10px)',
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
    },
    dialogTitle: {
      fontSize: SIZES.fontSize.lg,
      fontWeight: 600,
      paddingTop: theme.spacing(SIZES.spacing.md),
    },
    dialogText: {
      fontSize: SIZES.fontSize.md,
      color: theme.palette.text.secondary,
    },
    dialogActions: {
      padding: theme.spacing(SIZES.spacing.md),
      paddingTop: theme.spacing(SIZES.spacing.sm),
      gap: theme.spacing(SIZES.spacing.sm),
    },
    
    // Дополнительные элементы
    dateText: {
      fontSize: SIZES.fontSize.sm,
      color: theme.palette.text.secondary,
    },
  };
};
