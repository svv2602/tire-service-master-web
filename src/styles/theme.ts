// styles/theme.ts
// Централизованная система стилей для обеспечения единообразия

import { Theme } from '@mui/material/styles';

// Константы цветов для темной и светлой тем
export const THEME_COLORS = {
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
    primary: '#1976d2', // Используем основной цвет из существующей темы
    primaryDark: '#1565c0',
    primaryLight: '#42a5f5',
    
    // Фоны
    backgroundPrimary: 'rgba(255, 255, 255, 1)',
    backgroundSecondary: 'rgba(250, 250, 250, 1)',
    backgroundCard: 'rgba(255, 255, 255, 1)',
    backgroundField: 'rgba(0, 0, 0, 0.02)',
    backgroundHover: 'rgba(0, 0, 0, 0.04)',
    backgroundError: 'rgba(244, 67, 54, 0.05)',
    
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
  }
};

// Константы размеров
export const SIZES = {
  borderRadius: {
    xs: 4,
    small: 6,
    sm: 8,
    md: 12,
    medium: 12,
    lg: 16,
    large: 16,
    xl: 24,
  },
  spacing: {
    xs: 0.5,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 6,
  },
  icon: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
};

// Константы анимаций
export const ANIMATIONS = {
  transition: {
    fast: '0.2s ease-in-out',
    medium: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
    cubic: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
  fadeIn: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
  slideIn: '@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }',
  zoomIn: '@keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
};

// Утилита для получения цветов темы
export const getThemeColors = (theme: Theme) => {
  return theme.palette.mode === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light;
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
  return GRADIENTS[type];
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
