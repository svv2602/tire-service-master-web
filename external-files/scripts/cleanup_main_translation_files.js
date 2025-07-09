#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Путь к основным файлам переводов
const mainFilesPath = 'src/i18n/locales/';

// Секции, которые нужно удалить из основных файлов (уже есть в модульных)
const sectionsToRemove = [
  'forms.carBrand',
  'forms.city'
];

/**
 * Удаляет указанные секции из объекта переводов
 */
function removeSections(translations, sectionsToRemove) {
  const result = JSON.parse(JSON.stringify(translations)); // deep clone
  
  sectionsToRemove.forEach(sectionPath => {
    const parts = sectionPath.split('.');
    let current = result;
    
    // Навигация к родительскому объекту
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]]) {
        current = current[parts[i]];
      } else {
        return; // Секция не найдена
      }
    }
    
    // Удаление последней части пути
    const lastPart = parts[parts.length - 1];
    if (current[lastPart]) {
      delete current[lastPart];
      console.log(`✅ Удалена секция: ${sectionPath}`);
    }
  });
  
  return result;
}

/**
 * Очищает основной файл переводов
 */
function cleanupMainFile(filePath, language) {
  console.log(`\n🧹 Очистка файла: ${filePath}`);
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);
    
    // Удаляем указанные секции
    const cleanedTranslations = removeSections(translations, sectionsToRemove);
    
    // Сохраняем очищенный файл
    const cleanedContent = JSON.stringify(cleanedTranslations, null, 2);
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    
    console.log(`✅ Файл ${language} успешно очищен`);
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
  }
}

/**
 * Основная функция
 */
function main() {
  console.log('🚀 Начинаем очистку основных файлов переводов...\n');
  
  const files = [
    { path: path.join(mainFilesPath, 'ru.json'), lang: 'русский' },
    { path: path.join(mainFilesPath, 'uk.json'), lang: 'украинский' }
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      // Очищаем файл
      cleanupMainFile(file.path, file.lang);
    } else {
      console.log(`⚠️  Файл не найден: ${file.path}`);
    }
  });
  
  console.log('\n✨ Очистка завершена!');
}

// Запуск скрипта
if (require.main === module) {
  main();
} 