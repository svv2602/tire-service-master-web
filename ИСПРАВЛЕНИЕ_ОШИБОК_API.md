# Исправление ошибок API и TypeScript

## Описание проблемы

На фронтенде возникали массовые ошибки "Ошибка при загрузке данных" из-за несоответствия типов данных между API и фронтендом.

## Основные проблемы

### 1. Несоответствие структур ответов API

**Проблема**: Фронтенд ожидал структуру `{ data: T[], meta: {...} }`, а API возвращал разные форматы.

**Решение**: Обновлен интерфейс `ApiResponse<T>` в `models.ts`:

```typescript
export interface ApiResponse<T> {
  data: T[];
  total?: number;
  meta?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    total?: number;
  };
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    total?: number;
  };
}
```

### 2. Проблемы с типами ID

**Проблема**: API возвращает ID как строки, а фронтенд ожидал числа в некоторых местах.

**Решение**: Обновлены интерфейсы для поддержки как строк, так и чисел:

```typescript
export interface ServicePointFilter {
  search?: string;
  query?: string;
  city_id?: number | string;
  cityId?: number | string;
  region_id?: number | string;
  regionId?: number | string;
  // ...
}
```

### 3. Отсутствующие поля в типах

**Проблема**: В интерфейсах отсутствовали поля, которые использовались в компонентах.

**Решение**: Добавлены недостающие поля:
- `regionId` в интерфейс `City`
- `search` в интерфейс `ServicePointFilter`
- Поддержка альтернативных полей для совместимости

### 4. Проблемы с RTK Query хуками

**Проблема**: Некоторые хуки вызывались без обязательных параметров.

**Решение**: Исправлены вызовы хуков:

```typescript
// Было:
useGetPartnersQuery()
useGetRegionsQuery()

// Стало:
useGetPartnersQuery({})
useGetRegionsQuery({})
```

## Исправленные файлы

### 1. `src/types/models.ts`
- Обновлен `ApiResponse<T>` для поддержки разных форматов ответов
- Добавлено поле `regionId` в интерфейс `City`
- Обновлен `ServicePointFilter` с поддержкой `search`
- Обновлен `CityFilter` с поддержкой разных типов `region_id`

### 2. `src/pages/service-points/ServicePointsPage.tsx`
- Исправлены обращения к `citiesData?.data`
- Исправлены обращения к `regionsData?.data`
- Изменен параметр запроса с `query` на `search`
- Исправлена обработка `totalItems` с поддержкой разных структур

### 3. `src/pages/services/ServicesPage.tsx`
- Исправлены обращения к `categoriesData`
- Исправлены обращения к `servicesData`

### 4. `src/pages/service-points/ServicePointFormPage.tsx`
- Исправлены вызовы RTK Query хуков с пустыми объектами параметров

### 5. `src/pages/service-points/ServicePointDetailsPage.tsx`
- Исправлены обращения к `city?.regionId` на `city?.region_id`
- Добавлено приведение типов для `working_hours`

### 6. `src/pages/cities/CitiesPage.tsx`
- Добавлен локальный интерфейс `CityFilter` если отсутствует импорт

### 7. `src/pages/catalog/RegionsPage.tsx`
- Исправлена обработка `is_active` с поддержкой `undefined`

## Инструменты диагностики

### 1. `api_debug.js`
Скрипт для диагностики API ответов в консоли браузера:

```javascript
// Использование в консоли браузера:
testAllEndpoints()     // Тестирует все основные эндпоинты
checkIdTypes()         // Проверяет типы ID в ответах
apiRequest('/endpoint') // Выполняет запрос к API
```

### 2. `fix_typescript_errors.js`
Автоматический скрипт для исправления основных ошибок TypeScript:

```bash
node fix_typescript_errors.js
```

## Результат исправлений

После применения всех исправлений:

1. ✅ Проект успешно собирается без ошибок TypeScript
2. ✅ API запросы работают корректно
3. ✅ Данные загружаются и отображаются правильно
4. ✅ Совместимость с разными форматами ответов API
5. ✅ Поддержка как строковых, так и числовых ID

## Рекомендации

1. **Тестирование**: Используйте `api_debug.js` для проверки структуры ответов API
2. **Типизация**: Всегда проверяйте соответствие типов между API и фронтендом
3. **Совместимость**: Используйте опциональные поля и альтернативные названия для обратной совместимости
4. **Валидация**: Добавьте проверки на существование данных перед их использованием

## Команды для проверки

```bash
# Сборка проекта
npm run build

# Запуск в режиме разработки
npm start

# Проверка типов
npx tsc --noEmit
``` 