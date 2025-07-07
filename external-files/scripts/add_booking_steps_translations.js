const fs = require('fs');
const path = require('path');

// Путь к файлам переводов
const localesPath = path.join(__dirname, '../../src/i18n/locales');
const ruPath = path.join(localesPath, 'ru.json');
const ukPath = path.join(localesPath, 'uk.json');

// Переводы для компонентов шагов бронирования
const bookingStepsTranslations = {
  ru: {
    bookingSteps: {
      // Шаг выбора категории
      categorySelection: {
        title: "Выберите тип услуг",
        subtitle: "Какие услуги вам нужны?",
        selectCategory: "Выберите категорию услуг",
        loading: "Загрузка категорий...",
        error: "Ошибка загрузки категорий",
        noCategories: "Категории не найдены",
        services: "услуг",
        servicePoints: "сервисов"
      },
      
      // Шаг выбора города и сервисной точки
      cityServicePoint: {
        title: "Выберите сервисную точку",
        selectCity: "Выберите город",
        selectServicePoint: "Выберите сервисную точку",
        searchCity: "Поиск города...",
        searchServicePoint: "Поиск сервисной точки...",
        noResults: "Результатов не найдено",
        loading: "Загрузка...",
        error: "Ошибка загрузки данных",
        workingHours: "Часы работы",
        address: "Адрес",
        phone: "Телефон",
        rating: "Рейтинг",
        reviews: "отзывов"
      },
      
      // Шаг выбора даты и времени
      dateTime: {
        title: "Выберите дату и время",
        selectDate: "Выберите дату",
        selectTime: "Выберите время",
        availableSlots: "Доступные слоты",
        noSlotsAvailable: "На выбранную дату нет доступных слотов",
        selectAnotherDate: "Выберите другую дату",
        loading: "Загрузка доступных слотов...",
        error: "Ошибка загрузки слотов",
        duration: "Продолжительность",
        minutes: "мин",
        timeSlot: "Временной слот"
      },
      
      // Шаг контактной информации
      clientInfo: {
        title: "Контактная информация",
        subtitle: "Укажите ваши контактные данные",
        firstName: "Имя",
        lastName: "Фамилия",
        phone: "Номер телефона",
        email: "Email (необязательно)",
        required: "Обязательное поле",
        invalidPhone: "Некорректный номер телефона",
        invalidEmail: "Некорректный email"
      },
      
      // Шаг информации об автомобиле
      carType: {
        title: "Информация об автомобиле",
        subtitle: "Расскажите о вашем автомобиле",
        selectCarType: "Выберите тип автомобиля",
        carBrand: "Марка автомобиля",
        carModel: "Модель автомобиля",
        licensePlate: "Номерной знак",
        selectBrand: "Выберите марку",
        selectModel: "Выберите модель",
        enterLicensePlate: "Введите номерной знак",
        loading: "Загрузка...",
        error: "Ошибка загрузки данных",
        required: "Обязательное поле"
      },
      
      // Шаг выбора услуг
      services: {
        title: "Выберите услуги",
        subtitle: "Какие услуги вам нужны?",
        availableServices: "Доступные услуги",
        selectedServices: "Выбранные услуги",
        noServices: "Услуги не найдены",
        loading: "Загрузка услуг...",
        error: "Ошибка загрузки услуг",
        price: "Цена",
        duration: "Время",
        minutes: "мин",
        total: "Итого",
        selectAtLeastOne: "Выберите хотя бы одну услугу"
      },
      
      // Шаг подтверждения
      review: {
        title: "Подтверждение бронирования",
        subtitle: "Проверьте данные перед созданием бронирования",
        servicePoint: "Сервисная точка",
        dateTime: "Дата и время",
        contactInfo: "Контактная информация",
        carInfo: "Информация об автомобиле",
        services: "Услуги",
        total: "Общая стоимость",
        duration: "Общее время",
        notes: "Комментарии",
        addNotes: "Добавить комментарий",
        confirm: "Подтвердить бронирование",
        edit: "Изменить",
        minutes: "мин"
      },
      
      // Общие элементы
      common: {
        next: "Далее",
        back: "Назад",
        loading: "Загрузка...",
        error: "Произошла ошибка",
        retry: "Повторить",
        required: "Обязательное поле",
        optional: "Необязательное поле",
        select: "Выберите...",
        search: "Поиск...",
        noResults: "Результатов не найдено"
      }
    }
  },
  
  uk: {
    bookingSteps: {
      // Шаг выбора категории
      categorySelection: {
        title: "Виберіть тип послуг",
        subtitle: "Які послуги вам потрібні?",
        selectCategory: "Виберіть категорію послуг",
        loading: "Завантаження категорій...",
        error: "Помилка завантаження категорій",
        noCategories: "Категорії не знайдено",
        services: "послуг",
        servicePoints: "сервісів"
      },
      
      // Шаг выбора города и сервисной точки
      cityServicePoint: {
        title: "Виберіть сервісну точку",
        selectCity: "Виберіть місто",
        selectServicePoint: "Виберіть сервісну точку",
        searchCity: "Пошук міста...",
        searchServicePoint: "Пошук сервісної точки...",
        noResults: "Результатів не знайдено",
        loading: "Завантаження...",
        error: "Помилка завантаження даних",
        workingHours: "Години роботи",
        address: "Адреса",
        phone: "Телефон",
        rating: "Рейтинг",
        reviews: "відгуків"
      },
      
      // Шаг выбора даты и времени
      dateTime: {
        title: "Виберіть дату і час",
        selectDate: "Виберіть дату",
        selectTime: "Виберіть час",
        availableSlots: "Доступні слоти",
        noSlotsAvailable: "На обрану дату немає доступних слотів",
        selectAnotherDate: "Виберіть іншу дату",
        loading: "Завантаження доступних слотів...",
        error: "Помилка завантаження слотів",
        duration: "Тривалість",
        minutes: "хв",
        timeSlot: "Часовий слот"
      },
      
      // Шаг контактной информации
      clientInfo: {
        title: "Контактна інформація",
        subtitle: "Вкажіть ваші контактні дані",
        firstName: "Ім'я",
        lastName: "Прізвище",
        phone: "Номер телефону",
        email: "Email (необов'язково)",
        required: "Обов'язкове поле",
        invalidPhone: "Некоректний номер телефону",
        invalidEmail: "Некоректний email"
      },
      
      // Шаг информации об автомобиле
      carType: {
        title: "Інформація про автомобіль",
        subtitle: "Розкажіть про ваш автомобіль",
        selectCarType: "Виберіть тип автомобіля",
        carBrand: "Марка автомобіля",
        carModel: "Модель автомобіля",
        licensePlate: "Номерний знак",
        selectBrand: "Виберіть марку",
        selectModel: "Виберіть модель",
        enterLicensePlate: "Введіть номерний знак",
        loading: "Завантаження...",
        error: "Помилка завантаження даних",
        required: "Обов'язкове поле"
      },
      
      // Шаг выбора услуг
      services: {
        title: "Виберіть послуги",
        subtitle: "Які послуги вам потрібні?",
        availableServices: "Доступні послуги",
        selectedServices: "Вибрані послуги",
        noServices: "Послуги не знайдено",
        loading: "Завантаження послуг...",
        error: "Помилка завантаження послуг",
        price: "Ціна",
        duration: "Час",
        minutes: "хв",
        total: "Разом",
        selectAtLeastOne: "Виберіть хоча б одну послугу"
      },
      
      // Шаг подтверждения
      review: {
        title: "Підтвердження бронювання",
        subtitle: "Перевірте дані перед створенням бронювання",
        servicePoint: "Сервісна точка",
        dateTime: "Дата і час",
        contactInfo: "Контактна інформація",
        carInfo: "Інформація про автомобіль",
        services: "Послуги",
        total: "Загальна вартість",
        duration: "Загальний час",
        notes: "Коментарі",
        addNotes: "Додати коментар",
        confirm: "Підтвердити бронювання",
        edit: "Змінити",
        minutes: "хв"
      },
      
      // Общие элементы
      common: {
        next: "Далі",
        back: "Назад",
        loading: "Завантаження...",
        error: "Сталася помилка",
        retry: "Повторити",
        required: "Обов'язкове поле",
        optional: "Необов'язкове поле",
        select: "Виберіть...",
        search: "Пошук...",
        noResults: "Результатів не знайдено"
      }
    }
  }
};

function addBookingStepsTranslations() {
  try {
    console.log('🌍 Добавляем переводы для компонентов шагов бронирования...\n');
    
    // Читаем существующие файлы переводов
    const ruTranslations = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
    const ukTranslations = JSON.parse(fs.readFileSync(ukPath, 'utf8'));
    
    // Добавляем новые переводы
    const updatedRuTranslations = {
      ...ruTranslations,
      ...bookingStepsTranslations.ru
    };
    
    const updatedUkTranslations = {
      ...ukTranslations,
      ...bookingStepsTranslations.uk
    };
    
    // Записываем обновленные файлы
    fs.writeFileSync(ruPath, JSON.stringify(updatedRuTranslations, null, 2), 'utf8');
    fs.writeFileSync(ukPath, JSON.stringify(updatedUkTranslations, null, 2), 'utf8');
    
    console.log('✅ Переводы успешно добавлены:');
    console.log('📁 ru.json - добавлена секция bookingSteps');
    console.log('📁 uk.json - добавлена секция bookingSteps');
    
    // Подсчитываем количество ключей
    let totalKeys = 0;
    Object.values(bookingStepsTranslations.ru.bookingSteps).forEach(section => {
      totalKeys += Object.keys(section).length;
    });
    
    console.log(`🔢 Всего ключей переводов: ${totalKeys}`);
    console.log('\n🎯 Добавление переводов для компонентов шагов бронирования завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении переводов:', error);
  }
}

// Запуск скрипта
addBookingStepsTranslations(); 