// styles/theme.ts
// Централизованная система стилей для обеспечения единообразия

import { Theme, createTheme, ThemeOptions } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';

/** Цвета темы */
export const THEME_COLORS = {
  primary: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
  },
  secondary: {
    light: '#FF4081',
    main: '#F50057',
    dark: '#C51162',
  },
  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
  },
  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },
  info: {
    light: '#4FC3F7',
    main: '#03A9F4',
    dark: '#0288D1',
  },
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  dark: {
    // Основные цвета
    primary: '#e0e0e0',
    primaryDark: '#212121',
    primaryLight: '#f5f5f5',
    
    // Фоны
    backgroundPrimary: 'rgba(18, 18, 18, 0.98)',
    backgroundSecondary: 'rgba(28, 28, 28, 0.98)',
    backgroundCard: 'rgba(33, 33, 33, 0.95)',
    backgroundField: 'rgba(255, 255, 255, 0.05)',
    backgroundHover: 'rgba(255, 255, 255, 0.05)',
    backgroundError: 'rgba(244, 67, 54, 0.15)',
    // Фон для таблиц - "мокрый асфальт"
    backgroundTable: 'rgba(45, 45, 48, 0.95)', // Темно-серый как мокрый асфальт
    backgroundTableRow: 'rgba(52, 52, 56, 0.8)', // Чуть светлее для строк
    backgroundTableHeader: 'rgba(38, 38, 42, 0.95)', // Темнее для заголовков
    
    // Градиенты
    gradientSecondary: 'linear-gradient(135deg, rgba(28, 28, 28, 0.98), rgba(18, 18, 18, 0.98))',
    
    // Текст
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    
    // Рамки
    borderPrimary: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.15)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    border: 'rgba(255, 255, 255, 0.1)',
    
    // Состояния
    success: '#66bb6a',
    successBg: 'rgba(76, 175, 80, 0.15)',
    warning: '#ffa726',
    warningBg: 'rgba(255, 193, 7, 0.15)',
    error: '#ef5350',
    errorBg: 'rgba(244, 67, 54, 0.15)',
    
    // Тени
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    shadowMedium: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.4)',
  },
  light: {
    // Основные цвета
    primary: '#424242',
    primaryDark: '#212121',
    primaryLight: '#757575',
    
    // Фоны
    backgroundPrimary: 'rgba(255, 255, 255, 1)',
    backgroundSecondary: 'rgba(250, 250, 250, 1)',
    backgroundCard: 'rgba(255, 255, 255, 1)',
    backgroundField: 'rgba(0, 0, 0, 0.02)',
    backgroundHover: 'rgba(0, 0, 0, 0.04)',
    backgroundError: 'rgba(244, 67, 54, 0.05)',
    // Фон для таблиц в светлой теме
    backgroundTable: 'rgba(255, 255, 255, 1)', // Белый фон
    backgroundTableRow: 'rgba(248, 249, 250, 1)', // Очень светло-серый для строк
    backgroundTableHeader: 'rgba(242, 244, 246, 1)', // Светло-серый для заголовков
    
    // Градиенты
    gradientSecondary: 'linear-gradient(135deg, rgba(250, 250, 250, 1), rgba(255, 255, 255, 1))',
    
    // Текст
    textPrimary: '#212121',
    textSecondary: 'rgba(0, 0, 0, 0.7)',
    textMuted: 'rgba(0, 0, 0, 0.5)',
    
    // Рамки
    borderPrimary: 'rgba(0, 0, 0, 0.1)',
    borderSecondary: 'rgba(0, 0, 0, 0.15)',
    borderHover: 'rgba(0, 0, 0, 0.2)',
    border: 'rgba(0, 0, 0, 0.1)',
    
    // Состояния
    success: '#43a047',
    successBg: 'rgba(76, 175, 80, 0.05)',
    warning: '#f57c00',
    warningBg: 'rgba(255, 193, 7, 0.05)',
    error: '#d32f2f',
    errorBg: 'rgba(244, 67, 54, 0.05)',
    
    // Тени
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
    shadowDark: 'rgba(0, 0, 0, 0.12)',
  },
};

/** Размеры */
export const SIZES = {
  borderRadius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
  },
  icon: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
  // Новые константы для улучшенного дизайна
  navigation: {
    width: 280,
    widthCollapsed: 72,
    sectionTitleHeight: 44,
    itemHeight: 48,
  },
  userButton: {
    height: 40,
    borderRadius: 20,
    padding: 12,
  },
  scrollbar: {
    width: 8,
    borderRadius: 4,
  },
  transitions: {
    fast: '0.2s ease-in-out',
    medium: '0.3s ease-in-out', 
    slow: '0.5s ease-in-out',
    cubic: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

/** Анимации */
export const ANIMATIONS = {
  fadeIn: keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `,
  slideIn: keyframes`
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  zoomIn: keyframes`
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,
  transition: {
    fast: '150ms',
    medium: '300ms',
    slow: '500ms',
    cubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    fast: 200,
    medium: 300,
    slow: 500,
  },
  fade: {
    enter: 'fade-enter',
    enterActive: 'fade-enter-active',
    exit: 'fade-exit',
    exitActive: 'fade-exit-active',
  },
  slideDown: '@keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
  scaleIn: '@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
  pulse: '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }',
};

// Утилита для получения цветов темы
export const getThemeColors = (theme: Theme) => {
  const isDark = theme.palette.mode === 'dark';
  return isDark ? THEME_COLORS.dark : THEME_COLORS.light;
};

// Типы градиентов
export type GradientType = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'glass';

// Градиенты (адаптированы под существующую тему)
export const GRADIENTS: Record<GradientType, string> = {
  primary: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)', // Основной цвет проекта
  secondary: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)', // Вторичный цвет проекта
  success: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
  error: 'linear-gradient(45deg, #d32f2f 30%, #ef5350 90%)',
  warning: 'linear-gradient(45deg, #f57c00 30%, #ffa726 90%)',
  info: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
};

// Утилита для получения градиентов
export const getGradient = (theme: Theme, type: GradientType = 'primary') => {
  const isDark = theme.palette.mode === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  
  if (type === 'primary') {
    return `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`;
  }
  
  return colors.gradientSecondary;
};

// Стили для кнопок
export const getButtonStyles = (theme: Theme, variant: 'primary' | 'secondary' | 'success' | 'error' = 'primary') => {
  const colors = getThemeColors(theme);
  
  const baseStyles = {
    borderRadius: SIZES.borderRadius.sm,
    transition: ANIMATIONS.transition.medium,
    textTransform: 'none' as const,
    fontWeight: 500,
    letterSpacing: '0.02em',
  };

  const styles = {
    primary: {
      ...baseStyles,
      background: colors.primary,
      color: theme.palette.mode === 'dark' ? '#000' : '#fff',
      boxShadow: theme.shadows[1],
      '&:hover': {
        background: colors.primaryDark,
        boxShadow: theme.shadows[2],
      },
      '&:active': {
        boxShadow: theme.shadows[1],
      },
    },
    secondary: {
      ...baseStyles,
      background: 'transparent',
      border: `1px solid ${colors.borderSecondary}`,
      color: colors.textPrimary,
      '&:hover': {
        background: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.05)',
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

// Стили для навигации с улучшениями
export const getNavigationStyles = (theme: Theme) => {
  const colors = getThemeColors(theme);
  
  return {
    // Стили для контейнера навигации
    container: {
      width: SIZES.navigation.width,
      backgroundColor: theme.palette.background.paper,
      borderRight: `1px solid ${theme.palette.divider}`,
      transition: ANIMATIONS.transition.medium,
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      // Улучшенная полоса прокрутки
      '&::-webkit-scrollbar': {
        width: SIZES.scrollbar.width,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
        borderRadius: SIZES.scrollbar.borderRadius,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(0, 0, 0, 0.3)',
        borderRadius: SIZES.scrollbar.borderRadius,
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.5)' 
            : 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
    
    // Улучшенные стили для элементов списка
    listItem: {
      padding: `${theme.spacing(SIZES.spacing.xs)} ${theme.spacing(SIZES.spacing.sm)}`,
      minHeight: SIZES.navigation.itemHeight,
      borderRadius: 0, // Убираем закругления как просил пользователь
      margin: 0,
      transition: ANIMATIONS.transition.medium,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: 'transparent',
        transition: ANIMATIONS.transition.fast,
      },
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateX(2px)',
        '&::before': {
          backgroundColor: theme.palette.primary.main,
        },
      },
    },
    
    // Стили для активного элемента
    listItemActive: {
      backgroundColor: `${theme.palette.primary.main}15`, // Прозрачный фон
      color: theme.palette.primary.main,
      fontWeight: 600,
      '&::before': {
        backgroundColor: theme.palette.primary.main,
      },
    },
    
    // Стили для иконок
    listItemIcon: {
      color: colors.textSecondary,
      minWidth: 40,
      transition: ANIMATIONS.transition.medium,
    },
    
    // Стили для заголовков разделов
    sectionTitle: {
      fontSize: SIZES.fontSize.lg, // Увеличиваем шрифт как просил пользователь
      fontWeight: 700,
      height: SIZES.navigation.sectionTitleHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${theme.spacing(SIZES.spacing.sm)} ${theme.spacing(SIZES.spacing.md)}`,
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(0, 0, 0, 0.03)',
      borderRadius: 0,
      margin: 0,
      cursor: 'pointer',
      transition: ANIMATIONS.transition.medium,
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.05)',
      },
    },
  };
};

// Улучшенные стили для кнопки пользователя
export const getUserButtonStyles = (theme: Theme) => {
  const colors = getThemeColors(theme);
  
  return {
    // Основная кнопка пользователя
    primary: {
      height: SIZES.userButton.height,
      borderRadius: SIZES.userButton.borderRadius,
      padding: `0 ${SIZES.userButton.padding}px`,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      transition: ANIMATIONS.transition.medium,
      textTransform: 'none' as const,
      fontSize: SIZES.fontSize.md,
      fontWeight: 500,
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    },
    
    // Меню пользователя
    menu: {
      '& .MuiPaper-root': {
        borderRadius: SIZES.borderRadius.lg,
        backgroundColor: theme.palette.background.paper,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[8],
        minWidth: 200,
        animation: `${ANIMATIONS.slideDown} ${ANIMATIONS.duration.fast}ms ${ANIMATIONS.transition.cubic}`,
      },
      '& .MuiMenuItem-root': {
        borderRadius: SIZES.borderRadius.sm,
        margin: `${theme.spacing(SIZES.spacing.xs)} ${theme.spacing(SIZES.spacing.sm)}`,
        transition: ANIMATIONS.transition.fast,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          transform: 'translateX(4px)',
        },
      },
    },
  };
};

// Функция для создания стилей с эффектами
export const getInteractiveStyles = (theme: Theme) => {
  return {
    // Эффект при наведении с микроанимацией
    hoverLift: {
      transition: ANIMATIONS.transition.medium,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
      },
    },
    
    // Эффект нажатия
    pressEffect: {
      transition: ANIMATIONS.transition.fast,
      '&:active': {
        transform: 'scale(0.98)',
      },
    },
    
    // Эффект пульсации для важных элементов
    pulse: {
      animation: `${ANIMATIONS.pulse} 2s infinite`,
    },
    
    // Эффект появления
    fadeIn: {
      animation: `${ANIMATIONS.fadeIn} ${ANIMATIONS.duration.medium}ms ${ANIMATIONS.transition.cubic}`,
    },
    
    // Стеклянный эффект
    glass: {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${theme.palette.divider}`,
    },
  };
};

// Стили для таблиц в темной теме "мокрый асфальт"
export const getTableStyles = (theme: Theme) => {
  const colors = getThemeColors(theme);
  
  return {
    // Контейнер таблицы (исправлено название)
    tableContainer: {
      backgroundColor: colors.backgroundTable,
      borderRadius: SIZES.borderRadius.xs, // Минимальные закругления как у пользователей
      border: `1px solid ${colors.borderPrimary}`,
      overflow: 'hidden',
      boxShadow: theme.shadows[1],
    },
    
    // Основная таблица
    table: {
      backgroundColor: colors.backgroundTable,
    },
    
    // Заголовки таблицы (исправлено название)
    tableHead: {
      backgroundColor: colors.backgroundTableHeader,
      '& .MuiTableCell-root': {
        backgroundColor: colors.backgroundTableHeader,
        color: colors.textPrimary,
        fontWeight: 600,
        fontSize: SIZES.fontSize.md,
        borderBottom: `2px solid ${colors.borderPrimary}`,
      },
    },
    
    // Строки тела таблицы (исправлено название)
    tableRow: {
      backgroundColor: colors.backgroundTable,
      '&:nth-of-type(even)': {
        backgroundColor: colors.backgroundTableRow,
      },
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      },
      transition: ANIMATIONS.transition.fast,
    },
    
    // Ячейки таблицы (исправлено название)
    tableCell: {
      color: colors.textPrimary,
      borderBottom: `1px solid ${colors.borderPrimary}`,
      padding: '12px',
      fontSize: SIZES.fontSize.md,
    },
    
    // Ячейки с переносом слов
    tableCellWrap: {
      color: colors.textPrimary,
      borderBottom: `1px solid ${colors.borderPrimary}`,
      padding: '12px',
      fontSize: SIZES.fontSize.md,
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      hyphens: 'auto',
      wordWrap: 'break-word', // Для старых браузеров
    },
    
    // Оставляю старые названия для обратной совместимости
    container: {
      backgroundColor: colors.backgroundTable,
      borderRadius: SIZES.borderRadius.xs, // Минимальные закругления
      border: `1px solid ${colors.borderPrimary}`,
      overflow: 'hidden',
      boxShadow: theme.shadows[1],
    },
    
    header: {
      backgroundColor: colors.backgroundTableHeader,
      color: colors.textPrimary,
      fontWeight: 600,
      fontSize: SIZES.fontSize.md,
      padding: '16px 12px',
      borderBottom: `2px solid ${colors.borderPrimary}`,
    },
    
    row: {
      backgroundColor: colors.backgroundTable,
      '&:nth-of-type(even)': {
        backgroundColor: colors.backgroundTableRow,
      },
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      },
      transition: ANIMATIONS.transition.fast,
    },
    
    cell: {
      color: colors.textPrimary,
      borderBottom: `1px solid ${colors.borderPrimary}`,
      padding: '12px',
      fontSize: SIZES.fontSize.md,
    },
    
    // Ячейки с переносом слов (для обратной совместимости)
    cellWrap: {
      color: colors.textPrimary,
      borderBottom: `1px solid ${colors.borderPrimary}`,
      padding: '12px',
      fontSize: SIZES.fontSize.md,
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      hyphens: 'auto',
      wordWrap: 'break-word', // Для старых браузеров
    },
    
    // Статусные ячейки (например, "Доступно")
    statusCell: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Статусные чипы
    statusChip: {
      borderRadius: SIZES.borderRadius.xl,
      padding: '4px 12px',
      fontSize: SIZES.fontSize.sm,
      fontWeight: 600,
      minWidth: '80px',
      textAlign: 'center',
    },
    
    // Статус "Доступно"
    statusAvailable: {
      backgroundColor: colors.successBg,
      color: colors.success,
    },
    
    // Статус "Недоступно"
    statusUnavailable: {
      backgroundColor: colors.errorBg,
      color: colors.error,
    },
    
    // Статус "Ожидание"
    statusPending: {
      backgroundColor: colors.warningBg,
      color: colors.warning,
    },
  };
};

// Адаптивная функция для таблиц с горизонтальной прокруткой
export const getAdaptiveTableStyles = (theme: Theme, isMobile: boolean = false, isTablet: boolean = false) => {
  const baseStyles = getTableStyles(theme);
  const colors = getThemeColors(theme);
  
  return {
    ...baseStyles,
    
    // Адаптивный контейнер таблицы
    tableContainer: {
      ...baseStyles.tableContainer,
      // Горизонтальная прокрутка для адаптивности
      overflowX: 'auto',
      width: '100%',
      // Улучшенная прокрутка на мобильных и планшетах
      ...(isMobile || isTablet) && {
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.4)' 
            : 'rgba(0, 0, 0, 0.4)',
          borderRadius: 4,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.6)' 
              : 'rgba(0, 0, 0, 0.6)',
          },
        },
      },
    },
    
    // Адаптивная таблица
    table: {
      ...baseStyles.table,
      // Минимальная ширина для горизонтальной прокрутки
      minWidth: isMobile ? 800 : isTablet ? 600 : 'auto',
      '& .MuiTableCell-root': {
        // Запрещаем перенос текста
        whiteSpace: 'nowrap',
        // Адаптивный padding
        ...(isMobile && {
          padding: '8px 12px',
          fontSize: SIZES.fontSize.sm,
        }),
        ...(isTablet && !isMobile && {
          padding: '10px 12px',
          fontSize: SIZES.fontSize.sm,
        }),
      },
    },
    
    // Адаптивная пагинация
    pagination: {
      borderTop: `1px solid ${colors.borderPrimary}`,
      // Адаптивность пагинации для мобильных
      ...(isMobile && {
        '& .MuiTablePagination-toolbar': {
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '8px',
          padding: '16px 8px',
        },
        '& .MuiTablePagination-spacer': {
          display: 'none',
        },
        '& .MuiTablePagination-selectLabel': {
          margin: 0,
          fontSize: SIZES.fontSize.sm,
        },
        '& .MuiTablePagination-displayedRows': {
          margin: 0,
          fontSize: SIZES.fontSize.sm,
        },
        '& .MuiTablePagination-actions': {
          marginLeft: 0,
        },
      }),
      '& .MuiTablePagination-select': {
        fontSize: SIZES.fontSize.sm
      },
      '& .MuiTablePagination-displayedRows': {
        fontSize: SIZES.fontSize.sm
      }
    },
  };
};

// Константы для улучшенной типографики
export const TYPOGRAPHY = {
  fontFamily: {
    primary: '"Roboto", "Helvetica", "Arial", sans-serif',
    mono: '"Roboto Mono", "Consolas", "Monaco", monospace',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
};

// Константы для теней
export const SHADOWS = {
  light: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
  heavy: '0 8px 16px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(66, 165, 245, 0.3)',
};

// Функция создания темы с поддержкой темного/светлого режима
export const createAppTheme = (mode: 'light' | 'dark' = 'light'): Theme => {
  const colors = mode === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light;
  
  const themeOptions = {
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#f50057',
        light: '#ff4081',
        dark: '#c51162',
        contrastText: '#ffffff',
      },
      error: {
        main: colors.error,
        light: mode === 'dark' ? '#ef5350' : '#ffcdd2',
        dark: mode === 'dark' ? '#c62828' : '#d32f2f',
      },
      warning: {
        main: colors.warning,
        light: mode === 'dark' ? '#ffa726' : '#ffecb3',
        dark: mode === 'dark' ? '#f57c00' : '#f57c00',
      },
      success: {
        main: colors.success,
        light: mode === 'dark' ? '#66bb6a' : '#c8e6c9',
        dark: mode === 'dark' ? '#43a047' : '#388e3c',
      },
      background: {
        default: colors.backgroundPrimary,
        paper: colors.backgroundCard,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      divider: colors.borderPrimary,
      action: {
        hover: colors.backgroundHover,
        selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        disabled: mode === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: parseInt(SIZES.borderRadius.md) || 8,
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              width: SIZES.scrollbar.width,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.4)' 
                : 'rgba(0, 0, 0, 0.4)',
              borderRadius: SIZES.scrollbar.borderRadius,
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.6)' 
                  : 'rgba(0, 0, 0, 0.6)',
              },
            },
          },
          '*': {
            '&::-webkit-scrollbar': {
              width: SIZES.scrollbar.width,
              height: SIZES.scrollbar.width,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.4)' 
                : 'rgba(0, 0, 0, 0.4)',
              borderRadius: SIZES.scrollbar.borderRadius,
              transition: ANIMATIONS.transition.medium,
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.6)' 
                  : 'rgba(0, 0, 0, 0.6)',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: SIZES.borderRadius.md,
            fontWeight: 600,
            transition: ANIMATIONS.transition.medium,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: SIZES.borderRadius.sm, // Небольшие закругления для консистентности
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: SIZES.borderRadius.sm,
            border: `1px solid ${colors.borderPrimary}`,
            background: colors.backgroundCard,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${colors.borderPrimary}`,
            background: colors.backgroundSecondary,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Убираем закругления глобально
            margin: 0,
            '&.Mui-selected': {
              backgroundColor: colors.backgroundHover,
              borderRadius: 0, // Убираем закругления для выбранных элементов
              '&:hover': {
                backgroundColor: colors.backgroundHover,
              },
            },
            '&:hover': {
              backgroundColor: colors.backgroundHover,
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Убираем закругления и у ListItem
            margin: 0,
            padding: 0,
          },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: {
            borderRadius: 0, // Убираем закругления у заголовков секций
            margin: 0,
          },
        },
      },
      // Стили для таблиц
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: colors.backgroundTable,
            borderRadius: SIZES.borderRadius.xs, // Минимальные закругления
            overflow: 'hidden',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: colors.backgroundTableHeader,
            '& .MuiTableCell-root': {
              backgroundColor: colors.backgroundTableHeader,
              color: colors.textPrimary,
              fontWeight: 600,
              fontSize: SIZES.fontSize.md,
              borderBottom: `1px solid ${colors.borderPrimary}`,
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              backgroundColor: colors.backgroundTable,
              '&:nth-of-type(even)': {
                backgroundColor: colors.backgroundTableRow,
              },
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: colors.textPrimary,
            borderBottom: `1px solid ${colors.borderPrimary}`,
            padding: '12px',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: colors.backgroundTable,
            borderRadius: SIZES.borderRadius.xs, // Минимальные закругления
            border: `1px solid ${colors.borderPrimary}`,
            overflow: 'hidden',
          },
        },
      },
    },
  } as ThemeOptions;

  return createTheme(themeOptions);
};
