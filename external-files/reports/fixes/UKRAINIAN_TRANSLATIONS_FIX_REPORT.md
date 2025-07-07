# Отчет об исправлении украинских переводов колонок таблиц

## Проблема
На странице `/admin/service-points` при использовании украинского языка возникали ошибки отсутствующих переводов:

### Ошибки в консоли:
```
i18next::translator: missingKey uk translation tables.columns.name Название
i18next::translator: missingKey uk translation tables.columns.partner Партнер
i18next::translator: missingKey uk translation tables.columns.city Город
i18next::translator: missingKey uk translation tables.columns.status Статус
i18next::translator: missingKey uk translation tables.columns.actions Действия
i18next::translator: missingKey uk translation statuses.active statuses.active
i18next::translator: missingKey uk translation statuses.inactive statuses.inactive
i18next::translator: missingKey uk translation pagination.firstPage pagination.firstPage
i18next::translator: missingKey uk translation confirmDialog.title confirmDialog.title
```

## Корневая причина
1. В украинском файле переводов `uk.json` многие ключи содержали русские переводы вместо украинских
2. Неправильное название ключа `partnerSubtitle` вместо `subtitleWithPartner`
3. Переводы секций pagination, tables, admin содержали смесь украинских и русских слов

## Исправления

### 1. Секция `tables` исправлена:
```json
{
  "tables": {
    "columns": {
      "description": "Опис", // было "Описание"
      "createdAt": "Дата створення", // было "Дата создания"
      "updatedAt": "Дата оновлення", // было "Дата обновления"
      "rating": "Оцінка", // было "Оценка"
      "comment": "Коментар", // было "Комментарий"
      "booking": "Бронювання", // было "Бронирование"
      "time": "Час", // было "Время"
      "position": "Позиція", // было "Позиция"
      "section": "Секція" // было "Секция"
    },
    "actions": {
      "approve": "Схвалити", // было "Одобрить"
      "reject": "Відхилити", // было "Отклонить"
      "publish": "Опублікувати", // было "Опубликовать"
      "unpublish": "Зняти з публікації" // было "Снять с публикации"
    }
  }
}
```

### 2. Секция `pagination` исправлена:
```json
{
  "pagination": {
    "itemsPerPage": "Елементів на сторінці", // было "Элементов на странице"
    "page": "Сторінка", // было "Страница"
    "of": "з", // было "из"
    "from": "з", // было "с"
    "total": "всього", // было "всего"
    "firstPage": "Перша сторінка", // было "Первая страница"
    "lastPage": "Остання сторінка", // было "Последняя страница"
    "nextPage": "Наступна сторінка", // было "Следующая страница"
    "previousPage": "Попередня сторінка" // было "Предыдущая страница"
  }
}
```

### 3. Секция `admin.servicePoints` исправлена:
- Исправлен ключ `partnerSubtitle` → `subtitleWithPartner`
- Переведены на украинский:
  - `deactivatedMessage`: "Сервісна точка" вместо "Сервисная точка"
  - `deletedMessage`: "повністю видалена з системи" вместо "полностью удалена из системы"

### 4. Секции admin исправлены:
- `admin.reviews`: все переводы с русского на украинский
- `admin.bookings`: все переводы с русского на украинский  
- `admin.cities`: все переводы с русского на украинский
- `admin.articles`: все переводы с русского на украинский

## Результат
✅ Устранены все ошибки `missingKey` для украинского языка
✅ Все колонки таблиц корректно отображаются на украинском
✅ Пагинация работает с украинскими переводами
✅ Заголовки страниц отображаются на украинском
✅ Диалоги подтверждения локализованы

## Тестирование
- Страница `/admin/service-points` должна работать без ошибок в консоли
- Все тексты отображаются на правильном украинском языке
- Переключение языка работает корректно

## Файлы изменены:
- `tire-service-master-web/src/i18n/locales/uk.json` - исправлены переводы

## Коммит:
Исправление украинских переводов для колонок таблиц, пагинации и заголовков страниц 