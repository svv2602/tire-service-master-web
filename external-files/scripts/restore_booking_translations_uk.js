const fs = require('fs');
const path = require('path');

// Функция для восстановления украинских переводов бронирования
function restoreBookingTranslations() {
  console.log('🔄 Начинаем восстановление украинских переводов для страницы /client/booking...');

  // Пути к файлам
  const backupFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json.backup');
  const currentFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

  try {
    // Читаем резервную копию
    console.log('📖 Читаем резервную копию uk.json.backup...');
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    
    // Читаем текущий файл
    console.log('📖 Читаем текущий файл uk.json...');
    const currentData = JSON.parse(fs.readFileSync(currentFilePath, 'utf8'));

    // Извлекаем переводы бронирования из резервной копии
    const bookingTranslations = {
      booking: backupData.booking,
      bookingSteps: backupData.bookingSteps,
    };

    console.log('📋 Найденные переводы для восстановления:');
    console.log('- booking:', Object.keys(bookingTranslations.booking || {}).length, 'ключей');
    console.log('- bookingSteps:', Object.keys(bookingTranslations.bookingSteps || {}).length, 'ключей');

    // Объединяем с текущими данными
    const updatedData = {
      ...currentData,
      ...bookingTranslations
    };

    // Создаем резервную копию текущего файла
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupCurrentPath = path.join(__dirname, `../../src/i18n/locales/uk.json.backup.${timestamp}`);
    
    console.log('💾 Создаем резервную копию текущего файла...');
    fs.writeFileSync(backupCurrentPath, JSON.stringify(currentData, null, 2), 'utf8');

    // Записываем обновленные данные
    console.log('✍️ Записываем восстановленные переводы...');
    fs.writeFileSync(currentFilePath, JSON.stringify(updatedData, null, 2), 'utf8');

    console.log('✅ Украинские переводы для страницы /client/booking успешно восстановлены!');
    console.log('📁 Резервная копия сохранена в:', backupCurrentPath);
    
    // Выводим статистику
    const stats = {
      'booking.title': updatedData.booking?.title || 'НЕ НАЙДЕНО',
      'booking.steps.categorySelection': updatedData.booking?.steps?.categorySelection || 'НЕ НАЙДЕНО',
      'bookingSteps.clientInfo.title': updatedData.bookingSteps?.clientInfo?.title || 'НЕ НАЙДЕНО',
      'bookingSteps.dateTime.title': updatedData.bookingSteps?.dateTime?.title || 'НЕ НАЙДЕНО',
      'bookingSteps.review.title': updatedData.bookingSteps?.review?.title || 'НЕ НАЙДЕНО'
    };

    console.log('\n📊 Проверка ключевых переводов:');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  ${key}: "${value}"`);
    });

  } catch (error) {
    console.error('❌ Ошибка при восстановлении переводов:', error.message);
    process.exit(1);
  }
}

// Запускаем восстановление
restoreBookingTranslations(); 