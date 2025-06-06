# Трекер оставшихся компонентов для миграции на централизованную систему стилей

## Статус миграции
- **Дата начала**: 6 июня 2025
- **Всего осталось**: 34 компонента
- **Приоритет**: Начать с TextField компонентов

## 📋 Компоненты с TextField для миграции

### Формы
1. `/src/components/forms/LoginForm.tsx`
2. `/src/components/forms/RegistrationForm.tsx`
3. `/src/components/forms/PasswordResetForm.tsx`
4. `/src/components/forms/SearchForm.tsx`

### Диалоги
1. `/src/components/dialogs/BookingDialog.tsx`
2. `/src/components/dialogs/ServicePointDialog.tsx`
3. `/src/components/dialogs/UserDialog.tsx`
4. `/src/components/dialogs/FeedbackDialog.tsx`

### Фильтры и поиск
1. `/src/components/filters/DateRangeFilter.tsx`
2. `/src/components/filters/ServiceFilter.tsx`
3. `/src/components/filters/LocationFilter.tsx`
4. `/src/components/filters/StatusFilter.tsx`

### Страницы с формами
1. `/src/pages/bookings/BookingDetails.tsx`
2. `/src/pages/service-points/ServicePointDetails.tsx`
3. `/src/pages/users/UserDetails.tsx`
4. `/src/pages/profile/NotificationSettings.tsx`
5. `/src/pages/profile/SecuritySettings.tsx`

## 🔧 Специальные компоненты

### Календарь и планирование
1. `/src/components/calendar/BookingCalendar.tsx`
2. `/src/components/calendar/WeeklySchedule.tsx`
3. `/src/components/calendar/DailySchedule.tsx`
4. `/src/components/calendar/TimeSlotPicker.tsx`

### Карты и локация
1. `/src/components/maps/ServicePointMap.tsx`
2. `/src/components/maps/LocationPicker.tsx`
3. `/src/components/maps/CityMap.tsx`

### Статистика и графики
1. `/src/components/stats/BookingStats.tsx`
2. `/src/components/stats/RevenueChart.tsx`
3. `/src/components/stats/ServiceUsageChart.tsx`
4. `/src/components/stats/CustomerActivity.tsx`

### Таблицы и списки
1. `/src/components/tables/BookingTable.tsx`
2. `/src/components/tables/ServicePointTable.tsx`
3. `/src/components/tables/UserTable.tsx`
4. `/src/components/tables/TransactionTable.tsx`

## 📱 Мобильные компоненты
1. `/src/components/mobile/MobileMenu.tsx`
2. `/src/components/mobile/BottomNav.tsx`
3. `/src/components/mobile/ServiceCardMobile.tsx`
4. `/src/components/mobile/BookingCardMobile.tsx`

## План действий

1. **Первый этап** (Высокий приоритет)
   - Начать с миграции TextField компонентов
   - Сфокусироваться на формах и диалогах
   - Обеспечить консистентность стилей ввода

2. **Второй этап** (Средний приоритет)
   - Мигрировать компоненты календаря и планирования
   - Обновить компоненты карт и локации
   - Стандартизировать таблицы и списки

3. **Третий этап** (Низкий приоритет)
   - Мигрировать статистику и графики
   - Обновить мобильные компоненты
   - Финальная проверка консистентности

## Отслеживание прогресса

Для каждого компонента нужно:
1. ✓ Добавить импорты централизованной системы стилей
2. ✓ Инициализировать стили через useTheme
3. ✓ Заменить inline стили на централизованные
4. ✓ Использовать SIZES константы
5. ✓ Проверить типизацию
6. ✓ Провести тестирование
7. ✓ Документировать изменения

## Ежедневные обновления

### 6 июня 2025
- Создан трекер оставшихся компонентов
- Приоритизированы компоненты для миграции
- Составлен детальный план действий
