# 🚀 План реализации ролевого доступа

## 📋 Текущий статус

✅ **Завершено:**
- Создан хук `useRoleAccess()` для централизованного управления правами
- Backend уже настроен с политиками Pundit для фильтрации данных
- Меню админ-панели фильтруется по ролям

❌ **Проблемы:**
- Страницы показывают одинаковый интерфейс для всех ролей
- Партнеры видят данные всех партнеров вместо только своих
- Формы создания не адаптированы под роли

## 🎯 Этап 1: Критичные страницы (Приоритет)

### 1.1 ServicePointsPage - Сервисные точки ⚡

**Проблема:** Партнеры видят все сервисные точки, а не только свои

**Решение:**
```typescript
// В ServicePointsPage.tsx
import { useRoleAccess } from '../../hooks/useRoleAccess';

const ServicePointsPage = () => {
  const { isPartner, partnerId, canViewAllServicePoints } = useRoleAccess();
  
  // Условные параметры запроса
  const queryParams = useMemo(() => ({
    // Для партнеров автоматически фильтруем по partner_id
    partner_id: isPartner ? partnerId : undefined,
    // ... остальные параметры
  }), [isPartner, partnerId, ...]);
};
```

**Изменения:**
1. Добавить `useRoleAccess()` в компонент
2. Условно передавать `partner_id` в запрос для партнеров
3. Адаптировать кнопку "Добавить" для партнеров
4. Скрыть/показать колонки в зависимости от роли

### 1.2 BookingsPage - Бронирования ⚡

**Проблема:** Партнеры видят все бронирования

**Решение:** Аналогично ServicePointsPage - фильтрация через backend политики

### 1.3 DashboardPage - Дашборд ⚡

**Проблема:** Показывает общую статистику для всех ролей

**Решение:** Создать отдельные компоненты статистики для разных ролей

## 🎯 Этап 2: Важные страницы

### 2.1 ReviewsPage - Отзывы
- Партнеры видят только отзывы о своих сервисных точках

### 2.2 OperatorsPage - Операторы  
- Партнеры видят только своих операторов

### 2.3 Analytics - Аналитика
- Партнеры видят аналитику только по своим точкам

## 🛠️ Конкретные шаги реализации

### Шаг 1: Обновить ServicePointsPage (30 мин)

1. **Добавить хук useRoleAccess:**
```typescript
const { isPartner, partnerId, canViewAllServicePoints, getCreateServicePointPath } = useRoleAccess();
```

2. **Условная фильтрация данных:**
```typescript
const queryParams = useMemo(() => ({
  query: searchQuery || undefined,
  city_id: selectedCity !== 'all' ? Number(selectedCity) : undefined,
  region_id: selectedRegion !== 'all' ? Number(selectedRegion) : undefined,
  // Для партнеров автоматически фильтруем по их partner_id
  partner_id: isPartner ? partnerId : (selectedPartner !== 'all' ? Number(selectedPartner) : undefined),
  is_active: selectedStatus !== 'all' ? (selectedStatus === 'active' ? 'true' : 'false') : undefined,
  page: page,
  per_page: PER_PAGE,
}), [searchQuery, selectedCity, selectedRegion, selectedPartner, selectedStatus, page, isPartner, partnerId]);
```

3. **Адаптировать кнопку создания:**
```typescript
const headerConfig = useMemo(() => ({
  title: t('admin.servicePoints.title'),
  actions: [
    {
      label: t('admin.servicePoints.createServicePoint'),
      icon: <AddIcon />,
      onClick: () => navigate(getCreateServicePointPath()),
      variant: 'contained' as const,
      color: 'primary' as const,
    }
  ]
}), [navigate, t, getCreateServicePointPath]);
```

4. **Скрыть фильтр партнера для партнеров:**
```typescript
const filtersConfig = useMemo(() => {
  const filters = [
    // ... другие фильтры
  ];
  
  // Показываем фильтр партнеров только админам и менеджерам
  if (canViewAllServicePoints) {
    filters.push({
      key: 'partner',
      label: t('admin.servicePoints.filters.partner'),
      value: selectedPartner,
      onChange: handlePartnerFilterChange,
      options: [
        { value: 'all', label: t('admin.servicePoints.filters.allPartners') },
        ...(partnersData?.data || []).map(partner => ({
          value: partner.id.toString(),
          label: partner.name
        }))
      ]
    });
  }
  
  return filters;
}, [canViewAllServicePoints, selectedPartner, partnersData, t]);
```

### Шаг 2: Тестирование (15 мин)

1. Войти под партнером (partner@test.com / partner123)
2. Перейти на `/admin/service-points`
3. Проверить что показываются только точки партнера
4. Проверить что кнопка "Добавить" ведет на правильный путь
5. Проверить что фильтр партнеров скрыт

### Шаг 3: Обновить BookingsPage (20 мин)

Аналогично ServicePointsPage:
1. Добавить `useRoleAccess()`
2. Условная фильтрация по `service_point.partner_id`
3. Адаптировать UI под роли

### Шаг 4: Обновить DashboardPage (25 мин)

1. Создать отдельные компоненты:
   - `AdminDashboard` - полная статистика
   - `PartnerDashboard` - статистика партнера

2. Условное отображение:
```typescript
const DashboardPage = () => {
  const { isPartner, isAdmin, isManager } = useRoleAccess();
  
  if (isPartner) {
    return <PartnerDashboard />;
  }
  
  if (isAdmin || isManager) {
    return <AdminDashboard />;
  }
  
  return <div>Доступ запрещен</div>;
};
```

## 🧪 План тестирования

### Тестовые учетные записи:
- **admin@test.com / admin123** - полный доступ
- **partner@test.com / partner123** - только свои данные
- **client@test.com / client123** - ограниченный доступ

### Сценарии тестирования:

1. **Партнер видит только свои данные:**
   - Сервисные точки: только принадлежащие партнеру
   - Бронирования: только для своих точек
   - Отзывы: только о своих точках

2. **Админ видит все данные:**
   - Все сервисные точки
   - Все бронирования
   - Все отзывы

3. **UI адаптация:**
   - Правильные кнопки создания
   - Скрытые/показанные фильтры
   - Корректные пути навигации

## 📊 Метрики успеха

- ✅ Партнеры видят только свои данные
- ✅ Админы сохраняют полный доступ
- ✅ UI адаптирован под каждую роль
- ✅ Формы создания работают корректно
- ✅ Нет ошибок в консоли
- ✅ Все тесты проходят

## 🔄 Следующие итерации

После успешной реализации Этапа 1:

1. **Этап 2:** Reviews, Operators, Analytics
2. **Этап 3:** Формы создания/редактирования
3. **Этап 4:** Персонализированные дашборды
4. **Этап 5:** Ролевые индикаторы в UI

---

**Время на реализацию Этапа 1:** ~1.5 часа  
**Готовность к тестированию:** Сразу после каждого шага 