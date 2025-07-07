#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление синтаксических ошибок...');

// Список файлов для исправления
const filesToFix = [
  'src/pages/bookings/BookingFormPage.tsx',
  'src/pages/clients/ClientFormPage.tsx',
  'src/pages/service-points/ServicePointFormPage.tsx'
];

// Функция для исправления синтаксических ошибок
function fixSyntaxErrors(content) {
  let fixedContent = content;
  let fixCount = 0;
  
  // 1. Исправляем дублированный validationSchema: validationSchema:
  const duplicatePattern = /validationSchema:\s*validationSchema:\s*createValidationSchema\(t\)/g;
  if (duplicatePattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(duplicatePattern, 'validationSchema: createValidationSchema(t)');
    fixCount++;
    console.log(`  ✅ Исправлен дублированный validationSchema`);
  }
  
  // 2. Исправляем одиночный validationSchema, без присваивания
  const singlePattern = /(\s+)validationSchema,(\s*)/g;
  if (singlePattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(singlePattern, '$1validationSchema: createValidationSchema(t),$2');
    fixCount++;
    console.log(`  ✅ Исправлен одиночный validationSchema`);
  }
  
  return { content: fixedContent, count: fixCount };
}

// Обрабатываем каждый файл
let totalFiles = 0;
let fixedFiles = 0;
let totalFixes = 0;

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Файл не найден: ${filePath}`);
    return;
  }
  
  totalFiles++;
  console.log(`\n🔧 Исправление ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const result = fixSyntaxErrors(content);
  
  if (result.count > 0) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    fixedFiles++;
    totalFixes += result.count;
    console.log(`✅ Всего исправлений: ${result.count}`);
  } else {
    console.log(`ℹ️  Нет синтаксических ошибок для исправления`);
  }
});

console.log(`\n🎉 Исправление завершено!`);
console.log(`📊 Обработано файлов: ${totalFiles}`);
console.log(`✅ Исправлено файлов: ${fixedFiles}`);
console.log(`🔄 Всего исправлений: ${totalFixes}`); 