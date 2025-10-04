// styles/components.ts
// Переиспользуемые стили для компонентов

import { Theme, SxProps } from '@mui/material';
import { 
  SIZES, 
  ANIMATIONS, 
  GRADIENTS,
  getThemeColors
} from './theme';
import { getTabStyles as getTabStylesInternal } from './components/tabStyles';

export { getTabStylesInternal as getTabStyles };

// =====================================================
// ВАЖНО: Этот файл является АЛИАСОМ для theme.ts
// Все стилевые функции теперь импортируются из theme.ts
// для устранения дублирования и единого источника истины
// =====================================================

// Реэкспорт всех стилевых функций из theme.ts
export {
  // Типы
  type GradientType,
  
  // Константы
  THEME_COLORS,
  SIZES,
  ANIMATIONS,
  GRADIENTS,
  TYPOGRAPHY,
  SHADOWS,
  
  // Утилиты
  getThemeColors,
  getGradient,
  createAppTheme,
  
  // Стилевые функции - ЕДИНСТВЕННЫЙ ИСТОЧНИК ИСТИНЫ
  getButtonStyles,
  getNavigationStyles,
  getUserButtonStyles,
  getInteractiveStyles,
  getTableStyles,
  getAdaptiveTableStyles,
} from './theme';

// Дополнительные типы для обратной совместимости
export type CardVariant = 'primary' | 'secondary' | 'glass' | 'success' | 'error' | 'warning' | 'info' | 'alert';
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error';
export type ChipVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type TextFieldVariant = 'filled' | 'minimal' | 'glass';

// Функции специфичные для components.ts (не дублирующиеся с theme.ts)

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
      justifyContent: 'space-between',
      gap: theme.spacing(2),
    },
    primaryButton: {
      ...getButtonStyles(theme, 'primary'),
    },
    secondaryButton: {
      ...getButtonStyles(theme, 'secondary'),
    },
    pageContainer: {
      maxWidth: 1000,
      margin: '0 auto',
      padding: theme.spacing(SIZES.spacing.lg),
    },
    pageTitle: {
      fontSize: SIZES.fontSize.xl,
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
    backButton: {
      marginRight: theme.spacing(SIZES.spacing.md),
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    switchContainer: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
    },
    logoPreview: {
      width: 100,
      height: 100,
      border: `2px solid ${theme.palette.divider}`,
    },
    logoError: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: SIZES.borderRadius.md,
    },
    logoPlaceholder: {
      width: 100,
      height: 100,
      bgcolor: theme.palette.grey[200],
      border: `2px solid ${theme.palette.divider}`,
    },
    logoActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(SIZES.spacing.sm),
    },
    helperText: {
      marginTop: theme.spacing(SIZES.spacing.sm),
      display: 'block',
      fontSize: SIZES.fontSize.sm,
      color: theme.palette.text.secondary,
    },
    errorText: {
      marginTop: theme.spacing(SIZES.spacing.sm),
      display: 'block',
      fontSize: SIZES.fontSize.sm,
      color: theme.palette.error.main,
    },
    sectionDivider: {
      marginY: theme.spacing(SIZES.spacing.xl),
      borderColor: theme.palette.divider,
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
      background: theme.palette.background.paper,
      borderRadius: SIZES.borderRadius.sm,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[1],
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
      background: theme.palette.background.paper,
      borderRadius: SIZES.borderRadius.sm,
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(2),
      height: '100%',
      boxShadow: theme.shadows[1],
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
      overflowWrap: 'break-word',
      hyphens: 'auto',
      wordWrap: 'break-word', // Для старых браузеров
    },
    loadingCell: {
      padding: theme.spacing(4),
    },
    emptyCell: {
      padding: theme.spacing(4),
    },
    
    // Карточки
    card: {
      background: theme.palette.background.paper,
      borderRadius: SIZES.borderRadius.md,
      border: `1px solid ${theme.palette.divider}`,
      backdropFilter: 'blur(10px)',
      boxShadow: theme.shadows[1],
      padding: theme.spacing(SIZES.spacing.lg),
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
