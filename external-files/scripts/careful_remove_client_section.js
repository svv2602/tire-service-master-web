#!/usr/bin/env node

/**
 * Аккуратное удаление секции client из ru.json
 */

const fs = require('fs');
const path = require('path');

const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');

console.log('Аккуратное удаление секции client из ru.json...');

try {
  // Читаем и парсим JSON
  const content = fs.readFileSync(ruFilePath, 'utf8');
  const data = JSON.parse(content);
  
  // Проверяем, есть ли секция client
  if (data.client) {
    console.log('✅ Найдена секция client, удаляем...');
    delete data.client;
    
    // Сохраняем файл с правильным форматированием
    const newContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(ruFilePath, newContent, 'utf8');
    
    console.log('✅ Секция client удалена из ru.json');
  } else {
    console.log('ℹ️ Секция client не найдена в ru.json');
  }
  
  // Проверяем валидность
  JSON.parse(fs.readFileSync(ruFilePath, 'utf8'));
  console.log('✅ JSON валидный');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
} 