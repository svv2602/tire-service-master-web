#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление схем валидации...');

// Список файлов для исправления
const filesToFix = [
  'src/pages/bookings/BookingFormPage.tsx',
  'src/pages/bookings/BookingFormPageWithAvailability.tsx',
  'src/pages/regions/RegionFormPage.tsx',
  'src/pages/clients/ClientFormPage.tsx',
  'src/pages/clients/ClientCarFormPage.tsx',
  'src/pages/service-points/ServicePointFormPage.tsx',
  'src/pages/car-brands/CarBrandFormPage.tsx'
];

// Функция для исправления схемы валидации
function fixValidationSchema(content) {
  // Паттерн для поиска схем валидации с t() функциями
  const validationSchemaPattern = /const validationSchema = yup\.object\(\{[\s\S]*?\}\);/g;
  
  let fixedContent = content;
  let fixCount = 0;
  
  // Находим все схемы валидации
  const matches = content.match(validationSchemaPattern);
  
  if (matches) {
    matches.forEach(match => {
      // Если в схеме есть вызовы t(), оборачиваем в функцию
      if (match.includes("t('")) {
        // Создаем функцию, которая принимает t и возвращает схему
        const functionSchema = match.replace(
          'const validationSchema = yup.object({',
          'const createValidationSchema = (t: any) => yup.object({'
        ).replace(/\}\);$/, '});');
        
        fixedContent = fixedContent.replace(match, functionSchema);
        fixCount++;
      }
    });
  }
  
  // Также нужно обновить использование схемы в formik
  if (fixCount > 0) {
    // Ищем использование validationSchema в formik
    fixedContent = fixedContent.replace(
      /validationSchema={validationSchema}/g,
      'validationSchema={createValidationSchema(t)}'
    );
    
    // Ищем использование в других местах
    fixedContent = fixedContent.replace(
      /validationSchema\./g,
      'createValidationSchema(t).'
    );
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
  const result = fixValidationSchema(content);
  
  if (result.count > 0) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    fixedFiles++;
    totalFixes += result.count;
    console.log(`✅ Исправлено схем валидации: ${result.count}`);
  } else {
    console.log(`ℹ️  Нет схем валидации для исправления`);
  }
});

console.log(`\n🎉 Исправление завершено!`);
console.log(`📊 Обработано файлов: ${totalFiles}`);
console.log(`✅ Исправлено файлов: ${fixedFiles}`);
console.log(`🔄 Всего исправлений: ${totalFixes}`); 