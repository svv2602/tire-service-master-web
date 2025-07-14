# Правила локализации текстовых элементов таблиц

## 📋 Инструкция для ИИ-агента

### 🎯 Цель
Обеспечить единообразную локализацию всех текстовых элементов в таблицах и формах системы Tire Service в соответствии с принципами, используемыми для регионов и городов.

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

## 📝 Правила локализации форм

### 1. Структура форм с табами для языков

#### ✅ ПРАВИЛЬНО: Использование табов для многоязычных полей
```typescript
const LocalizedForm: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <form>
      {/* Основные поля (общие для всех языков) */}
      <TextField
        label={t('forms.common.sortOrder')}
        name="sort_order"
        type="number"
      />
      
      {/* Табы для языков */}
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={t('languages.russian')} />
        <Tab label={t('languages.ukrainian')} />
        <Tab label={t('forms.tabs.settings')} />
      </Tabs>
      
      {/* Русский язык */}
      <TabPanel value={activeTab} index={0}>
        <TextField
          label={t('forms.fields.nameRu')}
          name="name"
          required
        />
        <TextField
          label={t('forms.fields.descriptionRu')}
          name="description"
          multiline
          rows={3}
        />
      </TabPanel>
      
      {/* Украинский язык */}
      <TabPanel value={activeTab} index={1}>
        <TextField
          label={t('forms.fields.nameUk')}
          name="name_uk"
          required
        />
        <TextField
          label={t('forms.fields.descriptionUk')}
          name="description_uk"
          multiline
          rows={3}
        />
      </TabPanel>
      
      {/* Настройки */}
      <TabPanel value={activeTab} index={2}>
        <FormControlLabel
          control={<Switch name="is_active" />}
          label={t('forms.fields.isActive')}
        />
      </TabPanel>
    </form>
  );
};
```

#### ❌ НЕПРАВИЛЬНО: Все поля в одной форме без разделения
```typescript
// Плохой подход - все поля вперемешку
<form>
  <TextField label="Название (RU)" name="name" />
  <TextField label="Название (UK)" name="name_uk" />
  <TextField label="Описание (RU)" name="description" />
  <TextField label="Описание (UK)" name="description_uk" />
  <Switch label="Активен" name="is_active" />
</form>
```

### 2. Валидация многоязычных форм

#### ✅ ПРАВИЛЬНО: Yup схема с локализованными сообщениями
```typescript
const validationSchema = yup.object({
  // Русский язык - обязательный
  name: yup
    .string()
    .required(t('validation.required', { field: t('forms.fields.nameRu') }))
    .min(2, t('validation.minLength', { field: t('forms.fields.nameRu'), min: 2 })),
    
  description: yup
    .string()
    .required(t('validation.required', { field: t('forms.fields.descriptionRu') })),
    
  // Украинский язык - обязательный
  name_uk: yup
    .string()
    .required(t('validation.required', { field: t('forms.fields.nameUk') }))
    .min(2, t('validation.minLength', { field: t('forms.fields.nameUk'), min: 2 })),
    
  description_uk: yup
    .string()
    .required(t('validation.required', { field: t('forms.fields.descriptionUk') })),
    
  // Общие поля
  sort_order: yup
    .number()
    .min(0, t('validation.minValue', { field: t('forms.fields.sortOrder'), min: 0 }))
    .required(t('validation.required', { field: t('forms.fields.sortOrder') })),
    
  is_active: yup.boolean()
});
```

### 3. Инициализация данных в формах

#### ✅ ПРАВИЛЬНО: Корректная инициализация для редактирования
```typescript
const initialValues = useMemo(() => {
  if (editingItem) {
    return {
      // Русские поля
      name: editingItem.name || '',
      description: editingItem.description || '',
      
      // Украинские поля
      name_uk: editingItem.name_uk || '',
      description_uk: editingItem.description_uk || '',
      
      // Общие поля
      sort_order: editingItem.sort_order || 0,
      is_active: editingItem.is_active ?? true
    };
  }
  
  // Значения по умолчанию для создания
  return {
    name: '',
    description: '',
    name_uk: '',
    description_uk: '',
    sort_order: 0,
    is_active: true
  };
}, [editingItem]);
```

### 4. CRUD операции с локализацией

#### 4.1 CREATE - Создание с проверкой обязательных полей
```typescript
const handleCreate = async (values: FormData) => {
  try {
    // Проверяем, что заполнены обязательные поля для обоих языков
    if (!values.name || !values.name_uk) {
      throw new Error(t('validation.bothLanguagesRequired'));
    }
    
    const result = await createMutation.mutateAsync({
      service: {
        name: values.name,
        description: values.description,
        name_uk: values.name_uk,
        description_uk: values.description_uk,
        sort_order: values.sort_order,
        is_active: values.is_active
      }
    });
    
    // Показываем успешное сообщение
    showNotification(t('messages.createSuccess'), 'success');
    
  } catch (error) {
    showNotification(t('messages.createError'), 'error');
  }
};
```

#### 4.2 UPDATE - Обновление с сохранением всех полей
```typescript
const handleUpdate = async (values: FormData) => {
  try {
    const result = await updateMutation.mutateAsync({
      id: editingItem.id,
      service: {
        // Всегда передаем все поля, даже если они не изменились
        name: values.name,
        description: values.description,
        name_uk: values.name_uk,
        description_uk: values.description_uk,
        sort_order: values.sort_order,
        is_active: values.is_active
      }
    });
    
    showNotification(t('messages.updateSuccess'), 'success');
    
  } catch (error) {
    showNotification(t('messages.updateError'), 'error');
  }
};
```

#### 4.3 READ - Отображение с учетом текущего языка
```typescript
const ServicesList: React.FC = () => {
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  
  const columns = [
    {
      key: 'name',
      label: t('tables.columns.name'),
      render: (service: Service) => localizedName(service)
    },
    {
      key: 'description', 
      label: t('tables.columns.description'),
      render: (service: Service) => {
        const currentLang = localStorage.getItem('i18nextLng') || 'ru';
        return currentLang === 'uk' 
          ? (service.description_uk || service.description)
          : (service.description || service.description_uk);
      }
    }
  ];
};
```

#### 4.4 DELETE - Удаление с локализованным подтверждением
```typescript
const handleDelete = async (item: Service) => {
  const localizedName = useLocalizedName();
  
  const confirmed = window.confirm(
    t('messages.deleteConfirm', { 
      name: localizedName(item) 
    })
  );
  
  if (confirmed) {
    try {
      await deleteMutation.mutateAsync(item.id);
      showNotification(t('messages.deleteSuccess'), 'success');
    } catch (error) {
      showNotification(t('messages.deleteError'), 'error');
    }
  }
};
```

### 5. Обработка ошибок в формах

#### ✅ ПРАВИЛЬНО: Локализованные сообщения об ошибках
```typescript
const FormWithErrorHandling: React.FC = () => {
  const { t } = useTranslation();
  
  const formik = useFormik({
    validationSchema,
    onSubmit: async (values) => {
      try {
        await submitForm(values);
      } catch (error) {
        // Обработка ошибок валидации с сервера
        if (error.response?.status === 422) {
          const serverErrors = error.response.data.errors;
          
          // Преобразуем серверные ошибки в локализованные
          Object.keys(serverErrors).forEach(field => {
            formik.setFieldError(field, t(`validation.server.${field}`, {
              defaultValue: serverErrors[field][0]
            }));
          });
        } else {
          // Общая ошибка
          showNotification(t('messages.serverError'), 'error');
        }
      }
    }
  });
  
  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Поля формы с отображением ошибок */}
      <TextField
        error={!!(formik.touched.name && formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        {...formik.getFieldProps('name')}
      />
    </form>
  );
};
```

### 6. Тестирование локализованных форм

#### ✅ ПРАВИЛЬНО: Проверка всех CRUD операций
```typescript
// Чек-лист для тестирования форм с локализацией:

// 1. CREATE операции
// - [ ] Форма создания открывается без ошибок
// - [ ] Валидация работает для всех языковых полей
// - [ ] Можно создать запись с русскими полями
// - [ ] Можно создать запись с украинскими полями
// - [ ] Можно создать запись с обоими языками
// - [ ] Показываются корректные сообщения об успехе/ошибке

// 2. READ операции  
// - [ ] Таблица отображает данные на текущем языке
// - [ ] При переключении языка данные обновляются
// - [ ] Fallback работает при отсутствии перевода
// - [ ] Поиск работает по всем языковым полям

// 3. UPDATE операции
// - [ ] Форма редактирования предзаполняется данными
// - [ ] Можно редактировать русские поля
// - [ ] Можно редактировать украинские поля
// - [ ] Сохранение работает корректно
// - [ ] Данные обновляются в таблице после сохранения

// 4. DELETE операции
// - [ ] Подтверждение удаления показывает локализованное имя
// - [ ] Удаление работает корректно
// - [ ] Показывается сообщение об успешном удалении
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
  },
  "forms": {
    "tabs": {
      "russian": "Русский",
      "ukrainian": "Украинский", 
      "settings": "Настройки"
    },
    "fields": {
      "nameRu": "Название (RU)",
      "nameUk": "Название (UK)",
      "descriptionRu": "Описание (RU)",
      "descriptionUk": "Описание (UK)",
      "sortOrder": "Порядок сортировки",
      "isActive": "Активен"
    },
    "buttons": {
      "save": "Сохранить",
      "cancel": "Отмена",
      "create": "Создать",
      "update": "Обновить"
    }
  },
  "validation": {
    "required": "Поле {{field}} обязательно для заполнения",
    "minLength": "Поле {{field}} должно содержать минимум {{min}} символов",
    "minValue": "Поле {{field}} должно быть не менее {{min}}",
    "bothLanguagesRequired": "Необходимо заполнить поля для обоих языков"
  },
  "messages": {
    "createSuccess": "Запись успешно создана",
    "createError": "Ошибка при создании записи",
    "updateSuccess": "Запись успешно обновлена", 
    "updateError": "Ошибка при обновлении записи",
    "deleteSuccess": "Запись успешно удалена",
    "deleteError": "Ошибка при удалении записи",
    "deleteConfirm": "Вы уверены, что хотите удалить {{name}}?",
    "serverError": "Ошибка сервера. Попробуйте позже."
  },
  "languages": {
    "russian": "Русский",
    "ukrainian": "Украинский"
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
    },
    "services": {
      "title": "Услуги",
      "individual": {
        "title": "Редактирование услуги",
        "editDialog": "Редактировать услугу"
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
- Формы должны использовать единый паттерн с табами для языков

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

### 5. CRUD операции
- Всегда тестировать все четыре операции (Create, Read, Update, Delete)
- Проверять валидацию для всех языковых полей
- Убеждаться в корректной работе fallback логики
- Тестировать переключение языков в формах и таблицах

## 📝 Чек-лист для разработчика

### Таблицы:
- [ ] Все заголовки колонок используют `t('tables.columns.*')`
- [ ] Локализуемые данные используют `localizedName()`
- [ ] Статусы переводятся через `t('statuses.*')`
- [ ] Действия используют `t('tables.actions.*')`
- [ ] Фильтры локализованы
- [ ] Поиск учитывает все языковые поля
- [ ] Есть fallback для отсутствующих переводов

### Формы:
- [ ] Используются табы для разделения языков (Русский/Украинский/Настройки)
- [ ] Валидация настроена для всех языковых полей
- [ ] Инициализация данных работает корректно для редактирования
- [ ] CREATE операция проверяет обязательные поля
- [ ] UPDATE операция сохраняет все поля
- [ ] DELETE операция показывает локализованное подтверждение
- [ ] Обработка ошибок локализована
- [ ] Сообщения о успехе/ошибке переведены

### Общее:
- [ ] Используется строгая типизация
- [ ] Производительность оптимизирована
- [ ] Все CRUD операции протестированы
- [ ] Переключение языков работает корректно

## 🔗 Связанные файлы

- `src/utils/localizationHelpers.ts` - Хелперы локализации
- `src/i18n/locales/ru.json` - Русские переводы
- `src/i18n/locales/uk.json` - Украинские переводы
- `src/types/models.ts` - TypeScript интерфейсы
- Backend модели с методами локализации 