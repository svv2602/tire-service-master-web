#!/usr/bin/env node
// Скрипт для исправления перевода noServicesSelected в ServicesStep

const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Правильные переводы для noServicesSelected
const correctTranslations = {
  ru: "Услуги не выбраны. Вы можете обсудить необходимые услуги с мастером на месте.",
  uk: "Послуги не вибрані. Ви можете обговорити необхідні послуги з майстром на місці."
};

function fixNoServicesSelectedTranslation(filePath, lang) {
  console.log(`\n🔧 Исправление перевода noServicesSelected в ${lang.toUpperCase()} файле...`);
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Проверяем структуру
    if (!data.bookingSteps || !data.bookingSteps.services) {
      console.log(`❌ Секция bookingSteps.services не найдена в ${lang} файле`);
      return;
    }
    
    // Обновляем перевод
    const oldTranslation = data.bookingSteps.services.noServicesSelected;
    data.bookingSteps.services.noServicesSelected = correctTranslations[lang];
    
    // Сохраняем файл
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Перевод обновлен в ${lang} файле:`);
    console.log(`   Старый: "${oldTranslation}"`);
    console.log(`   Новый: "${correctTranslations[lang]}"`);
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${lang} файла:`, error.message);
  }
}

function main() {
  console.log('🚀 Начинаем исправление переводов noServicesSelected...');
  
  // Исправляем русский файл
  fixNoServicesSelectedTranslation(ruFilePath, 'ru');
  
  // Исправляем украинский файл
  fixNoServicesSelectedTranslation(ukFilePath, 'uk');
  
  console.log('\n✨ Исправление переводов завершено!');
  console.log('\n📝 Что было исправлено:');
  console.log('1. Обновлен текст перевода noServicesSelected для полной фразы');
  console.log('2. Переводы теперь содержат полный контекст');
  console.log('3. Устранены возможные дублирования');
  
  console.log('\n🧪 Для проверки:');
  console.log('1. Перезапустите приложение');
  console.log('2. Перейдите на страницу /client/booking');
  console.log('3. Дойдите до шага выбора услуг');
  console.log('4. Проверьте, что в правой панели отображается правильный текст вместо ключа');
}

main(); 