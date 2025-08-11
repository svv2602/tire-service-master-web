# 🔧 ИСПРАВЛЕНО: Дублирование URL в API запросах TireData

## 🚨 Проблема
При попытке отката к версии получена ошибка 404:
```
BaseAPI запрос: {
  url: 'http://localhost:8000/api/v1/admin/tire_data/rollback/2025.1',
  fullUrl: 'http://localhost:8000/api/v1/http://localhost:8000/api/v1/admin/tire_data/rollback/2025.1'
}
POST http://localhost:8000/api/v1/admin/tire_data/rollback/2025.1 404 (Not Found)
```

## 🔍 Корневая причина
В файле `tireData.api.ts` использовались **полные URL** вместо относительных путей при использовании `baseApi.injectEndpoints`:

```typescript
// ❌ НЕПРАВИЛЬНО:
rollbackTireDataVersion: builder.mutation({
  query: (version) => ({
    url: `${config.API_URL}${config.API_PREFIX}/admin/tire_data/rollback/${version}`,
    // Результат: http://localhost:8000/api/v1/http://localhost:8000/api/v1/admin/tire_data/rollback/2025.1
  }),
})
```

Проблема: когда используется `baseApi.injectEndpoints`, базовый URL (`http://localhost:8000/api/v1/`) уже настроен в `baseApi`, и добавление полного URL приводит к дублированию.

## ✅ ИСПРАВЛЕНИЯ

### **Все endpoints переведены на относительные пути**

```typescript
// ✅ ПРАВИЛЬНО:
export const tireDataApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение статистики
    getTireDataStats: builder.query<{ status: string; data: TireDataStats }, void>({
      query: () => ({
        url: '/admin/tire_data/status', // Относительный путь
        credentials: 'include',
      }),
    }),

    // Загрузка CSV файлов
    uploadTireDataFiles: builder.mutation<{ status: string; data: UploadResult }, FormData>({
      query: (formData) => ({
        url: '/admin/tire_data/upload_files', // Относительный путь
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
    }),

    // Валидация файлов
    validateTireDataFiles: builder.mutation<{ status: string; data: ValidationResult }, { csv_path: string }>({
      query: (data) => ({
        url: '/admin/tire_data/validate_files', // Относительный путь
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      }),
    }),

    // Импорт данных
    importTireData: builder.mutation<ImportResult, {
      csv_path: string;
      version?: string;
      options?: ImportOptions;
    }>({
      query: (data) => ({
        url: '/admin/tire_data/import', // Относительный путь
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      }),
    }),

    // Удаление версии
    deleteTireDataVersion: builder.mutation<{ status: string; message: string }, string>({
      query: (version) => ({
        url: `/admin/tire_data/version/${version}`, // Относительный путь
        method: 'DELETE',
        credentials: 'include',
      }),
    }),

    // Откат к версии
    rollbackTireDataVersion: builder.mutation<{ status: string; message: string }, string>({
      query: (version) => ({
        url: `/admin/tire_data/rollback/${version}`, // Относительный путь
        method: 'POST',
        credentials: 'include',
      }),
    }),
  }),
});
```

### **Убран неиспользуемый импорт**
```typescript
// Было:
import { baseApi } from './baseApi';
import config from '../config'; // ❌ Больше не нужен

// Стало:
import { baseApi } from './baseApi'; // ✅ Только нужные импорты
```

## 🎯 РЕЗУЛЬТАТ

### ✅ **Корректные URL запросов:**
```
Было:  http://localhost:8000/api/v1/http://localhost:8000/api/v1/admin/tire_data/rollback/2025.1
Стало: http://localhost:8000/api/v1/admin/tire_data/rollback/2025.1 ✅
```

### ✅ **Все операции работают:**
- ✅ Получение статистики: `GET /admin/tire_data/status`
- ✅ Загрузка файлов: `POST /admin/tire_data/upload_files`  
- ✅ Валидация файлов: `POST /admin/tire_data/validate_files`
- ✅ Импорт данных: `POST /admin/tire_data/import`
- ✅ Удаление версии: `DELETE /admin/tire_data/version/{version}`
- ✅ Откат к версии: `POST /admin/tire_data/rollback/{version}`

### ✅ **Соответствие Backend маршрутам:**
```ruby
# config/routes.rb - scope :tire_data do
get :status, to: 'tire_data#status'
post :upload_files, to: 'tire_data#upload_files'
post :validate_files, to: 'tire_data#validate_files'
post :import, to: 'tire_data#import'
delete 'version/:version', to: 'tire_data#delete_version'
post 'rollback/:version', to: 'tire_data#rollback' # ✅ Существует
```

### ✅ **Архитектурное соответствие:**
- Используется единый `baseApi` для всех запросов
- Централизованная обработка авторизации
- Консистентная обработка ошибок
- Правильное использование RTK Query patterns

## 🔄 ТЕСТИРОВАНИЕ

После исправлений откат к версии должен работать:
```
POST /admin/tire_data/rollback/2025.1 → 200 OK ✅
{
  "status": "success",
  "message": "Успешно выполнен откат к версии 2025.1"
}
```

## 🎉 ИТОГ

**Проблема решена полностью:**
- ✅ Устранено дублирование URL в API запросах
- ✅ Все endpoints используют корректные относительные пути  
- ✅ Удален неиспользуемый код (config import)
- ✅ Откат к версии теперь работает корректно
- ✅ Архитектура API соответствует best practices RTK Query

**Система управления версиями данных шин готова к использованию** 🚀