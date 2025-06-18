# 📝 Перенос слов в таблицах - Обновление UI компонентов

## 📋 Обзор изменений

Добавлена возможность переноса слов по умолчанию во всех таблицах приложения через обновление централизованных стилей и UI компонентов.

## ✨ Новые возможности

### 1. **Автоматический перенос в стилевых функциях**

#### `getTablePageStyles()` - Обновлены стили ячеек
```typescript
tableCellWrap: {
  padding: theme.spacing(1.5, 2),
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  hyphens: 'auto',
  wordWrap: 'break-word', // Для старых браузеров
},
```

#### `getTableStyles()` - Новые стили
```typescript
tableCellWrap: {
  // Базовые стили...
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  hyphens: 'auto',
  wordWrap: 'break-word',
},
cellWrap: {
  // Аналогичные стили для обратной совместимости
},
```

### 2. **UI компонент Table с поддержкой переноса**

#### Новое свойство Column.wrap
```typescript
interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  wrap?: boolean; // 🆕 Новое свойство
  format?: (value: any) => string | React.ReactNode;
}
```

#### Использование
```tsx
const columns: Column[] = [
  { 
    id: 'title', 
    label: 'Заголовок', 
    minWidth: 200, 
    wrap: true // 🆕 Включаем перенос
  },
  { 
    id: 'description', 
    label: 'Описание', 
    minWidth: 300, 
    wrap: true // 🆕 Включаем перенос
  },
  { id: 'status', label: 'Статус', minWidth: 100 }, // Без переноса
];
```

## 🛠️ CSS свойства для переноса

### Современные стандарты
- `wordBreak: 'break-word'` - разрыв длинных слов
- `overflowWrap: 'break-word'` - современный стандарт
- `hyphens: 'auto'` - автоматические переносы с дефисами

### Обратная совместимость
- `wordWrap: 'break-word'` - для старых браузеров
- `whiteSpace: 'normal'` - разрешение многострочности

## 📚 Применение в существующих страницах

### Страницы с длинным контентом
```tsx
// UsersPage.tsx
<TableCell sx={tablePageStyles.tableCellWrap}>
  {user.first_name} {user.last_name}
</TableCell>

// PartnersPage.tsx  
<TableCell sx={tablePageStyles.tableCellWrap}>
  {partner.description}
</TableCell>

// ServicePointsPage.tsx
<TableCell sx={tablePageStyles.tableCellWrap}>
  {servicePoint.address}
</TableCell>
```

### Новые UI компоненты
```tsx
<Table
  columns={[
    { id: 'name', label: 'Название', wrap: true },
    { id: 'description', label: 'Описание', wrap: true },
    { id: 'status', label: 'Статус' }, // Без переноса
  ]}
  rows={data}
/>
```

## 🎯 Рекомендации по использованию

### ✅ Используйте перенос для:
- Названий и заголовков
- Описаний и комментариев
- Адресов и длинного текста
- Email адресов (очень длинных)

### ❌ Не используйте перенос для:
- Коротких статусов
- Дат и времени
- Числовых значений
- Коротких кодов/ID

## 📊 Storybook примеры

Добавлен новый story `WithWordWrap` в `Table.stories.tsx`:

```tsx
export const WithWordWrap = Template.bind({});
WithWordWrap.args = {
  columns: columnsWithWrap,
  rows: rowsWithLongText,
};
```

## 🔧 Технические детали

### Файлы изменены:
- `src/styles/components.ts` - обновлены `getTablePageStyles()` и `getTableStyles()`
- `src/styles/theme.ts` - добавлены `tableCellWrap` и `cellWrap`
- `src/components/ui/Table/Table.tsx` - добавлено свойство `wrap`
- `src/components/ui/Table/Table.stories.tsx` - новый story

### Обратная совместимость:
- ✅ Существующие таблицы продолжат работать без изменений
- ✅ Добавлены альтернативные названия стилей (`cellWrap`)
- ✅ Сохранены все существующие стили (`tableCell`)

## 🚀 Результат

- **Универсальность:** Перенос слов доступен во всех таблицах
- **Гибкость:** Можно включать/отключать для отдельных колонок
- **Качество:** Современные CSS свойства с fallback
- **Совместимость:** Работает в старых и новых браузерах
- **Стандартизация:** Единый подход для всего приложения

---

**Дата создания:** 18 июня 2025  
**Статус:** ✅ Реализовано и протестировано  
**Совместимость:** Все современные браузеры + IE11

## 📋 Статус тестирования

### ✅ Завершенные тесты:
- **Браузерное тестирование** - Создана тестовая страница `/testing/word-wrap`
- **Интеграция с существующими таблицами** - Применено к CarBrandsPage и PartnersPage
- **UI компонент Table** - Протестирован новый prop `wrap`
- **Storybook примеры** - Добавлен story `WithWordWrap`
- **Обратная совместимость** - Все существующие функции работают корректно

### 🎯 Готово к продакшену:
Функциональность переноса слов полностью реализована, протестирована и готова к использованию в производственной среде.
