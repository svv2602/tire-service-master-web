# Tooltip Component

Централизованный компонент подсказки (Tooltip) для единообразного отображения во всем приложении.

## Особенности

- ✅ Простой API с типизацией TypeScript
- ✅ Поддержка светлой и темной темы
- ✅ Настраиваемые задержки появления/исчезновения
- ✅ Автоматическое скрытие при пустом title
- ✅ Консистентный дизайн во всем приложении
- ✅ Оптимизированная производительность

## Использование

### Базовый пример

```tsx
import { Tooltip } from '../../components/ui/Tooltip';
import { IconButton } from '@mui/material';
import { EditIcon } from '@mui/icons-material';

<Tooltip title="Редактировать">
  <IconButton>
    <EditIcon />
  </IconButton>
</Tooltip>
```

### Варианты темы

```tsx
// Темная тема (по умолчанию)
<Tooltip title="Темная подсказка">
  <Button>Кнопка</Button>
</Tooltip>

// Светлая тема
<Tooltip title="Светлая подсказка" variant="light">
  <Button>Кнопка</Button>
</Tooltip>
```

### Настройка задержек

```tsx
// Быстрое появление
<Tooltip title="Быстрая подсказка" enterDelay={100}>
  <Chip label="Быстро" />
</Tooltip>

// Без задержки исчезновения
<Tooltip title="Долгая подсказка" leaveDelay={500}>
  <Avatar>U</Avatar>
</Tooltip>
```

### Позиционирование

```tsx
<Tooltip title="Подсказка снизу" placement="bottom">
  <TextField label="Поле" />
</Tooltip>

<Tooltip title="Подсказка справа" placement="right">
  <Switch />
</Tooltip>
```

### Максимальная ширина

```tsx
<Tooltip 
  title="Очень длинная подсказка, которая может занимать много места"
  maxWidth={200}
>
  <Button>Узкая подсказка</Button>
</Tooltip>
```

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | **Обязательный.** Текст подсказки |
| `children` | `React.ReactElement` | - | **Обязательный.** Элемент, к которому привязана подсказка |
| `variant` | `'light' \| 'dark'` | `'dark'` | Вариант внешнего вида |
| `enterDelay` | `number` | `200` | Задержка появления в миллисекундах |
| `leaveDelay` | `number` | `0` | Задержка исчезновения в миллисекундах |
| `maxWidth` | `number` | `300` | Максимальная ширина в пикселях |
| `arrow` | `boolean` | `true` | Показывать стрелку |
| `placement` | `MuiTooltipProps['placement']` | `'top'` | Позиция относительно элемента |

### Наследуемые props

Компонент наследует все props от MUI Tooltip, кроме `title`.

## Примеры использования в проекте

### Кнопки действий в таблицах

```tsx
// В ReviewsPage.tsx
<Tooltip title="Одобрить отзыв">
  <IconButton onClick={() => handleApprove(review)}>
    <CheckIcon color="success" />
  </IconButton>
</Tooltip>

<Tooltip title="Отклонить отзыв">
  <IconButton onClick={() => handleReject(review)}>
    <CloseIcon color="error" />
  </IconButton>
</Tooltip>
```

### Информационные элементы

```tsx
// В ServicePointCard.tsx
<Tooltip title="Средний рейтинг сервисной точки">
  <Box display="flex" alignItems="center">
    <StarIcon />
    <Typography>{rating}</Typography>
  </Box>
</Tooltip>
```

### Статусы и индикаторы

```tsx
// В BookingCard.tsx
<Tooltip title="Бронирование подтверждено">
  <Chip 
    label="Подтверждено" 
    color="success" 
    variant="light"
  />
</Tooltip>
```

## Рекомендации

### ✅ Делайте

- Используйте краткие и понятные тексты
- Добавляйте подсказки к неочевидным элементам интерфейса
- Используйте единый стиль во всем приложении
- Тестируйте на мобильных устройствах

### ❌ Избегайте

- Слишком длинных текстов (более 1-2 строк)
- Дублирования очевидной информации
- Подсказок на элементах с текстом
- Слишком коротких задержек (<100ms)

## Стилизация

Компонент использует дизайн-токены из `tokens.ts`:

```tsx
// Темная тема
backgroundColor: 'rgba(33, 33, 33, 0.95)'
color: '#fff'
boxShadow: '0 2px 8px rgba(0,0,0,0.3)'

// Светлая тема  
backgroundColor: 'rgba(255, 255, 255, 0.95)'
color: '#333'
boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
border: '1px solid rgba(0,0,0,0.12)'
```

## Миграция с MUI Tooltip

```tsx
// Старый код
import { Tooltip } from '@mui/material';

<Tooltip title="Подсказка">
  <Button>Кнопка</Button>
</Tooltip>

// Новый код
import { Tooltip } from '../../components/ui/Tooltip';

<Tooltip title="Подсказка">
  <Button>Кнопка</Button>
</Tooltip>
```

## Производительность

- Компонент оптимизирован для частого использования
- Автоматически скрывается при пустом `title`
- Минимальный overhead по сравнению с MUI Tooltip
- Поддерживает React.memo для дочерних компонентов 