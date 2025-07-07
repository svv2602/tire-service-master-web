const fs = require('fs');
const path = require('path');

// Путь к компонентам шагов бронирования
const stepsPath = path.join(__dirname, '../../src/pages/bookings/components');

// Конфигурация для локализации каждого компонента
const stepConfigurations = {
  'CategorySelectionStep.tsx': {
    patterns: [
      { from: /Выберите тип услуг/g, to: "{t('bookingSteps.categorySelection.title')}" },
      { from: /Какие услуги вам нужны\?/g, to: "{t('bookingSteps.categorySelection.subtitle')}" },
      { from: /Выберите категорию услуг/g, to: "{t('bookingSteps.categorySelection.selectCategory')}" },
      { from: /Загрузка категорий\.\.\./g, to: "{t('bookingSteps.categorySelection.loading')}" },
      { from: /Ошибка загрузки категорий/g, to: "{t('bookingSteps.categorySelection.error')}" },
      { from: /Категории не найдены/g, to: "{t('bookingSteps.categorySelection.noCategories')}" },
    ]
  },
  
  'CityServicePointStep.tsx': {
    patterns: [
      { from: /Выберите сервисную точку/g, to: "{t('bookingSteps.cityServicePoint.title')}" },
      { from: /Выберите город/g, to: "{t('bookingSteps.cityServicePoint.selectCity')}" },
      { from: /Поиск города\.\.\./g, to: "{t('bookingSteps.cityServicePoint.searchCity')}" },
      { from: /Поиск сервисной точки\.\.\./g, to: "{t('bookingSteps.cityServicePoint.searchServicePoint')}" },
      { from: /Результатов не найдено/g, to: "{t('bookingSteps.cityServicePoint.noResults')}" },
      { from: /Часы работы/g, to: "{t('bookingSteps.cityServicePoint.workingHours')}" },
      { from: /Адрес/g, to: "{t('bookingSteps.cityServicePoint.address')}" },
      { from: /Телефон/g, to: "{t('bookingSteps.cityServicePoint.phone')}" },
      { from: /Рейтинг/g, to: "{t('bookingSteps.cityServicePoint.rating')}" },
    ]
  },
  
  'DateTimeStep.tsx': {
    patterns: [
      { from: /Выберите дату и время/g, to: "{t('bookingSteps.dateTime.title')}" },
      { from: /Выберите дату/g, to: "{t('bookingSteps.dateTime.selectDate')}" },
      { from: /Выберите время/g, to: "{t('bookingSteps.dateTime.selectTime')}" },
      { from: /Доступные слоты/g, to: "{t('bookingSteps.dateTime.availableSlots')}" },
      { from: /На выбранную дату нет доступных слотов/g, to: "{t('bookingSteps.dateTime.noSlotsAvailable')}" },
      { from: /Выберите другую дату/g, to: "{t('bookingSteps.dateTime.selectAnotherDate')}" },
      { from: /Загрузка доступных слотов\.\.\./g, to: "{t('bookingSteps.dateTime.loading')}" },
      { from: /Продолжительность/g, to: "{t('bookingSteps.dateTime.duration')}" },
      { from: /Временной слот/g, to: "{t('bookingSteps.dateTime.timeSlot')}" },
    ]
  },
  
  'ClientInfoStep.tsx': {
    patterns: [
      { from: /Контактная информация/g, to: "{t('bookingSteps.clientInfo.title')}" },
      { from: /Укажите ваши контактные данные/g, to: "{t('bookingSteps.clientInfo.subtitle')}" },
      { from: /Имя/g, to: "{t('bookingSteps.clientInfo.firstName')}" },
      { from: /Фамилия/g, to: "{t('bookingSteps.clientInfo.lastName')}" },
      { from: /Номер телефона/g, to: "{t('bookingSteps.clientInfo.phone')}" },
      { from: /Email \(необязательно\)/g, to: "{t('bookingSteps.clientInfo.email')}" },
      { from: /Обязательное поле/g, to: "{t('bookingSteps.clientInfo.required')}" },
      { from: /Некорректный номер телефона/g, to: "{t('bookingSteps.clientInfo.invalidPhone')}" },
      { from: /Некорректный email/g, to: "{t('bookingSteps.clientInfo.invalidEmail')}" },
    ]
  },
  
  'CarTypeStep.tsx': {
    patterns: [
      { from: /Информация об автомобиле/g, to: "{t('bookingSteps.carType.title')}" },
      { from: /Расскажите о вашем автомобиле/g, to: "{t('bookingSteps.carType.subtitle')}" },
      { from: /Выберите тип автомобиля/g, to: "{t('bookingSteps.carType.selectCarType')}" },
      { from: /Марка автомобиля/g, to: "{t('bookingSteps.carType.carBrand')}" },
      { from: /Модель автомобиля/g, to: "{t('bookingSteps.carType.carModel')}" },
      { from: /Номерной знак/g, to: "{t('bookingSteps.carType.licensePlate')}" },
      { from: /Выберите марку/g, to: "{t('bookingSteps.carType.selectBrand')}" },
      { from: /Выберите модель/g, to: "{t('bookingSteps.carType.selectModel')}" },
      { from: /Введите номерной знак/g, to: "{t('bookingSteps.carType.enterLicensePlate')}" },
    ]
  },
  
  'ServicesStep.tsx': {
    patterns: [
      { from: /Выберите услуги/g, to: "{t('bookingSteps.services.title')}" },
      { from: /Какие услуги вам нужны\?/g, to: "{t('bookingSteps.services.subtitle')}" },
      { from: /Доступные услуги/g, to: "{t('bookingSteps.services.availableServices')}" },
      { from: /Выбранные услуги/g, to: "{t('bookingSteps.services.selectedServices')}" },
      { from: /Услуги не найдены/g, to: "{t('bookingSteps.services.noServices')}" },
      { from: /Загрузка услуг\.\.\./g, to: "{t('bookingSteps.services.loading')}" },
      { from: /Цена/g, to: "{t('bookingSteps.services.price')}" },
      { from: /Время/g, to: "{t('bookingSteps.services.duration')}" },
      { from: /Итого/g, to: "{t('bookingSteps.services.total')}" },
      { from: /Выберите хотя бы одну услугу/g, to: "{t('bookingSteps.services.selectAtLeastOne')}" },
    ]
  },
  
  'ReviewStep.tsx': {
    patterns: [
      { from: /Подтверждение бронирования/g, to: "{t('bookingSteps.review.title')}" },
      { from: /Проверьте данные перед созданием бронирования/g, to: "{t('bookingSteps.review.subtitle')}" },
      { from: /Сервисная точка/g, to: "{t('bookingSteps.review.servicePoint')}" },
      { from: /Дата и время/g, to: "{t('bookingSteps.review.dateTime')}" },
      { from: /Контактная информация/g, to: "{t('bookingSteps.review.contactInfo')}" },
      { from: /Информация об автомобиле/g, to: "{t('bookingSteps.review.carInfo')}" },
      { from: /Услуги/g, to: "{t('bookingSteps.review.services')}" },
      { from: /Общая стоимость/g, to: "{t('bookingSteps.review.total')}" },
      { from: /Общее время/g, to: "{t('bookingSteps.review.duration')}" },
      { from: /Комментарии/g, to: "{t('bookingSteps.review.notes')}" },
      { from: /Добавить комментарий/g, to: "{t('bookingSteps.review.addNotes')}" },
      { from: /Подтвердить бронирование/g, to: "{t('bookingSteps.review.confirm')}" },
      { from: /Изменить/g, to: "{t('bookingSteps.review.edit')}" },
    ]
  }
};

function localizeBookingSteps() {
  try {
    console.log('🌍 Локализуем компоненты шагов бронирования...\n');
    
    let totalReplacements = 0;
    let processedFiles = 0;
    
    Object.entries(stepConfigurations).forEach(([fileName, config]) => {
      const filePath = path.join(stepsPath, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Файл ${fileName} не найден, пропускаем`);
        return;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      let fileReplacements = 0;
      
      // Добавляем импорт useTranslation если его нет
      if (!content.includes('useTranslation')) {
        content = content.replace(
          "import React",
          "import React\nimport { useTranslation } from 'react-i18next';"
        );
        console.log(`✅ ${fileName}: Добавлен импорт useTranslation`);
        fileReplacements++;
      }
      
      // Добавляем хук useTranslation в компонент
      const componentMatch = content.match(/const \w+Step: React\.FC<[^>]*> = \([^)]*\) => \{/);
      if (componentMatch && !content.includes('const { t } = useTranslation();')) {
        const insertPoint = componentMatch.index + componentMatch[0].length;
        content = content.slice(0, insertPoint) + '\n  const { t } = useTranslation();' + content.slice(insertPoint);
        console.log(`✅ ${fileName}: Добавлен хук useTranslation`);
        fileReplacements++;
      }
      
      // Применяем паттерны замен
      config.patterns.forEach(({ from, to }) => {
        const matches = content.match(from);
        if (matches) {
          content = content.replace(from, to);
          console.log(`✅ ${fileName}: Заменено ${matches.length} вхождений "${from.source || from}"`);
          fileReplacements += matches.length;
        }
      });
      
      // Сохраняем файл если были изменения
      if (fileReplacements > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`📝 ${fileName}: ${fileReplacements} замен\n`);
        totalReplacements += fileReplacements;
        processedFiles++;
      } else {
        console.log(`➖ ${fileName}: изменения не требуются\n`);
      }
    });
    
    console.log(`🎯 РЕЗУЛЬТАТ:`);
    console.log(`📁 Обработано файлов: ${processedFiles}/${Object.keys(stepConfigurations).length}`);
    console.log(`🔧 Всего замен: ${totalReplacements}`);
    console.log(`\n✅ Локализация компонентов шагов бронирования завершена!`);
    
  } catch (error) {
    console.error('❌ Ошибка при локализации компонентов шагов:', error);
  }
}

// Запуск скрипта
localizeBookingSteps(); 