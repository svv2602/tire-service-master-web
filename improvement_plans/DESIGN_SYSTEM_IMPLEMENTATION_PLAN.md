# План унификации дизайна приложения Tire Service

## Обоснование изменений

Текущая реализация интерфейса имеет следующие проблемы:

1. **Несогласованность стилей**: Разные компоненты используют разные размеры, отступы и цвета
2. **Отсутствие единой системы компонентов**: Дублирование кода и несогласованность в реализации
3. **Сложность поддержки**: Изменения в дизайне требуют правок во множестве файлов
4. **Отсутствие документации**: Нет единого источника информации о стилях и компонентах

Унификация дизайна позволит:
- Улучшить пользовательский опыт за счет единообразия интерфейса
- Ускорить разработку новых функций благодаря готовым компонентам
- Упростить поддержку и обновление дизайна
- Обеспечить согласованность между разными частями приложения

## План реализации

### 1. Аудит текущего состояния

#### 1.1. Анализ существующих компонентов

- Провести инвентаризацию всех компонентов интерфейса
- Выявить повторяющиеся элементы и паттерны
- Определить несоответствия и проблемные места

#### 1.2. Сбор метрик и статистики

- Проанализировать использование цветов, шрифтов и отступов
- Выявить наиболее часто используемые компоненты
- Определить приоритеты для унификации

### 2. Создание дизайн-системы

#### 2.1. Определение основных переменных

```tsx
// src/styles/theme/tokens.ts

// Цветовая палитра
export const colors = {
  // Основные цвета
  primary: {
    main: '#1976D2',
    light: '#42A5F5',
    dark: '#0D47A1',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF5722',
    light: '#FF8A65',
    dark: '#E64A19',
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
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  // Фон и текст
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
    dark: '#121212',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E',
    hint: '#9E9E9E',
  },
};

// Типографика
export const typography = {
  fontFamily: '"Roboto", "Arial", sans-serif',
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  },
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
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// Размеры и отступы
export const spacing = {
  unit: 8,
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
};

// Скругления
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.25rem',    // 4px
  lg: '0.5rem',     // 8px
  xl: '1rem',       // 16px
  full: '9999px',
};

// Тени
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Анимации
export const transitions = {
  duration: {
    short: '150ms',
    normal: '300ms',
    long: '500ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Z-индексы
export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};
```

#### 2.2. Обновление темы Material UI

```tsx
// src/styles/theme/index.ts

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { colors, typography, spacing, borderRadius, shadows, transitions, zIndex } from './tokens';

export const createAppTheme = (mode: 'light' | 'dark'): ThemeOptions => {
  return createTheme({
    palette: {
      mode,
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
      grey: colors.grey,
      background: {
        default: mode === 'light' ? colors.background.default : colors.background.dark,
        paper: mode === 'light' ? colors.background.paper : colors.grey[800],
      },
      text: {
        primary: mode === 'light' ? colors.text.primary : colors.grey[100],
        secondary: mode === 'light' ? colors.text.secondary : colors.grey[300],
        disabled: mode === 'light' ? colors.text.disabled : colors.grey[500],
      },
    },
    typography: {
      fontFamily: typography.fontFamily,
      fontWeightLight: typography.fontWeights.light,
      fontWeightRegular: typography.fontWeights.regular,
      fontWeightMedium: typography.fontWeights.medium,
      fontWeightBold: typography.fontWeights.bold,
      h1: {
        fontSize: typography.fontSize['5xl'],
        fontWeight: typography.fontWeights.bold,
        lineHeight: typography.lineHeight.tight,
      },
      h2: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: typography.fontWeights.bold,
        lineHeight: typography.lineHeight.tight,
      },
      h3: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeights.medium,
        lineHeight: typography.lineHeight.tight,
      },
      h4: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeights.medium,
        lineHeight: typography.lineHeight.normal,
      },
      h5: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeights.medium,
        lineHeight: typography.lineHeight.normal,
      },
      h6: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeights.medium,
        lineHeight: typography.lineHeight.normal,
      },
      subtitle1: {
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.normal,
      },
      subtitle2: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeights.medium,
        lineHeight: typography.lineHeight.normal,
      },
      body1: {
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.relaxed,
      },
      body2: {
        fontSize: typography.fontSize.sm,
        lineHeight: typography.lineHeight.relaxed,
      },
      button: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeights.medium,
        textTransform: 'none',
      },
      caption: {
        fontSize: typography.fontSize.xs,
        lineHeight: typography.lineHeight.normal,
      },
      overline: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeights.medium,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
    shape: {
      borderRadius: parseInt(borderRadius.md.replace('rem', '')) * 16,
    },
    shadows: [
      shadows.none,
      shadows.sm,
      shadows.md,
      shadows.md,
      shadows.md,
      shadows.md,
      shadows.md,
      shadows.md,
      shadows.lg,
      shadows.lg,
      shadows.lg,
      shadows.lg,
      shadows.lg,
      shadows.lg,
      shadows.lg,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
    ],
    transitions: {
      easing: {
        easeInOut: transitions.easing.easeInOut,
        easeOut: transitions.easing.easeOut,
        easeIn: transitions.easing.easeIn,
        sharp: transitions.easing.sharp,
      },
      duration: {
        shortest: parseInt(transitions.duration.short),
        shorter: parseInt(transitions.duration.short),
        short: parseInt(transitions.duration.short),
        standard: parseInt(transitions.duration.normal),
        complex: parseInt(transitions.duration.normal),
        enteringScreen: parseInt(transitions.duration.normal),
        leavingScreen: parseInt(transitions.duration.normal),
      },
    },
    zIndex: {
      mobileStepper: zIndex.fixed,
      speedDial: zIndex.fixed,
      appBar: zIndex.sticky,
      drawer: zIndex.fixed,
      modal: zIndex.modal,
      snackbar: zIndex.popover,
      tooltip: zIndex.tooltip,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.md,
            textTransform: 'none',
            fontWeight: typography.fontWeights.medium,
            padding: `${spacing.sm} ${spacing.md}`,
          },
          contained: {
            boxShadow: shadows.sm,
            '&:hover': {
              boxShadow: shadows.md,
            },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
            boxShadow: shadows.md,
          },
        },
      },
      // Другие компоненты MUI...
    },
  });
};
```

### 3. Создание библиотеки базовых компонентов

#### 3.1. Структура компонентов

```
src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   ├── Button.test.tsx
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   ├── Card.test.tsx
│   └── index.ts
├── TextField/
│   ├── TextField.tsx
│   ├── TextField.stories.tsx
│   ├── TextField.test.tsx
│   └── index.ts
// ... другие базовые компоненты
└── index.ts
```

#### 3.2. Примеры базовых компонентов

##### Button

```tsx
// src/components/ui/Button/Button.tsx

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'size'> {
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  ...rest
}) => {
  // Маппинг размеров для соответствия нашей дизайн-системе
  const sizeMap = {
    small: {
      padding: '6px 16px',
      fontSize: '0.875rem',
    },
    medium: {
      padding: '8px 20px',
      fontSize: '0.9375rem',
    },
    large: {
      padding: '10px 24px',
      fontSize: '1rem',
    },
  };

  return (
    <MuiButton
      variant={variant}
      color={color}
      disabled={loading || disabled}
      sx={{
        ...sizeMap[size],
      }}
      {...rest}
    >
      {loading ? 'Загрузка...' : children}
    </MuiButton>
  );
};

export default Button;
```

##### Card

```tsx
// src/components/ui/Card/Card.tsx

import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
} from '@mui/material';

export interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  noPadding = false,
  ...rest
}) => {
  return (
    <MuiCard {...rest}>
      {(title || subtitle) && (
        <CardHeader
          title={title && <Typography variant="h6">{title}</Typography>}
          subheader={subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        />
      )}
      <CardContent sx={{ padding: noPadding ? 0 : undefined }}>
        {children}
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
};

export default Card;
```

### 4. Настройка Storybook

#### 4.1. Установка и настройка

```bash
# Установка Storybook
npm install --save-dev @storybook/react @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-a11y @storybook/addon-viewport @storybook/addon-controls

# Настройка Storybook
npx sb init
```

#### 4.2. Конфигурация темы

```tsx
// .storybook/preview.js

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '../src/styles/theme';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => (
    <ThemeProvider theme={createAppTheme('light')}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  ),
];
```

#### 4.3. Пример истории для компонента

```tsx
// src/components/ui/Button/Button.stories.tsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Button from './Button';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
      defaultValue: 'contained',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      defaultValue: 'medium',
    },
    loading: {
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Кнопка',
  variant: 'contained',
  color: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Кнопка',
  variant: 'contained',
  color: 'secondary',
};

export const Outlined = Template.bind({});
Outlined.args = {
  children: 'Кнопка',
  variant: 'outlined',
  color: 'primary',
};

export const Text = Template.bind({});
Text.args = {
  children: 'Кнопка',
  variant: 'text',
  color: 'primary',
};

export const Small = Template.bind({});
Small.args = {
  children: 'Маленькая',
  size: 'small',
};

export const Medium = Template.bind({});
Medium.args = {
  children: 'Средняя',
  size: 'medium',
};

export const Large = Template.bind({});
Large.args = {
  children: 'Большая',
  size: 'large',
};

export const Loading = Template.bind({});
Loading.args = {
  children: 'Загрузка',
  loading: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Отключено',
  disabled: true,
};
```

### 5. Миграция существующих компонентов

#### 5.1. Стратегия миграции

1. Начать с наиболее часто используемых компонентов
2. Создавать обертки над существующими компонентами для плавного перехода
3. Постепенно заменять прямые использования MUI на наши компоненты
4. Обновлять стили в соответствии с новой дизайн-системой

#### 5.2. Приоритеты миграции

1. Формы и элементы ввода (TextField, Select, Checkbox и т.д.)
2. Кнопки и элементы действий
3. Карточки и контейнеры
4. Таблицы и списки
5. Модальные окна и диалоги
6. Навигационные элементы

### 6. Документация и руководства

#### 6.1. Руководство по дизайн-системе

- Описание философии дизайна
- Правила использования цветов, типографики и отступов
- Примеры использования компонентов
- Рекомендации по композиции интерфейсов

#### 6.2. Техническая документация

- API компонентов
- Примеры интеграции
- Рекомендации по расширению компонентов
- Советы по производительности

## График реализации

1. **Аудит текущего состояния**: 1-2 дня
2. **Создание дизайн-системы**: 2-3 дня
3. **Разработка базовых компонентов**: 3-5 дней
4. **Настройка Storybook**: 1-2 дня
5. **Миграция существующих компонентов**: 5-10 дней (в зависимости от объема)
6. **Создание документации**: 2-3 дня

## Ожидаемые результаты

- Единая дизайн-система с определенными переменными и токенами
- Библиотека базовых компонентов с документацией в Storybook
- Унифицированный интерфейс приложения
- Документация по использованию и расширению дизайн-системы

## Риски и их снижение

1. **Нарушение существующей функциональности**
   - Тщательное тестирование каждого компонента
   - Постепенное внедрение изменений
   - Автоматизированные тесты для проверки регрессий

2. **Увеличение размера бандла**
   - Оптимизация импортов компонентов
   - Использование tree-shaking
   - Мониторинг размера бандла

3. **Сопротивление команды новым стандартам**
   - Проведение обучающих сессий
   - Демонстрация преимуществ новой системы
   - Создание понятной документации