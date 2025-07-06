#!/usr/bin/env node

/**
 * Скрипт для локализации PageTable компонента
 * Автоматически добавляет useTranslation и заменяет захардкоженные тексты на переводы
 */

const fs = require('fs');
const path = require('path');

// Путь к PageTable компоненту
const PAGETABLE_PATH = 'src/components/common/PageTable/PageTable.tsx';

// Замены для локализации
const REPLACEMENTS = [
  // Основные тексты
  {
    search: "'Действия'",
    replace: "t('components.pageTable.actions')",
    description: 'Заголовок колонки действий'
  },
  {
    search: '"Действия"',
    replace: "t('components.pageTable.actions')",
    description: 'Заголовок колонки действий (двойные кавычки)'
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
  // Ищем последний импорт React
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
  // Ищем начало компонента PageTable
  const componentRegex = /export const PageTable = <T,>\(\{[^}]*\}: PageTableProps<T>\) => \{/;
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
 * Обновляет useMemo dependencies
 */
function updateUseMemo(content) {
  // Ищем useMemo с columns и actions
  const useMemoRegex = /const enhancedColumns = useMemo\(\(\) => \{[\s\S]*?\}, \[columns, actions\]\);/;
  const match = content.match(useMemoRegex);
  
  if (match) {
    const updatedUseMemo = match[0].replace('[columns, actions]', '[columns, actions, t]');
    return content.replace(match[0], updatedUseMemo);
  }
  
  return content;
}

/**
 * Основная функция локализации
 */
function localizePageTable() {
  const filePath = path.join(process.cwd(), PAGETABLE_PATH);
  
  console.log('🚀 Начинаем локализацию PageTable компонента...');
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
  
  // Обновляем useMemo
  console.log('\n🔄 Обновляем useMemo dependencies...');
  content = updateUseMemo(content);
  
  // Сохраняем файл
  fs.writeFileSync(filePath, content);
  
  console.log('\n✅ Локализация PageTable завершена!');
  console.log(`📊 Всего замен: ${totalReplacements}`);
  console.log(`💾 Файл сохранен: ${filePath}`);
  
  return {
    file: PAGETABLE_PATH,
    replacements: totalReplacements,
    success: true
  };
}

// Запуск скрипта
if (require.main === module) {
  try {
    const result = localizePageTable();
    console.log('\n🎉 Скрипт выполнен успешно!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Ошибка выполнения скрипта:', error.message);
    process.exit(1);
  }
}

module.exports = { localizePageTable }; 