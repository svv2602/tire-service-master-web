#!/usr/bin/env node
// Скрипт для добавления недостающих переводов в ServicesStep

const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Недостающие переводы для ServicesStep
const missingTranslations = {
  ru: {
    "servicesAndComments": "Выбор услуг и комментарии",
    "optionalInfo": "Выбор услуг не обязателен. Вы можете обсудить необходимые услуги с мастером на месте.",
    "forSelectedCategory": "для выбранной категории",
    "loadingError": "Ошибка загрузки услуг",
    "noServicesAvailable": "Нет доступных услуг для выбранной категории",
    "serviceNumber": "Услуга #{{id}}",
    "total": "Итого",
    "clearAll": "Очистить все",
    "commentLabel": "Комментарий к записи",
    "commentPlaceholder": "Добавьте комментарий к записи (необязательно)",
    "allFieldsCompleted": "Все поля заполнены. Можете перейти к следующему шагу.",
    "price": "Цена",
    "priceOnRequest": "по запросу",
    "selectServicePointFirst": "Сначала необходимо выбрать сервисную точку на предыдущем шаге"
  },
  uk: {
    "servicesAndComments": "Вибір послуг та коментарі",
    "optionalInfo": "Вибір послуг не обов'язковий. Ви можете обговорити необхідні послуги з майстром на місці.",
    "forSelectedCategory": "для вибраної категорії",
    "loadingError": "Помилка завантаження послуг",
    "noServicesAvailable": "Немає доступних послуг для вибраної категорії",
    "serviceNumber": "Послуга #{{id}}",
    "total": "Разом",
    "clearAll": "Очистити все",
    "commentLabel": "Коментар до запису",
    "commentPlaceholder": "Додайте коментар до запису (необов'язково)",
    "allFieldsCompleted": "Всі поля заповнені. Можете перейти до наступного кроку.",
    "price": "Ціна",
    "priceOnRequest": "за запитом",
    "selectServicePointFirst": "Спочатку необхідно вибрати сервісну точку на попередньому кроці"
  }
};

function addMissingServicesTranslations(filePath, lang) {
  console.log(`\n🔧 Добавление недостающих переводов для ServicesStep в ${lang.toUpperCase()} файле...`);
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Проверяем наличие секции bookingSteps.services
    if (!data.bookingSteps || !data.bookingSteps.services) {
      console.log(`❌ Секция bookingSteps.services не найдена в ${lang} файле`);
      return data;
    }
    
    let addedCount = 0;
    
    // Добавляем недостающие переводы
    for (const [key, value] of Object.entries(missingTranslations[lang])) {
      if (!data.bookingSteps.services[key]) {
        data.bookingSteps.services[key] = value;
        addedCount++;
        console.log(`✅ Добавлен ${key}: "${value}"`);
      } else {
        console.log(`⏭️  ${key}: уже существует`);
      }
    }
    
    console.log(`📊 Добавлено ${addedCount} новых переводов в ${lang} файле`);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${lang} файла:`, error.message);
    throw error;
  }
}

function main() {
  console.log('🎯 ИСПРАВЛЕНИЕ ПЕРЕВОДОВ ДЛЯ SERVICESSTEP');
  console.log('==========================================');
  
  try {
    // Создаем резервные копии
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      ruFilePath.replace('.json', `_backup_services_${timestamp}.json`),
      fs.readFileSync(ruFilePath, 'utf8')
    );
    fs.writeFileSync(
      ukFilePath.replace('.json', `_backup_services_${timestamp}.json`),
      fs.readFileSync(ukFilePath, 'utf8')
    );
    
    // Добавляем переводы в русский файл
    const ruData = addMissingServicesTranslations(ruFilePath, 'ru');
    
    // Добавляем переводы в украинский файл  
    const ukData = addMissingServicesTranslations(ukFilePath, 'uk');
    
    // Сохраняем исправленные файлы
    fs.writeFileSync(ruFilePath, JSON.stringify(ruData, null, 2), 'utf8');
    fs.writeFileSync(ukFilePath, JSON.stringify(ukData, null, 2), 'utf8');
    
    console.log('\n🎉 УСПЕШНО ЗАВЕРШЕНО!');
    console.log('✅ Добавлены недостающие переводы для ServicesStep');
    console.log('✅ Созданы резервные копии файлов');
    console.log('\n📊 СТАТИСТИКА:');
    console.log(`- Русский файл: ${Object.keys(missingTranslations.ru).length} ключей проверено`);
    console.log(`- Украинский файл: ${Object.keys(missingTranslations.uk).length} ключей проверено`);
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addMissingServicesTranslations, missingTranslations }; 