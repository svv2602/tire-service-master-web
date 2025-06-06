# Руководство по централизованной системе стилей

## 🎯 Обзор системы

Проект полностью перешел на централизованную систему стилей, обеспечивающую консистентность дизайна и упрощающую поддержку кода.

## 📁 Структура стилевой системы

```
src/styles/
├── theme.ts           # Основная тема, константы, цветовая палитра
├── components.ts      # Стилевые функции для компонентов
├── index.ts          # Экспорт всех стилей
└── components/       # Дополнительные стили (если нужны)

src/components/styled/
├── CommonComponents.tsx    # Базовые переиспользуемые компоненты
└── StyledComponents.tsx   # Готовые стилизованные компоненты
```

## 🚀 Быстрый старт

### 1. Использование готовых компонентов (Рекомендуется)

```tsx
import { 
  FlexBox, 
  GridContainer, 
  GridItem, 
  CenteredBox,
  StyledAlert,
  ResponsiveImage 
} from '../components/styled/CommonComponents';

const MyComponent = () => (
  <GridContainer spacing={3}>
    <GridItem xs={12} md={6}>
      <FlexBox direction="column" gap={2}>
        <ResponsiveImage src="/image.jpg" alt="Описание" />
        <StyledAlert severity="success">
          Операция выполнена успешно!
        </StyledAlert>
      </FlexBox>
    </GridItem>
  </GridContainer>
);
```

### 2. Использование стилевых функций

```tsx
import { useTheme } from '@mui/material';
import { getCardStyles, getButtonStyles, SIZES } from '../styles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={getCardStyles(theme, 'primary')}>
      <Button sx={getButtonStyles(theme, 'success')}>
        Сохранить
      </Button>
    </Box>
  );
};
```

### 3. Использование констант

```tsx
import { SIZES, ANIMATIONS, getThemeColors } from '../styles';

const MyComponent = () => {
  const theme = useTheme();
  const colors = getThemeColors(theme);
  
  return (
    <Box sx={{
      padding: theme.spacing(SIZES.spacing.lg),
      borderRadius: SIZES.borderRadius.md,
      transition: ANIMATIONS.transition.medium,
      backgroundColor: colors.backgroundCard,
    }}>
      Контент
    </Box>
  );
};
```

## 📦 Доступные компоненты

### Базовые компоненты (CommonComponents.tsx)

#### `FlexBox` - Flex-контейнер
```tsx
<FlexBox 
  direction="row"        // 'row' | 'column' | 'row-reverse' | 'column-reverse'
  gap={2}               // Отступ между элементами  
  wrap={true}           // Разрешить перенос
  my={3}                // Вертикальные отступы
>
  {children}
</FlexBox>
```

#### `GridContainer` и `GridItem` - Адаптивная сетка
```tsx
<GridContainer spacing={3}>
  <GridItem xs={12} sm={6} md={4}>
    Содержимое
  </GridItem>
</GridContainer>
```

#### `CenteredBox` - Центрирование контента
```tsx
<CenteredBox minHeight="400px">
  <CircularProgress />
</CenteredBox>
```

#### `StyledAlert` - Унифицированные уведомления
```tsx
<StyledAlert 
  severity="success"     // 'success' | 'error' | 'warning' | 'info'
  marginBottom={3}      // Отступ снизу
>
  Сообщение
</StyledAlert>
```

#### `ResponsiveImage` - Адаптивные изображения
```tsx
<ResponsiveImage 
  src="/path/to/image.jpg"
  alt="Описание изображения"
  borderRadius={8}      // Радиус скругления
/>
```

#### `StyledList` - Списки с отступами
```tsx
<StyledList gap={1}>
  <ListItem>Элемент 1</ListItem>
  <ListItem>Элемент 2</ListItem>
</StyledList>
```

#### `HiddenElement` - Скрытые элементы
```tsx
<HiddenElement 
  component="input"
  type="file"
  id="file-upload"
/>
```

#### `StyledListItemButton` - Навигационные кнопки
```tsx
<StyledListItemButton
  selected={isActive}
  nested={1}            // 0 | 1 | 2 - уровень вложенности
  component={Link}
  to="/path"
>
  <ListItemIcon><Icon /></ListItemIcon>
  <ListItemText primary="Пункт меню" />
</StyledListItemButton>
```

### Карточки сервисов

#### `ServiceCard` - Основная карточка
```tsx
<ServiceCard elevation={2}>
  <ServiceCardMedia 
    height={200}
    image="/service-image.jpg"
    title="Название сервиса"
  />
  <ServiceCardContent spacing={1}>
    <Typography variant="h6">Название</Typography>
    <Typography color="text.secondary">Описание</Typography>
  </ServiceCardContent>
  <ServiceCardActions>
    <Button>Подробнее</Button>
  </ServiceCardActions>
</ServiceCard>
```

## 🎨 Константы и стили

### Размеры (SIZES)

```tsx
// Радиусы скругления
SIZES.borderRadius.xs    // 4px
SIZES.borderRadius.sm    // 8px  
SIZES.borderRadius.md    // 12px
SIZES.borderRadius.lg    // 16px
SIZES.borderRadius.xl    // 24px

// Отступы (для theme.spacing())
SIZES.spacing.xs         // 0.5
SIZES.spacing.sm         // 1
SIZES.spacing.md         // 2
SIZES.spacing.lg         // 3
SIZES.spacing.xl         // 4
SIZES.spacing.xxl        // 6

// Размеры иконок
SIZES.icon.small         // 16px
SIZES.icon.medium        // 24px
SIZES.icon.large         // 32px
SIZES.icon.xlarge        // 48px

// Размеры шрифтов
SIZES.fontSize.xs        // 12px
SIZES.fontSize.sm        // 14px
SIZES.fontSize.md        // 16px
SIZES.fontSize.lg        // 18px
SIZES.fontSize.xl        // 20px
```

### Анимации (ANIMATIONS)

```tsx
// Переходы
ANIMATIONS.transition.fast     // 150ms
ANIMATIONS.transition.medium   // 300ms
ANIMATIONS.transition.slow     // 500ms

// Длительности
ANIMATIONS.duration.fast       // 150ms
ANIMATIONS.duration.medium     // 300ms
ANIMATIONS.duration.slow       // 500ms
```

### Цвета (getThemeColors)

```tsx
const colors = getThemeColors(theme);

// Основные цвета
colors.primary           // Основной цвет
colors.primaryDark       // Темный вариант основного
colors.secondary         // Вторичный цвет

// Текст
colors.textPrimary       // Основной текст
colors.textSecondary     // Вторичный текст

// Фоны
colors.backgroundDefault // Основной фон
colors.backgroundPaper   // Фон карточек
colors.backgroundCard    // Фон компонентов

// Состояния
colors.success          // Успех
colors.successBg        // Фон успеха
colors.error           // Ошибка
colors.errorBg         // Фон ошибки
colors.warning         // Предупреждение
colors.warningBg       // Фон предупреждения

// Границы
colors.borderPrimary    // Основные границы
colors.borderSecondary  // Вторичные границы
```

## 🛠️ Стилевые функции

### Карточки
```tsx
getCardStyles(theme, variant)
// variant: 'primary' | 'secondary' | 'glass' | 'success' | 'error' | 'warning' | 'info' | 'alert'
```

### Кнопки
```tsx
getButtonStyles(theme, variant)
// variant: 'primary' | 'secondary' | 'success' | 'error'
```

### Формы
```tsx
const formStyles = getFormStyles(theme);
// formStyles.container    - стили контейнера формы
// formStyles.section      - стили секции формы
// formStyles.sectionTitle - стили заголовков секций
```

### Текстовые поля
```tsx
getTextFieldStyles(theme) // Универсальные стили для TextField
```

### Таблицы
```tsx
const tableStyles = getTableStyles(theme);
// tableStyles.tableContainer
// tableStyles.tableHead
// tableStyles.tableRow
// tableStyles.tableCell
```

## ✅ Правила использования

### DO (Делать так):
- ✅ Использовать готовые компоненты из `CommonComponents.tsx`
- ✅ Применять константы `SIZES.*` для отступов и размеров
- ✅ Использовать `getThemeColors(theme)` для цветов
- ✅ Применять стилевые функции для сложных компонентов
- ✅ Тестировать в темной и светлой теме

### DON'T (Не делать так):
- ❌ Использовать инлайн-стили `style={{}}`
- ❌ Задавать жесткие значения цветов (#ffffff, rgba())
- ❌ Дублировать стили вместо создания переиспользуемых компонентов
- ❌ Игнорировать адаптивность
- ❌ Создавать новые стили без проверки существующих

## 🔄 Миграция существующих компонентов

### Шаг 1: Анализ существующих стилей
```tsx
// До миграции
<Box sx={{
  display: 'flex',
  gap: 2,
  flexDirection: 'column',
  p: 3,
  borderRadius: 2,
  backgroundColor: theme.palette.background.paper
}}>
```

### Шаг 2: Замена на готовые компоненты
```tsx
// После миграции  
<FlexBox direction="column" gap={2}>
  <Box sx={getCardStyles(theme, 'primary')}>
    {/* Содержимое */}
  </Box>
</FlexBox>
```

## 📞 Поддержка

При возникновении вопросов или необходимости добавления новых стилей:

1. **Проверьте существующие компоненты** в `CommonComponents.tsx`
2. **Изучите доступные стилевые функции** в `components.ts`
3. **Используйте константы** из `theme.ts`
4. **Создайте новый компонент** только если нет подходящего существующего

Помните: цель системы - обеспечить консистентность и упростить разработку! 🎨 