#!/usr/bin/env node
// Скрипт для валидации всех ключей переводов, используемых в ReviewStep

const fs = require('fs');
const path = require('path');

// Пути к файлам
const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Все ключи переводов, используемые в ReviewStep
const requiredKeys = [
  'title',
  'description', 
  'bookingDetails',
  'city',
  'servicePoint',
  'address',
  'phone',
  'dateTime',
  'dateTimeSeparator',
  'clientInfo',
  'name',
  'email',
  'noContactInfo',
  'noContactInfoDescription',
  'carInfo',
  'carType',
  'licensePlate',
  'carBrandModel',
  'services',
  'noServicesSelected',
  'total',
  'currency',
  'comments',
  'notifications',
  'notificationsText',
  'agreement',
  'loadingCity',
  'cityLoadError',
  'loadingService'
];

function validateTranslations(filePath, lang) {
  console.log(`\n🔍 Проверка переводов в ${lang.toUpperCase()} файле...`);
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Проверяем наличие секции bookingSteps.review
    if (!data.bookingSteps || !data.bookingSteps.review) {
      console.log(`❌ Секция bookingSteps.review не найдена в ${lang} файле`);
      return { missing: requiredKeys, found: [] };
    }
    
    const reviewSection = data.bookingSteps.review;
    const missing = [];
    const found = [];
    
    // Проверяем каждый ключ
    for (const key of requiredKeys) {
      if (reviewSection[key]) {
        found.push(key);
        console.log(`✅ ${key}: "${reviewSection[key]}"`);
      } else {
        missing.push(key);
        console.log(`❌ ${key}: ОТСУТСТВУЕТ`);
      }
    }
    
    return { missing, found };
    
  } catch (error) {
    console.error(`❌ Ошибка при чтении ${lang} файла:`, error.message);
    throw error;
  }
}

function addMissingTranslations(filePath, lang, missingKeys) {
  if (missingKeys.length === 0) {
    return;
  }
  
  console.log(`\n🔧 Добавление недостающих переводов в ${lang.toUpperCase()} файле...`);
  
  // Переводы для недостающих ключей
  const missingTranslations = {
    ru: {
      'title': 'Подтверждение записи',
      'description': 'Проверьте все данные перед подтверждением записи',
      'bookingDetails': 'Детали записи',
      'city': 'Город',
      'servicePoint': 'Сервисная точка',
      'address': 'Адрес',
      'phone': 'Телефон',
      'dateTime': 'Дата и время',
      'dateTimeSeparator': 'в',
      'clientInfo': 'Контактная информация',
      'name': 'Имя',
      'email': 'Email',
      'noContactInfo': 'не указана',
      'noContactInfoDescription': 'Вернитесь к шагу "Контактная информация" для заполнения данных',
      'carInfo': 'Информация об автомобиле',
      'carType': 'Тип автомобиля',
      'licensePlate': 'Номер',
      'carBrandModel': 'Марка и модель',
      'services': 'Услуги',
      'noServicesSelected': 'не выбраны',
      'total': 'Итого',
      'currency': 'грн',
      'comments': 'Комментарий',
      'notifications': 'Настройки уведомлений',
      'notificationsText': 'Получать SMS и email уведомления о статусе записи',
      'agreement': 'Нажимая "Подтвердить", вы соглашаетесь с условиями предоставления услуг',
      'loadingCity': 'Загрузка города...',
      'cityLoadError': 'ошибка загрузки города',
      'loadingService': 'Загрузка услуги...'
    },
    uk: {
      'title': 'Підтвердження запису',
      'description': 'Перевірте всі дані перед підтвердженням запису',
      'bookingDetails': 'Деталі запису',
      'city': 'Місто',
      'servicePoint': 'Сервісна точка',
      'address': 'Адреса',
      'phone': 'Телефон',
      'dateTime': 'Дата і час',
      'dateTimeSeparator': 'о',
      'clientInfo': 'Контактна інформація',
      'name': "Ім'я",
      'email': 'Email',
      'noContactInfo': 'не вказана',
      'noContactInfoDescription': 'Поверніться до кроку "Контактна інформація" для заповнення даних',
      'carInfo': 'Інформація про автомобіль',
      'carType': 'Тип автомобіля',
      'licensePlate': 'Номер',
      'carBrandModel': 'Марка і модель',
      'services': 'Послуги',
      'noServicesSelected': 'не вибрані',
      'total': 'Разом',
      'currency': 'грн',
      'comments': 'Коментар',
      'notifications': 'Налаштування сповіщень',
      'notificationsText': 'Отримувати SMS та email сповіщення про статус запису',
      'agreement': 'Натискаючи "Підтвердити", ви погоджуєтесь з умовами надання послуг',
      'loadingCity': 'Завантаження міста...',
      'cityLoadError': 'помилка завантаження міста',
      'loadingService': 'Завантаження послуги...'
    }
  };
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Добавляем недостающие переводы
    for (const key of missingKeys) {
      if (missingTranslations[lang][key]) {
        data.bookingSteps.review[key] = missingTranslations[lang][key];
        console.log(`✅ Добавлен ${key}: "${missingTranslations[lang][key]}"`);
      }
    }
    
    // Сохраняем файл
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
  } catch (error) {
    console.error(`❌ Ошибка при добавлении переводов в ${lang} файл:`, error.message);
    throw error;
  }
}

function main() {
  console.log('🎯 ВАЛИДАЦИЯ ПЕРЕВОДОВ REVIEWSTEP');
  console.log('=================================');
  console.log(`📝 Проверяем ${requiredKeys.length} ключей переводов...`);
  
  try {
    // Проверяем русский файл
    const ruResult = validateTranslations(ruFilePath, 'ru');
    
    // Проверяем украинский файл
    const ukResult = validateTranslations(ukFilePath, 'uk');
    
    // Добавляем недостающие переводы
    if (ruResult.missing.length > 0) {
      addMissingTranslations(ruFilePath, 'ru', ruResult.missing);
    }
    
    if (ukResult.missing.length > 0) {
      addMissingTranslations(ukFilePath, 'uk', ukResult.missing);
    }
    
    console.log('\n📊 ИТОГОВАЯ СТАТИСТИКА:');
    console.log(`🇷🇺 Русский: ${ruResult.found.length}/${requiredKeys.length} найдено, ${ruResult.missing.length} добавлено`);
    console.log(`🇺🇦 Украинский: ${ukResult.found.length}/${requiredKeys.length} найдено, ${ukResult.missing.length} добавлено`);
    
    if (ruResult.missing.length === 0 && ukResult.missing.length === 0) {
      console.log('\n🎉 ВСЕ ПЕРЕВОДЫ НАЙДЕНЫ! ReviewStep полностью локализован.');
    } else {
      console.log('\n✅ НЕДОСТАЮЩИЕ ПЕРЕВОДЫ ДОБАВЛЕНЫ! ReviewStep теперь полностью локализован.');
    }
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateTranslations, addMissingTranslations, requiredKeys }; 