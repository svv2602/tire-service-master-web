# 🚀 Быстрый старт: Улучшения UI

**Версия:** 1.0  
**Дата:** 04.10.2025

---

## 📖 Краткое описание

Это руководство поможет вам быстро начать работать с новыми UI стандартами проекта. Все необходимые инструменты уже настроены и готовы к использованию.

---

## ⚡ 5-минутный старт

### Шаг 1: Правильные импорты

❌ **НЕПРАВИЛЬНО:**
```tsx
import { Button, TextField, Typography } from '@mui/material';
```

✅ **ПРАВИЛЬНО:**
```tsx
import { Button, TextField, Typography } from '../../components/ui';
```

### Шаг 2: Использование стилей

✅ **ПРАВИЛЬНО:**
```tsx
import { useTheme } from '@mui/material';
import { getButtonStyles, getTableStyles } from '../../styles/theme';

const MyComponent = () => {
  const theme = useTheme();
  const buttonStyles = getButtonStyles(theme);
  const tableStyles = getTableStyles(theme);
  
  return (
    <Box sx={tableStyles.pageContainer}>
      <Button sx={buttonStyles.primary}>Кнопка</Button>
    </Box>
  );
};
```

### Шаг 3: Проверка кода

```bash
# Проверить код на соответствие стандартам
npm run lint

# Автоматически исправить простые ошибки
npm run lint:fix
```

---

## 🎯 Основные команды

### Миграция страниц

```bash
# Мигрировать одну страницу или папку
npm run migrate src/pages/my-page/

# Dry-run (проверить без изменений)
npm run migrate:dry src/pages/my-page/

# Проверить результат
npm run migrate:check
```

### Разработка

```bash
# Запустить проект
npm start

# Запустить Storybook (UI-компоненты)
npm run storybook

# Запустить тесты
npm test

# Билд для продакшена
npm run build
```

---

## 🔧 Структура UI

### Централизованные компоненты

Все UI компоненты находятся в `src/components/ui/`:

```
src/components/ui/
├── Button/
├── TextField/
├── Typography/
├── Alert/
├── Dialog/
├── Card/
├── Pagination/
├── Tooltip/
├── ActionsMenu/
└── ...
```

### Стили

```
src/styles/
├── theme.ts          # Главный файл стилей (ЕДИНСТВЕННЫЙ ИСТОЧНИК ИСТИНЫ)
├── components.ts     # Алиас для обратной совместимости
└── tokens.ts         # Дизайн-токены
```

---

## 📚 Основные концепции

### 1. Централизованные компоненты

Все UI компоненты импортируются из одного места:

```tsx
import {
  Button,
  TextField,
  Typography,
  Card,
  Alert,
} from '../../components/ui';
```

**Преимущества:**
- ✅ Единообразный дизайн
- ✅ Легко обновлять все компоненты сразу
- ✅ Лучшая производительность (оптимизированные компоненты)

### 2. Стилевые функции

Используйте стилевые функции вместо дублирования кода:

```tsx
// ❌ Плохо - дублирование стилей
const MyComponent = () => (
  <Button sx={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    padding: '10px 20px',
    // ... еще 20 строк
  }}>
    Кнопка
  </Button>
);

// ✅ Хорошо - переиспользуемые стили
const MyComponent = () => {
  const theme = useTheme();
  const buttonStyles = getButtonStyles(theme);
  
  return (
    <Button sx={buttonStyles.primary}>
      Кнопка
    </Button>
  );
};
```

### 3. Мемоизация для производительности

Все стилевые функции используют мемоизацию:

```tsx
// Стили вычисляются только один раз и кэшируются
const buttonStyles = getButtonStyles(theme); // ⚡ Кэш
const tableStyles = getTableStyles(theme);   // ⚡ Кэш
```

**Прирост производительности:** ~10-15% быстрее рендеринг

---

## 🎨 Примеры использования

### Кнопки

```tsx
import { Button } from '../../components/ui';
import { useTheme } from '@mui/material';
import { getButtonStyles } from '../../styles/theme';

const ButtonExample = () => {
  const theme = useTheme();
  const buttonStyles = getButtonStyles(theme);
  
  return (
    <>
      <Button sx={buttonStyles.primary}>Основная</Button>
      <Button sx={buttonStyles.secondary}>Второстепенная</Button>
      <Button sx={buttonStyles.success}>Успех</Button>
      <Button sx={buttonStyles.error}>Ошибка</Button>
    </>
  );
};
```

### Таблицы со стилями

```tsx
import { Box, Typography } from '../../components/ui';
import { useTheme } from '@mui/material';
import { getTableStyles } from '../../styles/theme';

const TablePage = () => {
  const theme = useTheme();
  const tableStyles = getTableStyles(theme);
  
  return (
    <Box sx={tableStyles.pageContainer}>
      <Box sx={tableStyles.headerContainer}>
        <Typography variant="h4">Заголовок</Typography>
      </Box>
      <Box sx={tableStyles.tableContainer}>
        {/* Содержимое таблицы */}
      </Box>
    </Box>
  );
};
```

### Карточки

```tsx
import { Card, CardContent, Typography } from '../../components/ui';
import { useTheme } from '@mui/material';
import { getCardStyles } from '../../styles/components';

const CardExample = () => {
  const theme = useTheme();
  const cardStyles = getCardStyles(theme);
  
  return (
    <Card sx={cardStyles('primary')}>
      <CardContent>
        <Typography variant="h5">Заголовок карточки</Typography>
        <Typography>Содержимое</Typography>
      </CardContent>
    </Card>
  );
};
```

---

## 🚨 Частые ошибки

### 1. Прямые импорты из MUI

❌ **ОШИБКА:**
```tsx
import { Button } from '@mui/material';
```

✅ **РЕШЕНИЕ:**
```tsx
import { Button } from '../../components/ui';
```

**ESLint сообщит об этой ошибке!**

### 2. Дублирование стилей

❌ **ОШИБКА:**
```tsx
const myStyles = {
  background: 'linear-gradient(...)',
  // ... 50 строк дублированных стилей
};
```

✅ **РЕШЕНИЕ:**
```tsx
const buttonStyles = getButtonStyles(theme);
```

### 3. Неправильный импорт стилевых функций

❌ **ОШИБКА:**
```tsx
import { getButtonStyles } from '../../styles/components';
```

✅ **РЕШЕНИЕ:**
```tsx
import { getButtonStyles } from '../../styles/theme';
// components.ts - это алиас, но theme.ts - источник истины
```

---

## 📋 Чек-лист для новой страницы

При создании новой страницы убедитесь:

- [ ] Все импорты идут из `../../components/ui`
- [ ] Используются стилевые функции из `theme.ts`
- [ ] Нет прямых импортов из `@mui/material`
- [ ] Код проходит `npm run lint` без ошибок
- [ ] Компоненты корректно отображаются в обеих темах (светлой и темной)
- [ ] Адаптивность на мобильных устройствах проверена

---

## 🔍 Проверка перед коммитом

```bash
# 1. Проверить линтер
npm run lint

# 2. Исправить автоматически исправляемые ошибки
npm run lint:fix

# 3. Запустить тесты
npm test

# 4. Проверить билд
npm run build
```

---

## 💡 Полезные ссылки

### Документация
- 📖 [Полное руководство по миграции](./MIGRATION_GUIDE.md)
- 📋 [Чек-лист для ревью](./CODE_REVIEW_UI_CHECKLIST.md)
- 📊 [Прогресс миграции](./reports/MIGRATION_PROGRESS.md)
- 📘 [Анализ UI стандартов](./reports/UI_STANDARDS_ANALYSIS_REPORT.md)

### Инструменты
- 🎨 [Storybook (UI компоненты)](http://localhost:6006)
- 📝 [ESLint конфигурация](./.eslintrc.js)
- 🔧 [Миграционный скрипт](./external-files/scripts/migration/migrate-mui-imports.js)

---

## 🆘 Нужна помощь?

### Вопросы по миграции?
1. Прочитайте [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. Проверьте [CODE_REVIEW_UI_CHECKLIST.md](./CODE_REVIEW_UI_CHECKLIST.md)
3. Создайте issue в GitHub с тегом `ui-migration`

### Нашли баг?
1. Проверьте, не решена ли проблема в [MIGRATION_PROGRESS.md](./reports/MIGRATION_PROGRESS.md)
2. Создайте issue с описанием проблемы и скриншотами

### Предложения по улучшению?
Мы открыты для идей! Создайте issue с тегом `enhancement`

---

## 🎓 Дополнительное обучение

### Видео-туториалы
_В разработке_

### Воркшопы
_Запланировано на следующий месяц_

### Паттерны и best practices
См. [CODE_REVIEW_UI_CHECKLIST.md](./CODE_REVIEW_UI_CHECKLIST.md)

---

**Приятной разработки! 🚀**

_Документ обновлен: 04.10.2025_
