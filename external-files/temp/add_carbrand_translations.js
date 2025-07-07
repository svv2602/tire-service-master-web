const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruPath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukPath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Недостающие переводы для русского языка
const newRuTranslations = {
  "nameMax": "Название не должно превышать 100 символов",
  "logo": "Логотип бренда",
  "sections": {
    "brandInfo": "Информация о бренде"
  },
  "buttons": {
    "uploadLogo": "Загрузить лого"
  },
  "messages": {
    "createSuccess": "Бренд успешно создан",
    "updateSuccess": "Бренд успешно обновлен",
    "saveError": "Произошла ошибка при сохранении",
    "validationError": "Ошибка валидации данных. Проверьте правильность заполнения всех полей.",
    "fileSizeError": "Размер файла не должен превышать 1MB",
    "fileTypeError": "Поддерживаются только изображения в форматах JPEG, PNG",
    "logoRequirements": "Поддерживаются форматы: JPEG, PNG. Максимальный размер: 1MB"
  }
};

// Переводы для украинского языка
const newUkTranslations = {
  "nameMax": "Назва не повинна перевищувати 100 символів",
  "logo": "Логотип бренду",
  "sections": {
    "brandInfo": "Інформація про бренд"
  },
  "buttons": {
    "uploadLogo": "Завантажити лого"
  },
  "messages": {
    "createSuccess": "Бренд успішно створено",
    "updateSuccess": "Бренд успішно оновлено",
    "saveError": "Сталася помилка при збереженні",
    "validationError": "Помилка валідації даних. Перевірте правильність заповнення всіх полів.",
    "fileSizeError": "Розмір файлу не повинен перевищувати 1MB",
    "fileTypeError": "Підтримуються тільки зображення у форматах JPEG, PNG",
    "logoRequirements": "Підтримуються формати: JPEG, PNG. Максимальний розмір: 1MB"
  }
};

function addTranslations(filePath, newTranslations, language) {
  try {
    // Читаем существующий файл
    const data = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(data);
    
    // Находим секцию forms.carBrand
    if (!translations.forms || !translations.forms.carBrand) {
      console.error(`Секция forms.carBrand не найдена в ${language} файле`);
      return;
    }
    
    const carBrandSection = translations.forms.carBrand;
    
    // Добавляем недостающие переводы
    Object.keys(newTranslations).forEach(key => {
      if (key === 'sections' || key === 'buttons' || key === 'messages') {
        // Для вложенных объектов
        if (!carBrandSection[key]) {
          carBrandSection[key] = {};
        }
        Object.assign(carBrandSection[key], newTranslations[key]);
      } else {
        // Для простых ключей в validation
        if (!carBrandSection.validation) {
          carBrandSection.validation = {};
        }
        carBrandSection.validation[key] = newTranslations[key];
      }
    });
    
    // Также добавляем поле logo в fields если его нет
    if (!carBrandSection.fields.logo) {
      carBrandSection.fields.logo = newTranslations.logo;
    }
    
    // Записываем обновленный файл
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
    console.log(`✅ Добавлены переводы для carBrand в ${language} файл`);
    
    // Выводим добавленные ключи
    console.log(`📝 Добавленные ключи для ${language}:`);
    console.log(`   - forms.carBrand.validation.nameMax`);
    console.log(`   - forms.carBrand.fields.logo`);
    console.log(`   - forms.carBrand.sections.brandInfo`);
    console.log(`   - forms.carBrand.buttons.uploadLogo`);
    console.log(`   - forms.carBrand.messages.*`);
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${language} файла:`, error.message);
  }
}

// Основная функция
function main() {
  console.log('🚀 Добавление недостающих переводов для формы марок автомобилей...\n');
  
  // Добавляем переводы в русский файл
  addTranslations(ruPath, newRuTranslations, 'русский');
  
  // Добавляем переводы в украинский файл  
  addTranslations(ukPath, newUkTranslations, 'украинский');
  
  console.log('\n✅ Все переводы для CarBrandFormPage добавлены!');
  console.log('📋 Теперь форма полностью локализована на русском и украинском языках.');
}

// Запуск скрипта
main();
