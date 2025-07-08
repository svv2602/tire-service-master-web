#!/usr/bin/env node
// Скрипт для добавления перевода разделителя даты и времени в ReviewStep

const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Новые переводы для разделителя даты и времени
const dateTimeSeparatorTranslations = {
  ru: {
    "dateTimeSeparator": "в"
  },
  uk: {
    "dateTimeSeparator": "о"
  }
};

function addDateTimeSeparatorTranslation(filePath, lang) {
  console.log(`\n🔧 Добавление перевода разделителя даты и времени в ${lang.toUpperCase()} файле...`);
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Проверяем наличие секции bookingSteps.review
    if (!data.bookingSteps || !data.bookingSteps.review) {
      console.log(`❌ Секция bookingSteps.review не найдена в ${lang} файле`);
      return data;
    }
    
    // Добавляем новый перевод
    data.bookingSteps.review = {
      ...data.bookingSteps.review,
      ...dateTimeSeparatorTranslations[lang]
    };
    
    console.log(`✅ Добавлен перевод разделителя в ${lang} файле: "${dateTimeSeparatorTranslations[lang].dateTimeSeparator}"`);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${lang} файла:`, error.message);
    throw error;
  }
}

function main() {
  console.log('🎯 ДОБАВЛЕНИЕ ПЕРЕВОДА РАЗДЕЛИТЕЛЯ ДАТЫ И ВРЕМЕНИ');
  console.log('================================================');
  
  try {
    // Добавляем переводы в русский файл
    const ruData = addDateTimeSeparatorTranslation(ruFilePath, 'ru');
    
    // Добавляем переводы в украинский файл  
    const ukData = addDateTimeSeparatorTranslation(ukFilePath, 'uk');
    
    // Сохраняем исправленные файлы
    fs.writeFileSync(ruFilePath, JSON.stringify(ruData, null, 2), 'utf8');
    fs.writeFileSync(ukFilePath, JSON.stringify(ukData, null, 2), 'utf8');
    
    console.log('\n🎉 УСПЕШНО ЗАВЕРШЕНО!');
    console.log('✅ Добавлены переводы разделителя даты и времени');
    console.log('\n📊 СТАТИСТИКА:');
    console.log(`- Русский: "${dateTimeSeparatorTranslations.ru.dateTimeSeparator}"`);
    console.log(`- Украинский: "${dateTimeSeparatorTranslations.uk.dateTimeSeparator}"`);
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addDateTimeSeparatorTranslation, dateTimeSeparatorTranslations }; 