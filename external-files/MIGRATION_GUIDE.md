# 📖 Руководство по миграции на централизованные UI компоненты

**Для разработчиков проекта Tire Service**

---

## 🎯 Цель миграции

Унифицировать все страницы проекта для использования централизованных UI компонентов вместо прямых импортов из MUI. Это обеспечит:

- ✅ Единообразный внешний вид
- ✅ Упрощенную поддержку
- ✅ Быстрые глобальные изменения дизайна
- ✅ Уменьшенный размер бандла
- ✅ Лучшую производительность

---

## 📋 Пошаговая инструкция

### Шаг 1: Проверить текущее состояние файла

```bash
# Запустить миграционный скрипт в dry-run режиме
node external-files/scripts/migration/migrate-mui-imports.js src/pages/your-page/YourPage.tsx --dry-run
```

Это покажет, какие импорты будут изменены БЕЗ применения изменений.

---

### Шаг 2: Применить автоматическую миграцию

```bash
# Применить автоматическую миграцию импортов
node external-files/scripts/migration/migrate-mui-imports.js src/pages/your-page/YourPage.tsx
```

Скрипт автоматически:
- ✅ Найдет все импорты из `@mui/material`
- ✅ Разделит их на UI компоненты и MUI-only
- ✅ Заменит импорты UI компонентов на централизованные
- ✅ Сохранит файл с новыми импортами

---

### Шаг 3: Заменить стили

#### ❌ БЫЛО (прямые стили)

```typescript
import { Box, Typography, Button } from '@mui/material';

const MyPage: React.FC = () => {
  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Заголовок
      </Typography>
      <Button variant="contained" sx={{ borderRadius: '8px' }}>
        Кнопка
      </Button>
    </Box>
  );
};
```

#### ✅ СТАЛО (централизованные стили)

```typescript
import { Box, Typography, Button } from '../../components/ui';
import { useTheme } from '@mui/material';
import { useMemo } from 'react';
import { getTablePageStyles } from '../../styles';

const MyPage: React.FC = () => {
  const theme = useTheme();
  
  // Мемоизация для производительности
  const tablePageStyles = useMemo(
    () => getTablePageStyles(theme),
    [theme]
  );
  
  return (
    <Box sx={tablePageStyles.pageContainer}>
      <Typography sx={tablePageStyles.pageTitle}>
        Заголовок
      </Typography>
      <Button variant="primary">
        Кнопка
      </Button>
    </Box>
  );
};
```

---

### Шаг 4: Заменить паттерны на канонические

#### 4.1 Таблицы: Переход на PageTable

##### ❌ БЫЛО

```typescript
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

<Table>
  <TableHead>
    <TableRow>
      <TableCell>Название</TableCell>
      <TableCell>Действия</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>
          <IconButton onClick={() => handleEdit(row.id)}>
            <EditIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

##### ✅ СТАЛО

```typescript
import { PageTable } from '../../components/common/PageTable';
import type { Column } from '../../components/common/PageTable';
import { ActionsMenu } from '../../components/ui';

const columns: Column[] = [
  { id: 'name', label: 'Название' },
  {
    id: 'actions',
    label: 'Действия',
    render: (row) => (
      <ActionsMenu
        actions={[
          {
            label: 'Редактировать',
            onClick: () => handleEdit(row.id),
            icon: <EditIcon />,
            color: 'primary',
          },
        ]}
      />
    ),
  },
];

<PageTable
  columns={columns}
  data={data}
  loading={isLoading}
/>
```

#### 4.2 Кнопки действий: Переход на ActionsMenu

##### ❌ БЫЛО (несколько подходов)

```typescript
// Вариант 1
<IconButton onClick={handleEdit}><EditIcon /></IconButton>
<IconButton onClick={handleDelete}><DeleteIcon /></IconButton>

// Вариант 2
<Button variant="text" size="small" onClick={handleEdit}>
  <EditIcon />
</Button>

// Вариант 3
<Tooltip title="Редактировать">
  <IconButton onClick={handleEdit}>
    <EditIcon />
  </IconButton>
</Tooltip>
```

##### ✅ СТАЛО (единообразный подход)

```typescript
import { ActionsMenu } from '../../components/ui';
import type { ActionItem } from '../../components/ui';

const actions: ActionItem[] = [
  {
    label: 'Редактировать',
    onClick: () => handleEdit(row.id),
    icon: <EditIcon />,
    color: 'primary',
  },
  {
    label: 'Удалить',
    onClick: () => handleDelete(row.id),
    icon: <DeleteIcon />,
    color: 'error',
    confirm: {
      title: 'Подтверждение удаления',
      message: 'Вы уверены, что хотите удалить эту запись?',
    },
  },
];

<ActionsMenu actions={actions} />
```

#### 4.3 Пагинация: Переход на Pagination

##### ❌ БЫЛО

```typescript
import { TablePagination } from '@mui/material';

<TablePagination
  component="div"
  count={totalItems}
  page={page}
  onPageChange={handleChangePage}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={handleChangeRowsPerPage}
/>
```

##### ✅ СТАЛО

```typescript
import { Pagination } from '../../components/ui';

<Pagination
  count={Math.ceil(totalItems / rowsPerPage)}
  page={page + 1}
  onChange={(newPage) => setPage(newPage - 1)}
  disabled={isLoading}
/>
```

---

### Шаг 5: Проверить работоспособность

#### 5.1 Линтер

```bash
npm run lint
```

**Ожидаемый результат:** 0 ошибок, связанных с MUI импортами

#### 5.2 TypeScript

```bash
npx tsc --noEmit
```

**Ожидаемый результат:** 0 ошибок типизации

#### 5.3 Визуальное тестирование

1. Запустить приложение: `npm start`
2. Открыть мигрированную страницу
3. Проверить:
   - ✅ Корректность отображения
   - ✅ Работу интерактивных элементов
   - ✅ Обе темы (светлая и темная)
   - ✅ Адаптивность (мобильные, планшет, десктоп)

---

## 🗺️ Карта миграции компонентов

### Базовые компоненты

| MUI компонент | Централизованный компонент | Путь импорта |
|--------------|---------------------------|--------------|
| `Box` | `Box` | `../../components/ui` |
| `Container` | `Container` | `../../components/ui` |
| `Typography` | `Typography` | `../../components/ui` |
| `Button` | `Button` | `../../components/ui` |
| `IconButton` | `ActionsMenu` | `../../components/ui` |
| `TextField` | `TextField` | `../../components/ui` |
| `Select` | `Select` | `../../components/ui` |
| `Checkbox` | `Checkbox` | `../../components/ui` |
| `Switch` | `Switch` | `../../components/ui` |
| `Radio` | `Radio` | `../../components/ui` |

### Сложные компоненты

| MUI компонент | Централизованный компонент | Путь импорта |
|--------------|---------------------------|--------------|
| `Table` + `TableHead` + `TableBody` + ... | `PageTable` | `../../components/common/PageTable` |
| `TablePagination` | `Pagination` | `../../components/ui` |
| `Dialog` | `Dialog` | `../../components/ui` |
| `Snackbar` | `Notification` | `../../components/Notification` |
| `Alert` | `Alert` | `../../components/ui` |

### Компоненты только из MUI

Эти компоненты **можно** импортировать напрямую из MUI (нет альтернатив):

```typescript
import { 
  Autocomplete, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
```

- `Autocomplete` - сложный компонент
- `useTheme` - хук темы
- `useMediaQuery` - хук медиа-запросов
- `FormControl`, `FormGroup`, `FormLabel`, `FormHelperText` - компоненты форм

---

## 📚 Стилевые функции

### Доступные стилевые функции

```typescript
import {
  getTablePageStyles,
  getFormStyles,
  getTableStyles,
  getButtonStyles,
  getAuthStyles,
  getDashboardStyles,
  getModalStyles,
  getNavigationStyles,
  SIZES,
  THEME_COLORS,
} from '../../styles';
```

### Примеры использования

#### Стили страницы с таблицей

```typescript
const theme = useTheme();
const tablePageStyles = useMemo(
  () => getTablePageStyles(theme),
  [theme]
);

<Box sx={tablePageStyles.pageContainer}>
  <Box sx={tablePageStyles.headerContainer}>
    <Typography sx={tablePageStyles.pageTitle}>
      Заголовок
    </Typography>
  </Box>
  
  <Box sx={tablePageStyles.filtersContainer}>
    {/* Фильтры */}
  </Box>
  
  <Box sx={tablePageStyles.tableContainer}>
    {/* Таблица */}
  </Box>
  
  <Box sx={tablePageStyles.paginationContainer}>
    <Pagination {...paginationProps} />
  </Box>
</Box>
```

#### Стили формы

```typescript
const theme = useTheme();
const formStyles = useMemo(
  () => getFormStyles(theme),
  [theme]
);

<Box sx={formStyles.container}>
  <Box sx={formStyles.headerContainer}>
    <Typography sx={formStyles.title}>Форма</Typography>
  </Box>
  
  <Box sx={formStyles.formCard}>
    <Box sx={formStyles.section}>
      <Typography sx={formStyles.sectionTitle}>
        Основная информация
      </Typography>
      <Grid container spacing={2}>
        {/* Поля формы */}
      </Grid>
    </Box>
  </Box>
</Box>
```

---

## ⚡ Оптимизация производительности

### Всегда используйте useMemo для стилей

```typescript
// ❌ ПЛОХО - создается на каждом рендере
const MyComponent = () => {
  const theme = useTheme();
  const styles = getTablePageStyles(theme);
  // ...
};

// ✅ ХОРОШО - мемоизируется
const MyComponent = () => {
  const theme = useTheme();
  const styles = useMemo(
    () => getTablePageStyles(theme),
    [theme]
  );
  // ...
};
```

### Используйте useCallback для обработчиков

```typescript
// ✅ Мемоизация обработчиков
const handleEdit = useCallback((id: number) => {
  // логика редактирования
}, [/* зависимости */]);

const handleDelete = useCallback((id: number) => {
  // логика удаления
}, [/* зависимости */]);
```

---

## 🐛 Частые проблемы и решения

### Проблема 1: ESLint ошибки после миграции

**Ошибка:**
```
'@mui/material' is restricted from being used. Use centralized UI components...
```

**Решение:**
```typescript
// Проверьте импорты
import { Box } from '@mui/material'; // ❌

// Замените на
import { Box } from '../../components/ui'; // ✅
```

### Проблема 2: TypeScript ошибки типов

**Ошибка:**
```
Property 'variant' does not exist on type 'ButtonProps'
```

**Решение:**
```typescript
// Убедитесь, что используете правильные типы
import type { ButtonProps } from '../../components/ui/Button';

// Или используйте правильные варианты
<Button variant="primary"> // ✅ ('primary' | 'secondary' | 'success' | 'error')
<Button variant="contained"> // ❌ (MUI вариант)
```

### Проблема 3: Стили не применяются

**Причина:** Стили вычисляются на каждом рендере без мемоизации

**Решение:**
```typescript
// Добавьте useMemo
const styles = useMemo(
  () => getTablePageStyles(theme),
  [theme]
);
```

### Проблема 4: Компонент не найден

**Ошибка:**
```
Module not found: Can't resolve '../../components/ui'
```

**Решение:**
```typescript
// Проверьте, что компонент экспортируется из index.ts
// src/components/ui/index.ts должен содержать:
export * from './Button';
export * from './TextField';
// ...

// Или используйте прямой импорт
import { Button } from '../../components/ui/Button';
```

---

## 📊 Прогресс миграции

Отслеживайте прогресс миграции в файле:
`external-files/reports/MIGRATION_PROGRESS.md`

---

## 🆘 Помощь и поддержка

### Ресурсы

- 📖 [UI Components Guide](design-unification/UI_COMPONENTS_GUIDE.md)
- 📋 [Code Review Checklist](external-files/CODE_REVIEW_UI_CHECKLIST.md)
- 🎨 [Design Unification Checklist](design-unification/DESIGN_UNIFICATION_CHECKLIST.md)
- 📊 [UI Standards Analysis](external-files/reports/UI_STANDARDS_ANALYSIS_REPORT.md)

### Контакты

- **Вопросы по миграции:** Создайте issue в GitHub
- **Проблемы с компонентами:** Проверьте Storybook (когда будет настроен)
- **Предложения по улучшению:** Pull Request welcome!

---

**Версия:** 1.0  
**Дата:** 04.10.2025  
**Автор:** Tire Service Team

**Успешной миграции! 🚀**

