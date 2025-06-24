# 👩‍💻 DEVELOPMENT.md - Документация для разработчиков

> **Версия:** 2.0.0  
> **Последнее обновление:** 2025-06-21  
> **Целевая аудитория:** Разработчики проекта

## 📋 Содержание

1. [Детальная архитектура](#-детальная-архитектура)
2. [Настройка окружения](#-настройка-окружения)
3. [Структура API](#-структура-api)
4. [База данных](#️-база-данных)
5. [Тестирование](#-тестирование)
6. [Безопасность](#-безопасность)
7. [Деплой](#-деплой)
8. [Мониторинг](#-мониторинг)

## 🏗️ Детальная архитектура

### Backend структура (tire-service-master-api)

```
app/
├── controllers/           # API контроллеры
│   └── api/v1/           # Версионированные API эндпоинты
├── models/               # Модели данных
├── policies/             # Pundit политики авторизации
├── serializers/          # JSON сериализаторы
└── services/             # Бизнес-логика

spec/                     # Тесты RSpec (537 примеров)
├── models/               # Тесты моделей
├── controllers/          # Тесты контроллеров
├── policies/             # Тесты политик
├── requests/             # Интеграционные тесты
└── swagger_docs/         # Swagger документация тесты

config/                   # Конфигурация Rails
├── initializers/         # Инициализаторы
├── routes.rb            # Маршруты API
└── database.yml         # Настройки БД

db/                      # База данных
├── migrate/             # Миграции
└── seeds.rb            # Начальные данные
```

### Frontend структура (tire-service-master-web)

```
src/
├── components/          # React компоненты
│   ├── atoms/          # Базовые компоненты
│   ├── molecules/      # Составные компоненты
│   ├── organisms/      # Сложные компоненты
│   └── templates/      # Шаблоны страниц
├── pages/              # Страницы приложения
├── hooks/              # Пользовательские хуки
├── store/              # Redux store
├── api/                # API клиент
├── utils/              # Утилиты
├── types/              # TypeScript типы
└── styles/             # Стили
```

## ⚙️ Настройка окружения

### Системные требования
- **Ruby**: 3.3.7+
- **Rails**: 8.0.2
- **PostgreSQL**: 17+
- **Node.js**: 18+ LTS
- **Yarn**: 1.22+
- **Redis**: 6+ (для кэширования)
- **ImageMagick**: Для обработки изображений

### Установка зависимостей

#### Backend
```bash
cd tire-service-master-api

# Установка Ruby зависимостей
bundle install

# Настройка базы данных
rails db:create
rails db:migrate
rails db:seed

# Запуск тестов
bundle exec rspec
```

#### Frontend
```bash
cd tire-service-master-web

# Установка Node.js зависимостей
yarn install

# Запуск в режиме разработки
yarn start

# Запуск тестов
yarn test
```

### Переменные окружения

#### Backend (.env)
```bash
# База данных
DATABASE_URL=postgresql://user:password@localhost/tire_service_development

# JWT
JWT_SECRET_KEY=your_secret_key_here
JWT_EXPIRATION_TIME=24.hours

# CORS
CORS_ORIGINS=http://localhost:3008,https://yourdomain.com

# Redis
REDIS_URL=redis://localhost:6379/0

# Файлы
UPLOAD_PATH=storage/uploads
MAX_FILE_SIZE=10.megabytes
```

#### Frontend (.env)
```bash
# API URL
REACT_APP_API_URL=http://localhost:8000

# Режим разработки
NODE_ENV=development

# Порт
PORT=3008
```

## 🌐 Структура API

### Аутентификация
- `POST /api/v1/auth/login` - Вход в систему
- `POST /api/v1/auth/refresh` - Обновление токена
- `POST /api/v1/auth/logout` - Выход из системы

### Управление пользователями
- `GET /api/v1/users/me` - Текущий пользователь
- `GET /api/v1/clients` - Список клиентов
- `POST /api/v1/clients/register` - Регистрация клиента
- `PUT /api/v1/clients/:id` - Обновление клиента
- `DELETE /api/v1/clients/:id` - Удаление клиента

### Сервисные точки
- `GET /api/v1/service_points` - Список сервисных точек
- `GET /api/v1/service_points/nearby` - Ближайшие точки
- `POST /api/v1/partners/:id/service_points` - Создание точки
- `PUT /api/v1/service_points/:id` - Обновление точки
- `DELETE /api/v1/service_points/:id` - Удаление точки

### Бронирования
- `GET /api/v1/bookings` - Список бронирований
- `POST /api/v1/clients/:id/bookings` - Создание бронирования
- `POST /api/v1/bookings/:id/confirm` - Подтверждение
- `POST /api/v1/bookings/:id/cancel` - Отмена
- `PUT /api/v1/bookings/:id` - Обновление бронирования

### Фотографии
- `GET /api/v1/service_points/:id/photos` - Фотографии точки
- `POST /api/v1/service_points/:id/photos` - Загрузка фото
- `DELETE /api/v1/photos/:id` - Удаление фото

### Каталоги
- `GET /api/v1/car_types` - Типы автомобилей
- `GET /api/v1/services` - Услуги
- `GET /api/v1/regions` - Регионы
- `GET /api/v1/cities` - Города

## 🗄️ База данных

### Основные модели

#### User
```ruby
class User < ApplicationRecord
  has_many :clients, dependent: :destroy
  has_many :partners, dependent: :destroy
  
  validates :email, presence: true, uniqueness: true
  validates :role, inclusion: { in: %w[admin client partner] }
  
  enum role: { admin: 0, client: 1, partner: 2 }
end
```

#### Client
```ruby
class Client < ApplicationRecord
  belongs_to :user
  has_many :bookings, dependent: :destroy
  
  validates :phone, presence: true
  validates :first_name, :last_name, presence: true
end
```

#### ServicePoint
```ruby
class ServicePoint < ApplicationRecord
  belongs_to :partner
  has_many :bookings, dependent: :destroy
  has_many :photos, dependent: :destroy
  has_many :reviews, dependent: :destroy
  
  validates :name, :address, presence: true
  validates :latitude, :longitude, presence: true
end
```

#### Booking
```ruby
class Booking < ApplicationRecord
  belongs_to :client
  belongs_to :service_point
  belongs_to :service
  belongs_to :car_type
  
  validates :scheduled_at, presence: true
  validates :status, inclusion: { in: %w[pending confirmed cancelled completed] }
  
  enum status: { pending: 0, confirmed: 1, cancelled: 2, completed: 3 }
end
```

### Миграции

#### Создание миграции
```bash
cd tire-service-master-api
rails generate migration CreateTableName field:type
```

#### Применение миграций
```bash
rails db:migrate              # Применить все миграции
rails db:rollback             # Откатить последнюю миграцию
rails db:migrate:status       # Статус миграций
rails db:reset               # Пересоздать БД
```

### Индексы и производительность
- Индексы на foreign keys
- Составные индексы для часто используемых запросов
- Партиционирование больших таблиц
- Оптимизация N+1 запросов

## 🧪 Тестирование

### Backend тестирование (RSpec)

#### Статистика тестов
- **Общее количество**: 537 примеров
- **Статус**: 0 провалов ✅
- **Покрытие**: Высокое покрытие основной функциональности
- **Время выполнения**: ~0.13 секунды

#### Запуск тестов
```bash
cd tire-service-master-api

# Все тесты
bundle exec rspec

# Конкретный файл
bundle exec rspec spec/models/user_spec.rb

# С покрытием
COVERAGE=true bundle exec rspec

# Только провальные тесты
bundle exec rspec --only-failures

# С детальным выводом
bundle exec rspec --format documentation

# Параллельное выполнение
bundle exec rspec --parallel
```

#### Категории тестов
- **Модели**: Тестирование бизнес-логики и валидаций
- **Контроллеры**: Тестирование API эндпоинтов
- **Политики**: Тестирование авторизации Pundit
- **Интеграционные**: Полные сценарии использования
- **Swagger**: Генерация и валидация документации

#### Пример теста модели
```ruby
# spec/models/user_spec.rb
RSpec.describe User, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email) }
    it { should validate_inclusion_of(:role).in_array(%w[admin client partner]) }
  end

  describe 'associations' do
    it { should have_many(:clients).dependent(:destroy) }
    it { should have_many(:partners).dependent(:destroy) }
  end

  describe 'enums' do
    it { should define_enum_for(:role).with_values(admin: 0, client: 1, partner: 2) }
  end
end
```

#### Пример теста контроллера
```ruby
# spec/requests/api/v1/auth_spec.rb
RSpec.describe 'Api::V1::Auth', type: :request do
  describe 'POST /api/v1/auth/login' do
    let(:user) { create(:user, :client) }
    let(:params) { { email: user.email, password: 'password' } }

    it 'returns authentication token' do
      post '/api/v1/auth/login', params: params
      
      expect(response).to have_http_status(:ok)
      expect(json_response).to have_key('token')
      expect(json_response).to have_key('user')
    end
  end
end
```

### Frontend тестирование (Jest + React Testing Library)

#### Запуск тестов
```bash
cd tire-service-master-web

# Все тесты
yarn test

# С покрытием
yarn test --coverage

# В режиме наблюдения
yarn test --watch

# Обновить снапшоты
yarn test --updateSnapshot
```

#### Пример теста компонента
```typescript
// src/components/LoginForm/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('должен отправлять форму с корректными данными', async () => {
    const mockOnSubmit = jest.fn();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

### Интеграционные тесты

#### Запуск интеграционных тестов
```bash
# Полное интеграционное тестирование
./dev-tools/shell/test_integration.sh

# Тестирование API
node ./dev-tools/js/simple_test.js

# Тестирование авторизации
./test_auth_flow.sh
```

## 🔐 Безопасность

### Аутентификация
- **JWT токены**: Безопасная аутентификация без состояния
- **Refresh токены**: Обновление сессий без повторного ввода пароля
- **Время жизни**: Настраиваемое время истечения токенов
- **Blacklist токенов**: Возможность отзыва токенов

### Авторизация (Pundit)
- **Политики**: Гранулярный контроль доступа на уровне ресурсов
- **Роли пользователей**: Клиенты, партнеры, администраторы
- **Контекстная авторизация**: Проверка прав в зависимости от контекста

```ruby
# app/policies/booking_policy.rb
class BookingPolicy < ApplicationPolicy
  def show?
    user.admin? || record.client.user == user || record.service_point.partner.user == user
  end

  def create?
    user.client? && record.client.user == user
  end

  def update?
    user.admin? || (user.partner? && record.service_point.partner.user == user)
  end

  def destroy?
    user.admin? || record.client.user == user
  end
end
```

### CORS
- **Настроенные домены**: Контроль доступа с фронтенда
- **Безопасные заголовки**: Защита от XSS и CSRF
- **Методы и заголовки**: Ограничение разрешенных HTTP методов

### Валидация и санитизация
- **Strong Parameters**: Фильтрация параметров в контроллерах
- **Валидация моделей**: Проверка данных на уровне БД
- **Санитизация HTML**: Очистка пользовательского контента
- **SQL Injection**: Использование prepared statements

## 🚀 Деплой

### Production окружение

#### Подготовка
```bash
cd tire-service-master-api

# Установка зависимостей для production
bundle install --without development test

# Миграции
RAILS_ENV=production rails db:migrate

# Компиляция ассетов
RAILS_ENV=production rails assets:precompile

# Запуск
RAILS_ENV=production rails server
```

#### Переменные окружения Production
```bash
# Безопасность
RAILS_ENV=production
SECRET_KEY_BASE=your_very_long_secret_key
JWT_SECRET_KEY=your_jwt_secret

# База данных
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_URL=redis://host:port/0

# Файлы
UPLOAD_PATH=/var/app/storage
```

### Docker

#### Dockerfile (Backend)
```dockerfile
FROM ruby:3.3.7-alpine

WORKDIR /app

# Установка зависимостей
COPY Gemfile Gemfile.lock ./
RUN bundle install --without development test

# Копирование кода
COPY . .

# Компиляция ассетов
RUN RAILS_ENV=production rails assets:precompile

EXPOSE 8000

CMD ["rails", "server", "-b", "0.0.0.0", "-p", "8000"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  api:
    build: ./tire-service-master-api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/tire_service
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  web:
    build: ./tire-service-master-web
    ports:
      - "3008:3008"
    environment:
      - REACT_APP_API_URL=http://localhost:8000

  db:
    image: postgres:17
    environment:
      - POSTGRES_DB=tire_service
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

#### Запуск с Docker
```bash
# Сборка и запуск
docker-compose up --build

# В фоновом режиме
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## 📊 Мониторинг

### Логирование

#### Структурированные логи (Backend)
```ruby
# config/application.rb
config.log_formatter = proc do |severity, datetime, progname, msg|
  {
    timestamp: datetime.iso8601,
    level: severity,
    message: msg,
    request_id: Thread.current[:request_id]
  }.to_json + "\n"
end
```

#### Логи приложения
- **Расположение**: `logs/` директория
- **Ротация**: Ежедневная ротация логов
- **Уровни**: DEBUG, INFO, WARN, ERROR, FATAL
- **Формат**: JSON для удобного парсинга

### Метрики и мониторинг

#### Ключевые метрики
- **Производительность API**: Время ответа эндпоинтов
- **Использование ресурсов**: CPU, память, диск
- **Бизнес-метрики**: Количество бронирований, регистраций
- **Ошибки**: Частота и типы ошибок

#### Monitoring stack
- **Логи**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Метрики**: Prometheus + Grafana
- **Алерты**: PagerDuty или Slack интеграции
- **Uptime**: Pingdom или UptimeRobot

### Производительность

#### Оптимизация запросов
```ruby
# Включение запросов связанных моделей
bookings = Booking.includes(:client, :service_point, :service, :car_type)

# Счетчики без загрузки записей
service_point.bookings.count

# Пагинация
bookings = Booking.page(params[:page]).per(20)
```

#### Кэширование
```ruby
# Кэширование дорогих операций
Rails.cache.fetch("service_points_nearby_#{lat}_#{lng}", expires_in: 1.hour) do
  ServicePoint.nearby(lat, lng).limit(10)
end

# Кэширование фрагментов
<% cache service_point do %>
  <%= render service_point %>
<% end %>
```

## 📋 Чек-лист разработчика

### Перед коммитом
- [ ] Все тесты проходят
- [ ] Код соответствует style guide
- [ ] Документация обновлена
- [ ] Нет дублирования кода
- [ ] Производительность проверена
- [ ] Безопасность учтена

### Перед деплоем
- [ ] Миграции протестированы
- [ ] Переменные окружения настроены
- [ ] Backup базы данных создан
- [ ] Monitoring настроен
- [ ] Rollback план готов

### Code Review
- [ ] Функциональность работает корректно
- [ ] Тесты покрывают новый код
- [ ] Нет уязвимостей безопасности
- [ ] Производительность оптимальна
- [ ] Документация актуальна

---

> 🎯 **Следующие шаги**: Изучите специализированную документацию для [Backend](rules/backend/) или [Frontend](rules/frontend/) разработки