const fs = require('fs');
const path = require('path');

// Путь к файлам переводов
const localesPath = path.join(__dirname, '../../src/i18n/locales');
const ruPath = path.join(localesPath, 'ru.json');
const ukPath = path.join(localesPath, 'uk.json');

// Переводы для верхней навигации клиентской части
const navigationTranslations = {
  ru: {
    knowledgeBase: "База знаний",
    services: "Услуги", 
    booking: "Запись",
    tireCalculator: "Калькулятор шин"
  },
  uk: {
    knowledgeBase: "База знань",
    services: "Послуги",
    booking: "Запис", 
    tireCalculator: "Калькулятор шин"
  }
};

function addNavigationTranslations() {
  try {
    // Обработка русского файла
    const ruContent = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
    
    // Добавляем переводы в секцию navigation
    if (!ruContent.navigation) {
      ruContent.navigation = {};
    }
    
    // Добавляем новые ключи
    Object.assign(ruContent.navigation, navigationTranslations.ru);
    
    // Сохраняем файл
    fs.writeFileSync(ruPath, JSON.stringify(ruContent, null, 2), 'utf8');
    console.log('✅ Добавлены переводы навигации в ru.json');
    
    // Обработка украинского файла
    const ukContent = JSON.parse(fs.readFileSync(ukPath, 'utf8'));
    
    // Добавляем переводы в секцию navigation
    if (!ukContent.navigation) {
      ukContent.navigation = {};
    }
    
    // Добавляем новые ключи
    Object.assign(ukContent.navigation, navigationTranslations.uk);
    
    // Сохраняем файл
    fs.writeFileSync(ukPath, JSON.stringify(ukContent, null, 2), 'utf8');
    console.log('✅ Добавлены переводы навигации в uk.json');
    
    console.log('\n🎯 РЕЗУЛЬТАТ: Переводы верхней навигации добавлены успешно!');
    console.log('📝 Добавленные ключи:');
    console.log('- navigation.knowledgeBase');
    console.log('- navigation.services');
    console.log('- navigation.booking');
    console.log('- navigation.tireCalculator');
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении переводов навигации:', error);
  }
}

// Запуск скрипта
addNavigationTranslations(); 