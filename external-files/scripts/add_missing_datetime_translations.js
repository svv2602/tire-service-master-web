const fs = require('fs');
const path = require('path');

// Недостающие переводы для forms.booking.dateTime
const dateTimeTranslations = {
  ru: {
    forms: {
      booking: {
        dateTime: {
          title: "Дата и время",
          selectServicePointFirst: "Сначала необходимо выбрать сервисную точку на предыдущем шаге",
          serviceUserMode: "Режим служебного пользователя",
          loadingServicePoint: "Загрузка...",
          servicePoint: "Сервисная точка",
          city: "г.",
          selectDate: "Выберите дату",
          proceedToTimeSelection: "Далее к выбору времени",
          selectTime: "Выберите время",
          fillRequiredFields: "Заполните все обязательные поля"
        }
      }
    }
  },
  uk: {
    forms: {
      booking: {
        dateTime: {
          title: "Дата і час",
          selectServicePointFirst: "Спочатку необхідно вибрати сервісну точку на попередньому кроці",
          serviceUserMode: "Режим службового користувача",
          loadingServicePoint: "Завантаження...",
          servicePoint: "Сервісна точка",
          city: "м.",
          selectDate: "Виберіть дату",
          proceedToTimeSelection: "Далі до вибору часу",
          selectTime: "Виберіть час",
          fillRequiredFields: "Заповніть всі обов'язкові поля"
        }
      }
    }
  }
};

// Функция для глубокого объединения объектов
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Основная функция
function addMissingDateTimeTranslations() {
  console.log('🔄 Добавляем недостающие переводы forms.booking.dateTime...');

  const localesDir = path.join(__dirname, '../../src/i18n/locales');
  
  // Обрабатываем русский файл
  const ruFilePath = path.join(localesDir, 'ru.json');
  const ukFilePath = path.join(localesDir, 'uk.json');

  try {
    // Русский файл
    console.log('📖 Обрабатываем русский файл...');
    const ruData = JSON.parse(fs.readFileSync(ruFilePath, 'utf8'));
    const updatedRuData = deepMerge(ruData, dateTimeTranslations.ru);
    
    // Создаем резервную копию
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRuPath = path.join(localesDir, `ru.json.backup.${timestamp}`);
    fs.writeFileSync(backupRuPath, JSON.stringify(ruData, null, 2), 'utf8');
    
    // Записываем обновленные данные
    fs.writeFileSync(ruFilePath, JSON.stringify(updatedRuData, null, 2), 'utf8');
    console.log('✅ Русский файл обновлен');

    // Украинский файл
    console.log('📖 Обрабатываем украинский файл...');
    const ukData = JSON.parse(fs.readFileSync(ukFilePath, 'utf8'));
    const updatedUkData = deepMerge(ukData, dateTimeTranslations.uk);
    
    // Создаем резервную копию
    const backupUkPath = path.join(localesDir, `uk.json.backup.${timestamp}`);
    fs.writeFileSync(backupUkPath, JSON.stringify(ukData, null, 2), 'utf8');
    
    // Записываем обновленные данные
    fs.writeFileSync(ukFilePath, JSON.stringify(updatedUkData, null, 2), 'utf8');
    console.log('✅ Украинский файл обновлен');

    console.log('✅ Недостающие переводы forms.booking.dateTime успешно добавлены!');
    console.log('📁 Резервные копии сохранены с timestamp:', timestamp);
    
    // Выводим добавленные ключи
    console.log('\n📋 Добавленные ключи:');
    const addedKeys = [
      'forms.booking.dateTime.title',
      'forms.booking.dateTime.selectServicePointFirst',
      'forms.booking.dateTime.serviceUserMode',
      'forms.booking.dateTime.loadingServicePoint',
      'forms.booking.dateTime.servicePoint',
      'forms.booking.dateTime.city',
      'forms.booking.dateTime.selectDate',
      'forms.booking.dateTime.proceedToTimeSelection',
      'forms.booking.dateTime.selectTime',
      'forms.booking.dateTime.fillRequiredFields'
    ];
    
    addedKeys.forEach(key => {
      console.log(`  - ${key}`);
    });

    console.log('\n🎯 Проверка ключевых переводов:');
    console.log(`  RU: forms.booking.dateTime.title = "${updatedRuData.forms?.booking?.dateTime?.title}"`);
    console.log(`  UK: forms.booking.dateTime.title = "${updatedUkData.forms?.booking?.dateTime?.title}"`);

  } catch (error) {
    console.error('❌ Ошибка при добавлении переводов:', error.message);
    process.exit(1);
  }
}

// Запускаем добавление переводов
addMissingDateTimeTranslations(); 