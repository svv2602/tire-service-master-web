const fs = require('fs');
const path = require('path');

// Функция для удаления секции clients из основных файлов
function removeClientsSection(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Удаляем секцию admin.clients
    if (data.admin && data.admin.clients) {
      console.log(`Удаляем admin.clients из ${filePath}`);
      delete data.admin.clients;
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

console.log('🔄 Удаление секции clients из основных файлов...');
removeClientsSection(ruPath);
removeClientsSection(ukPath);
console.log('✅ Готово!');
