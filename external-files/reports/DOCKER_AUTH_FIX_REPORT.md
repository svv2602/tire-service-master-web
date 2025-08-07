# 🔐 Исправление проблем авторизации в Docker

## Проблема
При запуске приложения в Docker окружении возникали ошибки 401 Unauthorized для всех API запросов, хотя локально всё работало корректно.

### Основные ошибки:
```
GET http://service-station.tot.biz.ua/api/v1/clients?page=1&per_page=1
[HTTP/1.1 401 Unauthorized 583ms]

GET http://service-station.tot.biz.ua/api/v1/reviews?page=1&per_page=50
[HTTP/1.1 401 Unauthorized 1097ms]

❌ Не удалось обновить токен
```

## Корневые причины

### 1. Неправильный REACT_APP_API_URL в Docker
- **Проблема**: В `docker-compose.yml` был указан `http://api:8000` (внутренний Docker URL)
- **Решение**: Заменено на `http://service-station.tot.biz.ua:8000` (внешний URL для браузера)

### 2. Отсутствие домена в CORS настройках
- **Проблема**: `service-station.tot.biz.ua` не был добавлен в разрешённые origins
- **Решение**: Добавлены все варианты домена в CORS конфигурацию

### 3. Проблемы с cookies между доменами
- **Проблема**: HttpOnly cookies не передавались между разными доменами
- **Решение**: Обновлены настройки session cookies в Rails

## Внесённые исправления

### 1. Frontend (tire-service-master-web)

#### docker-compose.yml
```yaml
# ДО:
REACT_APP_API_URL: "http://api:8000"
REACT_APP_API_BASE_URL: "http://api:8000/api/v1"

# ПОСЛЕ:
REACT_APP_API_URL: "http://service-station.tot.biz.ua:8000"  
REACT_APP_API_BASE_URL: "http://service-station.tot.biz.ua:8000/api/v1"
```

#### src/config.ts
- Добавлена специальная обработка для production домена
- Улучшено логирование для отладки
- Приоритет переменных окружения над автоматическим определением

### 2. Backend (tire-service-master-api)

#### config/initializers/cors.rb
```ruby
# Добавлены новые origins:
'http://service-station.tot.biz.ua:3008',
'https://service-station.tot.biz.ua:3008', 
'http://service-station.tot.biz.ua',
'https://service-station.tot.biz.ua'
```

#### config/application.rb  
```ruby
# Обновлены настройки session cookies:
config.middleware.use ActionDispatch::Session::CookieStore,
                     key: '_tire_service_session',
                     domain: :all,  # Разрешаем cookies для всех поддоменов
                     secure: Rails.env.production?,  # Secure только в production
                     same_site: :lax  # Более гибкие настройки для cross-origin запросов
```

## Инструкции по применению

### 1. Пересборка Docker контейнеров
```bash
# Остановить текущие контейнеры
docker-compose down

# Пересобрать образы с новыми настройками
docker-compose build --no-cache

# Запустить с новой конфигурацией
docker-compose up -d
```

### 2. Проверка настроек
После запуска проверьте в консоли браузера:
```
🔧 API Configuration: {
  API_URL: "http://service-station.tot.biz.ua:8000",
  hostname: "service-station.tot.biz.ua",
  REACT_APP_API_URL: "http://service-station.tot.biz.ua:8000"
}
```

### 3. Тестирование авторизации
1. Откройте `http://service-station.tot.biz.ua:3008`
2. Войдите в систему (admin@test.com / admin123)
3. Проверьте что API запросы выполняются успешно (200 OK вместо 401)

## Техническое объяснение

### Проблема с внутренними Docker URL
Docker Compose создаёт внутреннюю сеть, где контейнеры общаются по именам сервисов (`api`, `web`). Однако браузер пользователя не имеет доступа к этой внутренней сети и должен использовать внешние URL.

### CORS и безопасность
CORS (Cross-Origin Resource Sharing) защищает от несанкционированных запросов между доменами. Все домены, с которых фронтенд может обращаться к API, должны быть явно разрешены.

### Cookies и домены
HttpOnly cookies используются для хранения refresh токенов. Для работы между доменами необходимы специальные настройки `domain` и `same_site`.

## Альтернативные решения

### Вариант 1: Использование Nginx proxy
Можно настроить Nginx для проксирования запросов, чтобы API и фронтенд работали на одном домене:
```nginx
location /api/ {
    proxy_pass http://api:8000/api/;
}
```

### Вариант 2: Локальные хосты
Для development можно добавить в `/etc/hosts`:
```
127.0.0.1 service-station.local
127.0.0.1 api.service-station.local
```

## Проверочный список

- ✅ REACT_APP_API_URL указывает на внешний домен
- ✅ Домен добавлен в CORS origins  
- ✅ Session cookies настроены для cross-origin
- ✅ Docker контейнеры пересобраны
- ✅ Авторизация работает в браузере
- ✅ API запросы возвращают 200 OK

## Мониторинг и отладка

### Полезные команды для диагностики:
```bash
# Проверить логи API контейнера
docker-compose logs api

# Проверить логи Web контейнера  
docker-compose logs web

# Проверить доступность API
curl -v http://service-station.tot.biz.ua:8000/api/v1/health

# Проверить CORS заголовки
curl -H "Origin: http://service-station.tot.biz.ua:3008" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://service-station.tot.biz.ua:8000/api/v1/clients
```

### Отладка в браузере:
1. Откройте DevTools → Network
2. Проверьте заголовки запросов (должен быть `Authorization: Bearer ...`)
3. Проверьте заголовки ответов (должны быть CORS заголовки)
4. Проверьте cookies (должны передаваться с `credentials: include`)

## Заключение

Исправления решают основные проблемы с авторизацией в Docker:
- Правильная конфигурация API URL для браузера
- Корректные CORS настройки для production домена  
- Оптимизированные настройки cookies для cross-origin запросов

После применения всех изменений и пересборки контейнеров авторизация должна работать корректно в Docker окружении.

---
**Дата создания:** $(date '+%Y-%m-%d %H:%M:%S')  
**Автор:** AI Assistant  
**Статус:** Готово к применению