const fs = require('fs');
const path = require('path');

// Пути к файлам переводов
const ruJsonPath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukJsonPath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Переводы для страницы бронирования
const bookingTranslationsRu = {
  "booking": {
    "title": "Новое бронирование",
    "guestTitle": "Новое бронирование (гость)",
    "cancel": "Отменить",
    "back": "Назад",
    "next": "Далее",
    "creating": "Создание...",
    "createBooking": "Создать бронирование",
    "steps": {
      "categorySelection": "Выбор типа услуг",
      "cityServicePoint": "Выбор точки обслуживания",
      "dateTime": "Дата и время",
      "clientInfo": "Контактная информация",
      "carType": "Информация об автомобиле",
      "services": "Услуги",
      "review": "Подтверждение"
    },
    "success": {
      "title": "Бронирование создано!",
      "messageAuth": "Ваше бронирование успешно создано. Вы можете просмотреть его в своем профиле.",
      "messageGuest": "Ваше бронирование успешно создано. Мы свяжемся с вами для подтверждения.",
      "myBookings": "Мои записи",
      "goHome": "На главную",
      "returnHome": "Вернуться на главную"
    },
    "validation": {
      "selectCategory": "Выберите категорию услуг",
      "selectCity": "Выберите город",
      "selectServicePoint": "Выберите точку обслуживания",
      "selectDate": "Выберите дату",
      "selectTime": "Выберите время",
      "fillContactInfo": "Заполните контактную информацию",
      "fillCarInfo": "Заполните информацию об автомобиле",
      "selectServices": "Выберите услуги"
    },
    "errors": {
      "submitError": "Ошибка при создании бронирования",
      "networkError": "Ошибка сети. Проверьте подключение к интернету.",
      "serverError": "Ошибка сервера. Попробуйте позже.",
      "validationError": "Проверьте правильность заполнения всех полей"
    }
  }
};

const bookingTranslationsUk = {
  "booking": {
    "title": "Нове бронювання",
    "guestTitle": "Нове бронювання (гість)",
    "cancel": "Скасувати",
    "back": "Назад",
    "next": "Далі",
    "creating": "Створення...",
    "createBooking": "Створити бронювання",
    "steps": {
      "categorySelection": "Вибір типу послуг",
      "cityServicePoint": "Вибір точки обслуговування",
      "dateTime": "Дата і час",
      "clientInfo": "Контактна інформація",
      "carType": "Інформація про автомобіль",
      "services": "Послуги",
      "review": "Підтвердження"
    },
    "success": {
      "title": "Бронювання створено!",
      "messageAuth": "Ваше бронювання успішно створено. Ви можете переглянути його у своєму профілі.",
      "messageGuest": "Ваше бронювання успішно створено. Ми зв'яжемося з вами для підтвердження.",
      "myBookings": "Мої записи",
      "goHome": "На головну",
      "returnHome": "Повернутися на головну"
    },
    "validation": {
      "selectCategory": "Виберіть категорію послуг",
      "selectCity": "Виберіть місто",
      "selectServicePoint": "Виберіть точку обслуговування",
      "selectDate": "Виберіть дату",
      "selectTime": "Виберіть час",
      "fillContactInfo": "Заповніть контактну інформацію",
      "fillCarInfo": "Заповніть інформацію про автомобіль",
      "selectServices": "Виберіть послуги"
    },
    "errors": {
      "submitError": "Помилка при створенні бронювання",
      "networkError": "Помилка мережі. Перевірте підключення до інтернету.",
      "serverError": "Помилка сервера. Спробуйте пізніше.",
      "validationError": "Перевірте правильність заповнення всіх полів"
    }
  }
};

try {
  // Обработка русского файла
  console.log('📝 Обработка русского файла переводов...');
  const ruContent = fs.readFileSync(ruJsonPath, 'utf8');
  const ruData = JSON.parse(ruContent);
  
  // Добавляем переводы для бронирования
  ruData.booking = bookingTranslationsRu.booking;
  
  fs.writeFileSync(ruJsonPath, JSON.stringify(ruData, null, 2), 'utf8');
  console.log('✅ Русские переводы для страницы бронирования добавлены');

  // Обработка украинского файла
  console.log('📝 Обработка украинского файла переводов...');
  const ukContent = fs.readFileSync(ukJsonPath, 'utf8');
  const ukData = JSON.parse(ukContent);
  
  // Добавляем переводы для бронирования
  ukData.booking = bookingTranslationsUk.booking;
  
  fs.writeFileSync(ukJsonPath, JSON.stringify(ukData, null, 2), 'utf8');
  console.log('✅ Украинские переводы для страницы бронирования добавлены');

  console.log('🎉 Переводы для страницы бронирования успешно добавлены в оба языка!');
  console.log('📊 Добавлено ключей переводов: ' + Object.keys(bookingTranslationsRu.booking).length);

} catch (error) {
  console.error('❌ Ошибка при добавлении переводов:', error.message);
}