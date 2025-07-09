const fs = require('fs');
const path = require('path');

// Исправление дублирования секции servicePointCard в файле ru.json
const fixServicePointCardDuplication = () => {
  const filePath = path.join(__dirname, '../../src/i18n/locales/components/ru.json');
  
  try {
    // Читаем файл
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log('🔍 Анализ структуры файла ru.json...');
    
    // Проверяем наличие дублирования
    let hasClientSearchPageCard = false;
    let hasGlobalCard = false;
    
    if (data.clientSearchPage && data.clientSearchPage.servicePointCard) {
      hasClientSearchPageCard = true;
      console.log('❌ Найдена секция servicePointCard в clientSearchPage');
    }
    
    if (data.servicePointCard) {
      hasGlobalCard = true;
      console.log('✅ Найдена глобальная секция servicePointCard');
    }
    
    if (hasClientSearchPageCard && hasGlobalCard) {
      console.log('🚨 ОБНАРУЖЕНО ДУБЛИРОВАНИЕ!');
      
      // Создаем бэкап
      const backupPath = filePath + '.backup.' + Date.now();
      fs.writeFileSync(backupPath, content);
      console.log(`📦 Создан бэкап: ${backupPath}`);
      
      // Удаляем дублирующую секцию из clientSearchPage
      delete data.clientSearchPage.servicePointCard;
      console.log('🗑️ Удалена секция servicePointCard из clientSearchPage');
      
      // Сохраняем исправленный файл
      const newContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, newContent);
      
      console.log('✅ Файл исправлен успешно!');
      console.log('📊 Изменения:');
      console.log('   - Удалена дублирующая секция servicePointCard из clientSearchPage');
      console.log('   - Оставлена глобальная секция servicePointCard');
      
      return true;
    } else {
      console.log('ℹ️ Дублирование не обнаружено или отсутствует одна из секций');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Ошибка при обработке файла:', error.message);
    return false;
  }
};

// Проверка украинского файла на консистентность
const checkUkrainianFile = () => {
  const filePath = path.join(__dirname, '../../src/i18n/locales/components/uk.json');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log('\n🔍 Проверка украинского файла...');
    
    let hasClientSearchPageCard = false;
    let hasGlobalCard = false;
    
    if (data.clientSearchPage && data.clientSearchPage.servicePointCard) {
      hasClientSearchPageCard = true;
      console.log('⚠️ Найдена секция servicePointCard в clientSearchPage (UK)');
    }
    
    if (data.servicePointCard) {
      hasGlobalCard = true;
      console.log('✅ Найдена глобальная секция servicePointCard (UK)');
    }
    
    if (hasClientSearchPageCard && !hasGlobalCard) {
      console.log('🚨 В украинском файле servicePointCard только в clientSearchPage!');
      console.log('📝 Нужно добавить глобальную секцию servicePointCard');
    } else if (!hasClientSearchPageCard && hasGlobalCard) {
      console.log('✅ Украинский файл имеет правильную структуру');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке украинского файла:', error.message);
  }
};

// Запуск исправлений
console.log('🚀 Исправление дублирования servicePointCard...\n');

const fixed = fixServicePointCardDuplication();
checkUkrainianFile();

if (fixed) {
  console.log('\n✅ ИСПРАВЛЕНИЯ ЗАВЕРШЕНЫ УСПЕШНО!');
  console.log('📋 Что было сделано:');
  console.log('   1. Удалена дублирующая секция servicePointCard из clientSearchPage');
  console.log('   2. Оставлена глобальная секция servicePointCard с полными переводами');
  console.log('   3. Создан бэкап исходного файла');
  console.log('\n⚡ Теперь компонент ServicePointCard должен корректно отображать переводы!');
} else {
  console.log('\n❌ Исправления не требуются или произошла ошибка');
} 