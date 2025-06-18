# 🔄 Mapping кастомных компонентов → UI компоненты

## 📋 Замены компонентов

### 🔘 Кнопки
```tsx
// ❌ БЫЛО:
<Button variant="contained" style={{ backgroundColor: '#1976d2' }}>
// ✅ СТАЛО:
import { Button } from '../../../components/ui/Button';
<Button variant="primary">
```

### 📝 Поля ввода
```tsx
// ❌ БЫЛО:
<TextField sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
// ✅ СТАЛО:
import { TextField } from '../../../components/ui/TextField';
<TextField />
```

### 📋 Таблицы
```tsx
// ❌ БЫЛО:
<Table sx={{ '& th': { fontWeight: 'bold' } }}>
// ✅ СТАЛО:
import { Table } from '../../../components/ui/Table';
<Table />
```

### 🃏 Карточки
```tsx
// ❌ БЫЛО:
<Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
// ✅ СТАЛО:
import { Card } from '../../../components/ui/Card';
<Card>
```

### 📅 Дата/Время
```tsx
// ❌ БЫЛО:
<DatePicker sx={{ width: '100%' }} />
// ✅ СТАЛО:
import { DatePicker } from '../../../components/ui/DatePicker';
<DatePicker />
```

### 🎨 Модальные окна
```tsx
// ❌ БЫЛО:
<Modal sx={{ display: 'flex', alignItems: 'center' }}>
// ✅ СТАЛО:
import { Modal } from '../../../components/ui/Modal';
<Modal />
```

### 🔧 Селекты
```tsx
// ❌ БЫЛО:
<Select sx={{ minWidth: 120 }}>
// ✅ СТАЛО:
import { Select } from '../../../components/ui/Select';
<Select />
```

### ✅ Чекбоксы
```tsx
// ❌ БЫЛО:
<Checkbox sx={{ color: 'primary.main' }} />
// ✅ СТАЛО:
import { Checkbox } from '../../../components/ui/Checkbox';
<Checkbox />
```

## 🚀 Быстрые команды для миграции

### Поиск использований MUI компонентов:
```bash
# Найти все импорты Button из @mui/material
grep -r "import.*Button.*@mui/material" src/pages/

# Найти все TextField
grep -r "import.*TextField.*@mui/material" src/pages/

# Найти все Card
grep -r "import.*Card.*@mui/material" src/pages/

# Найти все Table
grep -r "import.*Table.*@mui/material" src/pages/
```

### Массовая замена импортов:
```bash
# Заменить импорты Button
find src/pages -name "*.tsx" -exec sed -i 's/import { Button } from "@mui\/material"/import { Button } from "..\/..\/..\/components\/ui\/Button"/g' {} \;

# Заменить импорты TextField
find src/pages -name "*.tsx" -exec sed -i 's/import { TextField } from "@mui\/material"/import { TextField } from "..\/..\/..\/components\/ui\/TextField"/g' {} \;
```

### Git команды для отслеживания:
```bash
# Создать основную ветку миграции
git checkout -b feature/ui-migration

# Создать под-ветку для конкретной страницы
git checkout -b ui-migration/dashboard

# Создать checkpoint до миграции
git tag before-ui-migration

# Создать checkpoint после миграции страницы
git tag after-dashboard-migration
```

## 📊 Анализ текущего использования

### Статистика по импортам MUI:
```bash
# Подсчет использования Button
grep -r "from '@mui/material'" src/pages/ | grep Button | wc -l

# Подсчет использования TextField
grep -r "from '@mui/material'" src/pages/ | grep TextField | wc -l

# Подсчет использования Table
grep -r "from '@mui/material'" src/pages/ | grep Table | wc -l
```

### Страницы с наибольшим количеством MUI импортов:
```bash
# Найти файлы с множественными импортами
for file in $(find src/pages -name "*.tsx"); do
  count=$(grep -c "@mui/material" "$file")
  if [ "$count" -gt 3 ]; then
    echo "$file: $count импортов"
  fi
done
```

## 🎯 Приоритетные замены

### 1️⃣ Высокий приоритет (критичные компоненты):
- **Button** - используется везде, легко заменить
- **TextField** - основа всех форм
- **Card** - базовый layout компонент
- **Table** - основа списков данных

### 2️⃣ Средний приоритет:
- **Modal** - диалоги и попапы
- **Select** - выпадающие списки
- **Checkbox/Radio** - элементы форм
- **DatePicker** - календари

### 3️⃣ Низкий приоритет:
- **Tabs** - навигация в интерфейсе
- **Accordion** - сворачиваемые блоки
- **Rating** - звездочки оценок
- **Progress** - индикаторы загрузки

## 🔧 Шаблоны замены

### Страница с таблицей:
```tsx
// ❌ СТАРЫЙ ПОДХОД:
import { 
  Button, 
  TextField, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell 
} from '@mui/material';

// ✅ НОВЫЙ ПОДХОД:
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { Table } from '../../../components/ui/Table';
```

### Страница с формой:
```tsx
// ❌ СТАРЫЙ ПОДХОД:
import { 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  Checkbox 
} from '@mui/material';

// ✅ НОВЫЙ ПОДХОД:
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
```

## 🧪 Тестовые сценарии

### Для каждой замены проверить:
1. **Визуальное соответствие** - компонент выглядит так же
2. **Функциональность** - все обработчики событий работают
3. **Пропсы** - все переданные параметры учитываются
4. **Состояния** - hover, focus, disabled, error
5. **Адаптивность** - корректное отображение на всех экранах

### Автоматизированная проверка:
```bash
# Запуск тестов после замены
npm test -- --testPathPattern=pages/dashboard

# Проверка TypeScript ошибок
npm run type-check

# Проверка линтера
npm run lint

# Билд проверка
npm run build
```

## 📋 Чеклист готовности компонента к замене

### ✅ UI компонент готов если:
- [ ] Имеет TypeScript типы
- [ ] Поддерживает все необходимые пропсы
- [ ] Имеет документацию/examples
- [ ] Покрыт тестами
- [ ] Следует дизайн-системе проекта

### ✅ Страница готова к миграции если:
- [ ] Проанализированы все используемые компоненты
- [ ] Есть соответствующие UI компоненты
- [ ] Подготовлены тестовые сценарии
- [ ] Создана резервная копия (git branch)

## 🚨 Потенциальные проблемы

### Часто встречающиеся:
1. **Разные наборы пропсов** - UI компонент может не поддерживать все пропсы MUI
2. **Изменение стилей** - UI компоненты могут иметь другие дефолтные стили
3. **Событийная модель** - onChange может работать по-разному
4. **Зависимости** - UI компоненты могут требовать других провайдеров

### Решения:
1. **Расширить UI компонент** - добавить недостающие пропсы
2. **Использовать sx prop** - для кастомизации стилей
3. **Обернуть логику** - создать adapter компонент
4. **Обновить контекст** - добавить необходимые провайдеры

---

**Обновлено:** _текущая дата_  
**Версия:** 1.0  
**Статус:** 📋 Готов к использованию 