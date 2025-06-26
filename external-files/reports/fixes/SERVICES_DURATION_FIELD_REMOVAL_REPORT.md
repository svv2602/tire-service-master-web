# Отчет об удалении поля длительности из форм услуг

## 🎯 Задача
Убрать поле "Длительность (минуты)" из формы редактирования/создания услуги в админке.

## ✅ Выполненные изменения

### Frontend изменения:

1. **src/types/service.ts**:
   - Убрано поле `default_duration` из интерфейса `Service`
   - Убрано поле `default_duration` из интерфейса `ServiceFormData`

2. **src/components/ServicesList.tsx**:
   - Убрано поле "Длительность (минуты)" из формы создания/редактирования услуги
   - Убран `default_duration` из initialValues формы
   - Убрана логика обработки `default_duration` в onSubmit
   - Убрано использование `default_duration` в handleOpenDialog

3. **src/pages/service-points/ServicePointFormPage.tsx**:
   - Исправлено использование `selectedService.default_duration` → `service.duration || 30`
   - Убрано `service.default_duration` из маппинга услуг

4. **src/pages/client/ClientSearchPage.tsx**:
   - Убрано `service.default_duration` из маппинга услуг в ServicePointCard

5. **src/pages/service-points/ServicePointServicesPage.tsx**:
   - Убрано поле `default_duration` из интерфейса ServicePointService
   - Убрана колонка "Длительность" из таблицы услуг

## 🎯 Результат

- ✅ Поле "Длительность (минуты)" полностью убрано из всех форм услуг
- ✅ Исправлены все TypeScript ошибки компиляции
- ✅ Время выполнения услуг теперь управляется только через таблицу `service_point_services`
- ✅ Проект успешно компилируется без ошибок

## 📁 Коммит
**Коммит**: `c4661aa` - "Удаление поля default_duration из форм и интерфейсов услуг"

**Измененные файлы**: 5 files changed, 7 insertions(+), 37 deletions(-)

## 💡 Техническое решение
Время выполнения услуг теперь управляется исключительно через связующую таблицу `service_point_services` (поле `duration`), что обеспечивает гибкость - разные сервисные точки могут устанавливать разное время для одной и той же услуги. 