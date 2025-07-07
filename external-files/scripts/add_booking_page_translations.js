const fs = require('fs');
const path = require('path');

// Путь к файлам переводов
const localesPath = path.join(__dirname, '../../src/i18n/locales');
const ruPath = path.join(localesPath, 'ru.json');
const ukPath = path.join(localesPath, 'uk.json');

// Переводы для страницы бронирования
const bookingTranslations = {
  ru: {
    booking: {
      // Заголовки и основные элементы
      title: "Новое бронирование",
      guestTitle: "Новое бронирование (гостевое)",
      cancel: "Отмена",
      back: "Назад",
      next: "Далее",
      creating: "Создание...",
      createBooking: "Создать бронирование",
      
      // Шаги бронирования
      steps: {
        categorySelection: "Выбор типа услуг",
        cityServicePoint: "Выбор точки обслуживания",
        dateTime: "Дата и время",
        clientInfo: "Контактная информация",
        carType: "Информация об автомобиле",
        services: "Услуги",
        review: "Подтверждение"
      },
      
      // Сообщения об успехе
      success: {
        title: "Бронирование создано!",
        messageAuth: "Ваше бронирование успешно создано. Вы можете просмотреть его в личном кабинете или вернуться на главную.",
        messageGuest: "Ваше гостевое бронирование успешно создано! Информация о бронировании отправлена на указанный номер телефона.",
        myBookings: "Мои бронирования",
        goHome: "На главную",
        returnHome: "Возврат на главную"
      },
      
      // Диалоги
      dialogs: {
        existingUser: {
          title: "Найден существующий пользователь",
          message: "Пользователь с таким номером телефона уже существует. Войдите в систему или продолжите как гость.",
          login: "Войти",
          continueAsGuest: "Продолжить как гость"
        },
        createAccount: {
          title: "Создать аккаунт",
          message: "Хотите создать аккаунт для управления бронированиями?",
          create: "Создать аккаунт",
          continueWithout: "Продолжить без аккаунта"
        },
        bookingType: {
          title: "Выберите тип бронирования",
          message: "Как вы хотите создать бронирование?",
          withAccount: "С созданием аккаунта",
          withoutAccount: "Без создания аккаунта"
        },
        addCar: {
          title: "Добавить автомобиль в профиль",
          message: "Хотите добавить этот автомобиль в свой профиль для будущих бронирований?",
          add: "Добавить",
          skip: "Пропустить"
        }
      },
      
      // Ошибки
      errors: {
        submitError: "Ошибка при создании бронирования",
        invalidStep: "Некорректный шаг",
        requiredFields: "Заполните обязательные поля",
        networkError: "Ошибка сети. Попробуйте позже.",
        unknownError: "Неизвестная ошибка"
      }
    }
  },
  
  uk: {
    booking: {
      // Заголовки и основные элементы
      title: "Нове бронювання",
      guestTitle: "Нове бронювання (гостьове)",
      cancel: "Скасувати",
      back: "Назад",
      next: "Далі",
      creating: "Створення...",
      createBooking: "Створити бронювання",
      
      // Шаги бронирования
      steps: {
        categorySelection: "Вибір типу послуг",
        cityServicePoint: "Вибір точки обслуговування",
        dateTime: "Дата і час",
        clientInfo: "Контактна інформація",
        carType: "Інформація про автомобіль",
        services: "Послуги",
        review: "Підтвердження"
      },
      
      // Сообщения об успехе
      success: {
        title: "Бронювання створено!",
        messageAuth: "Ваше бронювання успішно створено. Ви можете переглянути його в особистому кабінеті або повернутися на головну.",
        messageGuest: "Ваше гостьове бронювання успішно створено! Інформація про бронювання надіслана на вказаний номер телефону.",
        myBookings: "Мої бронювання",
        goHome: "На головну",
        returnHome: "Повернення на головну"
      },
      
      // Диалоги
      dialogs: {
        existingUser: {
          title: "Знайдено існуючого користувача",
          message: "Користувач з таким номером телефону вже існує. Увійдіть в систему або продовжте як гість.",
          login: "Увійти",
          continueAsGuest: "Продовжити як гість"
        },
        createAccount: {
          title: "Створити акаунт",
          message: "Хочете створити акаунт для управління бронюваннями?",
          create: "Створити акаунт",
          continueWithout: "Продовжити без акаунта"
        },
        bookingType: {
          title: "Виберіть тип бронювання",
          message: "Як ви хочете створити бронювання?",
          withAccount: "Зі створенням акаунта",
          withoutAccount: "Без створення акаунта"
        },
        addCar: {
          title: "Додати автомобіль до профілю",
          message: "Хочете додати цей автомобіль до свого профілю для майбутніх бронювань?",
          add: "Додати",
          skip: "Пропустити"
        }
      },
      
      // Ошибки
      errors: {
        submitError: "Помилка при створенні бронювання",
        invalidStep: "Некоректний крок",
        requiredFields: "Заповніть обов'язкові поля",
        networkError: "Помилка мережі. Спробуйте пізніше.",
        unknownError: "Невідома помилка"
      }
    }
  }
};

function addBookingTranslations() {
  try {
    console.log('🌍 Добавляем переводы для страницы бронирования...\n');
    
    // Читаем существующие файлы переводов
    const ruTranslations = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
    const ukTranslations = JSON.parse(fs.readFileSync(ukPath, 'utf8'));
    
    // Добавляем новые переводы
    const updatedRuTranslations = {
      ...ruTranslations,
      ...bookingTranslations.ru
    };
    
    const updatedUkTranslations = {
      ...ukTranslations,
      ...bookingTranslations.uk
    };
    
    // Записываем обновленные файлы
    fs.writeFileSync(ruPath, JSON.stringify(updatedRuTranslations, null, 2), 'utf8');
    fs.writeFileSync(ukPath, JSON.stringify(updatedUkTranslations, null, 2), 'utf8');
    
    console.log('✅ Переводы успешно добавлены:');
    console.log('📁 ru.json - добавлена секция booking');
    console.log('📁 uk.json - добавлена секция booking');
    console.log(`🔢 Всего ключей переводов: ${Object.keys(bookingTranslations.ru.booking).length + Object.keys(bookingTranslations.ru.booking.steps).length + Object.keys(bookingTranslations.ru.booking.success).length + Object.keys(bookingTranslations.ru.booking.dialogs.existingUser).length + Object.keys(bookingTranslations.ru.booking.dialogs.createAccount).length + Object.keys(bookingTranslations.ru.booking.dialogs.bookingType).length + Object.keys(bookingTranslations.ru.booking.dialogs.addCar).length + Object.keys(bookingTranslations.ru.booking.errors).length}`);
    
    console.log('\n🎯 Добавление переводов для страницы бронирования завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении переводов:', error);
  }
}

// Запуск скрипта
addBookingTranslations(); 