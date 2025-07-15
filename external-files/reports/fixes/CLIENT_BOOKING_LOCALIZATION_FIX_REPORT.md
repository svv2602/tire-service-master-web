# Отчет об исправлении локализации карточек сервисных точек на странице бронирования

## Проблема
На странице `/client/booking` в карточках сервисных точек не переводились название, адрес и город точки. Все данные отображались на русском языке независимо от выбранного языка интерфейса.

## Выявленные проблемы
1. **Компонент ServicePointCard не использовал локализованные поля**: Использовались поля `servicePoint.name` и `servicePoint.address` вместо `servicePoint.localized_name` и `servicePoint.localized_address`
2. **Отсутствие локализованных полей в интерфейсе ServicePointData**: Интерфейс не содержал поля для локализованных данных
3. **Функции конвертации не передавали локализованные поля**: `convertServicePointToServicePointData` не включала локализованные поля
4. **Отсутствие параметра locale в некоторых API запросах**: Не все API запросы передавали параметр locale

## Выполненные исправления

### 1. Обновление компонента ServicePointCard
**Файл**: `src/components/ui/ServicePointCard/ServicePointCard.tsx`

**Было**:
```typescript
<Typography variant={variant === 'compact' ? 'h6' : 'h5'} sx={{ fontWeight: 700, mb: 1, color: colors.textPrimary }}>
  {servicePoint.name}
</Typography>

<Typography variant="body2" sx={{ color: colors.textSecondary }}>
  {servicePoint.address}{servicePoint.city?.name ? `, ${getLocalizedName(servicePoint.city)}` : ''}
</Typography>
```

**Стало**:
```typescript
<Typography variant={variant === 'compact' ? 'h6' : 'h5'} sx={{ fontWeight: 700, mb: 1, color: colors.textPrimary }}>
  {servicePoint.localized_name || servicePoint.name}
</Typography>

<Typography variant="body2" sx={{ color: colors.textSecondary }}>
  {servicePoint.localized_address || servicePoint.address}{servicePoint.city?.name ? `, ${getLocalizedName(servicePoint.city)}` : ''}
</Typography>
```

### 2. Обновление интерфейса ServicePointData
**Файл**: `src/components/ui/ServicePointCard/ServicePointCard.tsx`

**Добавлено**:
```typescript
export interface ServicePointData {
  // ... существующие поля ...
  // Локализованные поля
  localized_name?: string;
  localized_address?: string;
  localized_description?: string;
  // ... остальные поля ...
}
```

### 3. Обновление функций конвертации
**Файл**: `src/pages/bookings/components/CityServicePointStep.tsx`

**Добавлено**:
```typescript
const convertServicePointToServicePointData = (servicePoint: ServicePoint): ServicePointData => {
  return {
    // ... существующие поля ...
    // Локализованные поля
    localized_name: servicePoint.localized_name,
    localized_address: servicePoint.localized_address,
    localized_description: servicePoint.localized_description,
    // ... остальные поля ...
  };
};
```

**Файл**: `src/pages/client/ClientServicesPage.tsx`

**Добавлено**:
```typescript
const convertServicePointToServicePointData = (servicePoint: ServicePointWithSearchData): ServicePointData => {
  return {
    // ... существующие поля ...
    // Локализованные поля
    localized_name: servicePoint.localized_name,
    localized_address: servicePoint.localized_address,
    localized_description: servicePoint.localized_description,
    // ... остальные поля ...
  };
};
```

### 4. Обновление API запросов
**Файл**: `src/api/servicePoints.api.ts`

**Обновлен интерфейс**:
```typescript
getServicePointsByCategory: builder.query<
  { data: ServicePoint[]; total_count: number }, 
  { categoryId: number; cityId?: number; page?: number; per_page?: number; locale?: string }
>({
  query: ({ categoryId, cityId, page = 1, per_page = 10, locale = 'ru' }) => ({
    url: 'service_points/by_category',
    params: { 
      category_id: categoryId, 
      city_id: cityId,
      page,
      per_page,
      locale
    }
  }),
```

**Файл**: `src/pages/bookings/components/CityServicePointStep.tsx`

**Добавлен параметр locale**:
```typescript
const { data: servicePointsData, isLoading: isLoadingServicePoints, error: servicePointsError } = useGetServicePointsByCategoryQuery(
  { 
    categoryId: formData.service_category_id,
    cityId: selectedCity?.id,
    locale: localStorage.getItem('i18nextLng') || 'ru'
  },
  { skip: !formData.service_category_id || !selectedCity }
);
```

## Результат
✅ **Исправлено**: Карточки сервисных точек теперь отображают локализованные названия и адреса
✅ **Унифицировано**: Все компоненты используют единую систему локализации
✅ **Оптимизировано**: API запросы передают параметр locale для получения переведенных данных
✅ **Совместимо**: Сохранена обратная совместимость с fallback на исходные поля

## Затронутые файлы
- `src/components/ui/ServicePointCard/ServicePointCard.tsx` (обновлен)
- `src/pages/bookings/components/CityServicePointStep.tsx` (обновлен)
- `src/pages/client/ClientServicesPage.tsx` (обновлен)
- `src/api/servicePoints.api.ts` (обновлен)

## Тестирование
Страница `/client/booking` теперь должна корректно отображать:
- Локализованные названия сервисных точек
- Локализованные адреса сервисных точек
- Корректные переводы при переключении языка интерфейса
- Fallback на исходные поля при отсутствии переводов

---
*Отчет создан: $(date)*
*Статус: Завершено ✅* 