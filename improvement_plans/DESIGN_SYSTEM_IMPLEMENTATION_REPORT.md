# Отчет о внедрении дизайн-системы

## Текущее состояние

### 1. Проведен аудит существующих компонентов и стилей

В результате анализа кодовой базы выявлено:

- Существующая структура UI компонентов в `src/components/ui/` с разделением по типам
- Базовый набор компонентов, включая Button, Card, TextField и другие
- Централизованная система стилей в `src/styles/theme.ts` и `src/styles/components.ts`
- Определены базовые токены для цветов, типографики, отступов и других параметров

### 2. Подготовлены планы по унификации дизайна

- Создан детальный план внедрения дизайн-системы (`DESIGN_SYSTEM_IMPLEMENTATION_PLAN.md`)
- Определены основные этапы работы и приоритеты

### 3. Реализованы базовые компоненты

Созданы базовые компоненты с поддержкой темизации:
- Button
- Card
- TextField
- и другие

## Выявленные проблемы

1. **Несогласованность в использовании стилей**:
   - Некоторые компоненты используют прямые стили, другие - стилизованные компоненты
   - Разные подходы к темизации (прямое использование theme vs getThemeColors)

2. **Отсутствие документации компонентов**:
   - Компоненты не имеют полной документации по использованию
   - Отсутствует визуализация вариаций компонентов

3. **Неполное покрытие компонентов**:
   - Некоторые часто используемые паттерны не вынесены в переиспользуемые компоненты
   - Отсутствует единый подход к композиции компонентов

## Следующие шаги

### 1. Стандартизация использования токенов

- Создать единый файл с токенами дизайн-системы
- Обеспечить использование токенов вместо жестко заданных значений
- Обновить существующие компоненты для использования токенов

```tsx
// Пример использования токенов
import { tokens } from '@/styles/tokens';

const StyledComponent = styled('div')(({ theme }) => ({
  color: tokens.colors.primary.main,
  padding: tokens.spacing.md,
  borderRadius: tokens.borderRadius.sm,
}));
```

### 2. Настройка Storybook

- Установить и настроить Storybook
- Создать истории для всех базовых компонентов
- Добавить документацию по использованию компонентов

```bash
# Установка Storybook
npm install --save-dev @storybook/react @storybook/addon-essentials @storybook/addon-interactions

# Инициализация Storybook
npx storybook init
```

### 3. Создание недостающих компонентов

- Проанализировать часто используемые паттерны
- Создать компоненты для типовых сценариев использования
- Обеспечить полное покрытие UI потребностей приложения

### 4. Внедрение единой темы

- Обновить ThemeProvider для использования единой темы
- Обеспечить поддержку темной и светлой темы
- Добавить контекст для управления темой

```tsx
// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '@/styles/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  
  // Загрузка предпочтений пользователя из localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Определение предпочтений системы
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);
  
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };
  
  const theme = createAppTheme(mode);
  
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 5. Миграция существующих компонентов

- Обновить компоненты для использования новой дизайн-системы
- Заменить прямые стили на использование токенов
- Обеспечить единообразие в использовании компонентов

## График работ

| Задача | Статус | Срок |
|--------|--------|------|
| Создание файла токенов | В процессе | 2 дня |
| Настройка Storybook | Запланировано | 3 дня |
| Создание историй для компонентов | Запланировано | 5 дней |
| Обновление ThemeProvider | Запланировано | 2 дня |
| Миграция компонентов | Запланировано | 10 дней |

## Риски и их снижение

1. **Нарушение существующей функциональности**
   - Постепенная миграция с тщательным тестированием
   - Параллельное существование старых и новых компонентов до полной миграции

2. **Увеличение размера бандла**
   - Использование tree-shaking
   - Оптимизация импортов компонентов
   - Мониторинг размера бандла

3. **Сложность поддержки во время миграции**
   - Четкая документация процесса миграции
   - Регулярные обновления статуса для команды
   - Выделение отдельных PR для каждого этапа миграции