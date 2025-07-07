const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruPath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukPath = path.join(__dirname, '../../src/i18n/locales/uk.json');

function addTranslations(filePath, language) {
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
    
    // Добавляем недостающие переводы в зависимости от языка
    if (language === 'русский') {
      // Добавляем в validation
      if (!carBrandSection.validation.nameMax) {
        carBrandSection.validation.nameMax = "Название не должно превышать 100 символов";
      }
      
      // Добавляем в fields
      if (!carBrandSection.fields.logo) {
        carBrandSection.fields.logo = "Логотип бренда";
      }
      
      // Добавляем sections
      if (!carBrandSection.sections) {
        carBrandSection.sections = {};
      }
      carBrandSection.sections.brandInfo = "Информация о бренде";
      
      // Добавляем buttons
      if (!carBrandSection.buttons) {
        carBrandSection.buttons = {};
      }
      carBrandSection.buttons.uploadLogo = "Загрузить лого";
      
      // Добавляем messages
      if (!carBrandSection.messages) {
        carBrandSection.messages = {};
      }
      Object.assign(carBrandSection.messages, {
        createSuccess: "Бренд успешно создан",
        updateSuccess: "Бренд успешно обновлен",
        saveError: "Произошла ошибка при сохранении",
        validationError: "Ошибка валидации данных. Проверьте правильность заполнения всех полей.",
        fileSizeError: "Размер файла не должен превышать 1MB",
        fileTypeError: "Поддерживаются только изображения в форматах JPEG, PNG",
        logoRequirements: "Поддерживаются форматы: JPEG, PNG. Максимальный размер: 1MB"
      });
      
    } else if (language === 'украинский') {
      // Добавляем в validation
      if (!carBrandSection.validation.nameMax) {
        carBrandSection.validation.nameMax = "Назва не повинна перевищувати 100 символів";
      }
      
      // Добавляем в fields
      if (!carBrandSection.fields.logo) {
        carBrandSection.fields.logo = "Логотип бренду";
      }
      
      // Добавляем sections
      if (!carBrandSection.sections) {
        carBrandSection.sections = {};
      }
      carBrandSection.sections.brandInfo = "Інформація про бренд";
      
      // Добавляем buttons
      if (!carBrandSection.buttons) {
        carBrandSection.buttons = {};
      }
      carBrandSection.buttons.uploadLogo = "Завантажити лого";
      
      // Добавляем messages
      if (!carBrandSection.messages) {
        carBrandSection.messages = {};
      }
      Object.assign(carBrandSection.messages, {
        createSuccess: "Бренд успішно створено",
        updateSuccess: "Бренд успішно оновлено",
        saveError: "Сталася помилка при збереженні",
        validationError: "Помилка валідації даних. Перевірте правильність заповнення всіх полів.",
        fileSizeError: "Розмір файлу не повинен перевищувати 1MB",
        fileTypeError: "Підтримуються тільки зображення у форматах JPEG, PNG",
        logoRequirements: "Підтримуються формати: JPEG, PNG. Максимальний розмір: 1MB"
      });
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
    console.log(`   - forms.carBrand.messages.* (7 ключей)`);
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${language} файла:`, error.message);
  }
}

// Основная функция
function main() {
  console.log('🚀 Добавление недостающих переводов для формы марок автомобилей...\n');
  
  // Добавляем переводы в русский файл
  addTranslations(ruPath, 'русский');
  
  // Добавляем переводы в украинский файл  
  addTranslations(ukPath, 'украинский');
  
  console.log('\n✅ Все переводы для CarBrandFormPage добавлены!');
  console.log('📋 Теперь форма полностью локализована на русском и украинском языках.');
}

// Запуск скрипта
main();
