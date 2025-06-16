# План унификации дизайна и создания дизайн-системы

## Обоснование изменений

Анализ текущего состояния интерфейса выявил следующие проблемы:

1. **Несогласованность стилей**: Разные страницы используют разные размеры шрифтов, отступы и цветовые решения
2. **Дублирование кода**: Повторяющиеся стили в разных компонентах
3. **Отсутствие единой системы**: Нет централизованного хранилища компонентов и стилей
4. **Сложность поддержки**: Изменение дизайна требует правок во множестве файлов

Создание дизайн-системы позволит:
- Обеспечить единообразие интерфейса
- Ускорить разработку новых компонентов
- Упростить поддержку и масштабирование приложения
- Улучшить пользовательский опыт

## План реализации

### 1. Аудит текущих компонентов и стилей

#### 1.1. Инвентаризация компонентов

```typescript
// Пример скрипта для анализа компонентов
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Поиск всех React компонентов
const components = glob.sync('src/**/*.tsx');

// Анализ использования MUI компонентов
const muiUsage = components.reduce((acc, file) => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/import \{([^}]+)\} from ['"]@mui\/material['"]/g) || [];
  
  matches.forEach(match => {
    const components = match.replace(/import \{|\} from ['"]@mui\/material['"]/g, '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    
    components.forEach(component => {
      acc[component] = (acc[component] || 0) + 1;
    });
  });
  
  return acc;
}, {});

console.log('MUI Component Usage:', muiUsage);
```

#### 1.2. Анализ текущих стилей

- Собрать все используемые цвета, размеры шрифтов, отступы
- Определить часто используемые паттерны стилизации
- Выявить несоответствия и отклонения от общего стиля

### 2. Разработка дизайн-токенов

#### 2.1. Определение основных токенов

```typescript
// src/styles/tokens.ts

export const COLORS = {
  // Основная палитра
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  
  // Семантические цвета
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32',
  
  // Нейтральные цвета
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Текст
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  
  // Фон
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    light: '#f5f5f5',
  },
};

export const TYPOGRAPHY = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  lineHeight: {
    xs: 1.2,
    sm: 1.4,
    md: 1.6,
    lg: 1.8,
  },
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const SHADOWS = {
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
};

export const BORDER_RADIUS = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  round: '50%',
};
```

#### 2.2. Обновление темы MUI

```typescript
// src/styles/theme.ts

import { createTheme } from '@mui/material/styles';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from './tokens';

const theme = createTheme({
  palette: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    error: {
      main: COLORS.error,
    },
    warning: {
      main: COLORS.warning,
    },
    info: {
      main: COLORS.info,
    },
    success: {
      main: COLORS.success,
    },
    text: COLORS.text,
    background: COLORS.background,
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: parseInt(TYPOGRAPHY.fontSize.md),
    h1: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.xs,
    },
    h2: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.lineHeight.xs,
    },
    h3: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semiBold,
      lineHeight: TYPOGRAPHY.lineHeight.sm,
    },
    h4: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semiBold,
      lineHeight: TYPOGRAPHY.lineHeight.sm,
    },
    h5: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.md,
    },
    h6: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: TYPOGRAPHY.lineHeight.md,
    },
    body1: {
      fontSize: TYPOGRAPHY.fontSize.md,
      lineHeight: TYPOGRAPHY.lineHeight.md,
    },
    body2: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      lineHeight: TYPOGRAPHY.lineHeight.md,
    },
    button: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: parseInt(BORDER_RADIUS.md),
  },
  shadows: [
    'none',
    SHADOWS.sm,
    SHADOWS.md,
    // ... другие тени
    SHADOWS.lg,
  ],
  spacing: (factor) => {
    const spacingValues = {
      1: SPACING.xs,
      2: SPACING.sm,
      3: SPACING.md,
      4: SPACING.lg,
      6: SPACING.xl,
      8: SPACING.xxl,
    };
    
    return spacingValues[factor] || `${factor * 8}px`;
  },
});

export default theme;
```

### 3. Создание библиотеки компонентов

#### 3.1. Базовые компоненты

```typescript
// src/components/ui/Button/Button.tsx

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends MuiButtonProps {
  fullWidth?: boolean;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'fullWidth',
})<ButtonProps>(({ theme, fullWidth }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  textTransform: 'none',
  fontWeight: theme.typography.button.fontWeight,
  width: fullWidth ? '100%' : 'auto',
  '&:hover': {
    boxShadow: theme.shadows[1],
  },
}));

export const Button: React.FC<ButtonProps> = (props) => {
  return <StyledButton {...props} />;
};
```

#### 3.2. Составные компоненты

```typescript
// src/components/ui/DataTable/DataTable.tsx

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  idField: keyof T;
  title?: string;
  pagination?: boolean;
  onRowClick?: (row: T) => void;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  overflow: 'hidden',
}));

const TableTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2),
  fontWeight: theme.typography.fontWeightBold,
}));

export function DataTable<T>({
  columns,
  rows,
  idField,
  title,
  pagination = true,
  onRowClick,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const displayRows = pagination
    ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : rows;

  return (
    <Paper>
      {title && <TableTitle variant="h6">{title}</TableTitle>}
      <StyledTableContainer>
        <Table stickyHeader aria-label={title || 'data table'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.map((row) => {
              return (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={String(row[idField])}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const value = row[column.id as keyof T];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
}
```

### 4. Настройка Storybook

#### 4.1. Установка и настройка

```bash
# Установка Storybook
npm install --save-dev @storybook/react @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/builder-webpack5 @storybook/manager-webpack5

# Создание конфигурации
npx sb init
```

#### 4.2. Пример истории для компонента

```typescript
// src/components/ui/Button/Button.stories.tsx

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Button } from './Button';

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
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      defaultValue: 'medium',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    fullWidth: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Primary Button',
  variant: 'contained',
  color: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary Button',
  variant: 'contained',
  color: 'secondary',
};

export const Outlined = Template.bind({});
Outlined.args = {
  children: 'Outlined Button',
  variant: 'outlined',
  color: 'primary',
};

export const Text = Template.bind({});
Text.args = {
  children: 'Text Button',
  variant: 'text',
  color: 'primary',
};

export const Small = Template.bind({});
Small.args = {
  children: 'Small Button',
  size: 'small',
};

export const Large = Template.bind({});
Large.args = {
  children: 'Large Button',
  size: 'large',
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  children: 'Full Width Button',
  fullWidth: true,
};
```

### 5. Миграция существующих компонентов

#### 5.1. Стратегия миграции

1. **Постепенный подход**:
   - Начать с общих компонентов (кнопки, поля ввода, карточки)
   - Затем перейти к составным компонентам (формы, таблицы)
   - В последнюю очередь обновить страницы

2. **Приоритизация**:
   - Сначала обновить компоненты с высокой повторяемостью
   - Затем компоненты с наибольшими стилевыми несоответствиями
   - В конце обновить редко используемые компоненты

#### 5.2. Пример миграции компонента

```typescript
// До миграции: src/pages/partners/PartnerCard.tsx

import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const PartnerCard = ({ partner }) => {
  return (
    <Card sx={{ mb: 2, boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          {partner.name}
        </Typography>
        <Typography sx={{ color: '#666', mb: 2 }}>
          {partner.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Chip 
            label={partner.status} 
            color={partner.status === 'active' ? 'success' : 'default'}
            sx={{ fontSize: '12px' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// После миграции: src/pages/partners/PartnerCard.tsx

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { StatusChip } from 'src/components/ui/StatusChip';
import { TYPOGRAPHY, SPACING } from 'src/styles/tokens';

const PartnerCard = ({ partner }) => {
  return (
    <Card sx={{ mb: SPACING.md, boxShadow: theme => theme.shadows[1] }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: TYPOGRAPHY.fontWeight.semiBold, mb: SPACING.xs }}>
          {partner.name}
        </Typography>
        <Typography variant="body1" sx={{ color: theme => theme.palette.text.secondary, mb: SPACING.md }}>
          {partner.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: SPACING.xs }}>
          <StatusChip status={partner.status} />
        </Box>
      </CardContent>
    </Card>
  );
};
```

### 6. Автоматизация и инструменты

#### 6.1. Линтинг стилей

```json
// .eslintrc.js
module.exports = {
  // ... существующие правила
  "rules": {
    // ... другие правила
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@mui/*"],
            "importNames": ["styled"],
            "message": "Используйте импорт styled из src/styles/styled вместо прямого импорта из MUI"
          }
        ]
      }
    ]
  }
}
```

#### 6.2. Скрипты для анализа стилей

```javascript
// scripts/analyze-styles.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Поиск всех файлов с стилями
const files = glob.sync('src/**/*.{tsx,ts}');

// Регулярные выражения для поиска стилей
const colorRegex = /#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)/g;
const fontSizeRegex = /fontSize:.*?['"](\d+)(px|rem|em)['"]|fontSize:.*?(\d+)/g;
const spacingRegex = /(margin|padding|gap):.*?['"](\d+)(px|rem|em)['"]|(margin|padding|gap):.*?(\d+)/g;

// Результаты
const colors = new Set();
const fontSizes = new Set();
const spacings = new Set();

// Анализ файлов
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Поиск цветов
  const colorMatches = content.match(colorRegex) || [];
  colorMatches.forEach(match => colors.add(match));
  
  // Поиск размеров шрифтов
  const fontMatches = content.match(fontSizeRegex) || [];
  fontMatches.forEach(match => {
    const size = match.replace(/fontSize:.*?['"](\d+)(px|rem|em)['"]|fontSize:.*?(\d+)/g, '$1$3');
    fontSizes.add(size);
  });
  
  // Поиск отступов
  const spacingMatches = content.match(spacingRegex) || [];
  spacingMatches.forEach(match => {
    const spacing = match.replace(/(margin|padding|gap):.*?['"](\d+)(px|rem|em)['"]|(margin|padding|gap):.*?(\d+)/g, '$2$5');
    spacings.add(spacing);
  });
});

console.log('Unique colors:', Array.from(colors));
console.log('Unique font sizes:', Array.from(fontSizes));
console.log('Unique spacings:', Array.from(spacings));
```

### 7. Документация

#### 7.1. Руководство по стилям

Создать документацию в формате Markdown:

```markdown
# Руководство по стилям Tire Service

## Цвета

### Основная палитра

- **Основной цвет**: #1976d2
- **Дополнительный цвет**: #9c27b0
- **Акцентный цвет**: #f50057

### Семантические цвета

- **Успех**: #2e7d32
- **Предупреждение**: #ed6c02
- **Ошибка**: #d32f2f
- **Информация**: #0288d1

## Типографика

### Шрифты

- **Основной шрифт**: Roboto

### Размеры

- **XS**: 12px
- **SM**: 14px
- **MD**: 16px
- **LG**: 18px
- **XL**: 24px
- **XXL**: 32px

## Отступы

- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **XXL**: 48px

## Компоненты

### Кнопки

- **Основная**: Синяя, заполненная
- **Вторичная**: Фиолетовая, заполненная
- **Контурная**: Белая с цветной границей
- **Текстовая**: Без фона и границы

### Поля ввода

- **Стандартное**: С плавающей подписью
- **С ошибкой**: Красная подсветка и текст ошибки
- **Отключенное**: Серый фон и текст

### Карточки

- **Стандартная**: Белый фон, легкая тень
- **Интерактивная**: С эффектом при наведении
```

#### 7.2. Документация компонентов в Storybook

```typescript
// src/components/ui/Button/Button.mdx

import { Meta, Story, Canvas, ArgsTable } from '@storybook/addon-docs';
import { Button } from './Button';

<Meta title="UI/Button/Documentation" component={Button} />

# Кнопка

Компонент кнопки используется для инициирования действий пользователем.

## Использование

```tsx
import { Button } from 'src/components/ui/Button';

<Button variant="contained" color="primary">
  Нажми меня
</Button>
```

## Варианты

<Canvas>
  <Story id="ui-button--primary" />
  <Story id="ui-button--secondary" />
  <Story id="ui-button--outlined" />
  <Story id="ui-button--text" />
</Canvas>

## Размеры

<Canvas>
  <Story id="ui-button--small" />
  <Story id="ui-button--primary" />
  <Story id="ui-button--large" />
</Canvas>

## Свойства

<ArgsTable of={Button} />
```

## График реализации

1. **Аудит и анализ**: 1 неделя
2. **Разработка дизайн-токенов**: 1 неделя
3. **Создание базовых компонентов**: 2 недели
4. **Настройка Storybook**: 1 неделя
5. **Миграция существующих компонентов**: 3-4 недели
6. **Документация**: 1 неделя

## Риски и их снижение

1. **Нарушение работы существующего функционала**
   - Постепенная миграция с тщательным тестированием
   - Параллельное существование старых и новых компонентов до полной миграции

2. **Сопротивление команды изменениям**
   - Обучение команды работе с новой системой
   - Демонстрация преимуществ дизайн-системы

3. **Увеличение размера бандла**
   - Оптимизация импортов
   - Использование tree-shaking
   - Разделение кода (code splitting)
``` 