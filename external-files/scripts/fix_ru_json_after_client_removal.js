#!/usr/bin/env node

/**
 * Скрипт для исправления ru.json после удаления секции client
 * Удаляет оставшиеся клиентские переводы и исправляет синтаксис
 */

const fs = require('fs');
const path = require('path');

const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');

console.log('Исправление ru.json после удаления секции client...');

try {
  // Читаем файл
  let content = fs.readFileSync(ruFilePath, 'utf8');
  
  // Находим строку с "logout": "Выйти" и добавляем запятую, если её нет
  content = content.replace(
    /"logout": "Выйти"\n      "search": {/,
    '"logout": "Выйти"\n    },\n    "bookingSteps": {'
  );
  
  // Удаляем все оставшиеся клиентские переводы до секции bookingSteps
  const startPattern = /"logout": "Выйти"\n    },\n/;
  const endPattern = /\n    "bookingSteps": {/;
  
  const startMatch = content.search(startPattern);
  const endMatch = content.search(endPattern);
  
  if (startMatch !== -1 && endMatch !== -1) {
    const beforeCleanup = content.substring(0, startMatch + '"logout": "Выйти"\n    },'.length);
    const afterCleanup = content.substring(endMatch);
    content = beforeCleanup + afterCleanup;
    console.log('✅ Удалены оставшиеся клиентские переводы');
  }
  
  // Сохраняем исправленный файл
  fs.writeFileSync(ruFilePath, content, 'utf8');
  
  console.log('✅ Файл ru.json исправлен');
  
  // Проверяем валидность JSON
  try {
    JSON.parse(content);
    console.log('✅ JSON валидный');
  } catch (jsonError) {
    console.error('❌ JSON все еще невалидный:', jsonError.message);
  }
  
} catch (error) {
  console.error('❌ Ошибка при исправлении файла:', error.message);
} 