# 🎭 Анализ и настройка интерфейсов по ролям пользователей

## 📋 Текущая ситуация

Сейчас админ-панель показывает одинаковый функционал для всех ролей, но каждая роль должна видеть только релевантную информацию. Меню уже фильтруется по ролям, но **содержимое страниц** не адаптировано под роли.

## 🎯 Роли в системе

- **👑 ADMIN** - Полный доступ ко всем функциям
- **👨‍💼 MANAGER** - Управление клиентами, бронированиями, аналитика
- **🤝 PARTNER** - Управление своими сервисными точками и заказами
- **👨‍💻 OPERATOR** - Работа с заказами партнера, ограниченный функционал
- **👤 CLIENT** - Личный кабинет (редко используется в админке)

## 📊 Анализ страниц по ролям

### 🏠 Dashboard (`/admin/dashboard`)
**Доступ:** ADMIN, MANAGER, PARTNER

**Текущие проблемы:**
- Показывает общую статистику для всех ролей
- Партнер видит статистику по всем точкам, а не только своим

**Решение:**
- **ADMIN/MANAGER:** Полная статистика
- **PARTNER:** Статистика только по своим сервисным точкам
- Фильтрация данных на backend по partner_id

### 🏢 Сервисные точки (`/admin/service-points`)
**Доступ:** ADMIN, MANAGER, PARTNER

**Текущие проблемы:**
- Партнер видит все сервисные точки
- Партнер не может создать новую точку с предустановленным partner_id

**Решение:**
- **ADMIN/MANAGER:** Все точки + возможность выбора партнера
- **PARTNER:** Только свои точки + кнопка "Добавить" с предустановленным partner_id
- Backend фильтрация: `service_points.where(partner_id: current_user.partner_id)` для партнеров

### 📍 Мои сервисные точки (`/admin/my-service-points`)
**Доступ:** PARTNER, MANAGER

**Статус:** Уже существует отдельная страница для партнеров ✅

### 📅 Бронирования (`/admin/bookings`)
**Доступ:** ADMIN, MANAGER, PARTNER

**Текущие проблемы:**
- Партнер видит все бронирования
- Нет фильтрации по сервисным точкам партнера

**Решение:**
- **ADMIN/MANAGER:** Все бронирования
- **PARTNER:** Только бронирования своих сервисных точек
- Backend фильтрация по service_point.partner_id

### ⭐ Отзывы (`/admin/reviews`)
**Доступ:** ADMIN, MANAGER, PARTNER

**Текущие проблемы:**
- Партнер видит все отзывы

**Решение:**
- **ADMIN/MANAGER:** Все отзывы
- **PARTNER:** Только отзывы о своих сервисных точках

### 👥 Пользователи (`/admin/users`)
**Доступ:** ADMIN

**Статус:** Корректно ограничен ✅

### 🤝 Партнеры (`/admin/partners`)
**Доступ:** ADMIN

**Статус:** Корректно ограничен ✅

### 👨‍💻 Операторы (`/admin/operators`)
**Доступ:** ADMIN, MANAGER, PARTNER

**Текущие проблемы:**
- Партнер видит всех операторов

**Решение:**
- **ADMIN/MANAGER:** Все операторы
- **PARTNER:** Только своих операторов (где operator.partner_id = current_user.partner_id)

### 🛒 Заказы
**Страницы:**
- `/admin/orders` (ADMIN, MANAGER) - все заказы
- `/admin/partner-orders` (PARTNER, OPERATOR) - заказы партнера

**Статус:** Уже разделены по ролям ✅

## 🔧 Варианты реализации

### Вариант 1: Условная логика в компонентах (Быстрый)
```typescript
// В компоненте страницы
const ServicePointsPage = () => {
  const { user } = useAuth();
  const isPartner = user?.role === UserRole.PARTNER;
  
  // Разные API запросы для разных ролей
  const { data } = isPartner 
    ? useGetPartnerServicePointsQuery(user.partner_id)
    : useGetAllServicePointsQuery();
    
  // Условное отображение кнопок
  return (
    <>
      {isPartner ? (
        <Button onClick={() => navigate('/admin/service-points/new?partner_id=' + user.partner_id)}>
          Добавить точку
        </Button>
      ) : (
        <Button onClick={() => navigate('/admin/service-points/new')}>
          Добавить точку
        </Button>
      )}
    </>
  );
};
```

### Вариант 2: Отдельные компоненты для ролей (Чистый)
```typescript
// Разные компоненты для разных ролей
const AdminServicePointsPage = () => { /* Полный функционал */ };
const PartnerServicePointsPage = () => { /* Ограниченный функционал */ };

// В роутере
<Route path="/admin/service-points" element={
  user?.role === UserRole.PARTNER 
    ? <PartnerServicePointsPage />
    : <AdminServicePointsPage />
} />
```

### Вариант 3: HOC (Higher-Order Component) для ролей
```typescript
const withRoleAccess = (Component, roleConfig) => {
  return (props) => {
    const { user } = useAuth();
    const config = roleConfig[user?.role];
    
    return <Component {...props} roleConfig={config} />;
  };
};

const ServicePointsPage = withRoleAccess(BaseServicePointsPage, {
  [UserRole.ADMIN]: { showAllPoints: true, canCreateForAnyPartner: true },
  [UserRole.PARTNER]: { showAllPoints: false, canCreateForAnyPartner: false }
});
```

## 🚀 Рекомендуемый подход

### Этап 1: Backend фильтрация (Приоритет)
1. Создать scope'ы в моделях для фильтрации по ролям
2. Обновить контроллеры для автоматической фильтрации данных
3. Добавить policy для проверки доступа

### Этап 2: Frontend адаптация
1. Использовать **Вариант 1** (условная логика) для быстрой реализации
2. Создать хук `useRoleAccess()` для централизованной логики
3. Постепенно рефакторить в **Вариант 2** для сложных страниц

### Этап 3: UI/UX улучшения
1. Адаптировать формы создания/редактирования
2. Скрыть ненужные поля и кнопки
3. Добавить индикаторы роли в интерфейсе

## 📝 План реализации

### Приоритет 1: Критичные страницы
1. **Service Points** - партнеры должны видеть только свои точки
2. **Bookings** - партнеры должны видеть только свои бронирования
3. **Dashboard** - адаптировать статистику под роли

### Приоритет 2: Важные страницы
1. **Reviews** - фильтрация отзывов по сервисным точкам партнера
2. **Operators** - партнеры видят только своих операторов
3. **Analytics** - аналитика по сервисным точкам партнера

### Приоритет 3: Дополнительные улучшения
1. Адаптация форм создания/редактирования
2. Персонализированные дашборды
3. Ролевые индикаторы в UI

## 🛠️ Техническая реализация

### Backend (Rails)
```ruby
# В контроллерах
class ServicePointsController < ApplicationController
  def index
    @service_points = policy_scope(ServicePoint)
  end
end

# В политиках
class ServicePointPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      case user.role
      when 'admin', 'manager'
        scope.all
      when 'partner'
        scope.where(partner_id: user.partner_id)
      else
        scope.none
      end
    end
  end
end
```

### Frontend (React)
```typescript
// Хук для работы с ролями
const useRoleAccess = () => {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === UserRole.ADMIN,
    isManager: user?.role === UserRole.MANAGER,
    isPartner: user?.role === UserRole.PARTNER,
    isOperator: user?.role === UserRole.OPERATOR,
    canManageAllPoints: ['admin', 'manager'].includes(user?.role),
    canManageOwnPoints: ['admin', 'manager', 'partner'].includes(user?.role),
  };
};
```

## 🎯 Ожидаемый результат

После реализации каждая роль будет видеть только релевантную информацию:

- **Партнеры** увидят только свои сервисные точки, бронирования и отзывы
- **Операторы** получат доступ к заказам своего партнера
- **Менеджеры** сохранят расширенный доступ для управления
- **Админы** сохранят полный контроль над системой

---
**Следующий шаг:** Выбрать страницы для первоочередной реализации и начать с backend фильтрации. 