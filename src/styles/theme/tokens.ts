// src/styles/theme/tokens.ts
// Токены дизайн-системы для обеспечения единообразия стилей

/**
 * Цветовая палитра приложения
 */
export const colors = {
  // Основные цвета
  primary: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F50057',
    light: '#FF4081',
    dark: '#C51162',
    contrastText: '#FFFFFF',
  },
  // Оттенки серого
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
  // Функциональные цвета
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000',
  },
  info: {
    main: '#03A9F4',
    light: '#4FC3F7',
    dark: '#0288D1',
    contrastText: '#FFFFFF',
  },
  // Цвета для темной и светлой темы
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
    
    // Фон для таблиц
    backgroundTable: 'rgba(255, 255, 255, 1)',
    backgroundTableRow: 'rgba(248, 249, 250, 1)',
    backgroundTableHeader: 'rgba(242, 244, 246, 1)',
    
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
    
    // Фон для таблиц
    backgroundTable: 'rgba(45, 45, 48, 0.95)',
    backgroundTableRow: 'rgba(52, 52, 56, 0.8)',
    backgroundTableHeader: 'rgba(38, 38, 42, 0.95)',
    
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
};

/**
 * Типографика
 */
export const typography = {
  // Семейства шрифтов
  fontFamily: '"Roboto", "Arial", sans-serif',
  
  // Веса шрифтов
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  },
  
  // Размеры шрифтов
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  // Межстрочные интервалы
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Межбуквенные интервалы
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

/**
 * Размеры и отступы
 */
export const spacing = {
  // Базовая единица отступов
  unit: 8,
  
  // Предопределенные отступы
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
};

/**
 * Скругления углов
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.25rem',    // 4px
  lg: '0.5rem',     // 8px
  xl: '1rem',       // 16px
  full: '9999px',
};

/**
 * Тени
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

/**
 * Анимации и переходы
 */
export const transitions = {
  // Длительности
  duration: {
    short: '150ms',
    normal: '300ms',
    long: '500ms',
  },
  
  // Функции плавности
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

/**
 * Z-индексы
 */
export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

/**
 * Размеры для компонентов
 */
export const sizes = {
  // Размеры иконок
  icon: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
  
  // Размеры для навигации
  navigation: {
    width: 280,
    widthCollapsed: 72,
    sectionTitleHeight: 44,
    itemHeight: 48,
  },
  
  // Размеры для кнопок пользователя
  userButton: {
    height: 40,
    borderRadius: 20,
    padding: 12,
  },
  
  // Размеры для полос прокрутки
  scrollbar: {
    width: 8,
    borderRadius: 4,
  },
};

/**
 * Градиенты
 */
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary.light}, ${colors.primary.dark})`,
  secondary: `linear-gradient(135deg, ${colors.secondary.light}, ${colors.secondary.dark})`,
  success: `linear-gradient(135deg, ${colors.success.light}, ${colors.success.dark})`,
  error: `linear-gradient(135deg, ${colors.error.light}, ${colors.error.dark})`,
  warning: `linear-gradient(135deg, ${colors.warning.light}, ${colors.warning.dark})`,
  info: `linear-gradient(135deg, ${colors.info.light}, ${colors.info.dark})`,
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
};

/**
 * Медиа-запросы для адаптивности
 */
export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px',
};

/**
 * Экспорт всех токенов
 */
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  sizes,
  gradients,
  breakpoints,
};

export default tokens;