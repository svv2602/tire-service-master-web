# 🌊 Стили таблиц "Мокрый асфальт" - Темная тема

## 📋 Обзор изменений

Добавлена поддержка красивых таблиц для темной темы с цветовой схемой "мокрый асфальт" - темно-серые оттенки, создающие современный и элегантный вид.

## 🎨 Цветовая палитра "Мокрый асфальт"

### **Темная тема:**
```tsx
// Новые цвета для таблиц
backgroundTable: 'rgba(45, 45, 48, 0.95)',      // Основной фон - "мокрый асфальт"
backgroundTableRow: 'rgba(52, 52, 56, 0.8)',    // Четные строки - чуть светлее
backgroundTableHeader: 'rgba(38, 38, 42, 0.95)', // Заголовки - темнее основного
```

### **Светлая тема:**
```tsx
// Цвета для светлой темы
backgroundTable: 'rgba(255, 255, 255, 1)',       // Белый фон
backgroundTableRow: 'rgba(248, 249, 250, 1)',    // Очень светло-серый для строк
backgroundTableHeader: 'rgba(242, 244, 246, 1)', // Светло-серый для заголовков
```

## 🛠️ Новые компоненты

### **1. StyledTable** - Основная таблица
```tsx
import { StyledTable } from '../components/styled/CommonComponents';

<StyledTable>
  <TableHead>
    <TableRow>
      <StyledTableCell header>Время</StyledTableCell>
      <StyledTableCell header>Посты</StyledTableCell>
      <StyledTableCell header>Статус</StyledTableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <StyledTableRow>
      <StyledTableCell>09:20</StyledTableCell>
      <StyledTableCell>1 из 1</StyledTableCell>
      <StyledTableCell>
        <StatusChip status="available" label="Доступно" />
      </StyledTableCell>
    </StyledTableRow>
  </TableBody>
</StyledTable>
```

### **2. StyledTableRow** - Строки с hover-эффектами
```tsx
<StyledTableRow hover={true}>
  {/* Содержимое строки */}
</StyledTableRow>
```

### **3. StyledTableCell** - Ячейки с автоматическими стилями
```tsx
// Обычная ячейка
<StyledTableCell>Содержимое</StyledTableCell>

// Ячейка заголовка
<StyledTableCell header>Заголовок</StyledTableCell>
```

### **4. StatusChip** - Статусные индикаторы
```tsx
// Доступно (зеленый)
<StatusChip status="available" label="Доступно" />

// Недоступно (красный)  
<StatusChip status="unavailable" label="Недоступно" />

// Ожидание (желтый)
<StatusChip status="pending" label="Ожидание" />
```

## ⚡ Функция getTableStyles()

Централизованная функция для получения всех стилей таблиц:

```tsx
import { getTableStyles } from '../../styles';

const MyTableComponent = () => {
  const theme = useTheme();
  const tableStyles = getTableStyles(theme);
  
  return (
    <TableContainer sx={tableStyles.container}>
      <Table sx={tableStyles.table}>
        <TableHead>
          <TableRow>
            <TableCell sx={tableStyles.header}>
              Заголовок
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={tableStyles.row}>
            <TableCell sx={tableStyles.cell}>
              Содержимое
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

## 🎯 Доступные стили

### **Контейнер таблицы:**
- `tableStyles.container` - контейнер с границами и закруглениями

### **Основная таблица:**
- `tableStyles.table` - основные стили таблицы

### **Заголовки:**
- `tableStyles.header` - стили для заголовков столбцов

### **Строки:**
- `tableStyles.row` - строки с hover-эффектами и чередующимися цветами

### **Ячейки:**
- `tableStyles.cell` - обычные ячейки данных

### **Статусные элементы:**
- `tableStyles.statusCell` - контейнер для статусов
- `tableStyles.statusChip` - базовые стили чипов
- `tableStyles.statusAvailable` - зеленый статус "Доступно"
- `tableStyles.statusUnavailable` - красный статус "Недоступно"  
- `tableStyles.statusPending` - желтый статус "Ожидание"

## ✨ Особенности

### **Автоматическая адаптация к теме:**
- Темная тема: цвета "мокрого асфальта"
- Светлая тема: классические светлые цвета
- Плавные переходы при переключении тем

### **Hover-эффекты:**
- Подсветка строк при наведении
- Плавные анимации
- Визуальная обратная связь

### **Чередующиеся строки:**
- Четные строки имеют слегка отличающийся фон
- Улучшенная читаемость больших таблиц

### **Статусные индикаторы:**
- Цветовая кодировка состояний
- Консистентные размеры и стили
- Легко расширяемая система

## 🔧 Глобальные стили

Автоматически применяются ко всем MUI таблицам:

```tsx
// В createAppTheme() автоматически применяются стили:
MuiTable: {
  styleOverrides: {
    root: {
      backgroundColor: colors.backgroundTable, // "Мокрый асфальт"
    },
  },
},
MuiTableHead: {
  styleOverrides: {
    root: {
      backgroundColor: colors.backgroundTableHeader, // Темнее
    },
  },
},
// И другие компоненты таблиц...
```

## 📊 Результат

- ✅ **Темная тема:** элегантные таблицы цвета "мокрого асфальта"
- ✅ **Светлая тема:** классические светлые таблицы
- ✅ **Автоматическое переключение** при смене темы
- ✅ **Консистентные стили** во всем приложении
- ✅ **Улучшенная читаемость** с чередующимися строками
- ✅ **Интерактивные эффекты** для лучшего UX

---

# 📱 Адаптивный Stepper - Компонент пошагового ввода

## 🎯 Обзор

Добавлен полностью адаптивный stepper в `ServicePointFormPageNew.tsx` с современным дизайном для всех размеров экрана.

## 🖥️ Адаптивность по устройствам

### **Десктоп (lg+):**
- Классический горизонтальный stepper
- Полные названия шагов
- Hover-эффекты на шагах

### **Планшет (md):**
- Горизонтальный stepper
- Сокращенные названия (до 12 символов)
- Адаптированные размеры

### **Мобильные (sm-):**
- Компактный индикатор прогресса
- Горизонтальная прокрутка чипов
- Вертикальная навигация кнопок

## 🔧 Технические детали

### **Breakpoints:**
```tsx
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
```

### **Мобильный индикатор:**
- Текущий шаг + общее количество
- Прогресс-бар с анимацией
- Навигационные чипы с иконками

### **Адаптивная навигация:**
- На мобильных: вертикальные кнопки (кнопка "Далее" сверху)
- На десктопе: горизонтальные кнопки
- Централизованные стили через `getButtonStyles()`

## 📱 Мобильные улучшения

### **Прогресс-бар:**
```tsx
<Box sx={{
  width: `${((activeStep + 1) / FORM_STEPS.length) * 100}%`,
  backgroundColor: theme.palette.primary.main,
  transition: theme.transitions.create('width'),
}} />
```

### **Chip навигация:**
- Автопрокрутка при много шагов
- Иконки галочек для завершенных шагов
- Hover-эффекты с анимацией подъема
- Градиентная маска справа для индикации прокрутки

### **Кнопки с улучшенными отступами:**
```tsx
// Увеличенные отступы справа и между кнопками
sx={{
  px: isMobile ? 3 : 2.5, // Горизонтальный padding
  mr: isMobile ? 0 : 1,   // Отступ справа на десктопе
  minHeight: isMobile ? 48 : 'auto', // Высота для touch
}}
```

### **Adaptive Breakpoints:**
```tsx
const isVerySmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
const isMediumMobile = useMediaQuery(theme.breakpoints.down('md'));    // < 900px
```

## ✨ Особенности V2

- ✅ **Улучшенные отступы** для кнопок и контейнеров
- ✅ **Градиентная маска** для индикации прокрутки чипов
- ✅ **Точные breakpoints** для разных размеров экрана  
- ✅ **Hover-эффекты** с тенями и анимациями
- ✅ **Контрастные цвета** для завершенных шагов
- ✅ **Flexbox оптимизация** с правильным shrinking

## ✨ Особенности

- ✅ **Полная адаптивность** под все устройства
- ✅ **Сохранение функциональности** на всех экранах
- ✅ **Современный дизайн** с анимациями
- ✅ **Централизованные стили** из темы
- ✅ **Улучшенный UX** для мобильных пользователей

---

**Автор**: AI Assistant  
**Дата**: Июнь 2025  
**Статус**: ✅ Готово к использованию  
**Версия**: 1.2 