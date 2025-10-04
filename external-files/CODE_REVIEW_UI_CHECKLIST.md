# ✅ Чек-лист код-ревью для UI изменений

## 📋 Общие правила

Используйте этот чек-лист при ревью Pull Request с изменениями UI компонентов или страниц.

---

## 1. 🚫 Запрещенные импорты

### ❌ Прямые импорты из MUI

```typescript
// ❌ ЗАПРЕЩЕНО
import { Box, Button, TextField } from '@mui/material';
import { styled } from '@mui/system';

// ✅ ПРАВИЛЬНО
import { Box, Button, TextField } from '../../components/ui';
```

**Проверка:**
- [ ] Нет прямых импортов из `@mui/material`
- [ ] Нет прямых импортов из `@mui/system`
- [ ] Нет использования `styled-components`
- [ ] Все UI компоненты импортируются из `src/components/ui`

**Исключения (допустимые файлы):**
- `src/components/ui/**/*` - сами UI компоненты
- `src/styles/**/*` - стилевые файлы
- `src/contexts/ThemeContext.tsx` - контекст темы
- `src/App.tsx` - корневой компонент

---

## 2. 🎨 Использование стилей

### ❌ Инлайн-стили и хардкод

```typescript
// ❌ ЗАПРЕЩЕНО - инлайн стили
<Box style={{ padding: '20px', backgroundColor: '#fff' }}>

// ❌ ЗАПРЕЩЕНО - хардкод в sx
<Box sx={{ padding: '20px', backgroundColor: '#ffffff' }}>

// ✅ ПРАВИЛЬНО - использование темы и констант
const theme = useTheme();
const tableStyles = useMemo(() => getTableStyles(theme), [theme]);

<Box sx={tableStyles.container}>
```

**Проверка:**
- [ ] Нет использования атрибута `style={}`
- [ ] Нет хардкода цветов (только `theme.palette.*`)
- [ ] Нет хардкода размеров (только `SIZES.*` или `theme.spacing()`)
- [ ] Используются централизованные стилевые функции из `src/styles`

### ✅ Правильное использование стилей

```typescript
// ✅ Импорт стилевых функций
import { getTablePageStyles, SIZES } from '../../styles';

// ✅ Мемоизация для производительности
const tablePageStyles = useMemo(
  () => getTablePageStyles(theme),
  [theme]
);

// ✅ Использование стилей
<Box sx={tablePageStyles.pageContainer}>
  <Typography sx={tablePageStyles.pageTitle}>Заголовок</Typography>
</Box>
```

---

## 3. 📦 Использование UI компонентов

### ❌ Некорректное использование

```typescript
// ❌ ЗАПРЕЩЕНО - собственная реализация
<div style={{ display: 'flex' }}>
  <button onClick={handleClick}>Кнопка</button>
</div>

// ❌ ЗАПРЕЩЕНО - разные подходы для одной задачи
<IconButton onClick={handleEdit}><EditIcon /></IconButton>
<Button variant="text" size="small"><EditIcon /></Button>

// ✅ ПРАВИЛЬНО - единообразный подход
import { ActionsMenu } from '../../components/ui';

<ActionsMenu
  actions={[
    { label: 'Редактировать', onClick: handleEdit, icon: <EditIcon /> }
  ]}
/>
```

**Проверка:**
- [ ] Используются централизованные UI компоненты
- [ ] Соблюдается единообразие паттернов (см. таблицу ниже)
- [ ] Нет собственных реализаций существующих компонентов
- [ ] Используются правильные варианты компонентов

### 📊 Канонические компоненты

| Функциональность | Компонент | Запрещено |
|-----------------|-----------|-----------|
| **Таблицы** | `<PageTable>` из `common/PageTable` | `<Table>` из MUI, кастомные таблицы |
| **Кнопки действий** | `<ActionsMenu>` из `ui/ActionsMenu` | `IconButton`, собственные кнопки |
| **Пагинация** | `<Pagination>` из `ui/Pagination` | `TablePagination` из MUI |
| **Формы** | Formik + UI компоненты | Нативные HTML формы, MUI формы напрямую |

---

## 4. ⚡ Производительность

### ❌ Проблемы производительности

```typescript
// ❌ ЗАПРЕЩЕНО - создание объекта на каждом рендере
const MyComponent = () => {
  const theme = useTheme();
  const styles = getTableStyles(theme); // Пересоздается каждый раз!
  
  return <Box sx={styles.container}>...</Box>;
};

// ✅ ПРАВИЛЬНО - мемоизация
const MyComponent = () => {
  const theme = useTheme();
  const styles = useMemo(
    () => getTableStyles(theme),
    [theme]
  );
  
  return <Box sx={styles.container}>...</Box>;
};
```

**Проверка:**
- [ ] Стилевые функции обернуты в `useMemo()` с правильными зависимостями
- [ ] Нет вызовов стилевых функций внутри JSX
- [ ] Нет создания объектов стилей на каждом рендере
- [ ] Тяжелые вычисления мемоизированы с `useMemo()`/`useCallback()`

---

## 5. 📱 Адаптивность

```typescript
// ✅ ПРАВИЛЬНО - использование адаптивных стилей
const tableStyles = useMemo(
  () => getAdaptiveTableStyles(theme, isMobile, isTablet),
  [theme, isMobile, isTablet]
);

// ✅ Скрытие колонок на мобильных
const columns: Column[] = [
  { id: 'name', label: 'Название' },
  { id: 'date', label: 'Дата', hideOnMobile: true },
  { id: 'actions', label: 'Действия' },
];
```

**Проверка:**
- [ ] Используются адаптивные стилевые функции
- [ ] Таблицы имеют горизонтальную прокрутку на мобильных
- [ ] Неважные колонки скрыты через `hideOnMobile: true`
- [ ] Кнопки и формы адаптируются под размер экрана

---

## 6. 🌓 Поддержка тем

```typescript
// ✅ ПРАВИЛЬНО - использование цветов темы
const theme = useTheme();
const colors = useMemo(() => getThemeColors(theme), [theme]);

<Box sx={{ 
  backgroundColor: colors.backgroundCard, // Адаптируется под тему
  color: colors.textPrimary 
}}>
```

**Проверка:**
- [ ] Все цвета берутся из `theme.palette.*` или `getThemeColors()`
- [ ] Компонент корректно отображается в обеих темах (светлая/темная)
- [ ] Нет хардкода цветов типа `#fff`, `#000`, `rgb(255,255,255)`
- [ ] Контрастность текста достаточна в обеих темах

---

## 7. 🧪 Типизация

```typescript
// ❌ ПЛОХО - отсутствие типов
const MyComponent = (props) => { ... };

// ✅ ХОРОШО - строгая типизация
interface MyComponentProps {
  title: string;
  onSave: (data: FormData) => void;
  loading?: boolean;
}

const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onSave, 
  loading = false 
}) => { ... };
```

**Проверка:**
- [ ] Все props имеют явные типы
- [ ] Используются правильные типы из UI библиотеки (`Column`, `ActionItem`, и т.д.)
- [ ] Нет использования `any` без крайней необходимости
- [ ] TypeScript не выдает ошибок

---

## 8. 🔤 Локализация

```typescript
// ❌ ЗАПРЕЩЕНО - хардкод текста
<Button>Сохранить</Button>

// ✅ ПРАВИЛЬНО - использование переводов
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<Button>{t('common.save')}</Button>
```

**Проверка:**
- [ ] Весь видимый текст локализован через `t()`
- [ ] Нет хардкода текста на украинском/русском
- [ ] Ключи переводов следуют соглашению (`namespace.key`)
- [ ] Добавлены переводы для обоих языков (RU/UK)

---

## 9. ♿ Доступность (a11y)

```typescript
// ✅ ПРАВИЛЬНО - правильная доступность
<IconButton
  onClick={handleDelete}
  aria-label="Удалить запись"
>
  <DeleteIcon />
</IconButton>

<TextField
  label="Email"
  required
  error={!!errors.email}
  helperText={errors.email}
  aria-describedby="email-helper-text"
/>
```

**Проверка:**
- [ ] Кнопки без текста имеют `aria-label`
- [ ] Формы имеют правильные `label` и `helperText`
- [ ] Интерактивные элементы доступны с клавиатуры
- [ ] Ошибки валидации озвучиваются скринридерами

---

## 10. 📐 Консистентность

**Проверка:**
- [ ] Стиль кода соответствует существующим страницам
- [ ] Используются те же паттерны для похожих задач
- [ ] Отступы и spacing единообразны (через `theme.spacing()`)
- [ ] Naming соответствует проектным соглашениям

---

## 🎯 Итоговый чеклист

Перед одобрением PR убедитесь, что:

- [ ] ✅ Все пункты раздела 1 (Запрещенные импорты) выполнены
- [ ] ✅ Все пункты раздела 2 (Использование стилей) выполнены
- [ ] ✅ Все пункты раздела 3 (UI компоненты) выполнены
- [ ] ✅ Все пункты раздела 4 (Производительность) выполнены
- [ ] ✅ Все пункты раздела 5 (Адаптивность) выполнены
- [ ] ✅ Все пункты раздела 6 (Поддержка тем) выполнены
- [ ] ✅ Все пункты раздела 7 (Типизация) выполнены
- [ ] ✅ Все пункты раздела 8 (Локализация) выполнены
- [ ] ✅ Все пункты раздела 9 (Доступность) выполнены
- [ ] ✅ Все пункты раздела 10 (Консистентность) выполнены

---

## 🛠️ Автоматические проверки

### ESLint

```bash
# Запустить линтер
npm run lint

# Ожидаемый результат: 0 ошибок related to MUI imports
```

### TypeScript

```bash
# Проверить типы
npx tsc --noEmit

# Ожидаемый результат: 0 ошибок
```

### Тестирование в обеих темах

1. Запустить приложение: `npm start`
2. Открыть страницу с изменениями
3. Переключить тему (светлая ↔ темная)
4. Проверить:
   - Корректность отображения
   - Читаемость текста
   - Работоспособность интерактивных элементов

---

## 📚 Дополнительные ресурсы

- [UI Components Guide](design-unification/UI_COMPONENTS_GUIDE.md)
- [Migration Guide](external-files/MIGRATION_GUIDE.md)
- [Style System Guide](docs/migration/STYLE_SYSTEM_GUIDE.md)
- [Design Unification Checklist](design-unification/DESIGN_UNIFICATION_CHECKLIST.md)

---

**Версия:** 1.0  
**Дата:** 04.10.2025  
**Автор:** Tire Service Team

