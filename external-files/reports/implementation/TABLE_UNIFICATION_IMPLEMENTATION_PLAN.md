# 🎯 ПЛАН УНИФИКАЦИИ СТИЛЕЙ ТАБЛИЦ

**Дата:** 24 июня 2025  
**Статус:** 📋 ПЛАНИРОВАНИЕ  
**Цель:** Привести все таблицы к единому стилю с поддержкой адаптивности и переноса слов

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ

### ✅ УЖЕ ЕСТЬ:

1. **Централизованные стили:**
   ```typescript
   // src/styles/components.ts
   getTableStyles(theme)         // Базовые стили
   getTablePageStyles(theme)     // Стили для страниц
   getAdaptiveTableStyles(theme) // Адаптивные стили
   ```

2. **UI компонент:**
   ```typescript
   // src/components/ui/Table/Table.tsx
   interface Column {
     id: string;
     label: string;
     wrap?: boolean;  // ✅ Поддержка переноса слов
     format?: (value: any) => React.ReactNode;
   }
   ```

3. **Styled компоненты:**
   ```typescript
   // src/components/styled/CommonComponents.tsx
   StyledTable, StyledTableRow, StyledTableCell
   ```

### 🚨 ПРОБЛЕМЫ:

1. **Фрагментация:** Страницы используют разные подходы
2. **Несогласованность:** Разные стили переноса слов
3. **Прямые импорты MUI:** Не все используют централизованные компоненты

## 📋 ТРЕБОВАНИЯ ИЗ ТЗ

### 🎯 Адаптивность:
- ✅ Корректное отображение от 320px
- ✅ Горизонтальный скролл при переполнении  
- ✅ Ширина таблицы 100% контейнера

### 📝 Перенос текста:
- ✅ Разрешить перенос строк в ячейках
- ❌ Запретить побуквенный перенос
- ✅ Перенос по словам и логическим блокам

### 🎨 Единый стиль:
- ✅ Общая таблица стилей
- ✅ Базовые отступы, шрифт, размер текста
- ✅ Цвет заголовков, границы, hover эффекты

## 🔧 ПЛАН РЕАЛИЗАЦИИ

### 📅 ЭТАП 1: Улучшение базового компонента (2-3 часа)

#### 1.1 Доработка UI компонента Table
```typescript
// src/components/ui/Table/Table.tsx

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'right' | 'center';
  wrap?: boolean;
  ellipsis?: boolean;  // 🆕 Поддержка многоточия
  sticky?: boolean;    // 🆕 Фиксированные колонки
  format?: (value: any, row?: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  rows: any[];
  loading?: boolean;
  empty?: React.ReactNode;
  stickyHeader?: boolean;
  maxHeight?: number;
  responsive?: boolean;  // 🆕 Адаптивность
  onRowClick?: (row: any) => void;
}
```

#### 1.2 Улучшение стилей переноса слов
```typescript
// Обновить StyledTableCell
const StyledTableCell = styled(TableCell)<{ 
  wrap?: boolean; 
  ellipsis?: boolean;
}>(({ theme, wrap, ellipsis }) => ({
  // Базовые стили
  padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
  borderBottom: `1px solid ${themeColors.borderPrimary}`,
  
  // Логика переноса
  ...(wrap ? {
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    wordWrap: 'break-word',
    // 🆕 Запрет побуквенного переноса
    wordBreak: 'normal',
    overflowWrap: 'anywhere',
  } : ellipsis ? {
    whiteSpace: 'nowrap',
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    maxWidth: '200px',
  } : {
    whiteSpace: 'nowrap',
  }),
}));
```

### 📅 ЭТАП 2: Создание универсального PageTable (3-4 часа)

#### 2.1 Компонент PageTable
```typescript
// src/components/common/PageTable/PageTable.tsx

interface PageTableProps<T = any> {
  title: string;
  data: T[];
  columns: Column[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  filters?: FilterConfig[];
  pagination?: PaginationConfig;
  actions?: ActionConfig<T>[];
  bulkActions?: BulkActionConfig<T>[];
  exportable?: boolean;
  responsive?: boolean;
}

const PageTable = <T,>({
  title,
  data,
  columns,
  loading = false,
  searchable = true,
  pagination,
  actions,
  ...props
}: PageTableProps<T>) => {
  const theme = useTheme();
  const tablePageStyles = getTablePageStyles(theme);
  
  return (
    <Box sx={tablePageStyles.pageContainer}>
      {/* Заголовок с действиями */}
      <Box sx={tablePageStyles.pageHeader}>
        <Typography variant="h4" sx={tablePageStyles.pageTitle}>
          {title}
        </Typography>
        {/* Кнопки действий */}
      </Box>
      
      {/* Поиск и фильтры */}
      {searchable && <SearchAndFilters />}
      
      {/* Таблица */}
      <Table
        columns={columns}
        rows={data}
        loading={loading}
        responsive={props.responsive}
        onRowClick={props.onRowClick}
      />
      
      {/* Пагинация */}
      {pagination && <Pagination {...pagination} />}
    </Box>
  );
};
```

#### 2.2 Конфигурация действий
```typescript
interface ActionConfig<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  color?: 'primary' | 'secondary' | 'error';
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

interface BulkActionConfig<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (items: T[]) => void;
  color?: 'primary' | 'secondary' | 'error';
}
```

### 📅 ЭТАП 3: Миграция существующих страниц (8-10 часов)

#### 3.1 Приоритет миграции:
1. **Высокий приоритет** (4-5 часов):
   - `ReviewsPage.tsx` - управление отзывами
   - `BookingsPage.tsx` - управление бронированиями  
   - `UsersPage.tsx` - управление пользователями
   - `ServicePointsPage.tsx` - сервисные точки

2. **Средний приоритет** (3-4 часа):
   - `PartnersPage.tsx` - партнеры
   - `ArticlesPage.tsx` - статьи
   - `CitiesPage.tsx` - города
   - `RegionsPage.tsx` - регионы

3. **Низкий приоритет** (1-2 часа):
   - Остальные админские страницы

#### 3.2 Шаблон миграции:
```typescript
// БЫЛО:
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Название</TableCell>
        <TableCell>Статус</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.status}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

// СТАЛО:
const columns: Column[] = [
  { 
    id: 'name', 
    label: 'Название', 
    wrap: true,
    minWidth: 150
  },
  { 
    id: 'status', 
    label: 'Статус',
    format: (value) => <StatusChip status={value} />
  }
];

<PageTable
  title="Управление данными"
  data={data}
  columns={columns}
  loading={loading}
  pagination={paginationConfig}
  actions={actionConfig}
/>
```

### 📅 ЭТАП 4: Адаптивность и финальная настройка (2-3 часа)

#### 4.1 Responsive breakpoints
```typescript
// src/components/ui/Table/ResponsiveTable.tsx
const ResponsiveTable = ({ columns, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Логика скрытия колонок на мобильных
  const visibleColumns = columns.filter(col => 
    !isMobile || !col.hideOnMobile
  );
  
  return (
    <Table
      columns={visibleColumns}
      responsive={true}
      {...props}
    />
  );
};
```

#### 4.2 Горизонтальный скролл
```typescript
const adaptiveTableStyles = {
  tableContainer: {
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      height: 8,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.grey[100],
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.grey[400],
      borderRadius: 4,
    },
  },
  table: {
    minWidth: isMobile ? 800 : 'auto',
  }
};
```

## 🧪 ТЕСТИРОВАНИЕ

### 📱 Тестовые сценарии:
1. **Адаптивность:**
   - ✅ 320px - горизонтальный скролл
   - ✅ 768px - адаптивные колонки
   - ✅ 1200px+ - полная таблица

2. **Перенос слов:**
   - ✅ Длинные слова переносятся по границам
   - ❌ Нет побуквенного переноса
   - ✅ Многоточие для коротких ячеек

3. **Производительность:**
   - ✅ Быстрая прокрутка больших таблиц
   - ✅ Виртуализация для 1000+ строк

### 🔧 Тестовая страница:
```typescript
// src/pages/testing/TableUnificationTest.tsx
const TableUnificationTest = () => {
  const testData = generateTestData(100);
  
  const columns: Column[] = [
    { id: 'shortText', label: 'Короткий текст' },
    { id: 'longText', label: 'Длинный текст', wrap: true },
    { id: 'ellipsisText', label: 'С многоточием', ellipsis: true },
    { id: 'number', label: 'Число', align: 'right' },
    { id: 'status', label: 'Статус', format: (v) => <Chip label={v} /> }
  ];
  
  return (
    <PageTable
      title="Тест унификации таблиц"
      data={testData}
      columns={columns}
      searchable
      pagination={{ pageSize: 25 }}
    />
  );
};
```

## 📊 РЕЗУЛЬТАТЫ

### ✅ После реализации:
- 🎯 Единый стиль всех таблиц
- 📱 Полная адаптивность 
- 📝 Правильный перенос слов без побуквенного разбиения
- ⚡ Улучшенная производительность
- 🔧 Легкость поддержки и расширения

### 📈 Метрики успеха:
- ✅ 100% таблиц используют унифицированные компоненты
- ✅ 0 прямых импортов MUI Table компонентов в страницах
- ✅ Консистентный UX на всех разрешениях
- ✅ Покрытие тестами 80%+

## 📁 ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

### 🆕 Новые файлы:
- `src/components/common/PageTable/PageTable.tsx`
- `src/components/common/PageTable/index.ts`
- `src/components/ui/Table/ResponsiveTable.tsx`
- `src/pages/testing/TableUnificationTest.tsx`

### ✏️ Изменения:
- `src/components/ui/Table/Table.tsx` - улучшения
- `src/styles/components.ts` - обновление стилей
- Все страницы с таблицами (15+ файлов)

### 📚 Документация:
- `docs/TABLE_UNIFICATION_GUIDE.md`
- `docs/RESPONSIVE_TABLES.md`
- Обновление Storybook компонентов

## 🚀 ПЛАН ВЫПОЛНЕНИЯ

### День 1 (4-5 часов):
- ✅ Этап 1: Улучшение базового компонента
- ✅ Этап 2: Создание PageTable

### День 2 (4-5 часов):  
- ✅ Этап 3.1: Миграция высокоприоритетных страниц

### День 3 (3-4 часа):
- ✅ Этап 3.2: Миграция остальных страниц
- ✅ Этап 4: Адаптивность и тестирование

### 📋 Чеклист готовности:
- [ ] Все таблицы используют унифицированные компоненты
- [ ] Нет прямых импортов MUI Table в страницах
- [ ] Тестирование на всех разрешениях
- [ ] Документация обновлена
- [ ] Покрытие тестами

**Время реализации: 3 дня (11-14 часов)**  
**Сложность: Средняя**  
**Приоритет: Высокий** 🔥 