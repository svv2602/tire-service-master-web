#!/bin/bash

# Скрипт для миграции страниц на ActionsMenu компонент
# Автор: Система унификации дизайна Tire Service
# Дата: $(date +"%Y-%m-%d")

echo "🚀 Начинаем миграцию страниц на ActionsMenu компонент..."

# Массив страниц для миграции (путь:название)
declare -A PAGES=(
    ["src/pages/clients/ClientsPage.tsx"]="ClientsPage"
    ["src/pages/partners/PartnersPage.tsx"]="PartnersPage" 
    ["src/pages/car-brands/CarBrandsPage.tsx"]="CarBrandsPage"
    ["src/pages/catalog/CitiesPage.tsx"]="CitiesPage"
    ["src/pages/regions/RegionsPage.tsx"]="RegionsPage"
    ["src/pages/reviews/ReviewsPage.tsx"]="ReviewsPage"
    ["src/pages/bookings/BookingsPage.tsx"]="BookingsPage"
    ["src/pages/service-points/ServicePointsPage.tsx"]="ServicePointsPage"
)

# Счетчики
MIGRATED=0
ERRORS=0

# Функция миграции одной страницы
migrate_page() {
    local file_path="$1"
    local page_name="$2"
    
    echo "📄 Мигрируем $page_name ($file_path)..."
    
    # Проверяем существование файла
    if [[ ! -f "$file_path" ]]; then
        echo "❌ Файл $file_path не найден"
        ((ERRORS++))
        return 1
    fi
    
    # Проверяем, уже ли мигрирован (есть ли ActionsMenu импорт)
    if grep -q "ActionsMenu" "$file_path"; then
        echo "✅ $page_name уже мигрирован"
        ((MIGRATED++))
        return 0
    fi
    
    # Создаем резервную копию
    cp "$file_path" "${file_path}.backup"
    
    echo "  🔧 Добавляем импорт ActionsMenu..."
    # Добавляем импорт ActionsMenu если его нет
    if ! grep -q "ActionsMenu" "$file_path"; then
        # Ищем строку с импортом UI компонентов и добавляем ActionsMenu
        sed -i '/from.*components\/ui/,/;/ {
            /ActionsMenu/!{
                /;/i\
  ActionsMenu,
            }
        }' "$file_path"
        
        # Добавляем импорт типа ActionItem
        sed -i '/import.*components\/ui/a\
import type { ActionItem } from '\''../../components/ui'\'';' "$file_path"
    fi
    
    echo "  🔧 Заменяем notistack на Notification компонент..."
    # Убираем импорт notistack если есть
    sed -i '/import.*useSnackbar.*notistack/d' "$file_path"
    
    # Добавляем импорт Notification если его нет
    if ! grep -q "import Notification" "$file_path"; then
        sed -i '/import.*PageTable/a\
import Notification from '\''../../components/Notification'\'';' "$file_path"
    fi
    
    echo "  ✅ $page_name успешно подготовлен к миграции"
    ((MIGRATED++))
    
    return 0
}

# Основной цикл миграции
for file_path in "${!PAGES[@]}"; do
    page_name="${PAGES[$file_path]}"
    migrate_page "$file_path" "$page_name"
done

echo ""
echo "📊 РЕЗУЛЬТАТЫ МИГРАЦИИ:"
echo "✅ Обработано страниц: $MIGRATED"
echo "❌ Ошибок: $ERRORS"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo "🎉 Все страницы успешно подготовлены к миграции на ActionsMenu!"
    echo ""
    echo "📋 СЛЕДУЮЩИЕ ШАГИ:"
    echo "1. Проверьте каждую страницу вручную"
    echo "2. Замените actionsConfig на ActionItem<T>[] массив"
    echo "3. Добавьте колонку 'actions' в columns с ActionsMenu компонентом"
    echo "4. Уберите actions={actionsConfig} из PageTable"
    echo "5. Замените useSnackbar на состояние notification"
    echo "6. Добавьте <Notification /> компонент в JSX"
else
    echo "⚠️  Обнаружены ошибки при миграции. Проверьте файлы вручную."
fi

echo ""
echo "📁 Резервные копии сохранены с расширением .backup"
echo "🔄 Для отката используйте: find . -name '*.backup' -exec bash -c 'mv \"\$1\" \"\${1%.backup}\"' _ {} \;" 