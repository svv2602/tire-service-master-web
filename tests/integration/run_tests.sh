#!/bin/bash

# Скрипт для запуска тестов интеграции фронтенд-бэкенд
# Использование: ./run_tests.sh [node|browser|all]

set -e

API_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

echo "🧪 =============================================="
echo "    ЗАПУСК ТЕСТОВ ИНТЕГРАЦИИ ФРОНТЕНД-БЭКЕНД"
echo "=============================================="
echo

# Функция проверки доступности сервисов
check_services() {
    echo "📊 Проверка доступности сервисов..."
    
    # Проверка API
    if curl -s "$API_URL/api/v1/health" > /dev/null; then
        echo "✅ API ($API_URL) - ДОСТУПЕН"
    else
        echo "❌ API ($API_URL) - НЕДОСТУПЕН"
        echo "   Запустите API: cd ../../../tire-service-master-api && bundle exec rails server -p 8000"
        exit 1
    fi
    
    # Проверка фронтенда
    if curl -s "$FRONTEND_URL" > /dev/null; then
        echo "✅ Фронтенд ($FRONTEND_URL) - ДОСТУПЕН"
    else
        echo "❌ Фронтенд ($FRONTEND_URL) - НЕДОСТУПЕН"
        echo "   Запустите фронтенд: cd ../../ && npm start"
        exit 1
    fi
    echo
}

# Функция запуска Node.js тестов
run_node_tests() {
    echo "🔧 Запуск Node.js тестов..."
    echo "=========================================="
    
    if command -v node >/dev/null 2>&1; then
        node test_frontend_integration.js
    else
        echo "❌ Node.js не найден. Установите Node.js для запуска тестов."
        exit 1
    fi
    echo
}

# Функция запуска браузерных тестов
run_browser_tests() {
    echo "🌐 Запуск браузерных тестов..."
    echo "=========================================="
    echo "Запуск HTTP сервера на порту 8080..."
    
    # Проверка, не занят ли порт 8080
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Порт 8080 уже занят. Остановите процесс или используйте другой порт."
        echo "   Для просмотра процессов: lsof -Pi :8080 -sTCP:LISTEN"
    else
        echo "🚀 HTTP сервер запущен на http://localhost:8080"
        echo "📖 Откройте в браузере: http://localhost:8080/test_frontend_browser.html"
        echo "⏹️  Для остановки нажмите Ctrl+C"
        echo
        python3 -m http.server 8080
    fi
}

# Функция показа помощи
show_help() {
    echo "Использование: $0 [ОПЦИЯ]"
    echo
    echo "ОПЦИИ:"
    echo "  node     - Запустить только Node.js тесты"
    echo "  browser  - Запустить только браузерные тесты"
    echo "  all      - Запустить все тесты (по умолчанию)"
    echo "  help     - Показать эту справку"
    echo
    echo "Примеры:"
    echo "  $0           # Запустить все тесты"
    echo "  $0 node      # Только Node.js тесты"
    echo "  $0 browser   # Только браузерные тесты"
    echo
}

# Основная логика
case "${1:-all}" in
    "node")
        check_services
        run_node_tests
        echo "✅ Node.js тесты завершены!"
        ;;
    "browser")
        check_services
        run_browser_tests
        ;;
    "all")
        check_services
        run_node_tests
        echo "🎯 Node.js тесты завершены! Теперь запускаем браузерные тесты..."
        echo "   Нажмите Enter для продолжения или Ctrl+C для выхода"
        read -r
        run_browser_tests
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Неизвестная опция: $1"
        echo
        show_help
        exit 1
        ;;
esac 