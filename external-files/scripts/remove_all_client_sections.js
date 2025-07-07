const fs = require('fs');
const path = require('path');

// Путь к файлу ru.json
const ruJsonPath = path.join(__dirname, '../../src/i18n/locales/ru.json');

try {
  // Читаем файл
  const ruJsonContent = fs.readFileSync(ruJsonPath, 'utf8');
  
  // Парсим JSON
  const ruData = JSON.parse(ruJsonContent);
  
  let sectionsRemoved = 0;
  
  // Проверяем, есть ли секция client в forms
  if (ruData.forms && ruData.forms.client) {
    console.log('✅ Найдена секция client в forms - удаляем...');
    delete ruData.forms.client;
    sectionsRemoved++;
  }
  
  // Проверяем, есть ли секция client на корневом уровне
  if (ruData.client) {
    console.log('✅ Найдена секция client на корневом уровне - удаляем...');
    delete ruData.client;
    sectionsRemoved++;
  }
  
  // Проверяем другие возможные места
  if (ruData.admin && ruData.admin.client) {
    console.log('✅ Найдена секция client в admin - удаляем...');
    delete ruData.admin.client;
    sectionsRemoved++;
  }
  
  if (sectionsRemoved > 0) {
    // Записываем обратно в файл
    fs.writeFileSync(ruJsonPath, JSON.stringify(ruData, null, 2), 'utf8');
    console.log(`✅ Удалено ${sectionsRemoved} секций client из ru.json`);
    console.log('📁 Теперь переводы будут браться из отдельного файла client-ru.json');
  } else {
    console.log('ℹ️ Секции client не найдены в ru.json');
  }
  
} catch (error) {
  console.error('❌ Ошибка при обработке файла:', error.message);
}