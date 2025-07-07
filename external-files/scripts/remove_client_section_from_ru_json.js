const fs = require('fs');
const path = require('path');

// Путь к файлу ru.json
const ruJsonPath = path.join(__dirname, '../../src/i18n/locales/ru.json');

try {
  // Читаем файл
  const ruJsonContent = fs.readFileSync(ruJsonPath, 'utf8');
  
  // Парсим JSON
  const ruData = JSON.parse(ruJsonContent);
  
  // Проверяем, есть ли секция client
  if (ruData.forms && ruData.forms.client) {
    console.log('✅ Найдена секция client в forms - удаляем...');
    delete ruData.forms.client;
  }
  
  // Проверяем, есть ли секция client на корневом уровне
  if (ruData.client) {
    console.log('✅ Найдена секция client на корневом уровне - удаляем...');
    delete ruData.client;
  }
  
  // Записываем обратно в файл
  fs.writeFileSync(ruJsonPath, JSON.stringify(ruData, null, 2), 'utf8');
  
  console.log('✅ Секция client успешно удалена из ru.json');
  console.log('📁 Теперь переводы будут браться из отдельного файла client-ru.json');
  
} catch (error) {
  console.error('❌ Ошибка при обработке файла:', error.message);
}