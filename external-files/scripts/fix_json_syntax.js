#!/usr/bin/env node

/**
 * Скрипт для исправления синтаксических ошибок в JSON файлах переводов
 */

const fs = require('fs');
const path = require('path');

const UK_JSON_PATH = 'src/i18n/locales/uk.json';
const RU_JSON_PATH = 'src/i18n/locales/ru.json';

/**
 * Исправляет синтаксические ошибки в JSON файле
 */
function fixJsonSyntax(filePath) {
  console.log(`🔧 Исправляю синтаксис в ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Исправляем основные проблемы
    content = content
      // Убираем дублирующие запятые
      .replace(/,\s*,/g, ',')
      // Исправляем запятые перед закрывающими скобками
      .replace(/,(\s*[}\]])/g, '$1')
      // Добавляем недостающие запятые между объектами
      .replace(/}\s*{/g, '},{')
      // Исправляем структуру
      .replace(/}\s*},\s*"/g, '}\n  },\n  "');
    
    // Проверяем валидность
    JSON.parse(content);
    
    // Сохраняем исправленный файл
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} успешно исправлен`);
    
    return true;
  } catch (error) {
    console.error(`❌ Ошибка в ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Основная функция
 */
function main() {
  console.log('🚀 Начинаю исправление JSON файлов переводов...\n');
  
  const results = [
    fixJsonSyntax(UK_JSON_PATH),
    fixJsonSyntax(RU_JSON_PATH)
  ];
  
  const successCount = results.filter(Boolean).length;
  
  console.log(`\n📊 Результат: ${successCount}/${results.length} файлов исправлено`);
  
  if (successCount === results.length) {
    console.log('🎉 Все JSON файлы успешно исправлены!');
  } else {
    console.log('⚠️ Некоторые файлы требуют ручного исправления');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixJsonSyntax }; 