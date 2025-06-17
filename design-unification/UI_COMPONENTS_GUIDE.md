# 📚 Руководство по использованию UI компонентов

## 📂 Расположение компонентов
- Все UI компоненты находятся в директории: `src/components/ui/`
- Storybook документация: `src/stories/`
- Примеры использования: `src/examples/`

## 🎯 Доступные UI компоненты

### 1️⃣ Базовые компоненты
| Компонент | Замена для | Описание |
|-----------|------------|-----------|
| `UI.Button` | MUI Button | Кнопки с предустановленными стилями |
| `UI.Card` | MUI Card | Карточки с тенями и отступами |
| `UI.Paper` | MUI Paper | Контейнеры с фоном |
| `UI.Badge` | MUI Badge | Бейджи для уведомлений |
| `UI.Avatar` | MUI Avatar | Аватары пользователей |
| `UI.Chip` | MUI Chip | Метки и теги |
| `UI.Icon` | MUI Icon | Иконки с унифицированным стилем |
| `UI.Typography` | MUI Typography | Текстовые элементы |
| `UI.Link` | MUI Link | Ссылки |
| `UI.Divider` | MUI Divider | Разделители |

### 2️⃣ Компоненты формы
| Компонент | Замена для | Описание |
|-----------|------------|-----------|
| `UI.TextField` | MUI TextField | Текстовые поля |
| `UI.Select` | MUI Select | Выпадающие списки |
| `UI.Checkbox` | MUI Checkbox | Чекбоксы |
| `UI.Radio` | MUI Radio | Радио-кнопки |
| `UI.Switch` | MUI Switch | Переключатели |
| `UI.DatePicker` | MUI DatePicker | Выбор даты |
| `UI.TimePicker` | MUI TimePicker | Выбор времени |
| `UI.AutoComplete` | MUI Autocomplete | Автодополнение |
| `UI.FormControl` | MUI FormControl | Контейнер формы |
| `UI.FormGroup` | MUI FormGroup | Группа полей |
| `UI.FormLabel` | MUI FormLabel | Метки полей |
| `UI.FormHelperText` | MUI FormHelperText | Вспомогательный текст |
| `UI.Slider` | MUI Slider | Слайдеры |

### 3️⃣ Компоненты навигации
| Компонент | Замена для | Описание |
|-----------|------------|-----------|
| `UI.Tabs` | MUI Tabs | Вкладки |
| `UI.Breadcrumbs` | MUI Breadcrumbs | Хлебные крошки |
| `UI.Pagination` | MUI Pagination | Пагинация |
| `UI.Menu` | MUI Menu | Меню |
| `UI.Drawer` | MUI Drawer | Боковая панель |
| `UI.BottomNavigation` | MUI BottomNavigation | Нижняя навигация |

### 4️⃣ Компоненты обратной связи
| Компонент | Замена для | Описание |
|-----------|------------|-----------|
| `UI.Alert` | MUI Alert | Уведомления |
| `UI.Snackbar` | MUI Snackbar | Всплывающие сообщения |
| `UI.Dialog` | MUI Dialog | Диалоговые окна |
| `UI.Modal` | MUI Modal | Модальные окна |
| `UI.Progress` | MUI Progress | Индикаторы загрузки |
| `UI.Skeleton` | MUI Skeleton | Плейсхолдеры |

### 5️⃣ Компоненты отображения данных
| Компонент | Замена для | Описание |
|-----------|------------|-----------|
| `UI.Table` | MUI Table | Таблицы |
| `UI.List` | MUI List | Списки |
| `UI.Tooltip` | MUI Tooltip | Подсказки |
| `UI.AvatarGroup` | MUI AvatarGroup | Группы аватаров |
| `UI.Accordion` | MUI Accordion | Аккордеоны |

### 6️⃣ Компоненты макета
| Компонент | Замена для | Описание |
|-----------|------------|-----------|
| `UI.Box` | MUI Box | Контейнеры |
| `UI.Container` | MUI Container | Ограничители ширины |
| `UI.Grid` | MUI Grid | Сетки |
| `UI.Stack` | MUI Stack | Стеки |

## 💡 Примеры использования

### Базовый пример
```typescript
// Было
import { Button, TextField, Card } from '@mui/material';

// Стало
import { 
  Button, 
  TextField, 
  Card 
} from 'src/components/ui';

const LoginForm = () => {
  return (
    <Card variant="outlined">
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
      />
      <Button 
        variant="contained"
        color="primary"
      >
        Войти
      </Button>
    </Card>
  );
};
```

### Пример с составными компонентами
```typescript
import { 
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  TextField
} from 'src/components/ui';

const DataTable = () => {
  return (
    <>
      <TextField 
        placeholder="Поиск..."
        startAdornment={<SearchIcon />}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Название</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* данные */}
        </TableBody>
      </Table>
      <Pagination 
        count={10} 
        page={1} 
      />
    </>
  );
};
```

## ⚡ Преимущества использования UI компонентов

1. **Единообразие**
   - Консистентный внешний вид
   - Предсказуемое поведение
   - Стандартизированные пропсы

2. **Производительность**
   - Оптимизированный рендеринг
   - Минимизация ререндеров
   - Кэширование стилей

3. **Доступность**
   - ARIA атрибуты
   - Поддержка клавиатуры
   - Высокий контраст

4. **Удобство разработки**
   - Полная документация
   - Примеры использования
   - TypeScript поддержка

## 📝 Рекомендации по миграции

1. **Пошаговый подход**
   - Начните с простых компонентов
   - Постепенно заменяйте сложные компоненты
   - Тестируйте после каждого изменения

2. **Приоритеты замены**
   - Сначала базовые компоненты
   - Затем компоненты форм
   - В последнюю очередь сложные составные компоненты

3. **Проверка после замены**
   - Визуальное соответствие
   - Функциональность
   - Производительность
   - Доступность

## 🔍 Отладка и тестирование

1. **Storybook**
   - Просмотр всех вариантов компонента
   - Тестирование в изоляции
   - Проверка документации

2. **Браузер**
   - Проверка в разных браузерах
   - Тестирование адаптивности
   - Проверка производительности

3. **Инструменты разработчика**
   - React DevTools для проверки пропсов
   - Chrome DevTools для стилей
   - Lighthouse для аудита