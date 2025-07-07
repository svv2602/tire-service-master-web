const fs = require('fs');
const path = require('path');

console.log('🔧 Добавление недостающих переводов фильтров...');

// Недостающие переводы для русского языка
const ruFiltersTranslations = {
  filters: {
    region: "Регион",
    city: "Город", 
    partner: "Партнер",
    status: "Статус",
    allRegions: "Все регионы",
    allCities: "Все города",
    allPartners: "Все партнеры",
    allStatuses: "Все статусы"
  }
};

// Недостающие переводы для украинского языка
const ukFiltersTranslations = {
  filters: {
    region: "Регіон",
    city: "Місто",
    partner: "Партнер", 
    status: "Статус",
    allRegions: "Всі регіони",
    allCities: "Всі міста",
    allPartners: "Всі партнери",
    allStatuses: "Всі статуси"
  }
};

// Функция для добавления переводов
function addFiltersTranslations(filePath, filtersTranslations, language) {
  console.log(`📝 Обновление ${language} файла: ${filePath}`);
  
  // Читаем существующий файл
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Добавляем секцию filters в admin.servicePoints
  if (!data.admin) data.admin = {};
  if (!data.admin.servicePoints) data.admin.servicePoints = {};
  
  // Добавляем filters
  data.admin.servicePoints.filters = filtersTranslations.filters;
  
  // Создаем бэкап
  const backupPath = filePath.replace('.json', '_before_filters.json');
  fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
  console.log(`💾 Создан бэкап: ${backupPath}`);
  
  // Сохраняем обновленный файл
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${language} файл обновлен`);
  
  return data;
}

// Пути к файлам
const ruPath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukPath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Обновляем русский файл
const ruData = addFiltersTranslations(ruPath, ruFiltersTranslations, 'Русский');

// Обновляем украинский файл  
const ukData = addFiltersTranslations(ukPath, ukFiltersTranslations, 'Украинский');

// Проверяем результат
console.log('');
console.log('🔍 ПРОВЕРКА РЕЗУЛЬТАТА:');
console.log('');

console.log('📊 РУССКИЙ ФАЙЛ:');
console.log('admin.servicePoints.filters.allRegions:', ruData.admin?.servicePoints?.filters?.allRegions);
console.log('admin.servicePoints.filters.allCities:', ruData.admin?.servicePoints?.filters?.allCities);
console.log('admin.servicePoints.filters.allPartners:', ruData.admin?.servicePoints?.filters?.allPartners);
console.log('admin.servicePoints.filters.allStatuses:', ruData.admin?.servicePoints?.filters?.allStatuses);

console.log('');
console.log('📊 УКРАИНСКИЙ ФАЙЛ:');
console.log('admin.servicePoints.filters.allRegions:', ukData.admin?.servicePoints?.filters?.allRegions);
console.log('admin.servicePoints.filters.allCities:', ukData.admin?.servicePoints?.filters?.allCities);
console.log('admin.servicePoints.filters.allPartners:', ukData.admin?.servicePoints?.filters?.allPartners);
console.log('admin.servicePoints.filters.allStatuses:', ukData.admin?.servicePoints?.filters?.allStatuses);

console.log('');
console.log('🎉 Переводы фильтров добавлены успешно!'); 