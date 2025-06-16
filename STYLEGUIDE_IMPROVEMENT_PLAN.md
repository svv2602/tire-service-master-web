# План улучшения StyleGuide

## 1. Добавление недостающих компонентов

### Недостающие компоненты для добавления:

- **Avatar** - различные варианты аватаров (с изображениями, с текстом, с иконками)
- **Backdrop** - примеры использования фона при загрузке или модальных окнах
- **Divider** - горизонтальные и вертикальные разделители с различными стилями
- **Grid** - система сеток с примерами различных раскладок
- **List** - различные варианты списков (с иконками, с аватарами, вложенные)
- **Menu** - выпадающие меню, контекстные меню
- **Snackbar** - уведомления различных типов и позиций
- **Stack** - горизонтальные и вертикальные стеки элементов
- **Toolbar** - различные варианты панелей инструментов
- **Typography** - выделить в отдельную полноценную секцию с примерами всех вариантов

### Приоритеты добавления:
1. **Высокий приоритет**: Grid, List, Menu, Snackbar, Typography
2. **Средний приоритет**: Avatar, Stack, Toolbar
3. **Низкий приоритет**: Backdrop, Divider

## 2. Реорганизация групп компонентов

### Новая структура групп:

1. **Основы дизайна**
   - Тема
   - Цвета
   - Типография
   - Иконки

2. **Элементы ввода**
   - Кнопки
   - Текстовые поля
   - Чекбоксы
   - Радиокнопки
   - Селекты
   - Переключатели
   - Слайдеры
   - Автодополнение
   - Загрузка файлов

3. **Элементы даты и времени**
   - Выбор даты
   - Выбор времени
   - Календарь

4. **Навигация**
   - Панель приложения (AppBar)
   - Боковая панель (Drawer)
   - Вкладки
   - Хлебные крошки
   - Пагинация
   - Меню
   - Степпер

5. **Отображение данных**
   - Таблицы
   - Списки
   - Карточки
   - Чипы
   - Значки (Badge)
   - Аватары
   - Рейтинг
   - Прогресс

6. **Компоновка и структура**
   - Сетка (Grid)
   - Бумага (Paper)
   - Карточки (Card)
   - Аккордеон
   - Разделители
   - Стек (Stack)
   - Контейнеры

7. **Обратная связь**
   - Уведомления (Alert)
   - Нотификации (Snackbar)
   - Подсказки (Tooltip)
   - Диалоги и модальные окна
   - Скелетон
   - Прогресс индикаторы
   - Backdrop

8. **Утилитарные компоненты**
   - Фильтры
   - Быстрый набор (SpeedDial)
   - Скроллбар
   - Панель инструментов (Toolbar)

## 3. Улучшение примеров использования

### Для каждого компонента добавить:

1. **Базовое использование** - простейший пример компонента
2. **Варианты и состояния** - различные варианты (размеры, цвета, состояния)
3. **Интерактивные примеры** - демонстрация взаимодействия с пользователем
4. **Комбинированное использование** - примеры использования с другими компонентами
5. **Адаптивность** - примеры поведения на разных размерах экрана

### Пример структуры секции компонента:

```tsx
// ButtonSection.tsx
const ButtonSection: React.FC = () => {
  return (
    <>
      <Typography variant="h5" gutterBottom>Кнопки</Typography>
      
      {/* 1. Базовое использование */}
      <SectionItem title="Базовое использование">
        <Button variant="contained">Кнопка</Button>
      </SectionItem>
      
      {/* 2. Варианты и состояния */}
      <SectionItem title="Варианты">
        <Stack direction="row" spacing={2}>
          <Button variant="contained">Contained</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
        </Stack>
        
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" disabled>Disabled</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="contained" color="success">Success</Button>
        </Stack>
      </SectionItem>
      
      {/* 3. Интерактивный пример */}
      <SectionItem title="Интерактивный пример">
        <InteractiveButtonDemo />
      </SectionItem>
      
      {/* 4. Комбинированное использование */}
      <SectionItem title="С другими компонентами">
        <Button variant="contained" startIcon={<SaveIcon />}>
          Сохранить
        </Button>
      </SectionItem>
      
      {/* 5. API документация */}
      <SectionItem title="API">
        <ApiTable 
          props={[
            { name: 'variant', type: "'contained' | 'outlined' | 'text'", default: "'text'", description: 'Вариант отображения кнопки' },
            { name: 'color', type: "'primary' | 'secondary' | 'success' | 'error'", default: "'primary'", description: 'Цветовая схема кнопки' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Отключает кнопку' },
            { name: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'", description: 'Размер кнопки' }
          ]} 
        />
      </SectionItem>
    </>
  );
};
```

## 4. Добавление документации по API

### Для каждого компонента создать таблицу API с:

1. **Названием свойства** - имя пропа компонента
2. **Типом** - тип данных свойства (string, boolean, ReactNode и т.д.)
3. **Значением по умолчанию** - значение, используемое если свойство не указано
4. **Описанием** - краткое описание назначения свойства

### Пример компонента ApiTable:

```tsx
// ApiTable.tsx
interface ApiProp {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface ApiTableProps {
  props: ApiProp[];
}

const ApiTable: React.FC<ApiTableProps> = ({ props }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Свойство</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell>По умолчанию</TableCell>
            <TableCell>Описание</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell component="th" scope="row">
                <code>{prop.name}</code>
              </TableCell>
              <TableCell><code>{prop.type}</code></TableCell>
              <TableCell>{prop.default ? <code>{prop.default}</code> : '—'}</TableCell>
              <TableCell>{prop.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

## 5. План реализации

### Этап 1: Подготовка инфраструктуры (1-2 дня)
- Создание компонентов SectionItem и ApiTable
- Обновление структуры StyleGuide с новыми группами
- Создание шаблонов для новых секций

### Этап 2: Обновление существующих компонентов (3-5 дней)
- Реорганизация существующих компонентов по новым группам
- Добавление расширенных примеров использования
- Добавление API документации

### Этап 3: Добавление недостающих компонентов (5-7 дней)
- Высокий приоритет (2-3 дня)
- Средний приоритет (1-2 дня)
- Низкий приоритет (1-2 дня)

### Этап 4: Тестирование и финальные улучшения (2-3 дня)
- Проверка всех примеров на работоспособность
- Проверка адаптивности на разных устройствах
- Финальные корректировки стилей и документации

## 6. Ожидаемые результаты

1. **Полная документация** всех UI компонентов в едином стиле
2. **Логичная структура** с интуитивно понятной группировкой
3. **Наглядные примеры** использования каждого компонента
4. **Подробное API** для быстрого поиска нужных свойств
5. **Повышение эффективности разработки** за счет быстрого доступа к документации
6. **Единообразие интерфейса** благодаря следованию стандартам из StyleGuide