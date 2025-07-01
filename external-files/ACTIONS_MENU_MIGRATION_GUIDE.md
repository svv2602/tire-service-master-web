# 📋 Руководство по миграции страниц на ActionsMenu

## 🎯 Цель миграции
Заменить старую систему действий (RowActions) на универсальный компонент ActionsMenu для унификации интерфейса всех страниц проекта Tire Service.

## 📊 Статус миграции
- ✅ **UsersPage** - мигрирована (эталонная реализация)
- ⏳ **ClientsPage** - ожидает миграции
- ⏳ **PartnersPage** - ожидает миграции
- ⏳ **CarBrandsPage** - ожидает миграции
- ⏳ **CitiesPage** - ожидает миграции
- ⏳ **RegionsPage** - ожидает миграции
- ⏳ **ReviewsPage** - ожидает миграции
- ⏳ **BookingsPage** - ожидает миграции
- ⏳ **ServicePointsPage** - ожидает миграции

## 📝 Пошаговая инструкция

### Шаг 1: Подготовка импортов

```typescript
// Добавить в импорты UI компонентов
import {
  // ... существующие импорты
  ActionsMenu,
} from '../../components/ui';
import type { ActionItem } from '../../components/ui';

// Добавить необходимые иконки из @mui/icons-material
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  RestoreFromTrash as RestoreIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  // ... другие иконки по необходимости
} from '@mui/icons-material';
```

### Шаг 2: Удаление старой конфигурации

```typescript
// ❌ УДАЛИТЬ старую конфигурацию actions
const actionsConfig: ActionConfig[] = useMemo(() => [
  // ... старые действия
], []);

// ❌ УДАЛИТЬ импорт ActionConfig (если не используется)
import type { 
  PageHeaderConfig, 
  SearchConfig, 
  FilterConfig,
  // ActionConfig // <- УДАЛИТЬ
} from '../../components/common/PageTable';
```

### Шаг 3: Создание новой конфигурации ActionsMenu

```typescript
// ✅ ДОБАВИТЬ новую конфигурацию
const itemActions: ActionItem<ItemType>[] = useMemo(() => [
  {
    id: 'view',
    label: 'Просмотр',
    icon: <VisibilityIcon />,
    onClick: (item: ItemType) => navigate(`/admin/path/${item.id}`),
    color: 'info',
    tooltip: 'Просмотр детальной информации'
  },
  {
    id: 'edit',
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: (item: ItemType) => navigate(`/admin/path/${item.id}/edit`),
    color: 'primary',
    tooltip: 'Редактировать данные'
  },
  {
    id: 'toggle-status',
    label: (item: ItemType) => item.is_active ? 'Деактивировать' : 'Активировать',
    icon: (item: ItemType) => item.is_active ? <BlockIcon /> : <CheckCircleIcon />,
    onClick: (item: ItemType) => handleToggleStatus(item),
    color: (item: ItemType) => item.is_active ? 'error' : 'success',
    tooltip: (item: ItemType) => item.is_active ? 'Деактивировать элемент' : 'Активировать элемент',
    requireConfirmation: true,
    confirmationConfig: {
      title: 'Подтверждение изменения статуса',
      message: 'Вы действительно хотите изменить статус этого элемента?',
      confirmLabel: 'Подтвердить',
      cancelLabel: 'Отмена'
    }
  },
  {
    id: 'delete',
    label: 'Удалить',
    icon: <DeleteIcon />,
    onClick: (item: ItemType) => handleDelete(item),
    color: 'error',
    tooltip: 'Удалить элемент',
    requireConfirmation: true,
    confirmationConfig: {
      title: 'Подтверждение удаления',
      message: 'Вы действительно хотите удалить этот элемент? Это действие нельзя отменить.',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена'
    }
  }
], [navigate, handleToggleStatus, handleDelete]);
```

### Шаг 4: Обновление колонки actions

```typescript
// В массиве columns найти колонку actions и заменить:
{
  id: 'actions',
  label: 'Действия',
  align: 'center',
  minWidth: 120,
  format: (_value: any, row: ItemType) => (
    <ActionsMenu 
      actions={itemActions} 
      item={row} 
      menuThreshold={1} // Принудительно показывать выпадающее меню
    />
  )
}
```

### Шаг 5: Удаление старого actions prop из PageTable

```typescript
// ❌ УБРАТЬ actions из PageTable
<PageTable<ItemType>
  header={headerConfig}
  search={searchConfig}
  filters={filtersConfig}
  columns={columns}
  rows={items}
  loading={isLoading}
  pagination={paginationConfig}
  // actions={actionsConfig} // <- УДАЛИТЬ эту строку
  responsive={true}
  empty={emptyComponent}
/>
```

## ⚙️ Настройки ActionsMenu

### Основные параметры

| Параметр | Тип | Описание | Значение по умолчанию |
|----------|-----|----------|----------------------|
| `actions` | `ActionItem<T>[]` | Массив действий | - |
| `item` | `T` | Объект для действий | - |
| `menuThreshold` | `number` | Порог для меню | `3` |
| `size` | `'small' \| 'medium' \| 'large'` | Размер кнопок | `'small'` |
| `sx` | `object` | Дополнительные стили | `{}` |

### Рекомендуемые настройки для разных случаев

```typescript
// Всегда показывать выпадающее меню (рекомендуется)
<ActionsMenu actions={itemActions} item={row} menuThreshold={1} />

// Показывать кнопки если ≤3 действий, иначе меню
<ActionsMenu actions={itemActions} item={row} menuThreshold={3} />

// Большие кнопки для важных действий
<ActionsMenu actions={itemActions} item={row} size="medium" />
```

## 🎨 Конфигурация действий

### Базовое действие
```typescript
{
  id: 'edit',                    // Уникальный идентификатор
  label: 'Редактировать',        // Текст действия
  icon: <EditIcon />,            // Иконка
  onClick: (item) => handleEdit(item), // Обработчик
  color: 'primary',              // Цвет (primary, secondary, error, warning, info, success)
  tooltip: 'Редактировать данные' // Подсказка
}
```

### Динамические значения
```typescript
{
  id: 'toggle-status',
  label: (item) => item.is_active ? 'Деактивировать' : 'Активировать',
  icon: (item) => item.is_active ? <BlockIcon /> : <CheckCircleIcon />,
  color: (item) => item.is_active ? 'error' : 'success',
  tooltip: (item) => `${item.is_active ? 'Деактивировать' : 'Активировать'} элемент`,
  onClick: (item) => handleToggleStatus(item)
}
```

### Условная видимость и доступность
```typescript
{
  id: 'edit',
  label: 'Редактировать',
  icon: <EditIcon />,
  onClick: (item) => handleEdit(item),
  color: 'primary',
  isVisible: (item) => item.can_be_edited,     // Показывать только если можно редактировать
  isDisabled: (item) => item.is_processing     // Отключать если обрабатывается
}
```

### Подтверждение действий
```typescript
{
  id: 'delete',
  label: 'Удалить',
  icon: <DeleteIcon />,
  onClick: (item) => handleDelete(item),
  color: 'error',
  requireConfirmation: true,
  confirmationConfig: {
    title: 'Подтверждение удаления',
    message: 'Вы действительно хотите удалить этот элемент? Это действие нельзя отменить.',
    confirmLabel: 'Удалить',      // По умолчанию: 'Подтвердить'
    cancelLabel: 'Отмена'         // По умолчанию: 'Отмена'
  }
}
```

## 🎨 Цветовая схема действий

| Цвет | Использование | Примеры действий |
|------|---------------|------------------|
| `primary` | Основные действия | Редактировать |
| `info` | Информационные действия | Детали, Связанные записи |
| `success` | Положительные действия | Активировать, Одобрить |
| `warning` | Предупреждающие действия | Приостановить, Предупредить |
| `error` | Опасные действия | Удалить, Деактивировать |
| `secondary` | Вторичные действия | Дублировать, Экспорт |

> ⚠️ **ВАЖНО**: Не добавляйте действие "Просмотр" - большинство страниц просмотра не реализованы в проекте.

## 🔍 Чек-лист проверки

### ✅ Обязательные проверки перед коммитом

#### Импорты и типизация
- [ ] Добавлен импорт `ActionsMenu` из UI компонентов
- [ ] Добавлен импорт `ActionItem` типа
- [ ] Добавлены все необходимые иконки из `@mui/icons-material`
- [ ] Удален неиспользуемый импорт `ActionConfig` (если применимо)

#### Конфигурация действий
- [ ] Создан массив `itemActions` с правильной типизацией `ActionItem<Type>[]`
- [ ] Все действия имеют уникальные `id`
- [ ] Указаны все обязательные поля: `label`, `icon`, `onClick`
- [ ] Добавлены `tooltip` для лучшего UX
- [ ] Правильно настроены цвета действий
- [ ] Добавлены подтверждения для опасных действий

#### Интеграция с PageTable
- [ ] Обновлена колонка `actions` для использования `ActionsMenu`
- [ ] Удален старый `actions` prop из компонента `PageTable`
- [ ] Удалена старая конфигурация `actionsConfig`
- [ ] Все зависимости добавлены в `useMemo`

### ✅ Функциональные проверки

#### Отображение
- [ ] Меню действий отображается корректно
- [ ] Иконки загружаются и отображаются
- [ ] Подсказки появляются при наведении
- [ ] Цвета действий соответствуют назначению

#### Функциональность
- [ ] Все действия выполняются корректно
- [ ] Диалоги подтверждения появляются для опасных действий
- [ ] Условная видимость работает (если используется)
- [ ] Условная доступность работает (если используется)

#### Производительность
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок TypeScript при компиляции
- [ ] Нет предупреждений React в консоли

## 🚨 Частые ошибки и их решения

### ❌ Ошибка: "ActionsMenu is not defined"
**Причина:** Забыли добавить импорт
```typescript
// ✅ Решение
import { ActionsMenu } from '../../components/ui';
```

### ❌ Ошибка: "Property 'actions' does not exist on type"
**Причина:** Не удален старый `actions` prop из PageTable
```typescript
// ❌ Неправильно
<PageTable actions={actionsConfig} />

// ✅ Правильно
<PageTable />
```

### ❌ Ошибка: TypeScript ошибки в ActionItem
**Причина:** Неправильная типизация
```typescript
// ❌ Неправильно
const actions: ActionItem[] = useMemo(() => [

// ✅ Правильно  
const actions: ActionItem<User>[] = useMemo(() => [
```

### ❌ Ошибка: Действия не отображаются
**Причина:** Забыли передать `item` или `actions`
```typescript
// ❌ Неправильно
<ActionsMenu actions={itemActions} />

// ✅ Правильно
<ActionsMenu actions={itemActions} item={row} />
```

### ❌ Ошибка: Показываются кнопки вместо меню
**Причина:** Не указан `menuThreshold`
```typescript
// ✅ Решение
<ActionsMenu actions={itemActions} item={row} menuThreshold={1} />
```

## 📋 Шаблоны для копирования

### Базовый шаблон
```typescript
// 1. Импорты
import { ActionsMenu } from '../../components/ui';
import type { ActionItem } from '../../components/ui';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon 
} from '@mui/icons-material';

// 2. Конфигурация действий
const itemActions: ActionItem<ItemType>[] = useMemo(() => [
  {
    id: 'view',
    label: 'Просмотр',
    icon: <VisibilityIcon />,
    onClick: (item) => navigate(`/admin/path/${item.id}`),
    color: 'info',
    tooltip: 'Просмотр детальной информации'
  },
  {
    id: 'edit', 
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: (item) => navigate(`/admin/path/${item.id}/edit`),
    color: 'primary',
    tooltip: 'Редактировать данные'
  },
  {
    id: 'delete',
    label: 'Удалить',
    icon: <DeleteIcon />,
    onClick: (item) => handleDelete(item),
    color: 'error',
    tooltip: 'Удалить элемент',
    requireConfirmation: true,
    confirmationConfig: {
      title: 'Подтверждение удаления',
      message: 'Вы действительно хотите удалить этот элемент?',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена'
    }
  }
], [navigate, handleDelete]);

// 3. Колонка в columns
{
  id: 'actions',
  label: 'Действия', 
  align: 'center',
  minWidth: 120,
  format: (_value: any, row: ItemType) => (
    <ActionsMenu actions={itemActions} item={row} menuThreshold={1} />
  )
}
```

### Шаблон с переключением статуса
```typescript
const itemActions: ActionItem<ItemType>[] = useMemo(() => [
  {
    id: 'edit',
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: (item) => navigate(`/admin/path/${item.id}/edit`),
    color: 'primary'
  },
  {
    id: 'toggle-status',
    label: (item) => item.is_active ? 'Деактивировать' : 'Активировать',
    icon: (item) => item.is_active ? <BlockIcon /> : <CheckCircleIcon />,
    onClick: (item) => handleToggleStatus(item),
    color: (item) => item.is_active ? 'error' : 'success',
    requireConfirmation: true,
    confirmationConfig: {
      title: 'Подтверждение изменения статуса',
      message: 'Вы действительно хотите изменить статус этого элемента?'
    }
  }
], [navigate, handleToggleStatus]);
```

## 🎯 Ожидаемый результат

После успешной миграции каждая страница будет иметь:

### ✅ Визуальные улучшения
- 🎨 Унифицированное меню действий во всех таблицах
- 📱 Выпадающее меню с иконками и подсказками
- 🌈 Цветовую индикацию типов действий
- 💡 Информативные подсказки при наведении

### ✅ Функциональные улучшения  
- 🛡️ Диалоги подтверждения для опасных операций
- 🎯 Условную видимость и доступность действий
- ⚡ Динамические значения для гибкой настройки
- 🔄 Единообразное поведение на всех страницах

### ✅ Технические улучшения
- 🏗️ Современный и поддерживаемый код
- 📝 Строгая типизация TypeScript
- 🧩 Переиспользуемые компоненты
- 🚀 Улучшенная производительность

## ⏱️ Временные затраты

- **Простая страница** (2-3 действия): ~15-20 минут
- **Сложная страница** (4+ действий, условная логика): ~25-30 минут
- **Тестирование и отладка**: ~10-15 минут на страницу

**Общее время миграции всех страниц: ~3-4 часа**

## 📞 Поддержка

При возникновении вопросов или проблем:
1. Проверьте чек-лист выше
2. Сравните с эталонной реализацией UsersPage
3. Обратитесь к разделу "Частые ошибки"
4. Изучите документацию компонента ActionsMenu

---

**Автор:** AI Assistant  
**Дата создания:** 30 июня 2025  
**Версия:** 1.0  
**На основе:** Успешной миграции UsersPage 