# Правила локализации текстовых элементов таблиц

## 📋 Инструкция для ИИ-агента

### 🎯 Цель
Обеспечить единообразную локализацию всех текстовых элементов в таблицах системы Tire Service в соответствии с принципами, используемыми для регионов и городов.

## 🏗️ Архитектура локализации

### 1. Структура данных в API (Backend)

#### 1.1 Модель данных
```ruby
# Пример модели с локализацией (Region/City)
class Region < ApplicationRecord
  validates :name_ru, presence: true
  validates :name_uk, presence: true
  
  # Метод локализации
  def localized_name(locale = 'ru')
    case locale.to_s
    when 'uk'
      name_uk.presence || name_ru.presence || name
    when 'ru'
      name_ru.presence || name_uk.presence || name
    else
      name_ru.presence || name_uk.presence || name
    end
  end
end
```

#### 1.2 Контроллер с поддержкой локализации
```ruby
# Определение языка из параметров или заголовков
locale = params[:locale] || request.headers['Accept-Language']&.split(',')&.first || 'ru'

# Сериализация с учетом языка
render json: {
  data: ActiveModel::Serializer::CollectionSerializer.new(
    @regions, 
    serializer: RegionSerializer,
    locale: locale
  )
}
```

#### 1.3 Сериализатор
```ruby
class RegionSerializer < ActiveModel::Serializer
  attributes :id, :name, :name_ru, :name_uk, :code, :is_active
  
  def localized_name
    locale = instance_options[:locale] || 'ru'
    object.localized_name(locale)
  end
end
```

### 2. Структура данных во Frontend

#### 2.1 Интерфейс локализуемых объектов
```typescript
// Базовый интерфейс для всех локализуемых сущностей
export interface LocalizableItem {
  name?: string;
  name_ru?: string;
  name_uk?: string;
}

// Конкретные интерфейсы
export interface Region extends LocalizableItem {
  id: number;
  code?: string;
  is_active: boolean;
  cities_count?: number;
}

export interface City extends LocalizableItem {
  id: number;
  region_id: number;
  region?: Region;
  is_active: boolean;
}
```

#### 2.2 Хелпер для локализации
```typescript
// utils/localizationHelpers.ts
export const getLocalizedName = (
  item: LocalizableItem,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return item.name_uk || item.name_ru || item.name || '';
  }
  
  // Приоритет для русского языка (по умолчанию)
  return item.name_ru || item.name_uk || item.name || '';
};

// Хук для использования в компонентах
export const useLocalizedName = () => {
  const { currentLanguage } = useTranslation();
  return (item: LocalizableItem) => getLocalizedName(item, currentLanguage);
};
```

## 📊 Правила локализации таблиц

### 1. Заголовки колонок таблиц

#### ✅ ПРАВИЛЬНО:
```typescript
// Использование переводов из i18n
const columns = [
  { key: 'name', label: t('tables.columns.name') },
  { key: 'city', label: t('tables.columns.city') },
  { key: 'region', label: t('tables.columns.region') },
  { key: 'status', label: t('tables.columns.status') },
  { key: 'actions', label: t('tables.columns.actions') }
];
```

#### ❌ НЕПРАВИЛЬНО:
```typescript
// Захардкоженные тексты
const columns = [
  { key: 'name', label: 'Название' },
  { key: 'city', label: 'Город' },
  { key: 'region', label: 'Регион' }
];
```

### 2. Отображение данных в ячейках

#### ✅ ПРАВИЛЬНО:
```typescript
// Для локализуемых сущностей (регионы, города)
const RegionCell = ({ region }) => {
  const localizedName = useLocalizedName();
  return <span>{localizedName(region)}</span>;
};

// Для статических переводов
const StatusCell = ({ status }) => {
  const { t } = useTranslation();
  return <span>{t(`statuses.${status}`)}</span>;
};
```

#### ❌ НЕПРАВИЛЬНО:
```typescript
// Прямое отображение без локализации
const RegionCell = ({ region }) => {
  return <span>{region.name}</span>; // Игнорирует текущий язык
};
```

### 3. Действия в таблицах

#### ✅ ПРАВИЛЬНО:
```typescript
const actions = [
  {
    key: 'edit',
    label: t('tables.actions.edit'),
    icon: EditIcon,
    onClick: handleEdit
  },
  {
    key: 'delete',
    label: t('tables.actions.delete'),
    icon: DeleteIcon,
    onClick: handleDelete
  }
];
```

### 4. Фильтры и поиск

#### ✅ ПРАВИЛЬНО:
```typescript
// Фильтр по регионам
const regionOptions = regions.map(region => ({
  value: region.id,
  label: localizedName(region)
}));

// Поиск с учетом локализации
const searchPlaceholder = t('tables.search.placeholder');
```

## 🗂️ Структура переводов в i18n

### 1. Файлы переводов (ru.json/uk.json)

```json
{
  "tables": {
    "columns": {
      "id": "ID",
      "name": "Название",
      "city": "Город",
      "region": "Регион",
      "status": "Статус",
      "actions": "Действия",
      "createdAt": "Дата создания",
      "updatedAt": "Дата обновления"
    },
    "actions": {
      "view": "Просмотреть",
      "edit": "Редактировать",
      "delete": "Удалить",
      "activate": "Активировать",
      "deactivate": "Деактивировать"
    },
    "search": {
      "placeholder": "Поиск...",
      "clear": "Очистить"
    },
    "filters": {
      "all": "Все",
      "active": "Активные",
      "inactive": "Неактивные"
    }
  }
}
```

### 2. Специфичные переводы для страниц

```json
{
  "admin": {
    "regions": {
      "title": "Регионы",
      "filters": {
        "allRegions": "Все регионы"
      }
    },
    "cities": {
      "title": "Города",
      "filters": {
        "allCities": "Все города"
      }
    }
  }
}
```

## 🔧 Алгоритм локализации таблиц

### 1. Подготовка данных
1. **API запрос**: Передать параметр `locale` в запросе
2. **Обработка ответа**: Использовать `localizedName` для сущностей с переводами
3. **Fallback**: Предусмотреть резервные варианты при отсутствии переводов

### 2. Конфигурация колонок
```typescript
const tableConfig = {
  columns: [
    {
      key: 'name',
      label: t('tables.columns.name'),
      render: (item) => localizedName(item)
    },
    {
      key: 'region',
      label: t('tables.columns.region'),
      render: (item) => localizedName(item.region)
    },
    {
      key: 'status',
      label: t('tables.columns.status'),
      render: (item) => t(`statuses.${item.status}`)
    }
  ]
};
```

### 3. Фильтры и поиск
```typescript
const filters = [
  {
    key: 'region',
    label: t('tables.filters.region'),
    options: regions.map(r => ({
      value: r.id,
      label: localizedName(r)
    }))
  }
];
```

## 🚀 Пример полной реализации

```typescript
// Компонент таблицы с локализацией
const LocalizedTable: React.FC = () => {
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  
  const columns = [
    {
      key: 'name',
      label: t('tables.columns.name'),
      render: (item: LocalizableItem) => localizedName(item)
    },
    {
      key: 'region',
      label: t('tables.columns.region'),
      render: (item: { region: Region }) => localizedName(item.region)
    },
    {
      key: 'status',
      label: t('tables.columns.status'),
      render: (item: { is_active: boolean }) => 
        t(item.is_active ? 'statuses.active' : 'statuses.inactive')
    },
    {
      key: 'actions',
      label: t('tables.columns.actions'),
      render: (item) => (
        <ActionsMenu
          actions={[
            {
              label: t('tables.actions.edit'),
              onClick: () => handleEdit(item)
            },
            {
              label: t('tables.actions.delete'),
              onClick: () => handleDelete(item)
            }
          ]}
        />
      )
    }
  ];

  return <PageTable columns={columns} data={data} />;
};
```

## ⚠️ Важные принципы

### 1. Единообразие
- Все таблицы должны использовать одинаковые ключи переводов
- Действия должны иметь стандартные названия
- Статусы должны переводиться единообразно

### 2. Fallback логика
- Всегда предусматривать резервные варианты
- Украинский → Русский → Оригинальный → Пустая строка
- Русский → Украинский → Оригинальный → Пустая строка

### 3. Производительность
- Использовать `useMemo` для тяжелых вычислений
- Кэшировать результаты локализации
- Минимизировать количество re-renders

### 4. Типизация
- Всегда использовать TypeScript интерфейсы
- Определять типы для локализуемых сущностей
- Использовать строгую типизацию для переводов

## 📝 Чек-лист для разработчика

- [ ] Все заголовки колонок используют `t('tables.columns.*')`
- [ ] Локализуемые данные используют `localizedName()`
- [ ] Статусы переводятся через `t('statuses.*')`
- [ ] Действия используют `t('tables.actions.*')`
- [ ] Фильтры локализованы
- [ ] Поиск учитывает все языковые поля
- [ ] Есть fallback для отсутствующих переводов
- [ ] Используется строгая типизация
- [ ] Производительность оптимизирована

## 🔗 Связанные файлы

- `src/utils/localizationHelpers.ts` - Хелперы локализации
- `src/i18n/locales/ru.json` - Русские переводы
- `src/i18n/locales/uk.json` - Украинские переводы
- `src/types/models.ts` - TypeScript интерфейсы
- Backend модели с методами локализации 