#!/bin/bash

# Скрипт для диагностики проблем с аутентификацией в админ интерфейсе бронирований

echo "🔍 Диагностика аутентификации в административном интерфейсе"
echo "================================================="

# Функция для отправки HTTP запросов с цветным выводом
test_api() {
    local method="$1"
    local url="$2"
    local headers="$3"
    local description="$4"
    
    echo ""
    echo "🧪 $description"
    echo "   Запрос: $method $url"
    
    if [[ -n "$headers" ]]; then
        echo "   Заголовки: $headers"
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "$headers" -H "Content-Type: application/json")
    else
        echo "   Заголовки: (отсутствуют)"
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json")
    fi
    
    # Разделяем ответ и HTTP код
    body=$(echo "$response" | head -n -1)
    status_code=$(echo "$response" | tail -n 1)
    
    # Цветной вывод в зависимости от статуса
    if [[ "$status_code" -ge 200 && "$status_code" -lt 300 ]]; then
        echo "   ✅ Статус: $status_code (успех)"
    elif [[ "$status_code" -eq 401 ]]; then
        echo "   ❌ Статус: $status_code (не авторизован)"
    elif [[ "$status_code" -ge 400 && "$status_code" -lt 500 ]]; then
        echo "   ⚠️  Статус: $status_code (ошибка клиента)"
    else
        echo "   🔥 Статус: $status_code (ошибка сервера)"
    fi
    
    # Показываем первые несколько строк ответа
    if [[ -n "$body" ]]; then
        echo "   Ответ: $(echo "$body" | head -c 200)..."
    fi
    
    return $status_code
}

# Проверяем работу API сервера
echo ""
echo "1️⃣ Проверяем доступность API сервера"
test_api "GET" "http://localhost:8000/api/v1/service_points" "" "Публичный эндпойнт (сервисные точки)"

# Тестируем авторизацию
echo ""
echo "2️⃣ Тестируем авторизацию"

# Авторизуемся и получаем токен
echo ""
echo "🔐 Получаем токен через /auth/login"
login_response=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@test.com", "password": "admin123"}' \
    --cookie-jar /tmp/auth_cookies.txt)

# Проверяем успешность логина
if echo "$login_response" | grep -q "tokens"; then
    echo "✅ Авторизация успешна"
    
    # Извлекаем токен
    access_token=$(echo "$login_response" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
    
    if [[ -n "$access_token" ]]; then
        echo "🔑 Получен токен: ${access_token:0:30}..."
        
        # Тестируем API с токеном
        echo ""
        echo "3️⃣ Тестируем API бронирований с Bearer токеном"
        test_api "GET" "http://localhost:8000/api/v1/bookings" "Authorization: Bearer $access_token" "API бронирований с Bearer токеном"
        
        # Тестируем другие административные API
        echo ""
        echo "4️⃣ Тестируем другие административные API"
        test_api "GET" "http://localhost:8000/api/v1/users" "Authorization: Bearer $access_token" "API пользователей"
        test_api "GET" "http://localhost:8000/api/v1/clients" "Authorization: Bearer $access_token" "API клиентов"
        
        # Тестируем API с пагинацией
        echo ""
        echo "5️⃣ Тестируем пагинацию бронирований"
        test_api "GET" "http://localhost:8000/api/v1/bookings?page=1&per_page=10" "Authorization: Bearer $access_token" "Бронирования с пагинацией"
        
    else
        echo "❌ Не удалось извлечь токен из ответа"
        echo "Ответ: $login_response"
    fi
    
    # Тестируем cookie-based аутентификацию
    echo ""
    echo "6️⃣ Тестируем Cookie-based аутентификацию"
    cookie_response=$(curl -s "http://localhost:8000/api/v1/auth/me" --cookie /tmp/auth_cookies.txt)
    
    if echo "$cookie_response" | grep -q "email"; then
        echo "✅ Cookie-based аутентификация работает"
        echo "   Пользователь: $(echo "$cookie_response" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
    else
        echo "❌ Cookie-based аутентификация не работает"
        echo "   Ответ: $cookie_response"
    fi
    
    # Тестируем API бронирований с cookies
    echo ""
    echo "7️⃣ Тестируем API бронирований с cookies"
    bookings_cookie_response=$(curl -s -w "\n%{http_code}" "http://localhost:8000/api/v1/bookings" --cookie /tmp/auth_cookies.txt)
    bookings_body=$(echo "$bookings_cookie_response" | head -n -1)
    bookings_status=$(echo "$bookings_cookie_response" | tail -n 1)
    
    if [[ "$bookings_status" -eq 200 ]]; then
        echo "✅ API бронирований работает с cookies (статус: $bookings_status)"
        bookings_count=$(echo "$bookings_body" | grep -o '"data":\[[^]]*\]' | grep -o '\[.*\]' | grep -o '{}' | wc -l)
        total_count=$(echo "$bookings_body" | grep -o '"total_count":[0-9]*' | cut -d':' -f2)
        echo "   Количество бронирований: $bookings_count"
        echo "   Общее количество: $total_count"
    else
        echo "❌ API бронирований не работает с cookies (статус: $bookings_status)"
        echo "   Ответ: $bookings_body"
    fi
    
else
    echo "❌ Ошибка авторизации"
    echo "Ответ: $login_response"
fi

# Тестируем фронтенд
echo ""
echo "8️⃣ Проверяем доступность фронтенда"

# Проверяем главную страницу
frontend_response=$(curl -s -w "%{http_code}" "http://localhost:3008" -o /dev/null)
if [[ "$frontend_response" -eq 200 ]]; then
    echo "✅ Фронтенд доступен (http://localhost:3008)"
else
    echo "❌ Фронтенд недоступен (статус: $frontend_response)"
fi

# Проверяем страницу бронирований
bookings_page_response=$(curl -s -w "%{http_code}" "http://localhost:3008/bookings" -o /dev/null)
if [[ "$bookings_page_response" -eq 200 ]]; then
    echo "✅ Страница бронирований доступна (http://localhost:3008/bookings)"
else
    echo "❌ Страница бронирований недоступна (статус: $bookings_page_response)"
fi

echo ""
echo "9️⃣ Рекомендации по устранению проблем"
echo ""

# Анализируем результаты и даем рекомендации
if [[ -n "$access_token" ]]; then
    echo "✅ API авторизация работает корректно"
    
    if [[ "$bookings_status" -eq 200 ]]; then
        echo "✅ API бронирований возвращает данные"
        echo ""
        echo "🎯 ОСНОВНАЯ ПРОБЛЕМА:"
        echo "   Скорее всего, проблема в передаче JWT токена во фронтенде."
        echo ""
        echo "🔧 РЕШЕНИЯ:"
        echo "   1. Проверить, что Redux store правильно сохраняет accessToken"
        echo "   2. Убедиться, что baseApi.ts правильно добавляет Authorization заголовок"
        echo "   3. Проверить AuthInitializer - восстанавливает ли он токен при загрузке"
        echo "   4. Открыть DevTools -> Network и проверить наличие Authorization заголовка"
        echo ""
        echo "📋 БЫСТРАЯ ПРОВЕРКА:"
        echo "   1. Откройте http://localhost:3008/login"
        echo "   2. Войдите как admin@test.com / admin123"
        echo "   3. Перейдите на http://localhost:3008/bookings"
        echo "   4. Откройте DevTools -> Network -> посмотрите запрос к /api/v1/bookings"
        echo "   5. Проверьте наличие заголовка 'Authorization: Bearer ...'"
    else
        echo "❌ API бронирований не работает даже с правильным токеном"
        echo "   Проверьте настройки CORS и права доступа в BookingPolicy"
    fi
else
    echo "❌ Проблема с API авторизацией"
    echo "   Проверьте работу сервера API и правильность учетных данных"
fi

# Очищаем временные файлы
rm -f /tmp/auth_cookies.txt

echo ""
echo "🏁 Диагностика завершена"
echo ""
echo "Для более детальной диагностики откройте:"
echo "🌐 http://localhost:3009/auth_diagnostic.html"
echo ""
