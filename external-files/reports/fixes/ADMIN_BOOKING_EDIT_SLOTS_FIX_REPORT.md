# 🔧 Отчет об исправлении логики подсчета загруженности в админской странице редактирования бронирования

## 📋 Описание проблемы

На странице `/admin/bookings/7/edit` в слотах по временным отрезкам показывалось неправильное количество:
- **Показывалось:** "1 из 1 свободно"
- **Должно показывать:** "1 из 2 свободно" (так как постов 2)

## 🔍 Корневая причина

В файле `BookingFormPage.tsx` использовалась неправильная логика преобразования данных API для компонента `AvailabilitySelector`. Старая логика группировки считала каждый слот как отдельный пост, вместо использования реальных данных из API.

### ❌ Неправильная логика (ДО исправления):

```typescript
// Группируем слоты по времени начала для подсчета доступных постов
const groupedByTime = availabilityData.slots.reduce((acc, slot) => {
  const timeKey = slot.start_time;
  
  if (!acc[timeKey]) {
    acc[timeKey] = {
      time: timeKey,
      available_posts: 0,
      total_posts: 0,
      duration_minutes: slot.duration_minutes,
      can_book: true
    };
  }
  
  acc[timeKey].available_posts += 1;  // ❌ Неправильно!
  acc[timeKey].total_posts += 1;      // ❌ Неправильно!
  
  return acc;
}, {} as Record<string, AvailableTimeSlot>);
```

**Проблема:** Каждый слот увеличивал счетчики на +1, но API уже возвращает правильные значения `available_posts`, `total_posts`, `bookings_count`.

## ✅ Решение

Исправлена логика преобразования данных для использования новых полей API:

```typescript
// ✅ Преобразуем слоты используя новые поля API
const availableTimeSlots = useMemo(() => {
  if (!availabilityData?.slots || availabilityData.slots.length === 0) {
    return [];
  }

  // Преобразуем слоты используя новые поля API
  return availabilityData.slots.map(slot => ({
    time: slot.start_time,
    available_posts: slot.available_posts || 0,    // ✅ Из API
    total_posts: slot.total_posts || 0,            // ✅ Из API
    bookings_count: slot.bookings_count || 0,      // ✅ Из API
    duration_minutes: slot.duration_minutes,
    can_book: (slot.available_posts || 0) > 0
  })).sort((a, b) => a.time.localeCompare(b.time));
}, [availabilityData]);
```

## 🔧 Внесенные изменения

### Frontend (tire-service-master-web)

**Файл:** `src/pages/bookings/BookingFormPage.tsx`

1. **Убрана неправильная группировка слотов** - удален код с `reduce()` который неправильно считал каждый слот как +1
2. **Добавлено использование новых полей API** - теперь используются `available_posts`, `total_posts`, `bookings_count` из API
3. **Упрощена логика** - простое преобразование массива слотов без сложной группировки

## 🧪 Тестирование

### API тестирование
- **Endpoint:** `GET /api/v1/availability/slots_for_category?service_point_id=6&category_id=1&date=2025-07-05`
- **Результат:** API возвращает правильные поля `available_posts`, `total_posts`, `bookings_count`

### UI тестирование
- **Страница:** `/admin/bookings/7/edit`
- **Действия:** Нажать "Изменить время" → выбрать дату 5 июля 2025 → проверить слоты
- **Ожидаемый результат:** Слоты показывают правильное количество постов (например, "1 из 2 свободно")

## 📊 Результат

✅ **Исправления внесены:**
- Исправлена логика в `BookingFormPage.tsx`
- Теперь используются поля API: `available_posts`, `total_posts`, `bookings_count`
- Убрана неправильная группировка слотов

✅ **Ожидаемый результат:**
- Слоты корректно отображают количество постов
- Показывается: "X из Y свободно" где Y - реальное количество постов
- Унифицирована логика с другими страницами (основная страница бронирования, страница переноса)

## 🔗 Связанные файлы

- `tire-service-master-web/src/pages/bookings/BookingFormPage.tsx` - исправлена логика преобразования данных
- `tire-service-master-web/external-files/testing/test_admin_booking_edit_slots_fix.html` - тестовый файл
- `tire-service-master-web/external-files/reports/fixes/ADMIN_BOOKING_EDIT_SLOTS_FIX_REPORT.md` - данный отчет

## 📅 Информация о коммите

- **Коммит:** `12d20c7`
- **Сообщение:** "Исправление логики подсчета загруженности в админской странице редактирования бронирования"
- **Дата:** 2025-01-07
- **Ветка:** `feature/booking-improvements`

## 🎯 Следующие шаги

1. Перезапустить frontend (если нужно)
2. Проверить страницу `/admin/bookings/7/edit`
3. Убедиться, что слоты показывают правильные цифры
4. Протестировать с разными датами и сервисными точками 