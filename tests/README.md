# Тесты фронтенд-приложения

## Структура тестов

### Интеграционные тесты (/integration)
- `test_bookings_with_new_token.js` - тестирование API бронирований с использованием токена авторизации
- `test_frontend_bookings.js` - тестирование интеграции фронтенда с API бронирований
- `test_bookings_with_auth.js` - тестирование процесса авторизации и бронирований
- `test_bookings_api.js` - тестирование API бронирований

## Запуск тестов

### Интеграционные тесты
```bash
# Запуск всех тестов бронирований
cd tests/integration
node test_bookings_with_new_token.js
node test_frontend_bookings.js
node test_bookings_with_auth.js
node test_bookings_api.js
```

## Требования
- Node.js 14+
- Запущенный API сервер на порту 8000
- Запущенный фронтенд на порту 3000

## Переменные окружения
- `API_BASE_URL` - базовый URL API (по умолчанию http://localhost:8000)
- `FRONTEND_URL` - URL фронтенда (по умолчанию http://localhost:3000)
- `AUTH_TOKEN` - токен авторизации для тестов (необходимо получить через систему авторизации)

## Примечания
- Перед запуском тестов убедитесь, что API и фронтенд запущены
- Для тестов авторизации необходим валидный токен
- Все тесты содержат подробный вывод результатов в консоль 