# Отчет о проблеме фильтрации городов по региону

## 🚨 Проблема
На странице `/client/services` при выборе региона "Львовская область" в выпадающем списке городов показываются города из других регионов (Киев, Борисполь из Киевской области).

## 🔍 Проведенная диагностика

### ✅ Бэкенд API работает корректно
```bash
# Все города
curl "http://localhost:8000/api/v1/service_points/cities"
# Результат: 3 города (Борисполь, Киев, Львов)

# Киевская область (region_id=1)
curl "http://localhost:8000/api/v1/service_points/cities?region_id=1"
# Результат: 2 города (Борисполь, Киев) ✅

# Львовская область (region_id=2)
curl "http://localhost:8000/api/v1/service_points/cities?region_id=2"
# Результат: 1 город (Львов) ✅
```

### ✅ Фронтенд API настроен правильно
- `useGetCitiesWithServicePointsQuery` правильно передает параметры
- Параметры фильтрации настроены: `{ region_id: selectedRegion || undefined }`
- API запрос формируется корректно

### 🔧 Внесенные изменения для диагностики

#### Backend
- Добавлена поддержка `region_id` в метод `client_search`
- Исправлена логика фильтрации по региону в `cities_with_service_points`

#### Frontend
- Добавлен `region_id` в параметры поиска сервисных точек
- Добавлена отладка в компонент `ClientServicesPage.tsx`
- Добавлена отладка в API `servicePoints.api.ts`

## 🎯 Следующие шаги
1. Открыть страницу `/client/services` в браузере
2. Открыть консоль разработчика (F12)
3. Выбрать "Львовская область" в фильтре
4. Проверить отладочные сообщения в консоли:
   - `🏙️ Cities query params:` - параметры запроса
   - `🏙️ Selected region:` - выбранный регион
   - `🔍 getCitiesWithServicePoints API params:` - параметры API
   - `🏙️ Cities response:` - ответ API

## 📋 Возможные причины
1. **Кэширование RTK Query** - старые данные могут кэшироваться
2. **Проблема с состоянием** - `selectedRegion` может не обновляться
3. **Проблема с зависимостями** - `useMemo` может не перезапускаться
4. **Проблема с типами** - неправильное преобразование типов

## 🔧 Файлы для проверки
- `tire-service-master-web/src/pages/client/ClientServicesPage.tsx`
- `tire-service-master-web/src/api/servicePoints.api.ts`
- `tire-service-master-api/app/controllers/api/v1/service_points_controller.rb`

## 📊 Тестовые файлы
- `tire-service-master-web/external-files/testing/test_cities_api_debug.html` 