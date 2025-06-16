# План оптимизации загрузки фронтенда

## Обоснование изменений

Текущая реализация фронтенда имеет следующие проблемы производительности:

1. **Большой размер бандла**: Все компоненты и модули загружаются одновременно при первом входе
2. **Отсутствие разделения кода**: Нет разделения на чанки для оптимальной загрузки
3. **Избыточная загрузка**: Компоненты, которые не используются на текущей странице, загружаются вместе с основным бандлом
4. **Неоптимальное кэширование**: Неэффективная стратегия кэширования данных в RTK Query

Оптимизация загрузки фронтенда позволит:
- Ускорить первоначальную загрузку приложения
- Улучшить пользовательский опыт
- Снизить нагрузку на сеть
- Повысить производительность на мобильных устройствах

## План реализации

### 1. Разделение кода (Code Splitting)

#### 1.1. Настройка React.lazy и Suspense

```tsx
// src/App.tsx

import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner';

// Ленивая загрузка страниц
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ServicePoints = lazy(() => import('./pages/service-points/ServicePointsPage'));
const Partners = lazy(() => import('./pages/partners/PartnersPage'));
// ... другие страницы

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/service-points/*" element={<ServicePoints />} />
        <Route path="/partners/*" element={<Partners />} />
        {/* ... другие маршруты */}
      </Routes>
    </Suspense>
  );
}

export default App;
```

#### 1.2. Настройка динамического импорта для больших компонентов

```tsx
// src/components/DataTable.tsx

import { lazy, Suspense } from 'react';
import LoadingSpinner from './common/LoadingSpinner';

// Ленивая загрузка тяжелых компонентов
const AdvancedFilters = lazy(() => import('./AdvancedFilters'));

function DataTable({ showFilters, ...props }) {
  return (
    <div>
      {showFilters && (
        <Suspense fallback={<LoadingSpinner size="small" />}>
          <AdvancedFilters {...props} />
        </Suspense>
      )}
      {/* Основное содержимое таблицы */}
    </div>
  );
}

export default DataTable;
```

### 2. Оптимизация размера бандла

#### 2.1. Анализ размера бандла

```bash
# Установка инструмента для анализа бандла
npm install --save-dev webpack-bundle-analyzer

# Настройка в webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // ...
  plugins: [
    // ...
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
    }),
  ],
};
```

#### 2.2. Оптимизация импортов библиотек

```tsx
// Было
import { Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// Стало - точечные импорты
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
```

#### 2.3. Оптимизация изображений

```tsx
// src/components/ImageOptimizer.tsx

import { useState, useEffect } from 'react';

function ImageOptimizer({ src, alt, width, height }) {
  const [loaded, setLoaded] = useState(false);
  
  // Генерация оптимизированного URL для изображения
  const optimizedSrc = `${src}?w=${width}&q=80`;
  
  return (
    <>
      {!loaded && <div className="image-placeholder" style={{ width, height }} />}
      <img 
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </>
  );
}

export default ImageOptimizer;
```

### 3. Кэширование данных

#### 3.1. Улучшение стратегий кэширования в RTK Query

```tsx
// src/api/baseApi.ts

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    credentials: 'include',
    // ... другие настройки
  }),
  tagTypes: [
    'Article', 'User', 'Partner', 'ServicePoint', 'City', 'Region',
    // ... другие типы
  ],
  endpoints: () => ({}),
});
```

#### 3.2. Настройка кэширования для конкретных API

```tsx
// src/api/servicePoints.api.ts

export const servicePointsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServicePoints: builder.query({
      query: (params) => ({
        url: 'service-points',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'ServicePoint', id })),
              { type: 'ServicePoint', id: 'LIST' },
            ]
          : [{ type: 'ServicePoint', id: 'LIST' }],
      // Кэширование на 5 минут
      keepUnusedDataFor: 300,
    }),
    
    getServicePoint: builder.query({
      query: (id) => `service-points/${id}`,
      providesTags: (result, error, id) => [{ type: 'ServicePoint', id }],
      // Кэширование на 10 минут
      keepUnusedDataFor: 600,
    }),
    
    // ... другие эндпоинты
  }),
});
```

#### 3.3. Настройка механизма инвалидации кэша

```tsx
// src/api/servicePoints.api.ts (продолжение)

updateServicePoint: builder.mutation({
  query: ({ id, ...body }) => ({
    url: `service-points/${id}`,
    method: 'PUT',
    body,
  }),
  // Инвалидация кэша при обновлении
  invalidatesTags: (result, error, { id }) => [
    { type: 'ServicePoint', id },
    { type: 'ServicePoint', id: 'LIST' },
  ],
}),

deleteServicePoint: builder.mutation({
  query: (id) => ({
    url: `service-points/${id}`,
    method: 'DELETE',
  }),
  // Инвалидация кэша при удалении
  invalidatesTags: (result, error, id) => [
    { type: 'ServicePoint', id },
    { type: 'ServicePoint', id: 'LIST' },
  ],
}),
```

### 4. Оптимизация рендеринга

#### 4.1. Использование React.memo для предотвращения ненужных ререндеров

```tsx
// src/components/ServicePointCard.tsx

import React from 'react';

interface ServicePointCardProps {
  id: number;
  name: string;
  address: string;
  // ... другие пропсы
}

const ServicePointCard: React.FC<ServicePointCardProps> = ({ id, name, address }) => {
  // ... логика компонента
  
  return (
    <div className="service-point-card">
      <h3>{name}</h3>
      <p>{address}</p>
      {/* ... остальной контент */}
    </div>
  );
};

// Мемоизация компонента для предотвращения ненужных ререндеров
export default React.memo(ServicePointCard);
```

#### 4.2. Оптимизация работы с большими списками (виртуализация)

```tsx
// src/components/VirtualizedList.tsx

import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
}

function VirtualizedList<T>({ items, renderItem, itemHeight }: VirtualizedListProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return <div style={style}>{renderItem(item, index)}</div>;
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

export default VirtualizedList;
```

### 5. Тестирование и мониторинг

#### 5.1. Метрики производительности

- **First Contentful Paint (FCP)**: Время до первого отображения контента
- **Largest Contentful Paint (LCP)**: Время до отображения основного контента
- **Time to Interactive (TTI)**: Время до интерактивности страницы
- **Total Blocking Time (TBT)**: Общее время блокировки основного потока

#### 5.2. Инструменты для тестирования

- **Lighthouse**: Для общего анализа производительности
- **WebPageTest**: Для детального анализа загрузки страницы
- **Chrome DevTools Performance**: Для профилирования рендеринга
- **React Profiler**: Для анализа производительности React-компонентов

## График реализации

1. **Анализ текущей производительности**: 1-2 дня
2. **Внедрение разделения кода и ленивой загрузки**: 2-3 дня
3. **Оптимизация размера бандла**: 2-3 дня
4. **Улучшение стратегий кэширования**: 1-2 дня
5. **Оптимизация рендеринга компонентов**: 2-3 дня
6. **Тестирование и отладка**: 2-3 дня

## Ожидаемые результаты

- **Уменьшение размера начального бандла на 30-50%**
- **Ускорение первоначальной загрузки на 40-60%**
- **Снижение времени до интерактивности (TTI) на 30-50%**
- **Улучшение метрик Web Vitals (LCP, FID, CLS)**
- **Снижение нагрузки на сеть и устройства пользователей**

## Риски и их снижение

1. **Проблемы совместимости с браузерами**
   - Тестирование на различных браузерах
   - Добавление полифиллов при необходимости

2. **Ухудшение UX при ленивой загрузке**
   - Использование качественных плейсхолдеров
   - Оптимизация порогов загрузки

3. **Проблемы с кэшированием данных**
   - Тщательное тестирование инвалидации кэша
   - Мониторинг состояния кэша в Redux DevTools 