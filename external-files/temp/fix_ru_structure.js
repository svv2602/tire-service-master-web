const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление структуры русского файла...');

// Читаем исходный файл
const ruPath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ruData = JSON.parse(fs.readFileSync(ruPath, 'utf8'));

console.log('📋 Исходная структура:');
console.log('Ключи верхнего уровня:', Object.keys(ruData));

// Ищем секцию tables внутри forms
let tablesSection = null;
let statusesSection = null;
let filtersSection = null;
let notificationsSection = null;
let errorsSection = null;
let componentsSection = null;

// Проходим по всем секциям и ищем tables
function findSections(obj, path = '') {
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'tables' && typeof value === 'object' && value.columns) {
      console.log(`✅ Найдена секция tables по пути: ${path}.${key}`);
      tablesSection = value;
    }
    if (key === 'statuses' && typeof value === 'object' && value.active) {
      console.log(`✅ Найдена секция statuses по пути: ${path}.${key}`);
      statusesSection = value;
    }
    if (key === 'filters' && typeof value === 'object' && value.all) {
      console.log(`✅ Найдена секция filters по пути: ${path}.${key}`);
      filtersSection = value;
    }
    if (key === 'notifications' && typeof value === 'object' && value.success) {
      console.log(`✅ Найдена секция notifications по пути: ${path}.${key}`);
      notificationsSection = value;
    }
    if (key === 'errors' && typeof value === 'object' && value.required) {
      console.log(`✅ Найдена секция errors по пути: ${path}.${key}`);
      errorsSection = value;
    }
    if (key === 'components' && typeof value === 'object') {
      console.log(`✅ Найдена секция components по пути: ${path}.${key}`);
      componentsSection = value;
    }
    
    if (typeof value === 'object' && value !== null) {
      findSections(value, path ? `${path}.${key}` : key);
    }
  }
}

findSections(ruData);

if (!tablesSection) {
  console.error('❌ Секция tables не найдена!');
  process.exit(1);
}

// Удаляем секции из вложенных объектов
function removeSections(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'tables' || key === 'statuses' || key === 'filters' || 
        key === 'notifications' || key === 'errors' || key === 'components') {
      delete obj[key];
      console.log(`🗑️ Удалена секция ${key} из вложенного объекта`);
    } else if (typeof value === 'object' && value !== null) {
      removeSections(value);
    }
  }
}

removeSections(ruData);

// Добавляем секции на корневой уровень
ruData.tables = tablesSection;
console.log('✅ Секция tables добавлена на корневой уровень');

if (statusesSection) {
  ruData.statuses = statusesSection;
  console.log('✅ Секция statuses добавлена на корневой уровень');
}

if (filtersSection) {
  ruData.filters = filtersSection;
  console.log('✅ Секция filters добавлена на корневой уровень');
}

if (notificationsSection) {
  ruData.notifications = notificationsSection;
  console.log('✅ Секция notifications добавлена на корневой уровень');
}

if (errorsSection) {
  ruData.errors = errorsSection;
  console.log('✅ Секция errors добавлена на корневой уровень');
}

if (componentsSection) {
  ruData.components = componentsSection;
  console.log('✅ Секция components добавлена на корневой уровень');
}

console.log('📋 Новая структура:');
console.log('Ключи верхнего уровня:', Object.keys(ruData));

// Создаем бэкап
const backupPath = path.join(__dirname, 'ru_before_fix.json');
fs.writeFileSync(backupPath, fs.readFileSync(ruPath, 'utf8'));
console.log('💾 Создан бэкап:', backupPath);

// Сохраняем исправленный файл
fs.writeFileSync(ruPath, JSON.stringify(ruData, null, 2));
console.log('✅ Русский файл исправлен!');

// Проверяем результат
const fixedData = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
console.log('🔍 Проверка:');
console.log('tables.columns.name:', fixedData.tables?.columns?.name);
console.log('tables.columns.city:', fixedData.tables?.columns?.city);
console.log('tables.columns.actions:', fixedData.tables?.columns?.actions); 