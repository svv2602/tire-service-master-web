# Руководство по использованию компонента ActionsMenu

## Описание
`ActionsMenu` - универсальный компонент для создания меню действий в любом месте приложения. Автоматически выбирает между отдельными кнопками (для ≤3 действий) и выпадающим меню (для >3 действий).

## Основные возможности
- ✅ Автоматический выбор UI в зависимости от количества действий
- ✅ Поддержка условной видимости и доступности действий
- ✅ Встроенные диалоги подтверждения
- ✅ Динамические значения (функции для label, icon, color)
- ✅ Цветовая индикация действий
- ✅ Полная типизация TypeScript
- ✅ Адаптивность и доступность

## Импорт
```typescript
import { ActionsMenu, ActionItem } from '../../components/ui';
// или
import { ActionsMenu } from '../../components/ui/ActionsMenu';
```

## Базовое использование

### 1. Простые действия (отображаются как отдельные кнопки)
```typescript
const actions: ActionItem<User>[] = [
  {
    id: 'edit',
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: (user) => navigate(`/users/${user.id}/edit`),
    color: 'primary'
  },
  {
    id: 'view',
    label: 'Просмотр',
    icon: <VisibilityIcon />,
    onClick: (user) => navigate(`/users/${user.id}`),
    color: 'info'
  }
];

<ActionsMenu actions={actions} item={user} />
```

### 2. Много действий (отображается как выпадающее меню)
```typescript
const actions: ActionItem<Client>[] = [
  {
    id: 'edit',
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: (client) => navigate(`/clients/${client.id}/edit`),
    color: 'primary'
  },
  {
    id: 'cars',
    label: 'Автомобили',
    icon: <CarIcon />,
    onClick: (client) => navigate(`/clients/${client.id}/cars`),
    color: 'info'
  },
  {
    id: 'toggle-status',
    label: (client) => client.is_active ? 'Деактивировать' : 'Активировать',
    icon: (client) => client.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />,
    onClick: (client) => handleToggleStatus(client),
    color: 'warning'
  },
  {
    id: 'delete',
    label: 'Удалить',
    icon: <DeleteIcon />,
    onClick: (client) => handleDelete(client),
    color: 'error',
    requireConfirmation: true,
    confirmationConfig: {
      title: 'Подтверждение удаления',
      message: 'Вы действительно хотите удалить этого клиента?',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена'
    }
  }
];

<ActionsMenu actions={actions} item={client} />
```

## Продвинутые возможности

### 1. Условная видимость и доступность
```typescript
const actions: ActionItem<Booking>[] = [
  {
    id: 'edit',
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: (booking) => navigate(`/bookings/${booking.id}/edit`),
    color: 'primary',
    // Показываем только для незавершенных бронирований
    isVisible: (booking) => booking.status !== 'completed',
    // Блокируем для отмененных бронирований
    isDisabled: (booking) => booking.status === 'cancelled'
  },
  {
    id: 'cancel',
    label: 'Отменить',
    icon: <CancelIcon />,
    onClick: (booking) => handleCancel(booking),
    color: 'error',
    // Показываем только для активных бронирований
    isVisible: (booking) => ['pending', 'confirmed'].includes(booking.status),
    requireConfirmation: true,
    confirmationConfig: {
      title: 'Отмена бронирования',
      message: 'Вы действительно хотите отменить это бронирование?'
    }
  }
];
```

### 2. Динамические значения
```typescript
const actions: ActionItem<ServicePoint>[] = [
  {
    id: 'status',
    // Динамический текст в зависимости от статуса
    label: (point) => point.is_active ? 'Деактивировать' : 'Активировать',
    // Динамическая иконка
    icon: (point) => point.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />,
    // Динамический цвет
    color: (point) => point.is_active ? 'warning' : 'success',
    // Динамическая подсказка
    tooltip: (point) => point.is_active 
      ? 'Деактивировать сервисную точку' 
      : 'Активировать сервисную точку',
    onClick: (point) => handleToggleStatus(point)
  }
];
```

### 3. Кастомизация внешнего вида
```typescript
<ActionsMenu 
  actions={actions} 
  item={item}
  size="medium"              // Размер кнопок: 'small' | 'medium' | 'large'
  menuThreshold={2}          // Порог для переключения на меню (по умолчанию 3)
  sx={{ ml: 1 }}            // Дополнительные стили
/>
```

## Интеграция с существующими страницами

### Замена в таблицах (вместо PageTable actions)
```typescript
// Вместо использования PageTable actions
const columns: Column<User>[] = [
  // ... остальные колонки
  {
    id: 'actions',
    label: 'Действия',
    align: 'center',
    render: (user) => (
      <ActionsMenu actions={userActions} item={user} />
    )
  }
];
```

### Использование в карточках
```typescript
const UserCard: React.FC<{ user: User }> = ({ user }) => (
  <Card>
    <CardHeader
      title={`${user.first_name} ${user.last_name}`}
      action={
        <ActionsMenu actions={userActions} item={user} />
      }
    />
    <CardContent>
      {/* Содержимое карточки */}
    </CardContent>
  </Card>
);
```

### Использование в списках
```typescript
const UserListItem: React.FC<{ user: User }> = ({ user }) => (
  <ListItem
    secondaryAction={
      <ActionsMenu actions={userActions} item={user} />
    }
  >
    <ListItemText primary={user.name} secondary={user.email} />
  </ListItem>
);
```

## Типы данных

### ActionItem<T>
```typescript
interface ActionItem<T = any> {
  id?: string;
  label: string | ((item: T) => string);
  icon: React.ReactNode | ((item: T) => React.ReactNode);
  color?: PaletteColor | ((item: T) => PaletteColor);
  isVisible?: (item: T) => boolean;
  isDisabled?: (item: T) => boolean;
  onClick: (item: T, index?: number) => void;
  tooltip?: string | ((item: T) => string);
  requireConfirmation?: boolean;
  confirmationConfig?: ConfirmationConfig;
}
```

### ConfirmationConfig
```typescript
interface ConfirmationConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}
```

### PaletteColor
```typescript
type PaletteColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
```

## Рекомендации по использованию

### ✅ Хорошие практики
1. **Группировка по важности**: Размещайте самые важные действия первыми
2. **Консистентность цветов**: Используйте одинаковые цвета для похожих действий по всему приложению
3. **Понятные названия**: Используйте глаголы для действий ("Редактировать", "Удалить")
4. **Подтверждение для опасных действий**: Всегда используйте `requireConfirmation` для деструктивных операций

### ❌ Что избегать
1. Не создавайте слишком много действий (>6-7)
2. Не используйте неясные иконки без подсказок
3. Не забывайте про условную видимость для неприменимых действий
4. Не используйте одинаковые цвета для разных типов действий

## Миграция с PageTable actions

### Было (PageTable actions)
```typescript
const actionsConfig: ActionConfig<Client>[] = [
  {
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: (client) => navigate(`/clients/${client.id}/edit`),
    color: 'primary'
  }
];

<PageTable actions={actionsConfig} ... />
```

### Стало (ActionsMenu)
```typescript
const actions: ActionItem<Client>[] = [
  {
    id: 'edit',
    label: 'Редактировать',
    icon: <EditIcon />,
    onClick: (client) => navigate(`/clients/${client.id}/edit`),
    color: 'primary'
  }
];

// В колонке таблицы
{
  id: 'actions',
  label: 'Действия',
  render: (client) => <ActionsMenu actions={actions} item={client} />
}
```

## Дата создания
01.07.2025

## Статус
🟢 **ГОТОВ К ИСПОЛЬЗОВАНИЮ** - Компонент полностью реализован и протестирован 