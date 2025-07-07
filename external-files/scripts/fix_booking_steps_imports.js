const fs = require('fs');
const path = require('path');

// Путь к компонентам шагов бронирования
const stepsPath = path.join(__dirname, '../../src/pages/bookings/components');

function fixBookingStepsImports() {
  try {
    console.log('🔧 Исправляем синтаксические ошибки в импортах компонентов шагов...\n');
    
    const files = fs.readdirSync(stepsPath).filter(file => file.endsWith('.tsx'));
    let totalFixes = 0;
    
    files.forEach(fileName => {
      const filePath = path.join(stepsPath, fileName);
      let content = fs.readFileSync(filePath, 'utf8');
      let fileFixes = 0;
      
      // Исправляем неправильные импорты React
      const wrongImportPattern = /import React\nimport { useTranslation } from 'react-i18next';, { ([^}]+) } from 'react';/g;
      if (wrongImportPattern.test(content)) {
        content = content.replace(wrongImportPattern, "import React, { $1 } from 'react';\nimport { useTranslation } from 'react-i18next';");
        console.log(`✅ ${fileName}: Исправлен импорт React`);
        fileFixes++;
      }
      
      // Исправляем дублированные импорты useTranslation
      const duplicateUseTranslationPattern = /import { useTranslation } from 'react-i18next';\s*import { useTranslation } from 'react-i18next';/g;
      if (duplicateUseTranslationPattern.test(content)) {
        content = content.replace(duplicateUseTranslationPattern, "import { useTranslation } from 'react-i18next';");
        console.log(`✅ ${fileName}: Удален дублированный импорт useTranslation`);
        fileFixes++;
      }
      
      // Исправляем неправильные переводы в фигурных скобках
      const wrongTranslationPattern = /\{t\('([^']+)'\)\}/g;
      const wrongMatches = content.match(wrongTranslationPattern);
      if (wrongMatches) {
        content = content.replace(wrongTranslationPattern, "t('$1')");
        console.log(`✅ ${fileName}: Исправлено ${wrongMatches.length} неправильных переводов`);
        fileFixes += wrongMatches.length;
      }
      
      // Исправляем JSX атрибуты без фигурных скобок
      const jsxAttributePattern = /(\w+)=t\('([^']+)'\)/g;
      const jsxMatches = content.match(jsxAttributePattern);
      if (jsxMatches) {
        content = content.replace(jsxAttributePattern, "$1={t('$2')}");
        console.log(`✅ ${fileName}: Исправлено ${jsxMatches.length} JSX атрибутов`);
        fileFixes += jsxMatches.length;
      }
      
      // Сохраняем файл если были изменения
      if (fileFixes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`📝 ${fileName}: ${fileFixes} исправлений\n`);
        totalFixes += fileFixes;
      } else {
        console.log(`➖ ${fileName}: исправления не требуются\n`);
      }
    });
    
    console.log(`🎯 РЕЗУЛЬТАТ:`);
    console.log(`🔧 Всего исправлений: ${totalFixes}`);
    console.log(`\n✅ Исправление синтаксических ошибок завершено!`);
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении синтаксических ошибок:', error);
  }
}

// Запуск скрипта
fixBookingStepsImports(); 