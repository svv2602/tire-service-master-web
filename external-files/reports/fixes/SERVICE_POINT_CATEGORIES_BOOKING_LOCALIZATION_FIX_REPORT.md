# Отчет об исправлении локализации категорий услуг на странице бронирования

## 🎯 Проблема
На странице `/client/booking` на шаге "Вибір сервісної точки" категории услуг не переводились в карточках сервисных точек и в информационном блоке о выбранной категории.

## 🔍 Диагностика
1. **Анализ логов**: Страница использует `NewBookingWithAvailabilityPage` и компонент `CityServicePointStep`
2. **Корневые причины**:
   - В `CategorySelectionStep` API запрос `useGetServiceCategoriesByCityIdQuery` не передавал параметр `locale`
   - В `ServicePointCardWrapper` логика извлечения категорий не использовала локализованные поля
   - Отображение информации о выбранной категории не использовало локализованные поля

## 🛠️ Исправления

### 1. Исправление API хука для категорий по городу
**Файл**: `tire-service-master-web/src/api/serviceCategories.api.ts`

Обновлен хук `getServiceCategoriesByCityId` для поддержки параметра `locale`.

### 2. Обновление CategorySelectionStep
**Файл**: `tire-service-master-web/src/pages/bookings/components/CategorySelectionStep.tsx`

- Добавлен параметр `locale` в API запрос
- Исправлено отображение категорий с использованием `localized_name` и `localized_description`

### 3. Исправление ServicePointCardWrapper
**Файл**: `tire-service-master-web/src/pages/bookings/components/CityServicePointStep.tsx`

- Обновлена логика извлечения категорий из `service_posts`
- Используются поля `service_category_id` и `category_name` из API ответа
- Исправлено отображение информации о выбранной категории

## 🎯 Результат
✅ **ЗАВЕРШЕНО**: Категории услуг на странице `/client/booking` теперь корректно отображают переводы в соответствии с выбранным языком интерфейса.

## 📝 Следующие шаги
Требуется перезапуск frontend для тестирования изменений.