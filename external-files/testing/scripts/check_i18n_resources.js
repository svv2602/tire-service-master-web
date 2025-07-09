const fs = require('fs');
const path = require('path');

// Функция для глубокого объединения
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

console.log('🔍 Проверка ресурсов i18n...\n');

try {
  // Загружаем основные файлы переводов
  const ruTranslations = require('../../../src/i18n/locales/ru.json');
  const ukTranslations = require('../../../src/i18n/locales/uk.json');
  
  // Загружаем файлы форм
  const clientAdminRu = require('../../../src/i18n/locales/forms/client-admin/client-ru.json');
  const clientAdminUk = require('../../../src/i18n/locales/forms/client-admin/client-uk.json');
  
  console.log('✅ Все файлы загружены успешно\n');
  
  // Проверяем структуру в client-admin файлах
  console.log('📁 Структура client-admin-ru.json:');
  console.log('- admin.clients.cars.form существует:', !!clientAdminRu.admin?.clients?.cars?.form);
  console.log('- admin.clients.cars.form.title существует:', !!clientAdminRu.admin?.clients?.cars?.form?.title);
  console.log('- admin.clients.cars.form.title.createHeader:', clientAdminRu.admin?.clients?.cars?.form?.title?.createHeader);
  
  console.log('\n📁 Структура client-admin-uk.json:');
  console.log('- admin.clients.cars.form существует:', !!clientAdminUk.admin?.clients?.cars?.form);
  console.log('- admin.clients.cars.form.title существует:', !!clientAdminUk.admin?.clients?.cars?.form?.title);
  console.log('- admin.clients.cars.form.title.createHeader:', clientAdminUk.admin?.clients?.cars?.form?.title?.createHeader);
  
  // Симулируем объединение как в i18n/index.ts
  const ruTranslationModules = [
    ruTranslations,
    clientAdminRu
  ];
  
  const ukTranslationModules = [
    ukTranslations,
    clientAdminUk
  ];
  
  console.log('\n🔗 Симуляция объединения...');
  
  const mergedRu = ruTranslationModules.reduce((acc, curr) => deepMerge(acc, curr), {});
  const mergedUk = ukTranslationModules.reduce((acc, curr) => deepMerge(acc, curr), {});
  
  console.log('\n📊 После объединения RU:');
  console.log('- admin.clients.cars.form существует:', !!mergedRu.admin?.clients?.cars?.form);
  console.log('- admin.clients.cars.form.title.createHeader:', mergedRu.admin?.clients?.cars?.form?.title?.createHeader);
  
  console.log('\n📊 После объединения UK:');
  console.log('- admin.clients.cars.form существует:', !!mergedUk.admin?.clients?.cars?.form);
  console.log('- admin.clients.cars.form.title.createHeader:', mergedUk.admin?.clients?.cars?.form?.title?.createHeader);
  
  // Проверяем конфликты ключей
  console.log('\n⚠️  Проверка конфликтов в RU:');
  if (ruTranslations.admin && clientAdminRu.admin) {
    console.log('- Конфликт admin секции между ru.json и client-admin-ru.json');
  }
  
  // Сохраняем объединенные данные для анализа
  fs.writeFileSync(
    path.join(__dirname, 'merged-ru-debug.json'), 
    JSON.stringify(mergedRu, null, 2)
  );
  
  fs.writeFileSync(
    path.join(__dirname, 'merged-uk-debug.json'), 
    JSON.stringify(mergedUk, null, 2)
  );
  
  console.log('\n💾 Объединенные данные сохранены в merged-*-debug.json');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  console.error('Путь:', error.path || 'неизвестно');
} 