const fs = require('fs');
const path = require('path');

// Путь к файлу страницы бронирования
const bookingPagePath = path.join(__dirname, '../../src/pages/bookings/NewBookingWithAvailabilityPage.tsx');

function localizeBookingPage() {
  try {
    console.log('🌍 Локализуем страницу бронирования...\n');
    
    let content = fs.readFileSync(bookingPagePath, 'utf8');
    let replacements = 0;
    
    // 1. Добавляем импорт useTranslation (если его нет)
    if (!content.includes('useTranslation')) {
      content = content.replace(
        "import React, { useState, useEffect, useMemo } from 'react';",
        "import React, { useState, useEffect, useMemo } from 'react';\nimport { useTranslation } from 'react-i18next';"
      );
      console.log('✅ Добавлен импорт useTranslation');
      replacements++;
    }
    
    // 2. Добавляем хук useTranslation в компонент (после других хуков)
    if (!content.includes('const { t } = useTranslation();')) {
      content = content.replace(
        'const NewBookingWithAvailabilityPage: React.FC = () => {',
        'const NewBookingWithAvailabilityPage: React.FC = () => {\n  const { t } = useTranslation();'
      );
      console.log('✅ Добавлен хук useTranslation');
      replacements++;
    }
    
    // 3. Обновляем конфигурацию шагов
    const stepsPattern = /const STEPS = \[\s*{[\s\S]*?}\s*\];/;
    const newSteps = `const STEPS = [
  {
    id: 'category-selection',
    label: t('booking.steps.categorySelection'),
    component: CategorySelectionStep,
  },
  {
    id: 'city-service-point',
    label: t('booking.steps.cityServicePoint'),
    component: CityServicePointStep,
  },
  {
    id: 'date-time',
    label: t('booking.steps.dateTime'),
    component: DateTimeStep,
  },
  {
    id: 'client-info',
    label: t('booking.steps.clientInfo'),
    component: ClientInfoStep,
  },
  {
    id: 'car-type',
    label: t('booking.steps.carType'),
    component: CarTypeStep,
  },
  {
    id: 'services',
    label: t('booking.steps.services'),
    component: ServicesStep,
  },
  {
    id: 'review',
    label: t('booking.steps.review'),
    component: ReviewStep,
  },
];`;
    
    if (stepsPattern.test(content)) {
      content = content.replace(stepsPattern, newSteps);
      console.log('✅ Локализована конфигурация шагов');
      replacements++;
    }
    
    // 4. Локализуем основные тексты
    const textReplacements = [
      // Заголовки
      { from: /Новое бронирование(?!\s*\()/g, to: "{t('booking.title')}" },
      { from: /\(гостевое\)/g, to: "{t('booking.guestTitle').replace(t('booking.title'), '').trim()}" },
      { from: /Отмена/g, to: "{t('booking.cancel')}" },
      
      // Кнопки навигации
      { from: /Назад/g, to: "{t('booking.back')}" },
      { from: /Далее/g, to: "{t('booking.next')}" },
      { from: /Создание\.\.\./g, to: "{t('booking.creating')}" },
      { from: /Создать бронирование/g, to: "{t('booking.createBooking')}" },
      
      // Диалог успеха
      { from: /"Бронирование создано!"/g, to: "t('booking.success.title')" },
      { from: /"Ваше бронирование успешно создано\. Вы можете просмотреть его в личном кабинете или вернуться на главную\."/g, to: "t('booking.success.messageAuth')" },
      { from: /"Ваше гостевое бронирование успешно создано! Информация о бронировании отправлена на указанный номер телефона\."/g, to: "t('booking.success.messageGuest')" },
      { from: /'Мои бронирования'/g, to: "t('booking.success.myBookings')" },
      { from: /'На главную'/g, to: "t('booking.success.goHome')" },
      { from: /'Возврат на главную'/g, to: "t('booking.success.returnHome')" },
    ];
    
    textReplacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        console.log(`✅ Заменено: ${matches.length} вхождений "${from.source || from}"`);
        replacements += matches.length;
      }
    });
    
    // 5. Специальные замены для JSX
    // Заголовок с условием
    content = content.replace(
      /Новое бронирование \{!isAuthenticated && <Typography component="span" variant="body2" color="text\.secondary">\(гостевое\)<\/Typography>\}/g,
      '{isAuthenticated ? t(\'booking.title\') : t(\'booking.guestTitle\')}'
    );
    
    // Проверяем результат
    if (replacements > 0) {
      fs.writeFileSync(bookingPagePath, content, 'utf8');
      console.log(`\n🎯 РЕЗУЛЬТАТ:`);
      console.log(`📝 Файл: NewBookingWithAvailabilityPage.tsx`);
      console.log(`🔄 Всего замен: ${replacements}`);
      console.log(`✅ Локализация страницы бронирования завершена!`);
    } else {
      console.log('ℹ️  Замены не требуются - файл уже локализован');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при локализации страницы бронирования:', error);
  }
}

// Запуск скрипта
localizeBookingPage(); 