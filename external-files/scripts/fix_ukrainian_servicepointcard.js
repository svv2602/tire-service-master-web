const fs = require('fs');
const path = require('path');

// Исправление структуры украинского файла переводов
const fixUkrainianServicePointCard = () => {
  const ukFilePath = path.join(__dirname, '../../src/i18n/locales/components/uk.json');
  const ruFilePath = path.join(__dirname, '../../src/i18n/locales/components/ru.json');
  
  try {
    // Читаем оба файла
    const ukContent = fs.readFileSync(ukFilePath, 'utf8');
    const ruContent = fs.readFileSync(ruFilePath, 'utf8');
    
    const ukData = JSON.parse(ukContent);
    const ruData = JSON.parse(ruContent);
    
    console.log('🔍 Анализ украинского файла...');
    
    // Проверяем структуру украинского файла
    const hasClientSearchPageCard = ukData.clientSearchPage && ukData.clientSearchPage.servicePointCard;
    const hasGlobalCard = ukData.servicePointCard;
    
    if (hasClientSearchPageCard && !hasGlobalCard) {
      console.log('🔧 Исправляем структуру украинского файла...');
      
      // Создаем бэкап
      const backupPath = ukFilePath + '.backup.' + Date.now();
      fs.writeFileSync(backupPath, ukContent);
      console.log(`📦 Создан бэкап: ${backupPath}`);
      
      // Копируем servicePointCard из clientSearchPage на глобальный уровень
      ukData.servicePointCard = ukData.clientSearchPage.servicePointCard;
      
      // Удаляем дублирующую секцию из clientSearchPage
      delete ukData.clientSearchPage.servicePointCard;
      
      console.log('✅ Структура исправлена:');
      console.log('   - Создана глобальная секция servicePointCard');
      console.log('   - Удалена дублирующая секция из clientSearchPage');
      
      // Сохраняем исправленный файл
      const newContent = JSON.stringify(ukData, null, 2);
      fs.writeFileSync(ukFilePath, newContent);
      
      console.log('💾 Файл сохранен успешно!');
      return true;
      
    } else if (hasGlobalCard) {
      console.log('✅ Украинский файл уже имеет правильную структуру');
      return false;
    } else {
      console.log('❌ Не найдена секция servicePointCard в украинском файле');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Ошибка при обработке файлов:', error.message);
    return false;
  }
};

// Проверка синхронизации переводов
const checkTranslationSync = () => {
  const ukFilePath = path.join(__dirname, '../../src/i18n/locales/components/uk.json');
  const ruFilePath = path.join(__dirname, '../../src/i18n/locales/components/ru.json');
  
  try {
    const ukContent = fs.readFileSync(ukFilePath, 'utf8');
    const ruContent = fs.readFileSync(ruFilePath, 'utf8');
    
    const ukData = JSON.parse(ukContent);
    const ruData = JSON.parse(ruContent);
    
    console.log('\n🔍 Проверка синхронизации переводов...');
    
    const ukKeys = Object.keys(ukData.servicePointCard || {});
    const ruKeys = Object.keys(ruData.servicePointCard || {});
    
    const missingInUk = ruKeys.filter(key => !ukKeys.includes(key));
    const missingInRu = ukKeys.filter(key => !ruKeys.includes(key));
    
    if (missingInUk.length === 0 && missingInRu.length === 0) {
      console.log('✅ Переводы синхронизированы');
    } else {
      console.log('⚠️ Найдены различия в переводах:');
      if (missingInUk.length > 0) {
        console.log('   Отсутствуют в UK:', missingInUk);
      }
      if (missingInRu.length > 0) {
        console.log('   Отсутствуют в RU:', missingInRu);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке синхронизации:', error.message);
  }
};

// Запуск исправлений
console.log('🚀 Исправление украинского файла переводов...\n');

const fixed = fixUkrainianServicePointCard();
checkTranslationSync();

if (fixed) {
  console.log('\n✅ ИСПРАВЛЕНИЯ ЗАВЕРШЕНЫ УСПЕШНО!');
  console.log('📋 Что было сделано:');
  console.log('   1. Создана глобальная секция servicePointCard в украинском файле');
  console.log('   2. Удалена дублирующая секция из clientSearchPage');
  console.log('   3. Создан бэкап исходного файла');
  console.log('\n⚡ Теперь переводы должны работать корректно на обоих языках!');
} else {
  console.log('\n❌ Исправления не требуются или произошла ошибка');
} 