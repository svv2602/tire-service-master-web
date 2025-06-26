# 📋 ЧЕКЛИСТ РЕАЛИЗАЦИИ ТИПОВ ПОСТОВ И КАТЕГОРИЙ УСЛУГ

## 🎯 ЦЕЛЬ ПРОЕКТА
Реализовать систему категорий услуг для постов обслуживания, позволяющую:
- Привязывать посты к категориям услуг (шиномонтаж, мойка, СТО) - **ОДИН ПОСТ = ОДНА КАТЕГОРИЯ**
- Фильтровать доступные точки по выбранной категории при бронировании
- Рассчитывать доступность только по постам нужной категории
- Управлять контактными телефонами по категориям через **JSON поле**
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
- [ ] **ОБЯЗАТЕЛЬНАЯ** связь постов с категориями услуг (NOT NULL)
- [ ] Поле категории в бронированиях
- [ ] JSON поле для контактных телефонов по категориям в service_points
- [ ] Логика фильтрации по категориям в доступности
- [ ] UI для выбора категории при бронировании
- [ ] Переработка шага "Услуги" в форме сервисной точки

---

## 📊 ЭТАП 1: BACKEND - СТРУКТУРА ДАННЫХ

### 1.1 Миграции базы данных

- [ ] **Создать миграцию для связи постов с категориями (ОБЯЗАТЕЛЬНАЯ)**
  ```ruby
  # 20250627_add_service_category_to_service_posts.rb
  class AddServiceCategoryToServicePosts < ActiveRecord::Migration[8.0]
    def change
      # Сначала добавляем поле как nullable для существующих записей
      add_reference :service_posts, :service_category, null: true, foreign_key: true
      add_index :service_posts, [:service_point_id, :service_category_id]
      
      # В отдельной миграции сделаем поле обязательным после назначения категорий
    end
  end
  ```

- [ ] **Создать миграцию для назначения категорий существующим постам**
  ```ruby
  # 20250627_assign_default_categories_to_posts.rb
  class AssignDefaultCategoriesToPosts < ActiveRecord::Migration[8.0]
    def up
      # Создаем дефолтную категорию "Общие услуги" если её нет
      default_category = ServiceCategory.find_or_create_by!(
        name: 'Общие услуги',
        description: 'Универсальная категория для постов без специализации',
        is_active: true,
        sort_order: 999
      )
      
      # Назначаем всем постам без категории дефолтную категорию
      ServicePost.where(service_category_id: nil).update_all(
        service_category_id: default_category.id
      )
    end
    
    def down
      # Откат: убираем назначения
      ServicePost.where(service_category_id: ServiceCategory.find_by(name: 'Общие услуги')&.id)
                 .update_all(service_category_id: nil)
    end
  end
  ```

- [ ] **Создать миграцию для обязательности категории**
  ```ruby
  # 20250627_make_service_category_required_in_posts.rb
  class MakeServiceCategoryRequiredInPosts < ActiveRecord::Migration[8.0]
    def change
      change_column_null :service_posts, :service_category_id, false
    end
  end
  ```

- [ ] **Создать миграцию для категории в бронированиях**
  ```ruby
  # 20250627_add_service_category_to_bookings.rb
  class AddServiceCategoryToBookings < ActiveRecord::Migration[8.0]
    def change
      add_reference :bookings, :service_category, null: true, foreign_key: true
      add_index :bookings, :service_category_id
    end
  end
  ```

- [ ] **Создать миграцию для JSON поля контактов по категориям**
  ```ruby
  # 20250627_add_category_contacts_to_service_points.rb
  class AddCategoryContactsToServicePoints < ActiveRecord::Migration[8.0]
    def change
      add_column :service_points, :category_contacts, :jsonb, default: {}
      add_index :service_points, :category_contacts, using: :gin
    end
  end
  ```

### 1.2 Обновление моделей

- [ ] **Обновить модель ServicePost**
  ```ruby
  # app/models/service_post.rb
  belongs_to :service_category # ОБЯЗАТЕЛЬНАЯ связь (убираем optional: true)
  
  scope :by_category, ->(category_id) { where(service_category_id: category_id) }
  scope :with_category, -> { includes(:service_category) }
  
  validates :service_category_id, presence: true # Обязательная валидация
  
  def category_name
    service_category.name
  end
  
  def supports_category?(category_id)
    service_category_id == category_id
  end
  ```

- [ ] **Обновить модель ServicePoint**
  ```ruby
  # app/models/service_point.rb
  
  # JSON структура для category_contacts:
  # {
  #   "1": { "phone": "+380671234567", "email": "tire@example.com" },
  #   "2": { "phone": "+380671234568", "email": "wash@example.com" }
  # }
  
  def posts_for_category(category_id)
    service_posts.active.by_category(category_id)
  end
  
  def posts_count_for_category(category_id)
    posts_for_category(category_id).count
  end
  
  def contact_phone_for_category(category_id)
    category_contacts.dig(category_id.to_s, 'phone')
  end
  
  def contact_email_for_category(category_id)
    category_contacts.dig(category_id.to_s, 'email')
  end
  
  def set_category_contact(category_id, phone:, email: nil)
    self.category_contacts = category_contacts.merge(
      category_id.to_s => { 'phone' => phone, 'email' => email }.compact
    )
  end
  
  def remove_category_contact(category_id)
    updated_contacts = category_contacts.dup
    updated_contacts.delete(category_id.to_s)
    self.category_contacts = updated_contacts
  end
  
  def supports_category?(category_id)
    posts_for_category(category_id).exists?
  end
  
  def available_categories
    service_posts.includes(:service_category).map(&:service_category).uniq
  end
  ```

- [ ] **Обновить модель Booking**
  ```ruby
  # app/models/booking.rb
  belongs_to :service_category, optional: true
  
  scope :by_category, ->(category_id) { where(service_category_id: category_id) }
  
  validate :service_category_supported_by_service_point
  
  # Автоматическое назначение категории на основе выбранных услуг
  before_validation :assign_service_category_from_services, on: :create
  
  private
  
  def service_category_supported_by_service_point
    return unless service_category_id && service_point_id
    
    unless service_point.supports_category?(service_category_id)
      errors.add(:service_category_id, 'не поддерживается данной сервисной точкой')
    end
  end
  
  def assign_service_category_from_services
    return if service_category_id.present?
    return if services.empty?
    
    # Берем категорию первой услуги (все услуги должны быть одной категории)
    first_service_category = services.first&.category_id
    self.service_category_id = first_service_category if first_service_category
  end
  ```

### 1.3 Обновление контроллеров

- [ ] **Обновить ServicePointsController**
  ```ruby
  # app/controllers/api/v1/service_points_controller.rb
  
  def by_category
    # GET /api/v1/service_points/by_category?category_id=1&city_id=1
    category_id = params[:category_id]
    city_id = params[:city_id]
    
    service_points = ServicePoint.joins(:service_posts)
                                 .where(service_posts: { service_category_id: category_id, is_active: true })
                                 .where(is_active: true)
    
    service_points = service_points.where(city_id: city_id) if city_id.present?
    
    render json: {
      data: service_points.distinct.includes(:city, :partner, service_posts: :service_category),
      total_count: service_points.distinct.count
    }
  end
  
  def posts_by_category
    # GET /api/v1/service_points/:id/posts_by_category?category_id=1
    category_id = params[:category_id]
    posts = @service_point.posts_for_category(category_id)
    
    render json: {
      data: posts.includes(:service_category),
      category_contact: {
        phone: @service_point.contact_phone_for_category(category_id),
        email: @service_point.contact_email_for_category(category_id)
      }
    }
  end
  
  def update_category_contacts
    # PATCH /api/v1/service_points/:id/category_contacts
    contacts_data = params[:category_contacts] || {}
    
    contacts_data.each do |category_id, contact_info|
      @service_point.set_category_contact(
        category_id,
        phone: contact_info[:phone],
        email: contact_info[:email]
      )
    end
    
    if @service_point.save
      render json: { success: true, category_contacts: @service_point.category_contacts }
    else
      render json: { errors: @service_point.errors }, status: :unprocessable_entity
    end
  end
  
  private
  
  def service_point_params
    params.require(:service_point).permit(
      # ... существующие параметры
      category_contacts: {}
    )
  end
  ```

- [ ] **Обновить BookingsController**
  ```ruby
  # app/controllers/api/v1/bookings_controller.rb
  
  def booking_params
    params.require(:booking).permit(
      # ... существующие параметры
      :service_category_id
    )
  end
  
  # Добавить фильтрацию по категории в index
  def index
    # ... существующая логика
    
    if params[:service_category_id].present?
      @bookings = @bookings.by_category(params[:service_category_id])
    end
    
    # ... остальная логика
  end
  ```

### 1.4 Обновление сервисов

- [ ] **Обновить DynamicAvailabilityService**
  ```ruby
  # app/services/dynamic_availability_service.rb
  
  def self.check_availability_with_category(service_point_id, date, start_time, duration, category_id)
    service_point = ServicePoint.find(service_point_id)
    
    # Получаем посты только для указанной категории
    available_posts = service_point.posts_for_category(category_id)
    
    return { 
      available: false, 
      reason: 'Нет активных постов для данной категории услуг',
      available_posts_count: 0
    } if available_posts.empty?
    
    # Проверяем доступность по каждому посту категории
    datetime = DateTime.parse("#{date} #{start_time}")
    end_datetime = datetime + duration.minutes
    
    available_posts_count = 0
    available_posts.each do |post|
      next unless post.available_at_time?(datetime)
      
      # Проверяем нет ли пересечений с существующими бронированиями
      overlapping_bookings = Booking.joins(:service_point)
                                   .where(service_point: service_point)
                                   .where(booking_date: date)
                                   .where('start_time < ? AND end_time > ?', end_datetime.strftime('%H:%M'), start_time)
                                   .where.not(status_id: BookingStatus.canceled_statuses)
      
      # Если нет пересечений для этого поста - он доступен
      if overlapping_bookings.count < available_posts.count
        available_posts_count += 1
      end
    end
    
    {
      available: available_posts_count > 0,
      reason: available_posts_count > 0 ? nil : 'Все посты данной категории заняты на выбранное время',
      available_posts_count: available_posts_count,
      total_posts_count: available_posts.count,
      category_contact: {
        phone: service_point.contact_phone_for_category(category_id),
        email: service_point.contact_email_for_category(category_id)
      }
    }
  end
  ```

- [ ] **Создать CategoryFilterService**
  ```ruby
  # app/services/category_filter_service.rb
  class CategoryFilterService
    def self.service_points_with_category(category_id, city_id = nil)
      query = ServicePoint.joins(:service_posts)
                          .where(service_posts: { service_category_id: category_id, is_active: true })
                          .where(is_active: true)
      
      query = query.where(city_id: city_id) if city_id.present?
      
      query.distinct.includes(:city, :partner, service_posts: :service_category)
    end
    
    def self.available_time_slots_by_category(service_point_id, date, category_id, duration = 60)
      service_point = ServicePoint.find(service_point_id)
      posts = service_point.posts_for_category(category_id)
      
      return [] if posts.empty?
      
      # Генерируем временные слоты для каждого поста категории
      available_slots = []
      
      posts.each do |post|
        post_slots = generate_slots_for_post(post, date, duration)
        available_slots.concat(post_slots)
      end
      
      # Убираем дубликаты и сортируем
      available_slots.uniq.sort
    end
    
    private
    
    def self.generate_slots_for_post(post, date, duration)
      # Логика генерации слотов для конкретного поста
      # Учитываем индивидуальное расписание поста
      # Проверяем существующие бронирования
    end
  end
  ```

### 1.5 Обновление роутов

- [ ] **Добавить новые роуты**
  ```ruby
  # config/routes.rb
  namespace :api do
    namespace :v1 do
      resources :service_points do
        collection do
          get :by_category
        end
        
        member do
          get :posts_by_category
          patch :category_contacts, to: 'service_points#update_category_contacts'
        end
      end
      
      # Новый endpoint для проверки доступности с категорией
      post 'availability/check_with_category', to: 'availability#check_with_category'
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
    service_category_id: number; // ОБЯЗАТЕЛЬНОЕ поле (убираем ?)
    service_category: ServiceCategory;
    slot_duration: number;
    is_active: boolean;
    // ... остальные поля
  }
  ```

- [ ] **Обновить типы для ServicePoint**
  ```typescript
  // src/types/models.ts
  interface ServicePoint {
    // ... существующие поля
    category_contacts: {
      [categoryId: string]: {
        phone: string;
        email?: string;
      };
    };
  }
  
  interface CategoryContact {
    phone: string;
    email?: string;
  }
  ```

- [ ] **Обновить типы для Booking**
  ```typescript
  // src/types/booking.ts
  interface BookingFormData {
    // Добавляем ПЕРВЫМ шагом выбор категории
    service_category_id: number; // ОБЯЗАТЕЛЬНОЕ поле
    city_id: number | null;
    service_point_id: number | null;
    // ... остальные поля
  }
  
  interface Booking {
    // ... существующие поля
    service_category_id?: number;
    service_category?: ServiceCategory;
  }
  ```

### 2.2 Обновление API слоя

- [ ] **Обновить servicePoints.api.ts**
  ```typescript
  // src/api/servicePoints.api.ts
  getServicePointsByCategory: builder.query<
    { data: ServicePoint[]; total_count: number }, 
    { categoryId: number; cityId?: number }
  >({
    query: ({ categoryId, cityId }) => ({
      url: 'service_points/by_category',
      params: { category_id: categoryId, city_id: cityId }
    }),
    providesTags: ['ServicePoint']
  }),
  
  getPostsByCategory: builder.query<
    { 
      data: ServicePost[]; 
      category_contact: { phone?: string; email?: string } 
    }, 
    { servicePointId: number; categoryId: number }
  >({
    query: ({ servicePointId, categoryId }) => 
      `service_points/${servicePointId}/posts_by_category?category_id=${categoryId}`,
    providesTags: ['ServicePost']
  }),
  
  updateCategoryContacts: builder.mutation<
    { success: boolean; category_contacts: Record<string, CategoryContact> },
    { id: number; category_contacts: Record<string, CategoryContact> }
  >({
    query: ({ id, category_contacts }) => ({
      url: `service_points/${id}/category_contacts`,
      method: 'PATCH',
      body: { category_contacts }
    }),
    invalidatesTags: ['ServicePoint']
  })
  ```

- [ ] **Создать availability.api.ts**
  ```typescript
  // src/api/availability.api.ts
  export const availabilityApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
      checkAvailabilityWithCategory: builder.mutation<
        {
          available: boolean;
          reason?: string;
          available_posts_count: number;
          total_posts_count: number;
          category_contact: { phone?: string; email?: string };
        },
        {
          servicePointId: number;
          date: string;
          startTime: string;
          duration: number;
          categoryId: number;
        }
      >({
        query: (data) => ({
          url: 'availability/check_with_category',
          method: 'POST',
          body: data
        })
      })
    })
  });
  
  export const { useCheckAvailabilityWithCategoryMutation } = availabilityApi;
  ```

### 2.3 Обновление компонентов формы бронирования

- [ ] **Создать CategorySelectionStep (ПЕРВЫЙ ШАГ)**
  ```typescript
  // src/pages/bookings/components/CategorySelectionStep.tsx
  interface CategorySelectionStepProps {
    formData: BookingFormData;
    updateFormData: (data: Partial<BookingFormData>) => void;
    onNext: () => void;
  }
  
  const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
    formData,
    updateFormData,
    onNext
  }) => {
    const { data: categories } = useGetServiceCategoriesQuery({ active: true });
    
    const handleCategorySelect = (categoryId: number) => {
      updateFormData({ 
        service_category_id: categoryId,
        // Сбрасываем следующие шаги при смене категории
        city_id: null,
        service_point_id: null
      });
      onNext();
    };
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Выберите тип услуг
        </Typography>
        
        <Grid container spacing={2}>
          {categories?.data.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: formData.service_category_id === category.id ? 2 : 1,
                  borderColor: formData.service_category_id === category.id ? 'primary.main' : 'divider'
                }}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent>
                  <Typography variant="h6">{category.name}</Typography>
                  {category.description && (
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {!formData.service_category_id && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Выберите категорию услуг для продолжения
          </Alert>
        )}
      </Box>
    );
  };
  ```

- [ ] **Обновить CityServicePointStep**
  ```typescript
  // src/pages/bookings/components/CityServicePointStep.tsx
  
  // Используем новый API для фильтрации по категории
  const { data: servicePointsData } = useGetServicePointsByCategoryQuery({
    categoryId: formData.service_category_id!,
    cityId: formData.city_id || undefined
  }, {
    skip: !formData.service_category_id || !formData.city_id
  });
  
  // Показываем информацию о выбранной категории
  const { data: selectedCategory } = useGetServiceCategoryByIdQuery(
    formData.service_category_id?.toString() || '',
    { skip: !formData.service_category_id }
  );
  
  return (
    <Box>
      {selectedCategory && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Выбрана категория: <strong>{selectedCategory.name}</strong>
        </Alert>
      )}
      
      {/* Остальная логика выбора города и точки */}
      {/* Показываем только точки, которые поддерживают выбранную категорию */}
    </Box>
  );
  ```

- [ ] **Обновить DateTimeStep**
  ```typescript
  // src/pages/bookings/components/DateTimeStep.tsx
  
  const [checkAvailabilityWithCategory] = useCheckAvailabilityWithCategoryMutation();
  
  const checkAvailability = useCallback(async (date: Date, time: string) => {
    if (!formData.service_point_id || !formData.service_category_id) return;
    
    try {
      const result = await checkAvailabilityWithCategory({
        servicePointId: formData.service_point_id,
        date: date.toISOString().split('T')[0],
        startTime: time,
        duration: estimatedDuration,
        categoryId: formData.service_category_id
      }).unwrap();
      
      setAvailabilityInfo(result);
      
      if (result.available) {
        updateFormData({ booking_date: date.toISOString().split('T')[0], start_time: time });
      }
    } catch (error) {
      console.error('Ошибка проверки доступности:', error);
    }
  }, [formData.service_point_id, formData.service_category_id, estimatedDuration]);
  
  // Показываем контактную информацию для выбранной категории
  {availabilityInfo?.category_contact?.phone && (
    <Alert severity="info" sx={{ mt: 2 }}>
      Контактный телефон для категории: {availabilityInfo.category_contact.phone}
    </Alert>
  )}
  ```

### 2.4 Обновление NewBookingWithAvailabilityPage

- [ ] **Обновить конфигурацию шагов**
  ```typescript
  // src/pages/bookings/NewBookingWithAvailabilityPage.tsx
  
  const STEPS = [
    {
      id: 'category-selection',
      label: 'Тип услуг',
      component: CategorySelectionStep,
    },
    {
      id: 'city-service-point',
      label: 'Выбор города и точки обслуживания',
      component: CityServicePointStep,
    },
    {
      id: 'date-time',
      label: 'Дата и время',
      component: DateTimeStep,
    },
    // ... остальные шаги
  ];
  
  const initialFormData: BookingFormData = {
    service_category_id: 0, // Обязательное поле
    city_id: null,
    service_point_id: null,
    // ... остальные поля
  };
  
  // Валидация шагов
  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Category selection
        return formData.service_category_id > 0;
      case 1: // City and service point
        return formData.city_id !== null && formData.service_point_id !== null;
      // ... остальные шаги
    }
  };
  ```

### 2.5 Административная панель

- [ ] **Обновить ServicePointFormPage - шаг PostsStep**
  ```typescript
  // src/pages/service-points/components/PostsStep.tsx
  
  interface PostFormData {
    post_number: number;
    name: string;
    service_category_id: number; // ОБЯЗАТЕЛЬНОЕ поле
    slot_duration: number;
    is_active: boolean;
    // ... остальные поля
  }
  
  const PostsStep: React.FC = () => {
    const { data: categories } = useGetServiceCategoriesQuery({ active: true });
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Настройка постов обслуживания
        </Typography>
        
        {posts.map((post, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              {/* Селект категории - ОБЯЗАТЕЛЬНОЕ поле */}
              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel>Категория услуг</InputLabel>
                <Select
                  value={post.service_category_id || ''}
                  onChange={(e) => updatePost(index, 'service_category_id', Number(e.target.value))}
                  error={!post.service_category_id}
                >
                  {categories?.data.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {!post.service_category_id && (
                  <FormHelperText error>Категория услуг обязательна</FormHelperText>
                )}
              </FormControl>
              
              {/* Остальные поля поста */}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };
  ```

- [ ] **Создать CategoryContactsStep**
  ```typescript
  // src/pages/service-points/components/CategoryContactsStep.tsx
  
  const CategoryContactsStep: React.FC<{ servicePointId: number }> = ({ servicePointId }) => {
    const { data: servicePoint } = useGetServicePointByIdQuery(servicePointId.toString());
    const { data: categories } = useGetServiceCategoriesQuery({ active: true });
    const [updateCategoryContacts] = useUpdateCategoryContactsMutation();
    
    const [contacts, setContacts] = useState<Record<string, CategoryContact>>({});
    
    useEffect(() => {
      if (servicePoint?.category_contacts) {
        setContacts(servicePoint.category_contacts);
      }
    }, [servicePoint]);
    
    const handleSave = async () => {
      try {
        await updateCategoryContacts({
          id: servicePointId,
          category_contacts: contacts
        }).unwrap();
        
        // Показать уведомление об успехе
      } catch (error) {
        // Показать ошибку
      }
    };
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Контактные телефоны по категориям
        </Typography>
        
        {categories?.data.map((category) => (
          <Card key={category.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {category.name}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Контактный телефон"
                    value={contacts[category.id]?.phone || ''}
                    onChange={(e) => setContacts(prev => ({
                      ...prev,
                      [category.id]: { ...prev[category.id], phone: e.target.value }
                    }))}
                    placeholder="+380671234567"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email (опционально)"
                    value={contacts[category.id]?.email || ''}
                    onChange={(e) => setContacts(prev => ({
                      ...prev,
                      [category.id]: { ...prev[category.id], email: e.target.value }
                    }))}
                    placeholder="category@example.com"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
        
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ mt: 2 }}
        >
          Сохранить контакты
        </Button>
      </Box>
    );
  };
  ```

---

## 🧪 ЭТАП 3: ТЕСТИРОВАНИЕ И ВАЛИДАЦИЯ

### 3.1 Backend тесты

- [ ] **Тесты миграций**
  ```ruby
  # spec/migrations/service_category_posts_spec.rb
  describe 'ServiceCategory migrations' do
    it 'assigns default category to existing posts' do
      # Тест назначения дефолтной категории
    end
    
    it 'makes service_category_id required' do
      # Тест обязательности поля
    end
  end
  ```

- [ ] **Тесты моделей**
  ```ruby
  # spec/models/service_post_spec.rb
  describe ServicePost do
    it 'requires service_category' do
      post = build(:service_post, service_category: nil)
      expect(post).not_to be_valid
      expect(post.errors[:service_category_id]).to include("can't be blank")
    end
    
    it 'filters posts by category' do
      category1 = create(:service_category)
      category2 = create(:service_category)
      
      post1 = create(:service_post, service_category: category1)
      post2 = create(:service_post, service_category: category2)
      
      expect(ServicePost.by_category(category1.id)).to include(post1)
      expect(ServicePost.by_category(category1.id)).not_to include(post2)
    end
  end
  ```

### 3.2 Тестовые данные

- [ ] **Обновить seeds**
  ```ruby
  # db/seeds/service_categories_and_posts.rb
  
  # Создаем основные категории
  tire_service = ServiceCategory.find_or_create_by!(
    name: 'Шиномонтаж',
    description: 'Услуги по замене и ремонту шин',
    sort_order: 1
  )
  
  car_wash = ServiceCategory.find_or_create_by!(
    name: 'Автомойка',
    description: 'Услуги по мойке автомобилей',
    sort_order: 2
  )
  
  car_service = ServiceCategory.find_or_create_by!(
    name: 'СТО',
    description: 'Техническое обслуживание и ремонт автомобилей',
    sort_order: 3
  )
  
  # Назначаем категории постам и настраиваем контакты
  ServicePoint.find_each do |service_point|
    # Назначаем категории постам
    service_point.service_posts.each_with_index do |post, index|
      category = [tire_service, car_wash, car_service][index % 3]
      post.update!(service_category: category)
    end
    
    # Настраиваем контактные телефоны
    service_point.update!(
      category_contacts: {
        tire_service.id.to_s => { phone: '+380671111111', email: 'tire@example.com' },
        car_wash.id.to_s => { phone: '+380672222222', email: 'wash@example.com' },
        car_service.id.to_s => { phone: '+380673333333', email: 'service@example.com' }
      }
    )
  end
  ```

---

## ✅ КРИТЕРИИ ГОТОВНОСТИ

### Обязательные требования:
- [ ] **ВСЕ посты имеют назначенную категорию (NOT NULL)**
- [ ] Бронирование работает с обязательным выбором категории
- [ ] Доступность рассчитывается корректно только для выбранной категории
- [ ] JSON поле category_contacts настроено для каждой сервисной точки
- [ ] Все тесты проходят успешно
- [ ] Миграция существующих данных выполнена без потерь

### Дополнительные требования:
- [ ] Производительность не снизилась
- [ ] Документация обновлена
- [ ] Пользователи обучены новому функционалу

---

## 📝 УПРОЩЕНИЯ НА ОСНОВЕ УТОЧНЕНИЙ

1. **✅ JSON поле вместо отдельной таблицы** - упрощает структуру БД
2. **✅ Одна категория на пост** - упрощает логику и UI
3. **✅ Обязательная категория** - исключает неопределенные состояния
4. **✅ Без приоритетов** - упрощает интерфейс управления

---

**Статус проекта**: 🟡 В разработке  
**Ответственный**: Команда разработки  
**Приоритет**: Высокий 