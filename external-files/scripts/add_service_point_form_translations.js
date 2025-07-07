const fs = require('fs');
const path = require('path');

// Новые переводы для ServicePointFormPage
const newTranslations = {
  ru: {
    forms: {
      servicePoint: {
        steps: {
          basic: "Основная информация",
          location: "Местоположение", 
          contact: "Контакты",
          schedule: "Расписание",
          posts: "Посты обслуживания",
          services: "Услуги",
          photos: "Фотографии",
          settings: "Настройки"
        },
        validation: {
          nameRequired: "Название точки обязательно",
          partnerRequired: "Партнер обязателен",
          regionRequired: "Регион обязателен",
          cityRequired: "Город обязателен",
          addressRequired: "Адрес обязателен",
          phoneRequired: "Контактный телефон обязателен",
          workStatusRequired: "Статус работы обязателен"
        },
        photoUploadSuccess: "Фотография загружена успешно",
        cacheInvalidation: "Инвалидируем кэш RTK Query для фотографий и сервисной точки"
      }
    },
    errors: {
      authTokenNotFound: "Токен авторизации не найден",
      photoUploadError: "Ошибка загрузки фотографии"
    }
  },
  uk: {
    forms: {
      servicePoint: {
        steps: {
          basic: "Основна інформація",
          location: "Місцезнаходження",
          contact: "Контакти", 
          schedule: "Розклад",
          posts: "Пости обслуговування",
          services: "Послуги",
          photos: "Фотографії",
          settings: "Налаштування"
        },
        validation: {
          nameRequired: "Назва точки обов'язкова",
          partnerRequired: "Партнер обов'язковий",
          regionRequired: "Регіон обов'язковий",
          cityRequired: "Місто обов'язкове",
          addressRequired: "Адреса обов'язкова",
          phoneRequired: "Контактний телефон обов'язковий",
          workStatusRequired: "Статус роботи обов'язковий"
        },
        photoUploadSuccess: "Фотографію завантажено успішно",
        cacheInvalidation: "Інвалідуємо кеш RTK Query для фотографій та сервісної точки"
      }
    },
    errors: {
      authTokenNotFound: "Токен авторизації не знайдено",
      photoUploadError: "Помилка завантаження фотографії"
    }
  }
};

function addTranslations() {
  const localesDir = path.join(__dirname, '../../src/i18n/locales');
  
  ['ru', 'uk'].forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    
    console.log(`🔧 Добавляю переводы для ${lang}...`);
    
    try {
      // Читаем существующий файл
      const content = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(content);
      
      // Добавляем новые переводы
      const newLangTranslations = newTranslations[lang];
      
      // Добавляем steps в forms.servicePoint
      if (!translations.forms) translations.forms = {};
      if (!translations.forms.servicePoint) translations.forms.servicePoint = {};
      translations.forms.servicePoint.steps = newLangTranslations.forms.servicePoint.steps;
      translations.forms.servicePoint.validation = newLangTranslations.forms.servicePoint.validation;
      translations.forms.servicePoint.photoUploadSuccess = newLangTranslations.forms.servicePoint.photoUploadSuccess;
      translations.forms.servicePoint.cacheInvalidation = newLangTranslations.forms.servicePoint.cacheInvalidation;
      
      // Добавляем errors если их нет
      if (!translations.errors) translations.errors = {};
      translations.errors.authTokenNotFound = newLangTranslations.errors.authTokenNotFound;
      translations.errors.photoUploadError = newLangTranslations.errors.photoUploadError;
      
      // Сохраняем файл с правильным форматированием
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
      
      console.log(`✅ ${lang}.json обновлен`);
      
    } catch (error) {
      console.error(`❌ Ошибка при обновлении ${lang}.json:`, error);
    }
  });
  
  console.log('\n🎉 Переводы для ServicePointFormPage добавлены!');
}

// Запускаем добавление переводов
addTranslations(); 