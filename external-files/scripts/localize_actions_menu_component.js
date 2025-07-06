#!/usr/bin/env node

/**
 * Скрипт для локализации ActionsMenu компонента
 * Автоматически добавляет useTranslation и заменяет захардкоженные тексты на переводы
 */

const fs = require('fs');
const path = require('path');

// Путь к ActionsMenu компоненту
const ACTIONS_MENU_PATH = 'src/components/ui/ActionsMenu/ActionsMenu.tsx';

// Замены для локализации
const REPLACEMENTS = [
  // Диалог подтверждения
  {
    search: "'Подтверждение'",
    replace: "t('components.confirmDialog.title')",
    description: 'Заголовок диалога подтверждения'
  },
  {
    search: '"Подтверждение"',
    replace: "t('components.confirmDialog.title')",
    description: 'Заголовок диалога подтверждения (двойные кавычки)'
  },
  {
    search: "'Вы действительно хотите выполнить это действие?'",
    replace: "t('components.confirmDialog.message')",
    description: 'Сообщение диалога подтверждения'
  },
  {
    search: '"Вы действительно хотите выполнить это действие?"',
    replace: "t('components.confirmDialog.message')",
    description: 'Сообщение диалога подтверждения (двойные кавычки)'
  },
  {
    search: "'Подтвердить'",
    replace: "t('components.confirmDialog.confirm')",
    description: 'Кнопка подтверждения'
  },
  {
    search: '"Подтвердить"',
    replace: "t('components.confirmDialog.confirm')",
    description: 'Кнопка подтверждения (двойные кавычки)'
  },
  {
    search: "'Отменить'",
    replace: "t('components.confirmDialog.cancel')",
    description: 'Кнопка отмены'
  },
  {
    search: '"Отменить"',
    replace: "t('components.confirmDialog.cancel')",
    description: 'Кнопка отмены (двойные кавычки)'
  },
  // Значения по умолчанию
  {
    search: "confirmLabel || 'Подтвердить'",
    replace: "confirmLabel || t('components.confirmDialog.confirm')",
    description: 'Значение по умолчанию для кнопки подтверждения'
  },
  {
    search: "cancelLabel || 'Отменить'",
    replace: "cancelLabel || t('components.confirmDialog.cancel')",
    description: 'Значение по умолчанию для кнопки отмены'
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
  // Ищем начало компонента ActionsMenu
  const componentRegex = /export const ActionsMenu = <T,>\(\{[\s\S]*?\}: ActionsMenuProps<T>\) => \{/;
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
function localizeActionsMenu() {
  const filePath = path.join(process.cwd(), ACTIONS_MENU_PATH);
  
  console.log('🚀 Начинаем локализацию ActionsMenu компонента...');
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
  
  console.log('\n✅ Локализация ActionsMenu завершена!');
  console.log(`📊 Всего замен: ${totalReplacements}`);
  console.log(`💾 Файл сохранен: ${filePath}`);
  
  return {
    file: ACTIONS_MENU_PATH,
    replacements: totalReplacements,
    success: true
  };
}

// Запуск скрипта
if (require.main === module) {
  try {
    const result = localizeActionsMenu();
    console.log('\n🎉 Скрипт выполнен успешно!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Ошибка выполнения скрипта:', error.message);
    process.exit(1);
  }
}

module.exports = { localizeActionsMenu }; 