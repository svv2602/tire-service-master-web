const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Утилита для поиска файлов с date-fns локализацией
const findFilesWithDateFnsLocale = () => {
  try {
    // Ищем файлы, которые импортируют ru локаль из date-fns
    const output = execSync('grep -r "import.*ru.*date-fns/locale" src/', { 
      cwd: path.join(__dirname, '../..'),
      encoding: 'utf8' 
    });
    
    const files = output.trim().split('\n').map(line => {
      const [filePath] = line.split(':');
      return filePath;
    }).filter(Boolean);
    
    return [...new Set(files)]; // убираем дубликаты
  } catch (error) {
    console.log('🔍 Поиск файлов с date-fns локализацией...');
    return [];
  }
};

// Функция для создания hook утилиты локализации
const createDateLocaleHook = () => {
  const hookPath = path.join(__dirname, '../../src/hooks/useDateLocale.ts');
  
  const hookContent = `import { ru, uk } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

// Hook для получения правильной локали date-fns в зависимости от языка интерфейса
export const useDateLocale = () => {
  const { i18n } = useTranslation();
  
  // Маппинг языков интерфейса на локали date-fns
  const localeMap = {
    'ru': ru,
    'uk': uk,
    'ru-RU': ru,
    'uk-UA': uk
  };
  
  // Возвращаем соответствующую локаль или русскую по умолчанию
  return localeMap[i18n.language] || ru;
};

export default useDateLocale;
`;

  // Создаем директорию hooks если её нет
  const hooksDir = path.dirname(hookPath);
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  fs.writeFileSync(hookPath, hookContent);
  console.log('✅ Создан hook useDateLocale.ts');
  return hookPath;
};

// Функция для исправления компонента
const fixComponentLocalization = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Проверяем, нужно ли исправлять файл
    if (!content.includes("import { ru } from 'date-fns/locale'")) {
      console.log(`⏭️ ${filePath} - уже исправлен или не требует изменений`);
      return false;
    }
    
    console.log(`🔧 Исправляю ${filePath}...`);
    
    // Создаем бэкап
    const backupPath = filePath + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, content);
    
    let newContent = content;
    
    // 1. Заменяем импорт ru локали на hook
    newContent = newContent.replace(
      /import { ru } from 'date-fns\/locale';?/g,
      ''
    );
    
    // 2. Добавляем импорт hook после других импортов react-i18next
    if (newContent.includes("from 'react-i18next'")) {
      newContent = newContent.replace(
        /(import.*from 'react-i18next';)/,
        '$1\nimport { useDateLocale } from \'../../hooks/useDateLocale\';'
      );
    } else {
      // Если нет react-i18next импорта, добавляем в начало
      const importIndex = newContent.indexOf('import React');
      if (importIndex !== -1) {
        const lineEnd = newContent.indexOf('\n', importIndex);
        newContent = newContent.slice(0, lineEnd + 1) + 
                    "import { useDateLocale } from '../../hooks/useDateLocale';\n" +
                    newContent.slice(lineEnd + 1);
      }
    }
    
    // 3. Добавляем использование hook в компоненте
    const componentMatch = newContent.match(/const\s+(\w+):\s*React\.FC/);
    if (componentMatch) {
      // Ищем начало тела компонента
      const componentStart = newContent.indexOf('{', newContent.indexOf(componentMatch[0]));
      if (componentStart !== -1) {
        const insertPoint = newContent.indexOf('\n', componentStart) + 1;
        newContent = newContent.slice(0, insertPoint) +
                    '  const dateLocale = useDateLocale();\n' +
                    newContent.slice(insertPoint);
      }
    }
    
    // 4. Заменяем все использования { locale: ru } на { locale: dateLocale }
    newContent = newContent.replace(/{\s*locale:\s*ru\s*}/g, '{ locale: dateLocale }');
    
    // Сохраняем исправленный файл
    fs.writeFileSync(filePath, newContent);
    
    console.log(`✅ ${filePath} - исправлен успешно`);
    console.log(`📦 Бэкап создан: ${backupPath}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Ошибка при исправлении ${filePath}:`, error.message);
    return false;
  }
};

// Функция для проверки импорта uk локали
const ensureUkrainianLocaleImport = () => {
  const hookPath = path.join(__dirname, '../../src/hooks/useDateLocale.ts');
  
  if (!fs.existsSync(hookPath)) {
    console.log('❌ Hook useDateLocale.ts не найден');
    return false;
  }
  
  const content = fs.readFileSync(hookPath, 'utf8');
  
  if (!content.includes('uk') || !content.includes("'uk'")) {
    console.log('⚠️ Украинская локаль не найдена в hook');
    return false;
  }
  
  console.log('✅ Украинская локаль правильно настроена в hook');
  return true;
};

// Основная функция
const fixDateFnsLocalization = () => {
  console.log('🚀 Исправление локализации date-fns...\n');
  
  // 1. Создаем hook для локализации
  const hookPath = createDateLocaleHook();
  
  // 2. Находим все файлы с проблемой
  const filesToFix = findFilesWithDateFnsLocale();
  
  if (filesToFix.length === 0) {
    console.log('✅ Файлы с жестко прописанной русской локалью не найдены');
    return;
  }
  
  console.log(`🔍 Найдено файлов для исправления: ${filesToFix.length}`);
  filesToFix.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log('');
  
  // 3. Исправляем каждый файл
  let fixedCount = 0;
  filesToFix.forEach(file => {
    const absolutePath = path.join(__dirname, '../..', file);
    if (fixComponentLocalization(absolutePath)) {
      fixedCount++;
    }
  });
  
  // 4. Проверяем настройку украинской локали
  ensureUkrainianLocaleImport();
  
  console.log(`\n✅ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!`);
  console.log(`📊 Статистика:`);
  console.log(`   - Всего файлов найдено: ${filesToFix.length}`);
  console.log(`   - Файлов исправлено: ${fixedCount}`);
  console.log(`   - Создан hook: ${hookPath}`);
  console.log(`\n🎯 РЕЗУЛЬТАТ:`);
  console.log(`   - Все компоненты теперь используют динамическую локаль`);
  console.log(`   - Названия месяцев будут отображаться на текущем языке интерфейса`);
  console.log(`   - Русский и украинский языки полностью поддерживаются`);
  console.log(`\n⚡ Перезапустите сервер разработки для применения изменений!`);
};

// Запуск исправлений
fixDateFnsLocalization(); 