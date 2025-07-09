const fs = require('fs');
const path = require('path');

// Недостающие переводы для страницы ServicePointDetail
const servicePointDetailTranslations = {
  ru: {
    client: {
      servicePointDetail: {
        bookNow: "Записаться",
        photos: "Фотографии",
        services: "Услуги",
        phone: "Телефон",
        address: "Адрес",
        workingHours: "Режим работы",
        description: "Описание",
        rating: "Рейтинг",
        reviews: "отзывов",
        categories: "Категории услуг",
        selectCategory: "Выберите категорию",
        viewAll: "Показать все",
        collapse: "Свернуть",
        noServices: "Услуги не найдены",
        contactForServices: "Услуги в данной категории уточняйте по контактному телефону",
        partner: "Партнер",
        city: "Город"
      }
    },
    forms: {
      clientPages: {
        servicePointDetail: {
          notFound: "Сервисная точка не найдена",
          backButton: "Назад",
          breadcrumbHome: "Главная",
          breadcrumbSearch: "Поиск сервисов",
          loading: "Загрузка...",
          error: "Ошибка загрузки",
          tryAgain: "Попробовать снова"
        }
      }
    }
  },
  uk: {
    client: {
      servicePointDetail: {
        bookNow: "Записатися",
        photos: "Фотографії",
        services: "Послуги",
        phone: "Телефон",
        address: "Адреса",
        workingHours: "Режим роботи",
        description: "Опис",
        rating: "Рейтинг",
        reviews: "відгуків",
        categories: "Категорії послуг",
        selectCategory: "Оберіть категорію",
        viewAll: "Показати всі",
        collapse: "Згорнути",
        noServices: "Послуги не знайдені",
        contactForServices: "Послуги в даній категорії уточнюйте за контактним телефоном",
        partner: "Партнер",
        city: "Місто"
      }
    },
    forms: {
      clientPages: {
        servicePointDetail: {
          notFound: "Сервісну точку не знайдено",
          backButton: "Назад",
          breadcrumbHome: "Головна",
          breadcrumbSearch: "Пошук сервісів",
          loading: "Завантаження...",
          error: "Помилка завантаження",
          tryAgain: "Спробувати знову"
        }
      }
    }
  }
};

// Функция для глубокого слияния объектов
const deepMerge = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

// Добавление переводов в файл
const addTranslationsToFile = (language) => {
  const filePath = path.join(__dirname, `../../src/i18n/locales/${language}.json`);
  
  try {
    // Читаем существующий файл
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log(`🔍 Анализ файла ${language}.json...`);
    
    // Проверяем, есть ли уже секции
    const hasClientSection = data.client && data.client.servicePointDetail;
    const hasFormsSection = data.forms && data.forms.clientPages && data.forms.clientPages.servicePointDetail;
    
    if (hasClientSection && hasFormsSection) {
      console.log(`✅ Переводы для ${language} уже существуют`);
      return false;
    }
    
    // Создаем бэкап
    const backupPath = filePath + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, content);
    console.log(`📦 Создан бэкап: ${backupPath}`);
    
    // Добавляем недостающие переводы
    const newData = deepMerge(data, servicePointDetailTranslations[language]);
    
    // Сохраняем файл
    const newContent = JSON.stringify(newData, null, 2);
    fs.writeFileSync(filePath, newContent);
    
    console.log(`✅ Добавлены переводы для ${language}:`);
    if (!hasClientSection) {
      console.log('   - client.servicePointDetail секция');
    }
    if (!hasFormsSection) {
      console.log('   - forms.clientPages.servicePointDetail секция');
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке файла ${language}.json:`, error.message);
    return false;
  }
};

// Проверка существующих переводов
const checkExistingTranslations = () => {
  console.log('🔍 Проверка существующих переводов...\n');
  
  ['ru', 'uk'].forEach(lang => {
    const filePath = path.join(__dirname, `../../src/i18n/locales/${lang}.json`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`📄 Файл ${lang}.json:`);
      
      // Проверяем client.servicePointDetail
      if (data.client && data.client.servicePointDetail) {
        console.log('   ✅ client.servicePointDetail существует');
      } else {
        console.log('   ❌ client.servicePointDetail отсутствует');
      }
      
      // Проверяем forms.clientPages.servicePointDetail
      if (data.forms && data.forms.clientPages && data.forms.clientPages.servicePointDetail) {
        console.log('   ✅ forms.clientPages.servicePointDetail существует');
      } else {
        console.log('   ❌ forms.clientPages.servicePointDetail отсутствует');
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`   ❌ Ошибка чтения ${lang}.json:`, error.message);
    }
  });
};

// Запуск исправлений
console.log('🚀 Добавление переводов для ServicePointDetail страницы...\n');

checkExistingTranslations();

const ruFixed = addTranslationsToFile('ru');
const ukFixed = addTranslationsToFile('uk');

if (ruFixed || ukFixed) {
  console.log('\n✅ ПЕРЕВОДЫ ДОБАВЛЕНЫ УСПЕШНО!');
  console.log('📋 Что было сделано:');
  if (ruFixed) console.log('   - Добавлены русские переводы для client.servicePointDetail и forms.clientPages.servicePointDetail');
  if (ukFixed) console.log('   - Добавлены украинские переводы для client.servicePointDetail и forms.clientPages.servicePointDetail');
  console.log('   - Созданы бэкапы исходных файлов');
  console.log('\n⚡ Теперь страница /client/service-point/* должна корректно отображать переводы!');
} else {
  console.log('\n❌ Переводы уже существуют или произошла ошибка');
} 