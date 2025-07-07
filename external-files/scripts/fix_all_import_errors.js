const fs = require('fs');
const path = require('path');

// Путь к компонентам шагов бронирования
const stepsPath = path.join(__dirname, '../../src/pages/bookings/components');

function fixAllImportErrors() {
  try {
    console.log('🔧 Исправляем все ошибки импортов в компонентах шагов...\n');
    
    const files = fs.readdirSync(stepsPath).filter(file => file.endsWith('.tsx'));
    let totalFixes = 0;
    
    files.forEach(fileName => {
      const filePath = path.join(stepsPath, fileName);
      let content = fs.readFileSync(filePath, 'utf8');
      let fileFixes = 0;
      
      // 1. Исправляем неправильные импорты React (различные варианты)
      const patterns = [
        // Паттерн 1: import React\nimport { useTranslation } from 'react-i18next'; from 'react';
        {
          from: /import React\nimport { useTranslation } from 'react-i18next'; from 'react';/g,
          to: "import React from 'react';\nimport { useTranslation } from 'react-i18next';",
          name: "неправильный импорт React (тип 1)"
        },
        
        // Паттерн 2: import React\nimport { useTranslation } from 'react-i18next';, { ... } from 'react';
        {
          from: /import React\nimport { useTranslation } from 'react-i18next';, { ([^}]+) } from 'react';/g,
          to: "import React, { $1 } from 'react';\nimport { useTranslation } from 'react-i18next';",
          name: "неправильный импорт React (тип 2)"
        },
        
        // Паттерн 3: import React, { ... }\nimport { useTranslation } from 'react-i18next'; from 'react';
        {
          from: /import React, { ([^}]+) }\nimport { useTranslation } from 'react-i18next'; from 'react';/g,
          to: "import React, { $1 } from 'react';\nimport { useTranslation } from 'react-i18next';",
          name: "неправильный импорт React (тип 3)"
        }
      ];
      
      patterns.forEach(pattern => {
        if (pattern.from.test(content)) {
          content = content.replace(pattern.from, pattern.to);
          console.log(`✅ ${fileName}: Исправлен ${pattern.name}`);
          fileFixes++;
        }
      });
      
      // 2. Исправляем дублированные импорты useTranslation
      const duplicatePattern = /import { useTranslation } from 'react-i18next';\s*import { useTranslation } from 'react-i18next';/g;
      if (duplicatePattern.test(content)) {
        content = content.replace(duplicatePattern, "import { useTranslation } from 'react-i18next';");
        console.log(`✅ ${fileName}: Удален дублированный импорт useTranslation`);
        fileFixes++;
      }
      
      // 3. Исправляем отсутствующие 'from' в импортах
      const missingFromPattern = /import React\s*$/gm;
      if (missingFromPattern.test(content)) {
        content = content.replace(missingFromPattern, "import React from 'react';");
        console.log(`✅ ${fileName}: Добавлен отсутствующий 'from' в импорте React`);
        fileFixes++;
      }
      
      // 4. Исправляем неправильные переводы в JSX
      const wrongTranslationPattern = /\{t\('([^']+)'\)\}/g;
      const wrongMatches = content.match(wrongTranslationPattern);
      if (wrongMatches) {
        content = content.replace(wrongTranslationPattern, "t('$1')");
        console.log(`✅ ${fileName}: Исправлено ${wrongMatches.length} неправильных переводов в JSX`);
        fileFixes += wrongMatches.length;
      }
      
      // 5. Исправляем JSX атрибуты без фигурных скобок
      const jsxAttributePattern = /(\w+)=t\('([^']+)'\)(?!\})/g;
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
    console.log(`\n✅ Исправление всех ошибок импортов завершено!`);
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении ошибок импортов:', error);
  }
}

// Запуск скрипта
fixAllImportErrors(); 