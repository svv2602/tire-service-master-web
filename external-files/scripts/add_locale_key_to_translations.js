#!/usr/bin/env node
// Скрипт для добавления ключа locale в файлы переводов

const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

function addLocaleKey(filePath, locale) {
  console.log(`\n🔧 Добавление ключа locale в ${locale.toUpperCase()} файле...`);
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Добавляем ключ locale
    data.locale = locale;
    
    // Сохраняем файл
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Добавлен ключ locale: "${locale}" в ${locale} файл`);
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${locale} файла:`, error.message);
  }
}

function main() {
  console.log('🚀 Начинаем добавление ключей locale...');
  
  // Добавляем ключ locale в русский файл
  addLocaleKey(ruFilePath, 'ru');
  
  // Добавляем ключ locale в украинский файл
  addLocaleKey(ukFilePath, 'uk');
  
  console.log('\n✨ Добавление ключей locale завершено!');
  console.log('\n📝 Что было добавлено:');
  console.log('1. Ключ "locale": "ru" в ru.json');
  console.log('2. Ключ "locale": "uk" в uk.json');
  
  console.log('\n🧪 Теперь можно использовать t("locale") для получения текущей локали');
}

main(); 