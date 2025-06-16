// src/styles/theme/theme.ts
// Создание темы на основе токенов дизайн-системы

import { createTheme, ThemeOptions, Theme } from '@mui/material/styles';
import { tokens } from './tokens';

/**
 * Создает тему Material UI на основе токенов дизайн-системы
 * @param mode Режим темы ('light' или 'dark')
 * @returns Тема Material UI
 */
export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  const colors = tokens.colors;
  const themeColors = mode === 'light' ? colors.light : colors.dark;
  
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      // Основные цвета
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: colors.primary.contrastText,
      },
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
        contrastText: colors.secondary.contrastText,
      },
      // Функциональные цвета
      error: {
        main: colors.error.main,
        light: colors.error.light,
        dark: colors.error.dark,
        contrastText: colors.error.contrastText,
      },
      warning: {
        main: colors.warning.main,
        light: colors.warning.light,
        dark: colors.warning.dark,
        contrastText: colors.warning.contrastText,
      },
      info: {
        main: colors.info.main,
        light: colors.info.light,
        dark: colors.info.dark,
        contrastText: colors.info.contrastText,
      },
      success: {
        main: colors.success.main,
        light: colors.success.light,
        dark: colors.success.dark,
        contrastText: colors.success.contrastText,
      },
      // Оттенки серого
      grey: colors.grey,
      // Фон и текст
      background: {
        default: themeColors.backgroundPrimary,
        paper: themeColors.backgroundCard,
      },
      text: {
        primary: themeColors.textPrimary,
        secondary: themeColors.textSecondary,
        disabled: themeColors.textMuted,
      },
    },
    // Типографика
    typography: {
      fontFamily: tokens.typography.fontFamily,
      fontWeightLight: tokens.typography.fontWeights.light,
      fontWeightRegular: tokens.typography.fontWeights.regular,
      fontWeightMedium: tokens.typography.fontWeights.medium,
      fontWeightBold: tokens.typography.fontWeights.bold,
      // Заголовки
      h1: {
        fontSize: tokens.typography.fontSize['5xl'],
        fontWeight: tokens.typography.fontWeights.bold,
        lineHeight: tokens.typography.lineHeight.tight,
      },
      h2: {
        fontSize: tokens.typography.fontSize['4xl'],
        fontWeight: tokens.typography.fontWeights.bold,
        lineHeight: tokens.typography.lineHeight.tight,
      },
      h3: {
        fontSize: tokens.typography.fontSize['3xl'],
        fontWeight: tokens.typography.fontWeights.medium,
        lineHeight: tokens.typography.lineHeight.tight,
      },
      h4: {
        fontSize: tokens.typography.fontSize['2xl'],
        fontWeight: tokens.typography.fontWeights.medium,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      h5: {
        fontSize: tokens.typography.fontSize.xl,
        fontWeight: tokens.typography.fontWeights.medium,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      h6: {
        fontSize: tokens.typography.fontSize.lg,
        fontWeight: tokens.typography.fontWeights.medium,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      // Подзаголовки
      subtitle1: {
        fontSize: tokens.typography.fontSize.md,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      subtitle2: {
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeights.medium,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      // Основной текст
      body1: {
        fontSize: tokens.typography.fontSize.md,
        lineHeight: tokens.typography.lineHeight.relaxed,
      },
      body2: {
        fontSize: tokens.typography.fontSize.sm,
        lineHeight: tokens.typography.lineHeight.relaxed,
      },
      // Другие элементы
      button: {
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeights.medium,
        textTransform: 'none',
      },
      caption: {
        fontSize: tokens.typography.fontSize.xs,
        lineHeight: tokens.typography.lineHeight.normal,
      },
      overline: {
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeights.medium,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.letterSpacing.wider,
      },
    },
    // Форма
    shape: {
      borderRadius: parseInt(tokens.borderRadius.md.replace('rem', '')) * 16,
    },
    // Тени
    shadows: [
      tokens.shadows.none,
      tokens.shadows.sm,
      tokens.shadows.sm,
      tokens.shadows.sm,
      tokens.shadows.md,
      tokens.shadows.md,
      tokens.shadows.md,
      tokens.shadows.md,
      tokens.shadows.md,
      tokens.shadows.lg,
      tokens.shadows.lg,
      tokens.shadows.lg,
      tokens.shadows.lg,
      tokens.shadows.lg,
      tokens.shadows.lg,
      tokens.shadows.xl,
      tokens.shadows.xl,
      tokens.shadows.xl,
      tokens.shadows.xl,
      tokens.shadows.xl,
      tokens.shadows.xl,
      tokens.shadows.xl,
      tokens.shadows.xl,
      tokens.shadows.xl,
      tokens.shadows.xl,
    ],
    // Переходы
    transitions: {
      easing: {
        easeInOut: tokens.transitions.easing.easeInOut,
        easeOut: tokens.transitions.easing.easeOut,
        easeIn: tokens.transitions.easing.easeIn,
        sharp: tokens.transitions.easing.sharp,
      },
      duration: {
        shortest: parseInt(tokens.transitions.duration.short),
        shorter: parseInt(tokens.transitions.duration.short),
        short: parseInt(tokens.transitions.duration.short),
        standard: parseInt(tokens.transitions.duration.normal),
        complex: parseInt(tokens.transitions.duration.normal),
        enteringScreen: parseInt(tokens.transitions.duration.normal),
        leavingScreen: parseInt(tokens.transitions.duration.normal),
      },
    },
    // Z-индексы
    zIndex: {
      mobileStepper: tokens.zIndex.fixed,
      speedDial: tokens.zIndex.fixed,
      appBar: tokens.zIndex.sticky,
      drawer: tokens.zIndex.fixed,
      modal: tokens.zIndex.modal,
      snackbar: tokens.zIndex.popover,
      tooltip: tokens.zIndex.tooltip,
    },
    // Настройки компонентов
    components: {
      // Кнопка
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.md,
            textTransform: 'none',
            fontWeight: tokens.typography.fontWeights.medium,
            padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
          },
          contained: {
            boxShadow: tokens.shadows.sm,
            '&:hover': {
              boxShadow: tokens.shadows.md,
            },
          },
          outlined: {
            borderColor: themeColors.borderPrimary,
            '&:hover': {
              borderColor: themeColors.borderHover,
              backgroundColor: themeColors.backgroundHover,
            },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      // Карточка
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.lg,
            boxShadow: tokens.shadows.md,
            backgroundColor: themeColors.backgroundCard,
          },
        },
      },
      // Поле ввода
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: tokens.borderRadius.md,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: themeColors.borderHover,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary.main,
              },
            },
          },
        },
      },
      // Таблица
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: tokens.spacing.md,
            borderBottom: `1px solid ${themeColors.borderPrimary}`,
          },
          head: {
            fontWeight: tokens.typography.fontWeights.medium,
            backgroundColor: themeColors.backgroundTableHeader,
          },
        },
      },
      // Чип
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.md,
          },
        },
      },
      // Диалог
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: tokens.borderRadius.lg,
            boxShadow: tokens.shadows.xl,
          },
        },
      },
      // Вкладки
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: tokens.typography.fontWeights.medium,
            minHeight: 48,
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export default createAppTheme;