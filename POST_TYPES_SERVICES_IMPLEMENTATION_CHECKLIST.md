# 📋 ЧЕКЛИСТ РЕАЛИЗАЦИИ ТИПОВ ПОСТОВ И КАТЕГОРИЙ УСЛУГ

## 🎯 ЦЕЛЬ ПРОЕКТА
Реализовать систему категорий услуг для постов обслуживания, позволяющую:
- Привязывать посты к категориям услуг (шиномонтаж, мойка, СТО)
- Фильтровать доступные точки по выбранной категории при бронировании
- Рассчитывать доступность только по постам нужной категории
- Управлять контактными телефонами по категориям
- Фиксировать тип услуг в бронированиях для аналитики

---

## 🔍 АНАЛИЗ ТЕКУЩЕГО СОСТОЯНИЯ

### ✅ ЧТО УЖЕ ЕСТЬ:
- [x] Модель `ServiceCategory` с базовой структурой
- [x] Модель `Service` привязанная к категориям
- [x] Модель `ServicePost` с индивидуальными настройками
- [x] Модель `Booking` с полями получателя услуги
- [x] API для управления категориями услуг
- [x] Frontend компоненты для управления категориями

### ❌ ЧТО НУЖНО ДОБАВИТЬ:
- [ ] Связь постов с категориями услуг
- [ ] Поле категории в бронированиях
- [ ] Контактные телефоны по категориям
- [ ] Логика фильтрации по категориям в доступности
- [ ] UI для выбора категории при бронировании
- [ ] Переработка шага "Услуги" в форме сервисной точки

---

## 📊 ЭТАП 1: BACKEND - СТРУКТУРА ДАННЫХ

### 1.1 Миграции базы данных
- [ ] **Создать миграцию для связи постов с категориями**
  ```ruby
  # 20250627_add_service_category_to_service_posts.rb
  add_reference :service_posts, :service_category, null: true, foreign_key: true
  add_index :service_posts, [:service_point_id, :service_category_id]
  ```

- [ ] **Создать миграцию для категории в бронированиях**
  ```ruby
  # 20250627_add_service_category_to_bookings.rb
  add_reference :bookings, :service_category, null: true, foreign_key: true
  add_index :bookings, :service_category_id
  ```

- [ ] **Создать таблицу контактных телефонов по категориям**
  ```ruby
  # 20250627_create_service_point_category_contacts.rb
  create_table :service_point_category_contacts do |t|
    t.references :service_point, null: false, foreign_key: true
    t.references :service_category, null: false, foreign_key: true
    t.string :contact_phone, null: false
    t.string :contact_email
    t.text :notes
    t.timestamps
  end
  add_index :service_point_category_contacts, 
    [:service_point_id, :service_category_id], 
    unique: true, 
    name: 'idx_sp_category_contacts_unique'
  ```

### 1.2 Обновление моделей

- [ ] **Обновить модель ServicePost**
  ```ruby
  # app/models/service_post.rb
  belongs_to :service_category, optional: true
  
  scope :by_category, ->(category_id) { where(service_category_id: category_id) }
  scope :with_category, -> { includes(:service_category) }
  
  def category_name
    service_category&.name
  end
  
  def supports_category?(category_id)
    service_category_id == category_id
  end
  ```

- [ ] **Обновить модель ServicePoint**
  ```ruby
  # app/models/service_point.rb
  has_many :service_point_category_contacts, dependent: :destroy
  has_many :supported_categories, through: :service_point_category_contacts, source: :service_category
  
  def posts_for_category(category_id)
    service_posts.active.by_category(category_id)
  end
  
  def posts_count_for_category(category_id)
    posts_for_category(category_id).count
  end
  
  def contact_phone_for_category(category_id)
    service_point_category_contacts.find_by(service_category_id: category_id)&.contact_phone
  end
  
  def supports_category?(category_id)
    posts_for_category(category_id).exists?
  end
  ```

- [ ] **Обновить модель Booking**
  ```ruby
  # app/models/booking.rb
  belongs_to :service_category, optional: true
  
  scope :by_category, ->(category_id) { where(service_category_id: category_id) }
  
  validate :service_category_supported_by_service_point
  
  private
  
  def service_category_supported_by_service_point
    return unless service_category_id && service_point_id
    
    unless service_point.supports_category?(service_category_id)
      errors.add(:service_category_id, 'не поддерживается данной сервисной точкой')
    end
  end
  ```

- [ ] **Создать модель ServicePointCategoryContact**
  ```ruby
  # app/models/service_point_category_contact.rb
  class ServicePointCategoryContact < ApplicationRecord
    belongs_to :service_point
    belongs_to :service_category
    
    validates :contact_phone, presence: true
    validates :service_point_id, uniqueness: { scope: :service_category_id }
    
    def display_name
      "#{service_category.name} - #{contact_phone}"
    end
  end
  ```

### 1.3 Обновление контроллеров

- [ ] **Создать ServicePointCategoryContactsController**
  ```ruby
  # app/controllers/api/v1/service_point_category_contacts_controller.rb
  class Api::V1::ServicePointCategoryContactsController < Api::V1::BaseController
    # CRUD операции для управления контактами по категориям
  end
  ```

- [ ] **Обновить ServicePointsController**
  ```ruby
  # Добавить методы для работы с категориями
  def categories
    # GET /api/v1/service_points/:id/categories
  end
  
  def posts_by_category
    # GET /api/v1/service_points/:id/posts_by_category
  end
  ```

- [ ] **Обновить BookingsController**
  ```ruby
  # Добавить поддержку service_category_id в параметрах
  def booking_params
    params.require(:booking).permit(
      # ... существующие параметры
      :service_category_id
    )
  end
  ```

### 1.4 Обновление сервисов

- [ ] **Обновить DynamicAvailabilityService**
  ```ruby
  # app/services/dynamic_availability_service.rb
  def self.check_availability_with_category(service_point_id, date, start_time, duration, category_id = nil)
    service_point = ServicePoint.find(service_point_id)
    
    # Получаем посты для конкретной категории или все активные
    available_posts = if category_id
      service_point.posts_for_category(category_id)
    else
      service_point.service_posts.active
    end
    
    return { available: false, reason: 'Нет постов для данной категории услуг' } if available_posts.empty?
    
    # Остальная логика проверки доступности...
  end
  ```

- [ ] **Создать CategoryFilterService**
  ```ruby
  # app/services/category_filter_service.rb
  class CategoryFilterService
    def self.service_points_with_category(category_id, city_id = nil)
      # Фильтрация сервисных точек по категории
    end
    
    def self.available_time_slots_by_category(service_point_id, date, category_id)
      # Получение доступных слотов по категории
    end
  end
  ```

---

## 🎨 ЭТАП 2: FRONTEND - ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС

### 2.1 Обновление типов TypeScript

- [ ] **Обновить типы для ServicePost**
  ```typescript
  // src/types/models.ts
  interface ServicePost {
    id: number;
    service_point_id: number;
    post_number: number;
    name: string;
    service_category_id?: number;
    service_category?: ServiceCategory;
    slot_duration: number;
    is_active: boolean;
    // ... остальные поля
  }
  ```

- [ ] **Обновить типы для Booking**
  ```typescript
  // src/types/booking.ts
  interface BookingFormData {
    // ... существующие поля
    service_category_id?: number;
  }
  
  interface Booking {
    // ... существующие поля
    service_category_id?: number;
    service_category?: ServiceCategory;
  }
  ```

- [ ] **Создать типы для контактов категорий**
  ```typescript
  // src/types/models.ts
  interface ServicePointCategoryContact {
    id: number;
    service_point_id: number;
    service_category_id: number;
    service_category: ServiceCategory;
    contact_phone: string;
    contact_email?: string;
    notes?: string;
  }
  ```

### 2.2 Обновление API слоя

- [ ] **Обновить servicePoints.api.ts**
  ```typescript
  // src/api/servicePoints.api.ts
  getServicePointsByCategory: builder.query<ServicePoint[], { categoryId: number; cityId?: number }>({
    query: ({ categoryId, cityId }) => ({
      url: 'service_points/by_category',
      params: { category_id: categoryId, city_id: cityId }
    })
  }),
  
  getPostsByCategory: builder.query<ServicePost[], { servicePointId: number; categoryId: number }>({
    query: ({ servicePointId, categoryId }) => 
      `service_points/${servicePointId}/posts_by_category?category_id=${categoryId}`
  })
  ```

- [ ] **Создать categoryContacts.api.ts**
  ```typescript
  // src/api/categoryContacts.api.ts
  export const categoryContactsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
      getCategoryContacts: builder.query<ServicePointCategoryContact[], number>({
        query: (servicePointId) => `service_points/${servicePointId}/category_contacts`
      }),
      // CRUD операции
    })
  });
  ```

### 2.3 Компоненты формы бронирования

- [ ] **Создать CategorySelectionStep**
  ```typescript
  // src/pages/bookings/components/CategorySelectionStep.tsx
  const CategorySelectionStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onBack }) => {
    // Выбор категории услуг перед выбором сервисной точки
    // Фильтрация точек по выбранной категории
  };
  ```

- [ ] **Обновить CityServicePointStep**
  ```typescript
  // Добавить фильтрацию по выбранной категории
  const { data: servicePoints } = useGetServicePointsByCategoryQuery({
    categoryId: formData.service_category_id,
    cityId: formData.city_id
  });
  ```

- [ ] **Обновить DateTimeStep**
  ```typescript
  // Учитывать категорию при проверке доступности
  const checkAvailability = useCallback(async (date: Date, time: string) => {
    const result = await checkAvailabilityWithCategory({
      servicePointId: formData.service_point_id,
      date: date.toISOString().split('T')[0],
      startTime: time,
      duration: estimatedDuration,
      categoryId: formData.service_category_id
    });
  }, [formData.service_point_id, formData.service_category_id]);
  ```

### 2.4 Административная панель

- [ ] **Обновить ServicePointFormPage - шаг PostsStep**
  ```typescript
  // src/pages/service-points/components/PostsStep.tsx
  interface PostFormData {
    // ... существующие поля
    service_category_id: number;
  }
  
  // Добавить селект выбора категории для каждого поста
  // Валидация обязательности категории
  ```

- [ ] **Создать CategoryContactsStep**
  ```typescript
  // src/pages/service-points/components/CategoryContactsStep.tsx
  const CategoryContactsStep: React.FC = () => {
    // Управление контактными телефонами по категориям
    // Таблица с возможностью добавления/редактирования
  };
  ```

- [ ] **Обновить BookingsPage - добавить фильтр по категориям**
  ```typescript
  // src/pages/bookings/BookingsPage.tsx
  const categoryFilter: FilterConfig = {
    key: 'service_category_id',
    label: 'Категория услуг',
    type: 'select',
    options: serviceCategories?.map(cat => ({
      value: cat.id.toString(),
      label: cat.name
    })) || []
  };
  ```

---

## 🧪 ЭТАП 3: ТЕСТИРОВАНИЕ И ВАЛИДАЦИЯ

### 3.1 Backend тесты

- [ ] **Тесты моделей**
  ```ruby
  # spec/models/service_post_spec.rb
  describe 'category associations' do
    it 'belongs to service_category' do
      # Тест связи с категорией
    end
    
    it 'filters posts by category' do
      # Тест скоупа by_category
    end
  end
  ```

- [ ] **Тесты API**
  ```ruby
  # spec/requests/api/v1/service_points_spec.rb
  describe 'GET /api/v1/service_points/by_category' do
    # Тест фильтрации точек по категории
  end
  ```

- [ ] **Тесты сервисов**
  ```ruby
  # spec/services/dynamic_availability_service_spec.rb
  describe 'availability with category filter' do
    # Тест проверки доступности с учетом категории
  end
  ```

### 3.2 Frontend тесты

- [ ] **Тесты компонентов**
  ```typescript
  // src/pages/bookings/components/__tests__/CategorySelectionStep.test.tsx
  describe('CategorySelectionStep', () => {
    it('renders category options correctly', () => {
      // Тест отображения категорий
    });
    
    it('filters service points by selected category', () => {
      // Тест фильтрации точек
    });
  });
  ```

- [ ] **Интеграционные тесты**
  ```typescript
  // src/__tests__/booking-flow-with-categories.test.tsx
  describe('Booking flow with categories', () => {
    it('completes booking with category selection', () => {
      // Полный флоу бронирования с выбором категории
    });
  });
  ```

### 3.3 Тестовые данные

- [ ] **Создать seeds для категорий и постов**
  ```ruby
  # db/seeds/service_categories_with_posts.rb
  # Создание тестовых данных с привязкой постов к категориям
  ```

- [ ] **Создать миграцию данных для существующих постов**
  ```ruby
  # Назначение категорий существующим постам
  ```

---

## 🚀 ЭТАП 4: РАЗВЕРТЫВАНИЕ И ОПТИМИЗАЦИЯ

### 4.1 Миграция данных

- [ ] **Скрипт назначения категорий существующим постам**
  ```ruby
  # lib/tasks/assign_categories_to_posts.rake
  # Автоматическое назначение категорий на основе услуг точки
  ```

- [ ] **Обновление существующих бронирований**
  ```ruby
  # Назначение категорий существующим бронированиям на основе услуг
  ```

### 4.2 Производительность

- [ ] **Добавить индексы для быстрых запросов**
  ```sql
  -- Индексы для фильтрации постов по категориям
  -- Индексы для статистики по категориям
  ```

- [ ] **Кэширование часто используемых данных**
  ```ruby
  # Кэширование списка точек по категориям
  # Кэширование доступности по категориям
  ```

### 4.3 Мониторинг

- [ ] **Логирование использования категорий**
  ```ruby
  # Аналитика популярности категорий
  # Мониторинг производительности фильтрации
  ```

- [ ] **Метрики бизнес-логики**
  ```ruby
  # Статистика бронирований по категориям
  # Загруженность постов по категориям
  ```

---

## 📈 ЭТАП 5: АНАЛИТИКА И ОТЧЕТНОСТЬ

### 5.1 Дашборд для администраторов

- [ ] **Статистика по категориям**
  ```typescript
  // Компонент с графиками распределения бронирований по категориям
  // Анализ загруженности постов разных категорий
  ```

- [ ] **Отчеты по эффективности**
  ```typescript
  // Отчет по доходности категорий
  // Анализ времени ожидания по категориям
  ```

### 5.2 Фильтры и поиск

- [ ] **Расширенные фильтры в админке**
  ```typescript
  // Фильтрация всех сущностей по категориям
  // Поиск по категориям в глобальном поиске
  ```

---

## ✅ КРИТЕРИИ ГОТОВНОСТИ

### Обязательные требования:
- [ ] Все посты имеют назначенную категорию
- [ ] Бронирование работает с фильтрацией по категориям
- [ ] Доступность рассчитывается корректно для выбранной категории
- [ ] Контактные телефоны настроены для каждой категории
- [ ] Все тесты проходят успешно

### Дополнительные требования:
- [ ] Миграция существующих данных выполнена без потерь
- [ ] Производительность не снизилась
- [ ] Документация обновлена
- [ ] Пользователи обучены новому функционалу

---

## 📝 ПРИМЕЧАНИЯ

1. **Обратная совместимость**: Все изменения должны поддерживать существующие бронирования
2. **Поэтапное внедрение**: Можно сначала сделать категории опциональными, затем обязательными
3. **Тестирование**: Особое внимание к тестированию логики доступности с категориями
4. **Производительность**: Мониторить влияние дополнительных фильтров на скорость запросов

---

**Статус проекта**: 🟡 В разработке  
**Ответственный**: Команда разработки  
**Срок**: По согласованию  
**Приоритет**: Высокий 