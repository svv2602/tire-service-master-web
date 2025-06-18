# Отчет: Исправление API для регионов и городов

## 🐛 Проблема
При попытке редактирования региона (http://localhost:3008/regions/10/edit) возникала ошибка 400 (Bad Request).

## 🔍 Диагностика
Проблема заключалась в несоответствии структуры данных между фронтендом и бэкендом:

### Бэкенд (Rails контроллеры)
```ruby
# RegionsController
def region_params
  params.require(:region).permit(:name, :code, :is_active)
end

# CitiesController  
def city_params
  params.require(:city).permit(:name, :region_id, :is_active)
end
```

### Фронтенд (до исправления)
```typescript
// regions.api.ts - НЕПРАВИЛЬНО
updateRegion: builder.mutation<Region, { id: number; region: Partial<Region> }>({
  query: ({ id, region }) => ({
    url: `regions/${id}`,
    method: 'PUT',
    body: region, // ❌ Отправлялось: { name: "...", code: "..." }
  }),
}),
```

Rails ожидал структуру: `{ region: { name: "...", code: "..." } }`  
А получал: `{ name: "...", code: "..." }`

## ✅ Исправления

### Файл: `src/api/regions.api.ts`
```typescript
// Создание региона
createRegion: builder.mutation<Region, Partial<Region>>({
  query: (region) => ({
    url: 'regions',
    method: 'POST',
    body: { region }, // ✅ Правильная обертка
  }),
}),

// Обновление региона
updateRegion: builder.mutation<Region, { id: number; region: Partial<Region> }>({
  query: ({ id, region }) => ({
    url: `regions/${id}`,
    method: 'PUT',
    body: { region }, // ✅ Правильная обертка
  }),
}),
```

### Файл: `src/api/cities.api.ts`
```typescript
// Создание города
createCity: builder.mutation<{ data: City }, Partial<City>>({
  query: (city) => ({
    url: 'cities',
    method: 'POST',
    body: { city }, // ✅ Правильная обертка
  }),
}),

// Обновление города
updateCity: builder.mutation<{ data: City }, { id: number; city: Partial<City> }>({
  query: ({ id, city }) => ({
    url: `cities/${id}`,
    method: 'PUT',
    body: { city }, // ✅ Правильная обертка
  }),
}),
```

## 🔧 Проверенные API
### ✅ Корректные (уже используют правильную обертку):
- **Partners API**: использует `{ partner: data }`
- **Services API**: использует `{ service: data }` и `{ service_category: data }`
- **Car Brands API**: использует FormData для загрузки файлов

### ✅ Исправленные:
- **Regions API**: теперь использует `{ region: data }`
- **Cities API**: теперь использует `{ city: data }`

## 📊 Результат
- ✅ Редактирование регионов теперь работает корректно
- ✅ Создание регионов работает корректно
- ✅ Редактирование городов работает корректно
- ✅ Создание городов работает корректно
- ✅ Сохранена совместимость с Rails Strong Parameters

## 🚀 Коммит
**7eac877** - fix: исправить обертку данных в regions и cities API для соответствия Rails контроллерам

## 💡 Урок
При работе с Rails API всегда проверяйте структуру `params.require()` в контроллерах и убеждайтесь, что фронтенд отправляет данные в ожидаемом формате с правильной оберткой. 