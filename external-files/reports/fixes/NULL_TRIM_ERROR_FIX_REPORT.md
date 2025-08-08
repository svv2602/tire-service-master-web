# 🚨 ИСПРАВЛЕНИЕ: Ошибка "Cannot read properties of null (reading 'trim')" в ProblematicDataAnalysisPage

## ❌ ПРОБЛЕМА
```
ERROR: Cannot read properties of null (reading 'trim')
TypeError: Cannot read properties of null (reading 'trim')
    at ProblematicDataAnalysisPage (line 824:45)
```

**Корневая причина:** В компоненте `ProblematicDataAnalysisPage.tsx` вызывался метод `trim()` на свойстве `item.name`, которое могло быть `null` или `undefined`.

## ✅ ИСПРАВЛЕНИЯ

### 1. Фильтрация данных (строка 150-152)
**Было:**
```tsx
return data.filter(item => 
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Стало:**
```tsx
return data.filter(item => 
  item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 2. Отображение названия в таблице (строка 393)
**Было:**
```tsx
{item.name.trim() === '' ? (
  <Box component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
    (пустая строка)
  </Box>
) : (
  `"${item.name}"`
)}
```

**Стало:**
```tsx
{!item.name || item.name.trim() === '' ? (
  <Box component="span" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
    (пустая строка)
  </Box>
) : (
  `"${item.name}"`
)}
```

### 3. Ключ для TableRow (строка 390)
**Было:**
```tsx
<TableRow key={`${item.name}-${index}`} hover>
```

**Стало:**
```tsx
<TableRow key={`${item.name || 'empty'}-${index}`} hover>
```

### 4. Заголовок диалога (строка 511)
**Было:**
```tsx
selectedItem?.name?.trim() === '' ? (
```

**Стало:**
```tsx
!selectedItem?.name || selectedItem.name.trim() === '' ? (
```

### 5. Диалог добавления алиаса (строка 617)
**Было:**
```tsx
Добавить алиас для "{selectedItem?.name}"
```

**Стало:**
```tsx
Добавить алиас для "{selectedItem?.name || '(пустая строка)'}"
```

## 🎯 РЕЗУЛЬТАТ

✅ **Устранены все ошибки runtime:**
- Компонент корректно обрабатывает `null` и `undefined` значения для `item.name`
- Добавлена защита от вызова `trim()` на null значениях
- Улучшена обработка пустых строк и null значений

✅ **Улучшена UX:**
- Корректное отображение "(пустая строка)" для null значений
- Стабильные ключи для React компонентов
- Безопасная фильтрация данных

## 📊 ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ

**Затронутый файл:**
- `src/pages/admin/normalization/ProblematicDataAnalysisPage.tsx`

**Тип исправления:**
- Null safety проверки
- Defensive programming
- Error handling улучшения

**Статус:** ✅ ЗАВЕРШЕНО

Проблема полностью решена. Страница `/admin/normalization/analysis` теперь работает стабильно без runtime ошибок.