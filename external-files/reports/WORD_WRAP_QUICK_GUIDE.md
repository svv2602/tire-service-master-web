# 📖 Быстрый гайд: Перенос слов в таблицах

## 🎯 Что добавлено

Функциональность переноса слов для улучшения отображения длинного текста в таблицах.

## 🚀 Как использовать

### 1. В новых UI компонентах Table
```tsx
import { Table, Column } from 'src/components/ui/Table/Table';

const columns: Column[] = [
  { 
    id: 'title', 
    label: 'Заголовок', 
    wrap: true  // ← Включает перенос слов
  },
  { 
    id: 'description', 
    label: 'Описание', 
    wrap: true  // ← Включает перенос слов
  },
  { id: 'status', label: 'Статус' }, // Без переноса
];

<Table columns={columns} rows={data} />
```

### 2. В существующих таблицах MUI
```tsx
import { getTablePageStyles } from 'src/styles/components';

const tablePageStyles = getTablePageStyles(theme);

// Применить к ячейке с длинным текстом
<TableCell sx={tablePageStyles.tableCellWrap}>
  {longText}
</TableCell>
```

## 🎨 Доступные стили

```typescript
// Основной стиль для переноса слов
tablePageStyles.tableCellWrap  

// Альтернативное название (обратная совместимость)
tablePageStyles.cellWrap
```

## ✅ Рекомендации

**Используйте перенос для:**
- Названий компаний и продуктов
- Описаний и комментариев  
- Адресов
- Длинных email адресов

**НЕ используйте для:**
- Статусов и тегов
- Дат и времени
- Коротких кодов
- Числовых значений

## 🧪 Тестирование

Открыть тестовую страницу: `/testing/word-wrap`

---
**Готово к использованию!** ✅
