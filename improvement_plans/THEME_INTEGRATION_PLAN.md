# План интеграции единой темы в приложение

## Цели

1. Внедрить единую тему для всего приложения
2. Обеспечить согласованность стилей во всех компонентах
3. Добавить поддержку светлой и темной темы
4. Улучшить пользовательский опыт за счет единообразия интерфейса

## Текущее состояние

- ✅ Создана структура дизайн-системы
- ✅ Разработаны токены дизайн-системы
- ✅ Создан контекст для управления темой
- ✅ Обновлен компонент переключения темы
- ✅ Создана библиотека компонентов в Storybook

## План работ

### 1. Интеграция ThemeProvider в приложение

1. Обновить `App.tsx` для использования нового `AppThemeProvider`:

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppThemeProvider } from '@/theme/ThemeProvider';
import { store } from '@/store';
import AppRoutes from '@/routes';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppThemeProvider>
    </Provider>
  );
};

export default App;
```

2. Добавить компонент переключения темы в главный макет:

```tsx
// src/layouts/MainLayout.tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Добавить в хедер или настройки
<ThemeToggle />
```

3. Тестирование базовой интеграции:
   - Проверить корректность переключения темы
   - Убедиться в сохранении выбранной темы при перезагрузке страницы
   - Проверить автоматическое определение системной темы

### 2. Миграция компонентов на использование токенов

#### Этап 1: Базовые компоненты (высокий приоритет)

1. Button
2. TextField
3. Card
4. Paper
5. Typography

Пример обновления компонента Button:

```tsx
// src/components/ui/Button/Button.tsx
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { tokens } from '@/styles/theme/tokens';

export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: tokens.borderRadius.md,
  padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
  transition: tokens.transitions.standard,
  
  '&.MuiButton-containedPrimary': {
    backgroundColor: tokens.colors.primary.main,
    '&:hover': {
      backgroundColor: tokens.colors.primary.dark,
    },
  },
  
  '&.MuiButton-containedSecondary': {
    backgroundColor: tokens.colors.secondary.main,
    '&:hover': {
      backgroundColor: tokens.colors.secondary.dark,
    },
  },
  
  '&.MuiButton-outlined': {
    borderColor: tokens.colors.primary.main,
    color: tokens.colors.primary.main,
    '&:hover': {
      borderColor: tokens.colors.primary.dark,
      backgroundColor: tokens.colors.primary.light,
    },
  },
}));
```

#### Этап 2: Составные компоненты (средний приоритет)

1. Dialog
2. Modal
3. Table
4. Tabs
5. List

#### Этап 3: Страницы и макеты (низкий приоритет)

1. MainLayout
2. Header
3. Sidebar
4. Footer
5. Основные страницы

### 3. Обеспечение поддержки светлой и темной темы

1. Обновить файл токенов для поддержки обеих тем:

```tsx
// src/styles/theme/tokens.ts
export const tokens = {
  colors: {
    light: {
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      // ...другие цвета
    },
    dark: {
      primary: {
        main: '#90caf9',
        light: '#e3f2fd',
        dark: '#42a5f5',
      },
      secondary: {
        main: '#ce93d8',
        light: '#f3e5f5',
        dark: '#ab47bc',
      },
      // ...другие цвета
    },
  },
  // ...другие токены
};
```

2. Обновить функцию создания темы для использования токенов в зависимости от режима:

```tsx
// src/styles/theme/theme.ts
import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

export const createAppTheme = (mode: 'light' | 'dark') => {
  const colors = tokens.colors[mode];
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
      },
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
      },
      // ...другие цвета
    },
    // ...другие настройки темы
  });
};
```

3. Тестирование темы на всех компонентах:
   - Проверить корректность отображения в обоих режимах
   - Убедиться в отсутствии проблем с контрастностью
   - Проверить анимации при переключении темы

### 4. Документирование и обучение

1. Обновить документацию по использованию темы:
   - Создать руководство по использованию токенов
   - Добавить примеры стилизации компонентов
   - Описать процесс добавления новых токенов

2. Обновить истории в Storybook:
   - Добавить поддержку переключения темы в Storybook
   - Обновить истории для демонстрации компонентов в обеих темах

## График работ

| Задача | Статус | Срок |
|--------|--------|------|
| Интеграция ThemeProvider | Запланировано | 2 дня |
| Миграция базовых компонентов | Запланировано | 3 дня |
| Миграция составных компонентов | Запланировано | 5 дней |
| Миграция страниц и макетов | Запланировано | 4 дня |
| Тестирование и исправление ошибок | Запланировано | 3 дня |
| Документирование | Запланировано | 2 дня |

## Риски и их снижение

1. **Нарушение существующей функциональности**
   - Постепенная миграция с тщательным тестированием
   - Параллельное существование старых и новых компонентов до полной миграции

2. **Несогласованность стилей во время миграции**
   - Приоритизация компонентов для миграции
   - Четкий график миграции с контрольными точками

3. **Сложность поддержки во время миграции**
   - Четкая документация процесса миграции
   - Регулярные обновления статуса для команды
   - Выделение отдельных PR для каждого этапа миграции

## Критерии успешного завершения

1. Все компоненты используют токены дизайн-системы
2. Приложение корректно отображается в светлой и темной теме
3. Пользовательские настройки темы сохраняются между сессиями
4. Обновлена документация по использованию темы
5. Обновлены истории в Storybook для демонстрации тем