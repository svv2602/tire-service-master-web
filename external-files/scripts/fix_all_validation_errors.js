#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление всех ошибок валидации...');

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

// Функция для исправления всех проблем валидации
function fixValidationIssues(content) {
  let fixedContent = content;
  let fixCount = 0;
  
  // 1. Исправляем схемы валидации с t() функциями
  const validationSchemaPattern = /const validationSchema = (Yup|yup)\.object\(\{[\s\S]*?\}\);/g;
  const matches = fixedContent.match(validationSchemaPattern);
  
  if (matches) {
    matches.forEach(match => {
      if (match.includes("t('")) {
        // Создаем функцию, которая принимает t и возвращает схему
        const functionSchema = match.replace(
          /const validationSchema = (Yup|yup)\.object\(\{/,
          'const createValidationSchema = (t: any) => $1.object({'
        ).replace(/\}\);$/, '});');
        
        fixedContent = fixedContent.replace(match, functionSchema);
        fixCount++;
        console.log(`  ✅ Исправлена схема валидации с t() функциями`);
      }
    });
  }
  
  // 2. Обновляем использование validationSchema в formik
  if (fixCount > 0) {
    // Ищем использование validationSchema в formik
    fixedContent = fixedContent.replace(
      /validationSchema,(\s*)/g,
      'validationSchema: createValidationSchema(t),$1'
    );
    
    // Ищем другие использования
    fixedContent = fixedContent.replace(
      /validationSchema\./g,
      'createValidationSchema(t).'
    );
  }
  
  // 3. Исправляем отдельные вызовы t() в схемах валидации (если остались)
  // Заменяем на статичные строки для простоты
  const tCallReplacements = [
    [/t\('forms\.common\.required'\)/g, "'Обязательное поле'"],
    [/t\('forms\.client\.validation\.firstNameRequired'\)/g, "'Имя обязательно'"],
    [/t\('forms\.region\.validation\.nameRequired'\)/g, "'Название региона обязательно'"],
    [/t\('forms\.carBrand\.validation\.nameRequired'\)/g, "'Название бренда обязательно'"],
    [/t\('forms\.booking\.validation\.servicePointRequired'\)/g, "'Выберите точку обслуживания'"],
    [/t\('forms\.booking\.validation\.carTypeRequired'\)/g, "'Выберите тип автомобиля'"],
    [/t\('forms\.booking\.validation\.categoryRequired'\)/g, "'Выберите категорию услуг'"],
    [/t\('forms\.booking\.validation\.dateRequired'\)/g, "'Выберите дату'"],
    [/t\('forms\.booking\.validation\.startTimeRequired'\)/g, "'Выберите время начала'"],
    [/t\('forms\.servicePoint\.validation\.nameRequired'\)/g, "'Название точки обязательно'"],
    [/t\('forms\.servicePoint\.validation\.partnerRequired'\)/g, "'Партнер обязателен'"],
    [/t\('forms\.servicePoint\.validation\.regionRequired'\)/g, "'Регион обязателен'"],
    [/t\('forms\.servicePoint\.validation\.cityRequired'\)/g, "'Город обязателен'"]
  ];
  
  tCallReplacements.forEach(([regex, replacement]) => {
    const beforeReplace = fixedContent;
    fixedContent = fixedContent.replace(regex, replacement);
    if (beforeReplace !== fixedContent) {
      fixCount++;
      console.log(`  ✅ Заменен вызов t() на статичную строку`);
    }
  });
  
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
  const result = fixValidationIssues(content);
  
  if (result.count > 0) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    fixedFiles++;
    totalFixes += result.count;
    console.log(`✅ Всего исправлений: ${result.count}`);
  } else {
    console.log(`ℹ️  Нет проблем для исправления`);
  }
});

console.log(`\n🎉 Исправление завершено!`);
console.log(`📊 Обработано файлов: ${totalFiles}`);
console.log(`✅ Исправлено файлов: ${fixedFiles}`);
console.log(`🔄 Всего исправлений: ${totalFixes}`); 