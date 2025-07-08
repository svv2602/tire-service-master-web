const fs = require('fs');
const path = require('path');

// Функция для удаления секций partners и partner из основных файлов
function removePartnersSection(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Удаляем секции admin.partners и admin.partner
    if (data.admin && data.admin.partners) {
      console.log(`Удаляем admin.partners из ${filePath}`);
      delete data.admin.partners;
    }
    
    if (data.admin && data.admin.partner) {
      console.log(`Удаляем admin.partner из ${filePath}`);
      delete data.admin.partner;
    }
    
    if (data.admin && data.admin.partnerServicePoints) {
      console.log(`Удаляем admin.partnerServicePoints из ${filePath}`);
      delete data.admin.partnerServicePoints;
    }
    
    // Записываем обратно
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Обновлен файл: ${filePath}`);
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
  }
}

// Обрабатываем файлы
const ruPath = '../../src/i18n/locales/ru.json';
const ukPath = '../../src/i18n/locales/uk.json';

console.log('🔄 Удаление секций partners из основных файлов...');
removePartnersSection(ruPath);
removePartnersSection(ukPath);

console.log('✅ Миграция Partners раздела завершена!');
console.log('📋 Переводы перенесены в forms/partners/partners-ru.json и partners-uk.json');
