#!/usr/bin/env node
// Скрипт для исправления дублирования секций bookingSteps и добавления переводов для ReviewStep

const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Недостающие переводы для ReviewStep
const reviewStepTranslations = {
  ru: {
    "loadingCity": "Загрузка города...",
    "cityLoadError": "ошибка загрузки города",
    "loadingService": "Загрузка услуги...",
    "currency": "грн"
  },
  uk: {
    "loadingCity": "Завантаження міста...",
    "cityLoadError": "помилка завантаження міста", 
    "loadingService": "Завантаження послуги...",
    "currency": "грн"
  }
};

function fixDuplicateBookingSteps(filePath, lang) {
  console.log(`\n🔧 Исправление дублирования bookingSteps в ${lang.toUpperCase()} файле...`);
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Проверяем наличие дублирования
    let bookingStepsCount = 0;
    let firstBookingSteps = null;
    let secondBookingSteps = null;
    
    // Ищем все вхождения bookingSteps
    function findBookingSteps(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'bookingSteps') {
          bookingStepsCount++;
          if (bookingStepsCount === 1) {
            firstBookingSteps = { path, data: value };
          } else if (bookingStepsCount === 2) {
            secondBookingSteps = { path, data: value };
          }
        } else if (typeof value === 'object' && value !== null) {
          findBookingSteps(value, path ? `${path}.${key}` : key);
        }
      }
    }
    
    findBookingSteps(data);
    
    if (bookingStepsCount < 2) {
      console.log(`✅ Дублирования не обнаружено в ${lang} файле`);
      return data;
    }
    
    console.log(`⚠️  Найдено ${bookingStepsCount} секций bookingSteps в ${lang} файле`);
    console.log(`📍 Первая секция: ${firstBookingSteps.path || 'корень'}`);
    console.log(`📍 Вторая секция: ${secondBookingSteps.path || 'корень'}`);
    
    // Объединяем секции (приоритет у второй секции)
    const mergedBookingSteps = {
      ...firstBookingSteps.data,
      ...secondBookingSteps.data
    };
    
    // Добавляем недостающие переводы для review
    if (mergedBookingSteps.review) {
      mergedBookingSteps.review = {
        ...mergedBookingSteps.review,
        ...reviewStepTranslations[lang]
      };
    } else {
      mergedBookingSteps.review = reviewStepTranslations[lang];
    }
    
    // Удаляем дублирующиеся секции и оставляем только одну
    function removeBookingSteps(obj) {
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'bookingSteps') {
          delete obj[key];
        } else if (typeof value === 'object' && value !== null) {
          removeBookingSteps(value);
        }
      }
    }
    
    removeBookingSteps(data);
    
    // Добавляем объединенную секцию в корень
    data.bookingSteps = mergedBookingSteps;
    
    console.log(`✅ Дублирование исправлено в ${lang} файле`);
    console.log(`📝 Добавлены недостающие переводы для ReviewStep`);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${lang} файла:`, error.message);
    throw error;
  }
}

function main() {
  console.log('🎯 ИСПРАВЛЕНИЕ ПЕРЕВОДОВ ДЛЯ REVIEWSTEP');
  console.log('==========================================');
  
  try {
    // Исправляем русский файл
    const ruData = fixDuplicateBookingSteps(ruFilePath, 'ru');
    
    // Исправляем украинский файл  
    const ukData = fixDuplicateBookingSteps(ukFilePath, 'uk');
    
    // Создаем резервные копии
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      ruFilePath.replace('.json', `_backup_${timestamp}.json`),
      fs.readFileSync(ruFilePath, 'utf8')
    );
    fs.writeFileSync(
      ukFilePath.replace('.json', `_backup_${timestamp}.json`),
      fs.readFileSync(ukFilePath, 'utf8')
    );
    
    // Сохраняем исправленные файлы
    fs.writeFileSync(ruFilePath, JSON.stringify(ruData, null, 2), 'utf8');
    fs.writeFileSync(ukFilePath, JSON.stringify(ukData, null, 2), 'utf8');
    
    console.log('\n🎉 УСПЕШНО ЗАВЕРШЕНО!');
    console.log('✅ Дублирование секций bookingSteps исправлено');
    console.log('✅ Добавлены недостающие переводы для ReviewStep');
    console.log('✅ Созданы резервные копии файлов');
    console.log('\n📊 СТАТИСТИКА:');
    console.log(`- Русский файл: ${Object.keys(reviewStepTranslations.ru).length} новых ключей`);
    console.log(`- Украинский файл: ${Object.keys(reviewStepTranslations.uk).length} новых ключей`);
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixDuplicateBookingSteps, reviewStepTranslations }; 