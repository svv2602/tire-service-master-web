#!/usr/bin/env node

/**
 * Скрипт для исправления ошибок локализации
 * Исправляет синтаксические ошибки после автоматической замены
 */

const fs = require('fs');
const path = require('path');

// Файлы с ошибками
const FILES_TO_FIX = [
  'src/pages/articles/ArticlesPage.tsx',
  'src/pages/services/ServicesPage.tsx',
  'src/pages/regions/RegionsPage.tsx',
  'src/pages/service-points/ServicePointsPage.tsx'
];

function fixJSXAttributes(content) {
  // Исправляем title=t('...') -> title={t('...')}
  content = content.replace(/title=t\(/g, 'title={t(');
  content = content.replace(/label=t\(/g, 'label={t(');
  
  // Находим и исправляем незакрытые фигурные скобки
  content = content.replace(/title=\{t\('([^']+)'\)\}>/g, 'title={t(\'$1\')}>');
  content = content.replace(/label=\{t\('([^']+)'\)\}>/g, 'label={t(\'$1\')}>');
  
  return content;
}

function addMissingImports(content) {
  // Проверяем, есть ли импорт useTranslation
  if (!content.includes('import { useTranslation }')) {
    // Ищем последний импорт из @mui/material
    const muiImportMatch = content.match(/} from '@mui\/material';/);
    if (muiImportMatch) {
      content = content.replace(
        /} from '@mui\/material';/,
        `} from '@mui/material';\nimport { useTranslation } from 'react-i18next';`
      );
    }
  }
  
  return content;
}

function addUseTranslationHook(content) {
  // Проверяем, есть ли хук useTranslation
  if (!content.includes('const { t } = useTranslation();')) {
    // Ищем const navigate = useNavigate();
    const navigateMatch = content.match(/const navigate = useNavigate\(\);/);
    if (navigateMatch) {
      content = content.replace(
        /const navigate = useNavigate\(\);/,
        `const navigate = useNavigate();\n  const { t } = useTranslation();`
      );
    }
  }
  
  return content;
}

function fixUseMemoHooks(content) {
  // Исправляем зависимости useMemo, добавляя 't' если его нет
  content = content.replace(
    /\], \[([^\]]*)\]\);/g,
    (match, deps) => {
      if (!deps.includes('t') && deps.trim() !== '') {
        return `], [${deps}, t]);`;
      } else if (deps.trim() === '') {
        return `], [t]);`;
      }
      return match;
    }
  );
  
  return content;
}

function fixSpecificErrors(content, filePath) {
  // Специфичные исправления для разных файлов
  
  if (filePath.includes('ArticlesPage.tsx')) {
    // Исправляем проблемы с ArticlesPage
    content = content.replace(
      /const ArticlesPage: React\.FC = \(\) => \{/,
      'const ArticlesPage: React.FC = () => {'
    );
  }
  
  if (filePath.includes('ServicesPage.tsx')) {
    // Исправляем проблемы с ServicesPage
    content = content.replace(
      /const ServicesPage: React\.FC = \(\) => \{/,
      'const ServicesPage: React.FC = () => {'
    );
  }
  
  return content;
}

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '../..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Файл не найден: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`🔧 Исправляю: ${filePath}`);
    
    // 1. Добавить импорт useTranslation если нужно
    content = addMissingImports(content);
    
    // 2. Добавить хук useTranslation если нужно
    content = addUseTranslationHook(content);
    
    // 3. Исправить JSX атрибуты
    content = fixJSXAttributes(content);
    
    // 4. Исправить зависимости useMemo
    content = fixUseMemoHooks(content);
    
    // 5. Специфичные исправления
    content = fixSpecificErrors(content, filePath);
    
    // Записать исправленный файл
    fs.writeFileSync(fullPath, content, 'utf8');
    
    console.log(`✅ Исправлен: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при исправлении ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Начинаю исправление ошибок локализации...\n');
  
  let successCount = 0;
  let totalCount = FILES_TO_FIX.length;
  
  for (const filePath of FILES_TO_FIX) {
    if (fixFile(filePath)) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Результат: ${successCount}/${totalCount} файлов успешно исправлены`);
  
  if (successCount === totalCount) {
    console.log('🎉 Все ошибки локализации исправлены!');
  } else {
    console.log('⚠️ Некоторые файлы не удалось исправить. Проверьте ошибки выше.');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fixFile,
  FILES_TO_FIX
}; 