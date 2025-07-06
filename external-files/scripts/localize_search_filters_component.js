#!/usr/bin/env node

/**
 * Скрипт для локализации SearchAndFilters компонента
 * Автоматически добавляет useTranslation и заменяет захардкоженные тексты на переводы
 */

const fs = require('fs');
const path = require('path');

// Путь к SearchAndFilters компоненту
const SEARCH_FILTERS_PATH = 'src/components/common/PageTable/SearchAndFilters.tsx';

// Замены для локализации
const REPLACEMENTS = [
  // Поиск
  {
    search: "'Поиск'",
    replace: "t('components.searchAndFilters.search')",
    description: 'Заголовок поиска'
  },
  {
    search: '"Поиск"',
    replace: "t('components.searchAndFilters.search')",
    description: 'Заголовок поиска (двойные кавычки)'
  },
  {
    search: "'Очистить поиск'",
    replace: "t('components.searchAndFilters.clearSearch')",
    description: 'Кнопка очистки поиска'
  },
  {
    search: '"Очистить поиск"',
    replace: "t('components.searchAndFilters.clearSearch')",
    description: 'Кнопка очистки поиска (двойные кавычки)'
  },
  // Фильтры
  {
    search: "'Фильтры'",
    replace: "t('components.searchAndFilters.filters')",
    description: 'Заголовок фильтров'
  },
  {
    search: '"Фильтры"',
    replace: "t('components.searchAndFilters.filters')",
    description: 'Заголовок фильтров (двойные кавычки)'
  },
  {
    search: "'Показать фильтры'",
    replace: "t('components.searchAndFilters.showFilters')",
    description: 'Кнопка показать фильтры'
  },
  {
    search: '"Показать фильтры"',
    replace: "t('components.searchAndFilters.showFilters')",
    description: 'Кнопка показать фильтры (двойные кавычки)'
  },
  {
    search: "'Скрыть фильтры'",
    replace: "t('components.searchAndFilters.hideFilters')",
    description: 'Кнопка скрыть фильтры'
  },
  {
    search: '"Скрыть фильтры"',
    replace: "t('components.searchAndFilters.hideFilters')",
    description: 'Кнопка скрыть фильтры (двойные кавычки)'
  },
  {
    search: "'Очистить фильтры'",
    replace: "t('components.searchAndFilters.clearFilters')",
    description: 'Кнопка очистки фильтров'
  },
  {
    search: '"Очистить фильтры"',
    replace: "t('components.searchAndFilters.clearFilters')",
    description: 'Кнопка очистки фильтров (двойные кавычки)'
  }
];

/**
 * Проверяет наличие useTranslation в файле
 */
function hasUseTranslation(content) {
  return content.includes('useTranslation') && content.includes("from 'react-i18next'");
}

/**
 * Добавляет импорт useTranslation
 */
function addUseTranslationImport(content) {
  // Ищем импорт React
  const reactImportRegex = /import React[^;]*;/;
  const match = content.match(reactImportRegex);
  
  if (match) {
    const importStatement = "\nimport { useTranslation } from 'react-i18next';";
    return content.replace(match[0], match[0] + importStatement);
  }
  
  // Если не найден импорт React, добавляем в начало
  return "import { useTranslation } from 'react-i18next';\n" + content;
}

/**
 * Добавляет хук useTranslation в компонент
 */
function addUseTranslationHook(content) {
  // Ищем начало компонента SearchAndFilters
  const componentRegex = /export const SearchAndFilters: React\.FC<SearchAndFiltersProps> = \(\{[\s\S]*?\}\) => \{/;
  const match = content.match(componentRegex);
  
  if (match) {
    const hookStatement = "\n  const { t } = useTranslation();";
    return content.replace(match[0], match[0] + hookStatement);
  }
  
  return content;
}

/**
 * Применяет замены текстов
 */
function applyReplacements(content) {
  let modifiedContent = content;
  let totalReplacements = 0;
  
  REPLACEMENTS.forEach(replacement => {
    const regex = new RegExp(replacement.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = modifiedContent.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      modifiedContent = modifiedContent.replace(regex, replacement.replace);
      console.log(`✅ ${replacement.description}: ${count} замен`);
      totalReplacements += count;
    } else {
      console.log(`⚠️  ${replacement.description}: не найдено`);
    }
  });
  
  return { content: modifiedContent, totalReplacements };
}

/**
 * Основная функция локализации
 */
function localizeSearchAndFilters() {
  const filePath = path.join(process.cwd(), SEARCH_FILTERS_PATH);
  
  console.log('🚀 Начинаем локализацию SearchAndFilters компонента...');
  console.log(`📁 Файл: ${filePath}`);
  
  // Проверяем существование файла
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Файл не найден: ${filePath}`);
    process.exit(1);
  }
  
  // Читаем содержимое файла
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Прочитано ${content.length} символов`);
  
  // Проверяем, нужна ли локализация
  if (hasUseTranslation(content)) {
    console.log('ℹ️  useTranslation уже импортирован');
  } else {
    console.log('➕ Добавляем импорт useTranslation...');
    content = addUseTranslationImport(content);
    
    console.log('➕ Добавляем хук useTranslation...');
    content = addUseTranslationHook(content);
  }
  
  // Применяем замены
  console.log('\n🔄 Применяем замены текстов:');
  const { content: modifiedContent, totalReplacements } = applyReplacements(content);
  content = modifiedContent;
  
  // Сохраняем файл
  fs.writeFileSync(filePath, content);
  
  console.log('\n✅ Локализация SearchAndFilters завершена!');
  console.log(`📊 Всего замен: ${totalReplacements}`);
  console.log(`💾 Файл сохранен: ${filePath}`);
  
  return {
    file: SEARCH_FILTERS_PATH,
    replacements: totalReplacements,
    success: true
  };
}

// Запуск скрипта
if (require.main === module) {
  try {
    const result = localizeSearchAndFilters();
    console.log('\n🎉 Скрипт выполнен успешно!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Ошибка выполнения скрипта:', error.message);
    process.exit(1);
  }
}

module.exports = { localizeSearchAndFilters }; 