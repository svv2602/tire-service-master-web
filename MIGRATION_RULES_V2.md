# 📋 Правила миграции UI компонентов - Версия 2.0

## 🎯 Цель
Полная миграция React компонентов с MUI на собственную UI систему с убиранием ненужных Paper компонентов.

## 📦 Стратегия Git
- **Отдельная ветка**: `ui-migration/{page-name}` для каждой страницы
- **Коммиты**: описательные с эмодзи и списком изменений
- **Объединение**: через merge request после завершения миграции страницы

## 🔄 Процесс миграции компонентов

### 1. **Основные компоненты**
```tsx
// ❌ Старый код:
import { Button, TextField, Paper } from '@mui/material';

// ✅ Новый код:
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
// Paper НЕ импортируем если используется только как контейнер
```

### 2. **Замена Paper компонентов**

#### ❌ Удаляем Paper если он используется только как контейнер:
```tsx
// ❌ НЕ ДЕЛАТЬ:
<Paper sx={{ 
  backgroundColor: 'transparent',
  boxShadow: 'none',
  border: 'none',
  p: 2 
}}>
  <TextField />
  <Select />
</Paper>

// ✅ ДЕЛАТЬ:
<Box sx={{ p: 2 }}>
  <TextField />
  <Select />
</Box>
```

#### ⚠️ Оставляем Paper только в специальных случаях:
```tsx
// ✅ TableContainer - оставляем для семантики
<TableContainer sx={{
  backgroundColor: 'transparent',
  boxShadow: 'none',
  border: 'none'
}}>

// ✅ Modal PaperProps - нужен для accessibility
<Modal PaperProps={{ sx: cardStyles }}>
```

### 3. **Компоненты для замены**

| MUI Компонент | UI Компонент | Примечания |
|---------------|-------------|------------|
| `Button` | `ui/Button` | Полная замена |
| `TextField` | `ui/TextField` | Полная замена |
| `Paper` | `Box` | **УДАЛЯТЬ если только контейнер** |
| `Alert` | `ui/Alert` | Полная замена |
| `Chip` | `ui/Chip` | Полная замена |
| `Select` | `ui/Select` | Поддерживает children + options |
| `Pagination` | `ui/Pagination` | Полная замена |
| `Dialog` | `ui/Modal` | Замена с новым API |
| `Tabs` | `ui/Tabs` | Новый API с массивом tabs |
| `Switch` | `ui/Switch` | Полная замена |
| `Snackbar` | `ui/Snackbar` | Полная замена |

### 4. **Обязательные правила стилизации**

#### Убираем серые подложки:
```tsx
// ❌ НЕ НУЖНО (удаляем Paper):
backgroundColor: 'transparent',
boxShadow: 'none',
border: 'none'

// ✅ Заменяем на Box:
<Box sx={{ p: 2, mb: 3 }}>
```

#### Централизованные стили:
```tsx
import { SIZES } from '../../styles/theme';
import { getCardStyles, getButtonStyles } from '../../styles/components';

const theme = useTheme();
const cardStyles = getCardStyles(theme);
```

### 5. **Особенности API новых компонентов**

#### Modal (замена Dialog):
```tsx
// ❌ Старый Dialog API:
<Dialog open={open} onClose={onClose}>
  <DialogTitle>Заголовок</DialogTitle>
  <DialogContent>Контент</DialogContent>
  <DialogActions>
    <Button>Кнопки</Button>
  </DialogActions>
</Dialog>

// ✅ Новый Modal API:
<Modal 
  open={open} 
  onClose={onClose}
  title="Заголовок"
  actions={<Button>Кнопки</Button>}
>
  Контент
</Modal>
```

#### Tabs (новый API):
```tsx
// ✅ Новый Tabs API:
const tabs = [
  { label: 'Общие', value: 0, icon: <SettingsIcon /> },
  { label: 'Уведомления', value: 1, icon: <NotificationsIcon /> }
];

<Tabs
  value={activeTab}
  onChange={(value) => setActiveTab(value)} // value первый параметр!
  tabs={tabs}
/>
```

#### Select (поддержка children):
```tsx
// ✅ Два способа использования:
// 1. С options prop:
<Select
  options={[
    { value: 'option1', label: 'Опция 1' },
    { value: 'option2', label: 'Опция 2' }
  ]}
  onChange={(value) => setValue(value)}
/>

// 2. С children (MUI style):
<Select onChange={(value) => setValue(value)}>
  <MenuItem value="option1">Опция 1</MenuItem>
  <MenuItem value="option2">Опция 2</MenuItem>
</Select>
```

### 6. **Алгоритм миграции страницы**

1. **Анализ** - определить все MUI компоненты на странице
2. **Paper аудит** - найти все Paper и решить: удалить или оставить
3. **Замена импортов** - заменить MUI импорты на UI импорты
4. **Обновление JSX** - заменить компоненты и их API
5. **Стили** - применить централизованные стили и убрать серые подложки
6. **Тестирование** - проверить что все работает
7. **Очистка** - удалить неиспользуемые импорты

### 7. **Чек-лист завершения миграции**

- [ ] ✅ Все MUI компоненты заменены на UI компоненты
- [ ] ✅ Paper компоненты-контейнеры заменены на Box
- [ ] ✅ Серые подложки убраны
- [ ] ✅ Централизованные стили применены
- [ ] ✅ Неиспользуемые импорты удалены
- [ ] ✅ Функциональность сохранена
- [ ] ✅ TypeScript ошибок нет
- [ ] ✅ Страница компилируется
- [ ] ✅ Создан коммит с описательным сообщением

## 🎨 Примеры до/после

### Поиск и фильтры:
```tsx
// ❌ Было:
<Paper sx={{ 
  p: SIZES.spacing.md, 
  mb: SIZES.spacing.lg,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  border: 'none'
}}>
  <TextField />
  <Select />
</Paper>

// ✅ Стало:
<Box sx={{ 
  p: SIZES.spacing.md, 
  mb: SIZES.spacing.lg 
}}>
  <TextField />
  <Select />
</Box>
```

### Таблицы:
```tsx
// ❌ Было:
<TableContainer component={Paper} sx={{
  backgroundColor: 'transparent',
  boxShadow: 'none',
  border: 'none'
}}>

// ✅ Стало:
<TableContainer sx={{
  backgroundColor: 'transparent',
  boxShadow: 'none',
  border: 'none'
}}>
```

## 📊 Прогресс миграции

### ✅ Завершенные страницы (11/24 - 45.8%):
1. DashboardPage
2. LoginPage 
3. PartnersPage
4. ServicePointsPage
5. ClientsPage
6. BookingsPage
7. NewServicesPage
8. ReviewsPage
9. UsersPage
10. SettingsPage
11. RegionsPage

### 🔄 Рефакторинг Paper (завершен):
- ✅ PartnersPage: Paper → Box
- ✅ ClientsPage: Paper → Box
- ✅ BookingsPage: Paper → Box  
- ✅ ReviewsPage: Paper → Box
- ✅ UsersPage: Paper → Box
- ✅ SettingsPage: Paper → Box
- ✅ RegionsPage: Paper → Box

### 📋 Оставшиеся страницы (13/24):
- [ ] CatalogPage
- [ ] CarBrandsPage  
- [ ] CitiesPage
- [ ] ArticlesPage
- [ ] ProfilePage
- [ ] MyBookingsPage
- [ ] MyCarsPage
- [ ] KnowledgeBasePage
- [ ] PageContentPage
- [ ] ServicePointFormPage
- [ ] ClientFormPage
- [ ] RegionFormPage
- [ ] ArticleFormPage

## 🔧 Новые компоненты созданы:
- ✅ Tabs (с TabPanel)
- ✅ Switch  
- ✅ Snackbar (с SnackbarContext)

**Цель**: Завершить миграцию всех 24 страниц с применением новых правил по Paper компонентам.