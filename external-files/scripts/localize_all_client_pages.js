const fs = require('fs');
const path = require('path');

// Путь к клиентским страницам
const clientPagesPath = path.join(__dirname, '../../src/pages/client');

// Маппинг страниц и их переводов
const pageTranslations = {
  'ClientMainPage.tsx': {
    patterns: [
      // Заголовки и подзаголовки
      { from: /Знайдіть найкращий автосервіс поруч з вами/g, to: "{t('client.mainPage.title')}" },
      { from: /Швидке бронювання, перевірені майстри, гарантія якості/g, to: "{t('client.mainPage.subtitle')}" },
      { from: /Знайти сервіс або послугу/g, to: "{t('client.mainPage.searchPlaceholder')}" },
      { from: /Місто/g, to: "{t('client.mainPage.cityPlaceholder')}" },
      { from: /Знайти/g, to: "{t('client.mainPage.searchButton')}" },
      { from: /Записатися онлайн/g, to: "{t('client.mainPage.bookOnlineButton')}" },
      { from: /Особистий кабінет/g, to: "{t('client.mainPage.personalCabinetButton')}" },
      { from: /Послуги/g, to: "{t('client.mainPage.servicesTitle')}" },
      { from: /🚗 Твоя Шина/g, to: "{t('client.mainPage.footerTitle')}" },
      { from: /Завантаження\.\.\./g, to: "{t('client.mainPage.loading')}" },
      { from: /Готові записатися на обслуговування\?/g, to: "{t('client.mainPage.readyToBook')}" },
      { from: /Оберіть зручний час та найближчий сервіс/g, to: "{t('client.mainPage.chooseTimeAndService')}" }
    ]
  },
  
  'ClientSearchPage.tsx': {
    patterns: [
      { from: /🔍 Пошук сервісних точок/g, to: "{t('client.search.title')}" },
      { from: /Знайдіть ідеальний автосервіс у вашому місті/g, to: "{t('client.search.subtitle')}" },
      { from: /Пошук за назвою або послугами\.\.\./g, to: "{t('client.search.searchPlaceholder')}" },
      { from: /Оберіть місто/g, to: "{t('client.search.selectCity')}" },
      { from: /Всі послуги/g, to: "{t('client.search.selectServiceType')}" },
      { from: /Очистити фільтри/g, to: "{t('client.search.clearFilters')}" },
      { from: /Нічого не знайдено/g, to: "{t('client.search.noResults')}" },
      { from: /Записатися/g, to: "{t('client.search.bookNow')}" },
      { from: /Детальніше/g, to: "{t('client.search.viewDetails')}" },
      { from: /Відкрито зараз/g, to: "{t('client.search.openNow')}" },
      { from: /Зачинено/g, to: "{t('client.search.closedNow')}" },
      { from: /Рейтинг/g, to: "{t('client.search.rating')}" },
      { from: /відгуків/g, to: "{t('client.search.reviews')}" }
    ]
  },
  
  'ClientServicesPage.tsx': {
    patterns: [
      { from: /🔧 Поиск услуг/g, to: "{t('client.services.title')}" },
      { from: /Найдите нужную услугу в вашем городе и запишитесь на удобное время/g, to: "{t('client.services.subtitle')}" },
      { from: /Выберите город/g, to: "{t('client.services.selectCity')}" },
      { from: /Все категории/g, to: "{t('client.services.allCategories')}" },
      { from: /точек/g, to: "{t('client.services.servicePoints')}" },
      { from: /Записаться/g, to: "{t('client.services.bookService')}" },
      { from: /Смотреть точки/g, to: "{t('client.services.viewServicePoints')}" }
    ]
  },
  
  'ClientProfilePage.tsx': {
    patterns: [
      { from: /Мой профиль/g, to: "{t('client.profile.title')}" },
      { from: /Личные данные/g, to: "{t('client.profile.personalData')}" },
      { from: /Мои автомобили/g, to: "{t('client.profile.myCars')}" },
      { from: /Статистика/g, to: "{t('client.profile.statistics')}" },
      { from: /Безопасность/g, to: "{t('client.profile.security')}" },
      { from: /Настройки/g, to: "{t('client.profile.settings')}" },
      { from: /Клиент/g, to: "{t('client.profile.client')}" },
      { from: /Администратор/g, to: "{t('client.profile.administrator')}" },
      { from: /Загрузка\.\.\./g, to: "{t('client.profile.loading')}" },
      { from: /Добавить автомобиль/g, to: "{t('client.profile.addCar')}" },
      { from: /У вас пока нет добавленных автомобилей/g, to: "{t('client.profile.noCars')}" },
      { from: /Всего бронирований/g, to: "{t('client.profile.totalBookings')}" },
      { from: /Выполненных услуг/g, to: "{t('client.profile.completedServices')}" },
      { from: /Активных бронирований/g, to: "{t('client.profile.activeBookings')}" }
    ]
  },
  
  'MyBookingsPage.tsx': {
    patterns: [
      { from: /Мои записи/g, to: "{t('client.myBookings.title')}" },
      { from: /Новая запись/g, to: "{t('client.myBookings.newBooking')}" },
      { from: /🎉 Добро пожаловать в личный кабинет!/g, to: "{t('client.myBookings.welcome')}" },
      { from: /Предстоящие/g, to: "{t('client.myBookings.upcoming')}" },
      { from: /Завершенные/g, to: "{t('client.myBookings.completed')}" },
      { from: /Отмененные/g, to: "{t('client.myBookings.cancelled')}" },
      { from: /Подтвержденные/g, to: "{t('client.myBookings.confirmed')}" },
      { from: /У вас пока нет записей/g, to: "{t('client.myBookings.noBookings')}" },
      { from: /Создать запись/g, to: "{t('client.myBookings.createBooking')}" },
      { from: /Загрузка\.\.\./g, to: "{t('client.myBookings.loading')}" }
    ]
  },
  
  'BookingDetailsPage.tsx': {
    patterns: [
      { from: /Детали записи/g, to: "{t('client.bookingDetails.title')}" },
      { from: /Назад к записям/g, to: "{t('client.bookingDetails.backToBookings')}" },
      { from: /Общая информация/g, to: "{t('client.bookingDetails.generalInfo')}" },
      { from: /Номер записи/g, to: "{t('client.bookingDetails.bookingNumber')}" },
      { from: /Статус/g, to: "{t('client.bookingDetails.status')}" },
      { from: /Дата/g, to: "{t('client.bookingDetails.date')}" },
      { from: /Время/g, to: "{t('client.bookingDetails.time')}" },
      { from: /Сервисная точка/g, to: "{t('client.bookingDetails.servicePoint')}" },
      { from: /Перенести запись/g, to: "{t('client.bookingDetails.reschedule')}" },
      { from: /Отменить запись/g, to: "{t('client.bookingDetails.cancel')}" }
    ]
  },
  
  'RescheduleBookingPage.tsx': {
    patterns: [
      { from: /Перенос записи/g, to: "{t('client.reschedule.title')}" },
      { from: /Выберите новую дату и время для вашей записи/g, to: "{t('client.reschedule.subtitle')}" },
      { from: /Текущая запись/g, to: "{t('client.reschedule.currentBooking')}" },
      { from: /Новые дата и время/g, to: "{t('client.reschedule.newDateTime')}" },
      { from: /Выберите дату/g, to: "{t('client.reschedule.selectDate')}" },
      { from: /Выберите время/g, to: "{t('client.reschedule.selectTime')}" },
      { from: /Подтвердить перенос/g, to: "{t('client.reschedule.confirmReschedule')}" },
      { from: /Отменить/g, to: "{t('client.reschedule.cancel')}" }
    ]
  },
  
  'BookingSuccessPage.tsx': {
    patterns: [
      { from: /🎉 Запись успешно создана!/g, to: "{t('client.bookingSuccess.title')}" },
      { from: /Мы отправили подтверждение на ваш email/g, to: "{t('client.bookingSuccess.subtitle')}" },
      { from: /Что дальше\?/g, to: "{t('client.bookingSuccess.nextSteps')}" },
      { from: /Мои записи/g, to: "{t('client.bookingSuccess.goToBookings')}" },
      { from: /Создать еще одну запись/g, to: "{t('client.bookingSuccess.createAnother')}" },
      { from: /На главную/g, to: "{t('client.bookingSuccess.backToMain')}" }
    ]
  },
  
  'MyReviewsPage.tsx': {
    patterns: [
      { from: /Мои отзывы/g, to: "{t('client.reviews.title')}" },
      { from: /Написать отзыв/g, to: "{t('client.reviews.writeReview')}" },
      { from: /У вас пока нет отзывов/g, to: "{t('client.reviews.noReviews')}" },
      { from: /Оценка/g, to: "{t('client.reviews.rating')}" },
      { from: /Комментарий/g, to: "{t('client.reviews.comment')}" },
      { from: /Редактировать/g, to: "{t('client.reviews.edit')}" },
      { from: /Удалить/g, to: "{t('client.reviews.delete')}" }
    ]
  },
  
  'ReviewFormPage.tsx': {
    patterns: [
      { from: /Написать отзыв/g, to: "{t('client.reviewForm.title')}" },
      { from: /Выберите запись/g, to: "{t('client.reviewForm.selectBooking')}" },
      { from: /Без записи/g, to: "{t('client.reviewForm.withoutBooking')}" },
      { from: /Ваш отзыв/g, to: "{t('client.reviewForm.comment')}" },
      { from: /Отправить отзыв/g, to: "{t('client.reviewForm.submit')}" },
      { from: /Отменить/g, to: "{t('client.reviewForm.cancel')}" }
    ]
  },
  
  'ServicePointDetailPage.tsx': {
    patterns: [
      { from: /Детали сервисной точки/g, to: "{t('client.servicePointDetail.title')}" },
      { from: /Назад к поиску/g, to: "{t('client.servicePointDetail.backToSearch')}" },
      { from: /Записаться/g, to: "{t('client.servicePointDetail.bookNow')}" },
      { from: /Позвонить/g, to: "{t('client.servicePointDetail.callNow')}" },
      { from: /Часы работы/g, to: "{t('client.servicePointDetail.workingHours')}" },
      { from: /Услуги/g, to: "{t('client.servicePointDetail.services')}" },
      { from: /Отзывы/g, to: "{t('client.servicePointDetail.reviews')}" },
      { from: /Фотографии/g, to: "{t('client.servicePointDetail.photos')}" },
      { from: /Адрес/g, to: "{t('client.servicePointDetail.address')}" },
      { from: /Телефон/g, to: "{t('client.servicePointDetail.phone')}" }
    ]
  }
};

function localizeClientPages() {
  try {
    let totalReplacements = 0;
    let processedFiles = 0;
    
    console.log('🚀 Начинаем локализацию клиентских страниц...\n');
    
    // Обрабатываем каждую страницу
    for (const [fileName, config] of Object.entries(pageTranslations)) {
      const filePath = path.join(clientPagesPath, fileName);
      
      // Проверяем существование файла
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Файл ${fileName} не найден, пропускаем`);
        continue;
      }
      
      // Читаем содержимое файла
      let content = fs.readFileSync(filePath, 'utf8');
      let fileReplacements = 0;
      
      // Добавляем импорт useTranslation если его нет
      if (!content.includes("import { useTranslation }") && !content.includes("useTranslation")) {
        const importMatch = content.match(/import.*from 'react';/);
        if (importMatch) {
          content = content.replace(
            importMatch[0],
            importMatch[0] + "\nimport { useTranslation } from 'react-i18next';"
          );
          fileReplacements++;
        }
      }
      
      // Добавляем хук useTranslation в компонент если его нет
      if (!content.includes("const { t } = useTranslation()")) {
        const componentMatch = content.match(/const \w+: React\.FC.*?= \(\) => \{/);
        if (componentMatch) {
          content = content.replace(
            componentMatch[0],
            componentMatch[0] + "\n  const { t } = useTranslation();"
          );
          fileReplacements++;
        }
      }
      
      // Применяем паттерны замены
      for (const pattern of config.patterns) {
        const matches = content.match(pattern.from);
        if (matches) {
          content = content.replace(pattern.from, pattern.to);
          fileReplacements += matches.length;
        }
      }
      
      // Сохраняем файл только если были изменения
      if (fileReplacements > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${fileName}: ${fileReplacements} замен`);
        totalReplacements += fileReplacements;
        processedFiles++;
      } else {
        console.log(`➖ ${fileName}: изменений не требуется`);
      }
    }
    
    console.log(`\n🎯 РЕЗУЛЬТАТ:`);
    console.log(`📁 Обработано файлов: ${processedFiles}/${Object.keys(pageTranslations).length}`);
    console.log(`🔄 Всего замен: ${totalReplacements}`);
    console.log(`\n✅ Локализация клиентских страниц завершена!`);
    
  } catch (error) {
    console.error('❌ Ошибка при локализации клиентских страниц:', error);
  }
}

// Запуск скрипта
localizeClientPages(); 