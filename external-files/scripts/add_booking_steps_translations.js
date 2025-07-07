const fs = require('fs');
const path = require('path');

// Путь к файлам переводов
const ruFilePath = path.join(__dirname, '../../src/i18n/locales/ru.json');
const ukFilePath = path.join(__dirname, '../../src/i18n/locales/uk.json');

// Функция для чтения JSON файла
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Ошибка чтения файла ${filePath}:`, error);
    return {};
  }
}

// Функция для записи JSON файла
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Файл ${filePath} успешно обновлен`);
  } catch (error) {
    console.error(`Ошибка записи файла ${filePath}:`, error);
  }
}

// Новые переводы для шагов формы бронирования
const newTranslations = {
  bookingSteps: {
    categorySelection: {
      title: "Выбор категории услуг",
      error: "Ошибка загрузки категорий",
      citySelect: "Выберите город",
      cityPlaceholder: "Начните вводить название города",
      noCitiesFound: "Города не найдены",
      loadingCities: "Загрузка городов...",
      availableCategories: "Доступные категории услуг в городе",
      selectCityFirst: "Сначала выберите город, чтобы увидеть доступные категории услуг",
      noCategories: "В выбранном городе пока нет доступных категорий услуг. Попробуйте выбрать другой город.",
      pointsCount: "точек",
      servicesCount: "услуг",
      allRequiredFieldsFilled: "Все обязательные поля заполнены. Можете перейти к следующему шагу."
    },
    clientInfo: {
      title: "Контактная информация",
      firstName: "Имя",
      lastName: "Фамилия",
      phone: "Телефон",
      email: "Email",
      privacy: "Конфиденциальность",
      privacyText: "Мы используем ваши данные только для обработки бронирования и не передаем их третьим лицам.",
      requiredFieldsWarning: "Заполните все обязательные поля",
      allRequiredFieldsFilled: "Все обязательные поля заполнены. Можете перейти к следующему шагу.",
      placeholders: {
        firstName: "Введите ваше имя",
        lastName: "Введите вашу фамилию",
        email: "Введите ваш email (необязательно)"
      },
      helperText: {
        phoneFormat: "Формат: +38 (0ХХ) ХХХ-ХХ-ХХ",
        email: "Email необязателен, но поможет получать уведомления"
      },
      validation: {
        firstNameRequired: "Имя обязательно для заполнения",
        lastNameRequired: "Фамилия обязательна для заполнения",
        phoneRequired: "Телефон обязателен для заполнения",
        firstNameMinLength: "Имя должно быть не менее 2 символов",
        lastNameMinLength: "Фамилия должна быть не менее 2 символов",
        phoneStartsWith: "Телефон должен начинаться с +380",
        phoneLength: "Телефон должен содержать 12 цифр после +",
        emailFormat: "Введите корректный email адрес"
      },
      status: {
        authenticated: "Вы авторизованы как",
        dataPrefilledFromProfile: "Данные предзаполнены из вашего профиля.",
        guestBooking: "Вы создаете гостевое бронирование.",
        guestBookingInfo: "Информация о бронировании будет отправлена на указанный номер телефона."
      }
    },
    carType: {
      title: "Информация об автомобиле",
      licensePlate: "Номер автомобиля",
      licensePlateRequired: "Номер автомобиля обязателен для заполнения",
      licensePlatePlaceholder: "Введите номер автомобиля",
      carType: "Тип автомобиля",
      carBrand: "Марка автомобиля",
      carModel: "Модель автомобиля",
      selectCarType: "Выберите тип автомобиля",
      selectCarBrand: "Выберите марку",
      selectCarModel: "Выберите модель",
      myVehicles: "Мои автомобили",
      myVehiclesDescription: "Выберите один из ваших сохраненных автомобилей",
      noVehicles: "У вас пока нет сохраненных автомобилей",
      addVehicleToProfile: "Добавить автомобиль в профиль",
      vehicleTypes: "Типы автомобилей",
      vehicleTypesDescription: "Выберите подходящий тип вашего автомобиля",
      vehicleBrands: "Марки автомобилей",
      vehicleBrandsDescription: "Выберите марку вашего автомобиля",
      vehicleModels: "Модели автомобилей",
      vehicleModelsDescription: "Выберите модель вашего автомобиля",
      vehicleNumber: "Номер автомобиля",
      vehicleNumberDescription: "Введите государственный номер вашего автомобиля",
      loadingCarTypes: "Загрузка типов автомобилей...",
      loadingBrands: "Загрузка марок...",
      loadingModels: "Загрузка моделей...",
      loadingClientCars: "Загрузка ваших автомобилей...",
      errorLoadingCarTypes: "Ошибка загрузки типов автомобилей",
      errorLoadingBrands: "Ошибка загрузки марок",
      errorLoadingModels: "Ошибка загрузки моделей",
      errorLoadingClientCars: "Ошибка загрузки ваших автомобилей",
      requiredFieldsWarning: "Заполните все обязательные поля",
      allRequiredFieldsFilled: "Все обязательные поля заполнены. Можете перейти к следующему шагу.",
      selectedVehicle: "Выбранный автомобиль",
      changeVehicle: "Изменить автомобиль",
      vehicleInfo: "Информация об автомобиле",
      year: "Год выпуска"
    },
    dateTime: {
      title: "Дата и время",
      selectDate: "Выберите дату",
      selectTime: "Выберите время",
      availableSlots: "Доступные слоты",
      noSlotsAvailable: "На выбранную дату нет доступных слотов",
      loadingSlots: "Загрузка доступных слотов...",
      errorLoadingSlots: "Ошибка загрузки слотов",
      selectedDateTime: "Выбранная дата и время",
      changeDateTime: "Изменить дату и время",
      requiredFieldsWarning: "Заполните все обязательные поля",
      allRequiredFieldsFilled: "Все обязательные поля заполнены. Можете перейти к следующему шагу.",
      dateRequired: "Дата обязательна для заполнения",
      timeRequired: "Время обязательно для заполнения",
      calendar: "Календарь",
      timeSlots: "Временные слоты",
      selectDateFirst: "Сначала выберите дату",
      workingHours: "Рабочие часы",
      closed: "Закрыто",
      availableFrom: "Доступно с",
      availableTo: "до",
      duration: "Продолжительность",
      minutes: "мин"
    },
    services: {
      title: "Выбор услуг",
      availableServices: "Доступные услуги",
      selectedServices: "Выбранные услуги",
      noServices: "Нет доступных услуг",
      loadingServices: "Загрузка услуг...",
      errorLoadingServices: "Ошибка загрузки услуг",
      servicePrice: "Цена",
      serviceDuration: "Длительность",
      selectService: "Выбрать услугу",
      removeService: "Удалить услугу",
      totalPrice: "Общая стоимость",
      totalDuration: "Общая продолжительность",
      requiredFieldsWarning: "Выберите хотя бы одну услугу",
      allRequiredFieldsFilled: "Все обязательные поля заполнены. Можете перейти к следующему шагу.",
      serviceDescription: "Описание услуги",
      serviceDetails: "Детали услуги",
      priceFrom: "от",
      currency: "грн",
      minutesShort: "мин"
    },
    review: {
      title: "Подтверждение бронирования",
      bookingDetails: "Детали бронирования",
      servicePoint: "Сервисная точка",
      dateTime: "Дата и время",
      clientInfo: "Контактная информация",
      vehicleInfo: "Информация об автомобиле",
      selectedServices: "Выбранные услуги",
      totalCost: "Общая стоимость",
      confirmBooking: "Подтвердить бронирование",
      editStep: "Редактировать",
      loadingServicePoint: "Загрузка информации о сервисной точке...",
      loadingCity: "Загрузка информации о городе...",
      loadingCarType: "Загрузка информации о типе автомобиля...",
      errorLoadingData: "Ошибка загрузки данных",
      address: "Адрес",
      phone: "Телефон",
      workingHours: "Рабочие часы",
      notes: "Примечания",
      notesPlaceholder: "Добавьте примечания к бронированию (необязательно)",
      bookingSummary: "Сводка бронирования",
      paymentInfo: "Информация об оплате",
      paymentNote: "Оплата производится в сервисной точке после оказания услуг",
      termsAndConditions: "Условия бронирования",
      termsText: "Подверждая бронирование, вы соглашаетесь с условиями предоставления услуг",
      currency: "грн",
      minutesShort: "мин"
    },
    cityServicePoint: {
      title: "Выбор сервисной точки",
      selectCity: "Выберите город",
      selectServicePoint: "Выберите сервисную точку",
      availableServicePoints: "Доступные сервисные точки",
      noServicePoints: "В выбранном городе нет доступных сервисных точек",
      loadingServicePoints: "Загрузка сервисных точек...",
      errorLoadingServicePoints: "Ошибка загрузки сервисных точек",
      servicePointDetails: "Детали сервисной точки",
      address: "Адрес",
      phone: "Телефон",
      workingHours: "Рабочие часы",
      services: "Услуги",
      rating: "Рейтинг",
      reviews: "отзывов",
      selectPoint: "Выбрать точку",
      changePoint: "Изменить точку",
      requiredFieldsWarning: "Заполните все обязательные поля",
      allRequiredFieldsFilled: "Все обязательные поля заполнены. Можете перейти к следующему шагу.",
      cityRequired: "Город обязателен для заполнения",
      servicePointRequired: "Сервисная точка обязательна для заполнения",
      viewDetails: "Подробнее",
      hideDetails: "Скрыть",
      photosCount: "фото",
      servicesCount: "услуг",
      openNow: "Открыто",
      closedNow: "Закрыто",
      opensAt: "Откроется в",
      closesAt: "Закроется в"
    }
  }
};

// Украинские переводы (перевод с русского)
const ukTranslations = {
  bookingSteps: {
    categorySelection: {
      title: "Вибір категорії послуг",
      error: "Помилка завантаження категорій",
      citySelect: "Виберіть місто",
      cityPlaceholder: "Почніть вводити назву міста",
      noCitiesFound: "Міста не знайдено",
      loadingCities: "Завантаження міст...",
      availableCategories: "Доступні категорії послуг у місті",
      selectCityFirst: "Спочатку виберіть місто, щоб побачити доступні категорії послуг",
      noCategories: "У вибраному місті поки немає доступних категорій послуг. Спробуйте вибрати інше місто.",
      pointsCount: "точок",
      servicesCount: "послуг",
      allRequiredFieldsFilled: "Всі обов'язкові поля заповнено. Можете перейти до наступного кроку."
    },
    clientInfo: {
      title: "Контактна інформація",
      firstName: "Ім'я",
      lastName: "Прізвище",
      phone: "Телефон",
      email: "Email",
      privacy: "Конфіденційність",
      privacyText: "Ми використовуємо ваші дані лише для обробки бронювання і не передаємо їх третім особам.",
      requiredFieldsWarning: "Заповніть всі обов'язкові поля",
      allRequiredFieldsFilled: "Всі обов'язкові поля заповнено. Можете перейти до наступного кроку.",
      placeholders: {
        firstName: "Введіть ваше ім'я",
        lastName: "Введіть ваше прізвище",
        email: "Введіть ваш email (необов'язково)"
      },
      helperText: {
        phoneFormat: "Формат: +38 (0ХХ) ХХХ-ХХ-ХХ",
        email: "Email необов'язковий, але допоможе отримувати сповіщення"
      },
      validation: {
        firstNameRequired: "Ім'я обов'язкове для заповнення",
        lastNameRequired: "Прізвище обов'язкове для заповнення",
        phoneRequired: "Телефон обов'язковий для заповнення",
        firstNameMinLength: "Ім'я повинно бути не менше 2 символів",
        lastNameMinLength: "Прізвище повинно бути не менше 2 символів",
        phoneStartsWith: "Телефон повинен починатися з +380",
        phoneLength: "Телефон повинен містити 12 цифр після +",
        emailFormat: "Введіть коректний email адрес"
      },
      status: {
        authenticated: "Ви авторизовані як",
        dataPrefilledFromProfile: "Дані попередньо заповнені з вашого профілю.",
        guestBooking: "Ви створюєте гостьове бронювання.",
        guestBookingInfo: "Інформація про бронювання буде відправлена на вказаний номер телефону."
      }
    },
    carType: {
      title: "Інформація про автомобіль",
      licensePlate: "Номер автомобіля",
      licensePlateRequired: "Номер автомобіля обов'язковий для заповнення",
      licensePlatePlaceholder: "Введіть номер автомобіля",
      carType: "Тип автомобіля",
      carBrand: "Марка автомобіля",
      carModel: "Модель автомобіля",
      selectCarType: "Виберіть тип автомобіля",
      selectCarBrand: "Виберіть марку",
      selectCarModel: "Виберіть модель",
      myVehicles: "Мої автомобілі",
      myVehiclesDescription: "Виберіть один з ваших збережених автомобілів",
      noVehicles: "У вас поки немає збережених автомобілів",
      addVehicleToProfile: "Додати автомобіль до профілю",
      vehicleTypes: "Типи автомобілів",
      vehicleTypesDescription: "Виберіть підходящий тип вашого автомобіля",
      vehicleBrands: "Марки автомобілів",
      vehicleBrandsDescription: "Виберіть марку вашого автомобіля",
      vehicleModels: "Моделі автомобілів",
      vehicleModelsDescription: "Виберіть модель вашого автомобіля",
      vehicleNumber: "Номер автомобіля",
      vehicleNumberDescription: "Введіть державний номер вашого автомобіля",
      loadingCarTypes: "Завантаження типів автомобілів...",
      loadingBrands: "Завантаження марок...",
      loadingModels: "Завантаження моделей...",
      loadingClientCars: "Завантаження ваших автомобілів...",
      errorLoadingCarTypes: "Помилка завантаження типів автомобілів",
      errorLoadingBrands: "Помилка завантаження марок",
      errorLoadingModels: "Помилка завантаження моделей",
      errorLoadingClientCars: "Помилка завантаження ваших автомобілів",
      requiredFieldsWarning: "Заповніть всі обов'язкові поля",
      allRequiredFieldsFilled: "Всі обов'язкові поля заповнено. Можете перейти до наступного кроку.",
      selectedVehicle: "Вибраний автомобіль",
      changeVehicle: "Змінити автомобіль",
      vehicleInfo: "Інформація про автомобіль",
      year: "Рік випуску"
    },
    dateTime: {
      title: "Дата і час",
      selectDate: "Виберіть дату",
      selectTime: "Виберіть час",
      availableSlots: "Доступні слоти",
      noSlotsAvailable: "На вибрану дату немає доступних слотів",
      loadingSlots: "Завантаження доступних слотів...",
      errorLoadingSlots: "Помилка завантаження слотів",
      selectedDateTime: "Вибрана дата і час",
      changeDateTime: "Змінити дату і час",
      requiredFieldsWarning: "Заповніть всі обов'язкові поля",
      allRequiredFieldsFilled: "Всі обов'язкові поля заповнено. Можете перейти до наступного кроку.",
      dateRequired: "Дата обов'язкова для заповнення",
      timeRequired: "Час обов'язковий для заповнення",
      calendar: "Календар",
      timeSlots: "Часові слоти",
      selectDateFirst: "Спочатку виберіть дату",
      workingHours: "Робочі години",
      closed: "Зачинено",
      availableFrom: "Доступно з",
      availableTo: "до",
      duration: "Тривалість",
      minutes: "хв"
    },
    services: {
      title: "Вибір послуг",
      availableServices: "Доступні послуги",
      selectedServices: "Вибрані послуги",
      noServices: "Немає доступних послуг",
      loadingServices: "Завантаження послуг...",
      errorLoadingServices: "Помилка завантаження послуг",
      servicePrice: "Ціна",
      serviceDuration: "Тривалість",
      selectService: "Вибрати послугу",
      removeService: "Видалити послугу",
      totalPrice: "Загальна вартість",
      totalDuration: "Загальна тривалість",
      requiredFieldsWarning: "Виберіть хоча б одну послугу",
      allRequiredFieldsFilled: "Всі обов'язкові поля заповнено. Можете перейти до наступного кроку.",
      serviceDescription: "Опис послуги",
      serviceDetails: "Деталі послуги",
      priceFrom: "від",
      currency: "грн",
      minutesShort: "хв"
    },
    review: {
      title: "Підтвердження бронювання",
      bookingDetails: "Деталі бронювання",
      servicePoint: "Сервісна точка",
      dateTime: "Дата і час",
      clientInfo: "Контактна інформація",
      vehicleInfo: "Інформація про автомобіль",
      selectedServices: "Вибрані послуги",
      totalCost: "Загальна вартість",
      confirmBooking: "Підтвердити бронювання",
      editStep: "Редагувати",
      loadingServicePoint: "Завантаження інформації про сервісну точку...",
      loadingCity: "Завантаження інформації про місто...",
      loadingCarType: "Завантаження інформації про тип автомобіля...",
      errorLoadingData: "Помилка завантаження даних",
      address: "Адреса",
      phone: "Телефон",
      workingHours: "Робочі години",
      notes: "Примітки",
      notesPlaceholder: "Додайте примітки до бронювання (необов'язково)",
      bookingSummary: "Зведення бронювання",
      paymentInfo: "Інформація про оплату",
      paymentNote: "Оплата здійснюється в сервісній точці після надання послуг",
      termsAndConditions: "Умови бронювання",
      termsText: "Підтверджуючи бронирование, ви погоджуєтесь з умовами надання послуг",
      currency: "грн",
      minutesShort: "хв"
    },
    cityServicePoint: {
      title: "Вибір сервісної точки",
      selectCity: "Виберіть місто",
      selectServicePoint: "Виберіть сервісну точку",
      availableServicePoints: "Доступні сервісні точки",
      noServicePoints: "У вибраному місті немає доступних сервісних точок",
      loadingServicePoints: "Завантаження сервісних точок...",
      errorLoadingServicePoints: "Помилка завантаження сервісних точок",
      servicePointDetails: "Деталі сервісної точки",
      address: "Адреса",
      phone: "Телефон",
      workingHours: "Робочі години",
      services: "Послуги",
      rating: "Рейтинг",
      reviews: "відгуків",
      selectPoint: "Вибрати точку",
      changePoint: "Змінити точку",
      requiredFieldsWarning: "Заповніть всі обов'язкові поля",
      allRequiredFieldsFilled: "Всі обов'язкові поля заповнено. Можете перейти до наступного кроку.",
      cityRequired: "Місто обов'язкове для заповнення",
      servicePointRequired: "Сервісна точка обов'язкова для заповнення",
      viewDetails: "Детальніше",
      hideDetails: "Сховати",
      photosCount: "фото",
      servicesCount: "послуг",
      openNow: "Відкрито",
      closedNow: "Зачинено",
      opensAt: "Відкриється о",
      closesAt: "Закриється о"
    }
  }
};

// Основная функция
function main() {
  console.log('🚀 Начинаю добавление переводов для шагов формы бронирования...');
  
  // Читаем существующие файлы переводов
  const ruData = readJsonFile(ruFilePath);
  const ukData = readJsonFile(ukFilePath);
  
  // Добавляем новые переводы
  const updatedRuData = { ...ruData, ...newTranslations };
  const updatedUkData = { ...ukData, ...ukTranslations };
  
  // Записываем обновленные файлы
  writeJsonFile(ruFilePath, updatedRuData);
  writeJsonFile(ukFilePath, updatedUkData);
  
  console.log('✅ Переводы для шагов формы бронирования успешно добавлены!');
  console.log('📊 Статистика:');
  console.log(`   - Добавлено основных разделов: ${Object.keys(newTranslations.bookingSteps).length}`);
  console.log(`   - Общее количество новых ключей: ${JSON.stringify(newTranslations).split('"').length / 2}`);
  console.log('🎯 Теперь нужно обновить компоненты для использования новых ключей переводов');
}

// Запускаем скрипт
main(); 