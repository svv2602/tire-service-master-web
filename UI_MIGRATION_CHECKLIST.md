# 📋 Чеклист миграции UI компонентов

## 🎯 Цель проекта
Заменить все кастомные решения на унифицированные компоненты из `/src/components/ui/` для создания консистентного дизайна во всем приложении.
### 📋 Правила миграции

**Подробные правила миграции:** [`MIGRATION_RULES_V2.md`](./MIGRATION_RULES_V2.md)

Ключевые принципы:
- Замена MUI компонентов на собственные UI компоненты
- Удаление ненужных Paper контейнеров (замена на Box)
- Централизованная система стилей
- Устранение серых подложек
- Модульная архитектура компонентов

## 📊 Анализ текущей ситуации

### ✅ Доступные UI компоненты (37 компонентов):
- Button, TextField, Select, Checkbox, Radio, Switch
- Card, Paper, Modal, Alert, Tooltip, Snackbar
- Table, Tabs, AppBar, Toolbar, Menu, Divider
- Grid, List, Drawer, Badge, Chip, Progress
- DatePicker, TimePicker, AutoComplete, FileUpload
- Accordion, Stepper, Filter, Scrollbar, Skeleton
- Rating, SpeedDial, Backdrop, Pagination, Breadcrumbs

### 📋 Страницы для миграции (по приоритету):

#### 🔴 Высокий приоритет (критичные страницы):
1. **DashboardPage** - главная страница
2. **LoginPage** - точка входа
3. **PartnersPage** - ключевая бизнес-логика
4. **ServicePointsPage** - основная функциональность
5. **ClientsPage** - управление клиентами
6. **BookingsPage** - бронирования

#### 🟡 Средний приоритет (часто используемые):
7. **ServicesPage** - каталог услуг
8. **ReviewsPage** - отзывы
9. **UsersPage** - управление пользователями
10. **SettingsPage** - настройки
11. **ProfilePage** - профиль пользователя

#### 🟢 Низкий приоритет (редко используемые):
12. **RegionsPage** - справочники
13. **CarBrandsPage** - справочники
14. **ArticlesPage** - контент

## 📋 Детальный план миграции

### 🚀 Этап 1: Подготовка (Неделя 1)

#### День 1-2: Анализ и подготовка
- [ ] Провести аудит всех кастомных компонентов в проекте
- [ ] Создать mapping кастомных компонентов → UI компоненты
- [ ] Создать тестовую ветку `feature/ui-migration`
- [ ] Настроить систему быстрого отката через git

#### День 3-4: Создание вспомогательных компонентов
- [ ] Создать `PageContainer` для унификации layout страниц
- [ ] Создать `ActionToolbar` для стандартизации действий
- [ ] Создать `SearchFilter` для унификации поиска
- [ ] Создать `DataTable` на базе UI Table

#### День 5-7: Настройка системы тестирования
- [ ] Создать тестовые сценарии для каждой страницы
- [ ] Настроить автоматические screenshot-тесты
- [ ] Подготовить чеклисты для ручного тестирования

### 🔄 Этап 2: Миграция критичных страниц (Неделя 2-3)

#### DashboardPage (День 1)
- [ ] **Анализ компонентов:**
  - [ ] Заменить кастомные карточки на UI/Card
  - [ ] Заменить кастомные кнопки на UI/Button
  - [ ] Заменить кастомные графики на стандартные
- [ ] **Тестирование:**
  - [ ] Проверить отображение на всех экранах
  - [ ] Проверить интерактивность всех элементов
  - [ ] Провести сравнение до/после
- [ ] **Git checkpoint:** `git commit -m "feat: migrate DashboardPage to UI components"`

#### LoginPage (День 2)
- [ ] **Анализ компонентов:**
  - [ ] Заменить кастомные поля на UI/TextField
  - [ ] Заменить кастомные кнопки на UI/Button
  - [ ] Заменить кастомные чекбоксы на UI/Checkbox
- [ ] **Тестирование:**
  - [ ] Проверить валидацию форм
  - [ ] Проверить процесс авторизации
  - [ ] Проверить адаптивность на мобильных
- [ ] **Git checkpoint:** `git commit -m "feat: migrate LoginPage to UI components"`

#### PartnersPage (День 3-4)
- [ ] **Анализ компонентов:**
  - [ ] Заменить кастомную таблицу на UI/Table
  - [ ] Заменить кастомные кнопки действий на UI/Button
  - [ ] Заменить поиск на UI/TextField + UI/Select
  - [ ] Заменить модальные окна на UI/Modal
- [ ] **Тестирование:**
  - [ ] Проверить сортировку и фильтрацию
  - [ ] Проверить CRUD операции
  - [ ] Проверить пагинацию
- [ ] **Git checkpoint:** `git commit -m "feat: migrate PartnersPage to UI components"`

#### ServicePointsPage (День 5-6)
- [ ] **Анализ компонентов:**
  - [ ] Заменить кастомные карточки на UI/Card
  - [ ] Заменить кастомные табы на UI/Tabs
  - [ ] Заменить загрузку файлов на UI/FileUpload
  - [ ] Заменить селекты на UI/Select
- [ ] **Тестирование:**
  - [ ] Проверить переключение между табами
  - [ ] Проверить загрузку изображений
  - [ ] Проверить геолокацию
- [ ] **Git checkpoint:** `git commit -m "feat: migrate ServicePointsPage to UI components"`

#### ClientsPage (День 7)
- [ ] **Анализ компонентов:**
  - [ ] Заменить кастомную таблицу на UI/Table
  - [ ] Заменить формы на UI/TextField
  - [ ] Заменить кнопки на UI/Button
- [ ] **Тестирование:**
  - [ ] Проверить создание/редактирование клиентов
  - [ ] Проверить поиск и фильтрацию
- [ ] **Git checkpoint:** `git commit -m "feat: migrate ClientsPage to UI components"`

#### BookingsPage (День 8-9)
- [ ] **Анализ компонентов:**
  - [ ] Заменить календарь на UI/DatePicker
  - [ ] Заменить время на UI/TimePicker
  - [ ] Заменить автозаполнение на UI/AutoComplete
  - [ ] Заменить статусы на UI/Chip
- [ ] **Тестирование:**
  - [ ] Проверить создание бронирований
  - [ ] Проверить проверку доступности
  - [ ] Проверить отмену/изменение
- [ ] **Git checkpoint:** `git commit -m "feat: migrate BookingsPage to UI components"`

### 🔄 Этап 3: Миграция средних страниц (Неделя 4)

#### ServicesPage (День 1)
- [ ] **Компоненты:** UI/Card, UI/Button, UI/TextField, UI/Select
- [ ] **Тестирование:** CRUD операции, категории
- [ ] **Git checkpoint:** `git commit -m "feat: migrate ServicesPage to UI components"`

#### ReviewsPage (День 2)
- [ ] **Компоненты:** UI/Rating, UI/TextField, UI/Button, UI/Alert
- [ ] **Тестирование:** Отзывы, оценки, модерация
- [ ] **Git checkpoint:** `git commit -m "feat: migrate ReviewsPage to UI components"`

#### UsersPage (День 3)
- [ ] **Компоненты:** UI/Table, UI/Switch, UI/Tooltip, UI/Button
- [ ] **Тестирование:** Управление пользователями
- [ ] **Git checkpoint:** `git commit -m "feat: migrate UsersPage to UI components"`

#### SettingsPage (День 4)
- [ ] **Компоненты:** UI/Switch, UI/Select, UI/TextField, UI/Tabs
- [ ] **Тестирование:** Сохранение настроек
- [ ] **Git checkpoint:** `git commit -m "feat: migrate SettingsPage to UI components"`

#### ProfilePage (День 5)
- [ ] **Компоненты:** UI/TextField, UI/Button, UI/FileUpload
- [ ] **Тестирование:** Редактирование профиля
- [ ] **Git checkpoint:** `git commit -m "feat: migrate ProfilePage to UI components"`

### 🔄 Этап 4: Миграция низкоприоритетных страниц (Неделя 5)

#### RegionsPage
- [ ] **Компоненты:** UI/Table, UI/Button, UI/TextField
- [ ] **Git checkpoint:** `git commit -m "feat: migrate RegionsPage to UI components"`

#### CarBrandsPage
- [ ] **Компоненты:** UI/Table, UI/Button, UI/TextField, UI/FileUpload
- [ ] **Git checkpoint:** `git commit -m "feat: migrate CarBrandsPage to UI components"`

#### ArticlesPage
- [ ] **Компоненты:** UI/TextField, UI/Button, UI/Modal
- [ ] **Git checkpoint:** `git commit -m "feat: migrate ArticlesPage to UI components"`

### 🔄 Этап 5: Финализация (Неделя 6)

#### День 1-3: Сквозное тестирование
- [ ] Провести полное функциональное тестирование
- [ ] Проверить производительность после миграции
- [ ] Исправить найденные багы

#### День 4-5: Оптимизация
- [ ] Удалить неиспользуемые кастомные компоненты
- [ ] Оптимизировать импорты
- [ ] Обновить документацию

#### День 6-7: Подготовка к релизу
- [ ] Создать PR для code review
- [ ] Подготовить релизные заметки
- [ ] Подготовить план отката

## 🛡️ Система безопасности и отката

### Git стратегия:
- **Основная ветка:** `feature/ui-migration`
- **Под-ветки:** `ui-migration/dashboard`, `ui-migration/login`, etc.
- **Commit pattern:** `feat: migrate [PageName] to UI components`
- **Теги:** `before-ui-migration`, `after-dashboard-migration`, etc.

### Быстрый откат:
```bash
# Откат конкретной страницы
git revert <commit-hash>

# Откат всей миграции
git reset --hard before-ui-migration

# Частичный откат с сохранением изменений
git reset --soft HEAD~1
```

### Тестирование на каждом этапе:
1. **Функциональное тестирование** - все функции работают
2. **Визуальное тестирование** - UI выглядит корректно
3. **Адаптивное тестирование** - работа на всех устройствах
4. **Производительность** - нет деградации скорости

## 📊 Метрики успеха

### Количественные:
- [ ] **100%** страниц переведено на UI компоненты
- [ ] **0** критических багов после миграции
- [ ] **<5%** деградация производительности
- [ ] **37** UI компонентов активно используются

### Качественные:
- [ ] Консистентный дизайн во всем приложении
- [ ] Улучшенная поддерживаемость кода
- [ ] Упрощенная разработка новых страниц
- [ ] Лучший пользовательский опыт

## 🚨 Критические точки внимания

### Обязательно проверить:
1. **Формы:** Валидация, отправка данных, состояния ошибок
2. **Таблицы:** Сортировка, фильтрация, пагинация
3. **Модальные окна:** Открытие, закрытие, передача данных
4. **Навигация:** Переходы между страницами, breadcrumbs
5. **Адаптивность:** Корректное отображение на всех устройствах

### Риски и митигация:
1. **Потеря функциональности:** Тщательное тестирование каждого компонента
2. **Изменение внешнего вида:** Визуальное сравнение до/после
3. **Падение производительности:** Мониторинг bundle size и runtime
4. **Ошибки в production:** Поэтапный rollout через feature flags

## ✅ Критерии готовности к релизу

- [ ] Все страницы успешно мигрированы
- [ ] Пройдены все тесты (unit, integration, e2e)
- [ ] Code review завершен
- [ ] Документация обновлена
- [ ] Performance metrics в пределах нормы
- [ ] QA тестирование пройдено
- [ ] План отката готов и протестирован

## 📋 Ежедневный чеклист

### В начале дня:
- [ ] Создать ветку для конкретной страницы
- [ ] Проанализировать кастомные компоненты
- [ ] Создать backup точку в git

### В процессе работы:
- [ ] Заменять по одному компоненту за раз
- [ ] Тестировать после каждой замены
- [ ] Делать промежуточные коммиты

### В конце дня:
- [ ] Провести полное тестирование страницы
- [ ] Создать итоговый коммит
- [ ] Обновить прогресс в чеклисте
- [ ] Подготовить план на следующий день

---

**Начало проекта:** _дата старта_  
**Планируемое завершение:** _дата + 6 недель_  
**Ответственный:** _имя разработчика_  

## 📊 ОБНОВЛЕННЫЙ ПРОГРЕСС

**Статус:** 🚀 В активной разработке  
**Завершено:** 15/24 страниц (62.5%) 🎉🔥  
**Текущий этап:** Переход к оставшимся 9 страницам

### 📋 Правила миграции V2.0

**Обновленные правила миграции:** [`MIGRATION_RULES_V2.md`](./MIGRATION_RULES_V2.md) ⭐

**Ключевые достижения V2.0:**
- ✅ Исправлены все ошибки компиляции TypeScript
- ✅ Рефакторинг Paper компонентов (замена на Box)
- ✅ Полное устранение серых подложек
- ✅ Централизованная система стилей

### ✅ ЗАВЕРШЕННЫЕ СТРАНИЦЫ (15/24):

#### ✅ DashboardPage - ЗАВЕРШЕНО ✨
- ✅ Современные карточки, графики, анимации
- ✅ Убраны фоновые подкладки

#### ✅ LoginPage - ЗАВЕРШЕНО ✨  
- ✅ Миграция форм авторизации

#### ✅ PartnersPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Paper→Box, Button, TextField, Alert, Chip, Pagination, Dialog→Modal
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Коммиты: ae4c2de, 433bbfe

#### ✅ ServicePointsPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Paper→Box, Button, TextField, Select, Modal, Alert, Chip, Pagination
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Коммит: e000192

#### ✅ ClientsPage - ЗАВЕРШЕНО ✨  
- ✅ Заменены: Paper→Box, Button, TextField, Modal, Alert, Pagination
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Коммит: cd7174e

#### ✅ BookingsPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Paper→Box, Button, TextField, Modal, Alert, Chip, Pagination
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Коммит: 6cc318e

#### ✅ NewServicesPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Button, Card, TextField, Chip, Pagination, Alert, Modal
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ CARD** - transparent backgrounds, no shadows, no borders

#### ✅ ReviewsPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Paper→Box, Button, TextField, Select, Alert, Chip, Pagination, Modal
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Централизованные стили и SIZES константы

#### ✅ UsersPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Paper→Box, Button, TextField, Alert, Chip, Pagination, Modal, Switch
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Адаптивные таблицы

#### ✅ SettingsPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Paper→Box, Button, TextField, Select, Alert, Tabs, Switch, Snackbar
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Новый Tabs API с массивом объектов

#### ✅ RegionsPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Paper→Box, Button, TextField, Alert, Pagination, Modal
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Рефакторинг Paper компонентов

#### ✅ CarBrandsPage - ЗАВЕРШЕНО ✨
- ✅ Заменены: Paper→Box, Button, TextField, Select, Alert, Switch, Pagination, Dialog→Modal, Notification→Snackbar
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Убран TablePagination → заменен на UI/Pagination
- ✅ Убран кастомный Notification → заменен на UI/Snackbar
- ✅ Исправлена пагинация (page с 0 на 1-based)

#### ✅ CitiesPage - ЗАВЕРШЕНО ✨ 🆕
- ✅ Заменены: Button, TextField, Alert, Switch, Chip, Pagination, Dialog→Modal
- ✅ **УБРАНА ОБЕРТКА** - мигрирован и CitiesPage.tsx и компонент CitiesList.tsx
- ✅ Убран FormControlLabel → UI/Switch с собственным label
- ✅ Исправлена пагинация (handlePageChange с event на newPage)
- ✅ Централизованные стили SIZES

#### ✅ ArticlesPage - ЗАВЕРШЕНО ✨ 🆕
- ✅ Заменены: Paper→Box, Button, TextField, Select, Alert, Chip, Pagination
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Убраны Fade анимации для упрощения кода
- ✅ Исправлены типы Select обработчиков (string | number)
- ✅ Сложная таблица статей с фильтрами и статистикой
- ✅ Централизованные стили SIZES

#### ✅ ProfilePage - ЗАВЕРШЕНО ✨ 🆕
- ✅ Заменены: Paper→Box, Button, TextField, Alert, Chip, Snackbar, Card→UI/Card
- ✅ **УБРАНЫ ФОНОВЫЕ ПОДКЛАДКИ** - transparent backgrounds, no shadows, no borders
- ✅ Card + CardContent → UI/Card с единым контейнером
- ✅ MUI Snackbar → UI/Snackbar с упрощенным API
- ✅ Форма профиля пользователя с редактированием и сменой пароля
- ✅ Централизованные стили SIZES

### 🔄 ОСТАВШИЕСЯ СТРАНИЦЫ (9/24):

#### 🎯 Высокий приоритет:
1. **ArticlesPage** - система контента

#### 🎯 Средний приоритет:
2. **ProfilePage** - профиль пользователя
3. **MyBookingsPage** - личные бронирования
4. **MyCarsPage** - личные автомобили
5. **KnowledgeBasePage** - база знаний

#### 🎯 Низкий приоритет (формы):
6. **PageContentPage** - управление контентом
7. **ServicePointFormPage** - форма сервисной точки
8. **ClientFormPage** - форма клиента
9. **RegionFormPage** - форма региона
10. **ArticleFormPage** - форма статьи

### 🎨 Созданные UI компоненты:
- ✅ **Tabs** (с TabPanel) - новый API с массивом tabs
- ✅ **Switch** - замена MUI Switch
- ✅ **Snackbar** (с SnackbarContext) - система уведомлений

### 🐛 Исправленные проблемы:
- ✅ **TypeScript ошибки** - все ошибки компиляции исправлены
- ✅ **SnackbarContext** - исправлена передача message prop
- ✅ **Tabs onChange** - изменена сигнатура с (event, value) на (value, event)  
- ✅ **Select children** - добавлена поддержка children как альтернативы options
- ✅ **Switch onChange** - исправлена сигнатура callback
- ✅ **Paper компоненты** - убраны серые подложки, замена на Box

## 🚨 ВАЖНОЕ ПРАВИЛО ДЛЯ ВСЕХ ОСТАВШИХСЯ СТРАНИЦ

**ОБЯЗАТЕЛЬНО следовать правилам V2.0:**
```tsx
// ❌ НЕ ДЕЛАТЬ:
<Paper sx={{
  backgroundColor: 'transparent',
  boxShadow: 'none', 
  border: 'none'
}}>

// ✅ ДЕЛАТЬ:
<Box sx={{ p: 2, mb: 3 }}>
```

### 🎯 СЛЕДУЮЩИЕ ЭТАПЫ:
1. **ArticlesPage** - система контента
2. **ProfilePage** - профиль пользователя
3. **MyBookingsPage** - личные бронирования
4. **MyCarsPage** - личные автомобили

**Git стратегия:** Отдельная ветка `ui-migration/{page-name}` для каждой страницы