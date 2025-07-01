#!/bin/bash

# Скрипт для замены старых страниц на новые в проекте Tire Service
# Автор: AI Assistant
# Дата: $(date)

cd /home/snisar/mobi_tz/tire-service-master-web/src/pages

echo "🔄 Начинаю замену старых страниц на новые..."

# Функция для замены страницы
replace_page() {
    local folder=$1
    local page_name=$2
    
    if [ -f "$folder/${page_name}PageNew.tsx" ] && [ -f "$folder/${page_name}Page.tsx" ]; then
        echo "📁 Обрабатываю $folder/${page_name}Page..."
        
        # Переименовываем старую в backup
        mv "$folder/${page_name}Page.tsx" "$folder/${page_name}PageOld.tsx"
        
        # Переименовываем новую в основную
        mv "$folder/${page_name}PageNew.tsx" "$folder/${page_name}Page.tsx"
        
        echo "✅ $page_name заменена успешно"
    else
        echo "⚠️  Пропускаю $folder/$page_name - файлы не найдены"
    fi
}

# Список страниц для замены
replace_page "service-points" "ServicePoints"
replace_page "reviews" "Reviews"
replace_page "bookings" "Bookings"
replace_page "car-brands" "CarBrands"
replace_page "catalog" "Cities"
replace_page "catalog" "Regions"
replace_page "services" "Services"
replace_page "articles" "Articles"

echo "🎉 Замена страниц завершена!"
echo "📝 Не забудьте обновить App.tsx и исправить экспорты в файлах" 