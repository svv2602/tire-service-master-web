const fs = require('fs');
const path = require('path');

// Путь к файлам переводов
const localesPath = path.join(__dirname, '../../src/i18n/locales');
const ruPath = path.join(localesPath, 'ru.json');
const ukPath = path.join(localesPath, 'uk.json');

// Переводы для клиентских страниц
const clientTranslations = {
  ru: {
    client: {
      // Главная страница
      mainPage: {
        title: "Найдите лучший автосервис рядом с вами",
        subtitle: "Быстрое бронирование, проверенные мастера, гарантия качества",
        searchPlaceholder: "Найти сервис или услугу",
        cityPlaceholder: "Город",
        searchButton: "Найти",
        bookOnlineButton: "Записаться онлайн",
        personalCabinetButton: "Личный кабинет",
        servicesTitle: "Услуги",
        footerTitle: "🚗 Твоя Шина",
        footerDescription: "Найдите лучший автосервис рядом с вами. Быстрое бронирование, проверенные мастера.",
        loading: "Загрузка...",
        readyToBook: "Готовы записаться на обслуживание?",
        chooseTimeAndService: "Выберите удобное время и ближайший сервис"
      },
      
      // Поиск сервисов
      search: {
        title: "🔍 Поиск сервисных точек",
        subtitle: "Найдите идеальный автосервис в вашем городе",
        searchPlaceholder: "Поиск по названию или услугам...",
        cityLabel: "Город",
        selectCity: "Выберите город",
        serviceTypeLabel: "Тип услуги", 
        selectServiceType: "Все услуги",
        searchButton: "Найти",
        clearFilters: "Очистить фильтры",
        resultsFound: "Найдено {{count}} результатов",
        noResults: "Ничего не найдено",
        noResultsDescription: "Попробуйте изменить критерии поиска",
        bookNow: "Записаться",
        viewDetails: "Подробнее",
        openNow: "Открыто сейчас",
        closedNow: "Закрыто",
        rating: "Рейтинг",
        reviews: "отзывов",
        workingHours: "Часы работы",
        address: "Адрес",
        phone: "Телефон",
        services: "Услуги",
        photos: "Фотографии"
      },
      
      // Страница услуг
      services: {
        title: "🔧 Поиск услуг",
        subtitle: "Найдите нужную услугу в вашем городе и запишитесь на удобное время",
        cityFilter: "Город",
        selectCity: "Выберите город",
        allCategories: "Все категории",
        servicePoints: "точек",
        bookService: "Записаться",
        viewServicePoints: "Смотреть точки",
        noServices: "Услуги не найдены",
        noServicesDescription: "Попробуйте выбрать другой город или категорию"
      },
      
      // Личный кабинет
      profile: {
        title: "Мой профиль",
        personalData: "Личные данные",
        myCars: "Мои автомобили",
        statistics: "Статистика",
        security: "Безопасность", 
        settings: "Настройки",
        client: "Клиент",
        administrator: "Администратор",
        loading: "Загрузка...",
        
        // Личные данные
        firstName: "Имя",
        lastName: "Фамилия",
        email: "Email",
        phone: "Телефон",
        saveChanges: "Сохранить изменения",
        saving: "Сохранение...",
        
        // Автомобили
        addCar: "Добавить автомобиль",
        editCar: "Редактировать автомобиль",
        deleteCar: "Удалить автомобиль",
        noCars: "У вас пока нет добавленных автомобилей",
        addFirstCar: "Добавьте свой первый автомобиль",
        carBrand: "Марка",
        carModel: "Модель",
        year: "Год выпуска",
        licensePlate: "Номер",
        carType: "Тип автомобиля",
        selectBrand: "Выберите марку",
        selectModel: "Выберите модель",
        selectCarType: "Выберите тип",
        confirmDelete: "Подтвердите удаление",
        confirmDeleteCar: "Вы действительно хотите удалить этот автомобиль?",
        
        // Статистика
        statisticsTitle: "Статистика использования",
        totalBookings: "Всего бронирований",
        completedServices: "Выполненных услуг",
        activeBookings: "Активных бронирований",
        
        // Безопасность
        changePassword: "Изменить пароль",
        currentPassword: "Текущий пароль",
        newPassword: "Новый пароль",
        confirmPassword: "Подтвердите пароль",
        passwordChanged: "Пароль успешно изменен"
      },
      
      // Мои записи
      myBookings: {
        title: "Мои записи",
        newBooking: "Новая запись",
        welcome: "🎉 Добро пожаловать в личный кабинет!",
        welcomeDescription: "Ваш аккаунт успешно создан и бронирование добавлено. Теперь вы можете управлять своими записями.",
        upcoming: "Предстоящие",
        completed: "Завершенные", 
        cancelled: "Отмененные",
        confirmed: "Подтвержденные",
        noBookings: "У вас пока нет записей",
        noBookingsDescription: "Создайте первую запись для начала",
        createBooking: "Создать запись",
        loading: "Загрузка...",
        bookingDetails: "Детали записи",
        servicePoint: "Сервисная точка",
        service: "Услуга",
        date: "Дата",
        time: "Время",
        status: "Статус",
        car: "Автомобиль",
        reschedule: "Перенести",
        cancel: "Отменить",
        viewDetails: "Подробнее"
      },
      
      // Детали записи
      bookingDetails: {
        title: "Детали записи",
        backToBookings: "Назад к записям",
        generalInfo: "Общая информация",
        serviceInfo: "Информация об услуге",
        carInfo: "Информация об автомобиле",
        contactInfo: "Контактная информация",
        bookingNumber: "Номер записи",
        status: "Статус",
        date: "Дата",
        time: "Время",
        servicePoint: "Сервисная точка",
        service: "Услуга",
        duration: "Длительность",
        price: "Стоимость",
        car: "Автомобиль",
        licensePlate: "Номер",
        client: "Клиент",
        phone: "Телефон",
        email: "Email",
        notes: "Примечания",
        reschedule: "Перенести запись",
        cancel: "Отменить запись",
        loading: "Загрузка...",
        notFound: "Запись не найдена",
        accessDenied: "У вас нет доступа к этой записи"
      },
      
      // Перенос записи
      reschedule: {
        title: "Перенос записи",
        subtitle: "Выберите новую дату и время для вашей записи",
        currentBooking: "Текущая запись",
        newDateTime: "Новые дата и время",
        selectDate: "Выберите дату",
        selectTime: "Выберите время",
        availableSlots: "Доступные слоты",
        noSlotsAvailable: "Нет доступных слотов на выбранную дату",
        confirmReschedule: "Подтвердить перенос",
        cancel: "Отменить",
        loading: "Загрузка...",
        rescheduling: "Перенос...",
        success: "Запись успешно перенесена",
        error: "Ошибка при переносе записи"
      },
      
      // Успешное бронирование
      bookingSuccess: {
        title: "🎉 Запись успешно создана!",
        subtitle: "Мы отправили подтверждение на ваш email",
        bookingNumber: "Номер записи",
        servicePoint: "Сервисная точка",
        date: "Дата",
        time: "Время",
        service: "Услуга",
        nextSteps: "Что дальше?",
        step1: "Мы свяжемся с вами для подтверждения",
        step2: "Приходите в назначенное время",
        step3: "Получите качественную услугу",
        goToBookings: "Мои записи",
        createAnother: "Создать еще одну запись",
        backToMain: "На главную"
      },
      
      // Отзывы
      reviews: {
        title: "Мои отзывы",
        writeReview: "Написать отзыв",
        noReviews: "У вас пока нет отзывов",
        noReviewsDescription: "После завершения обслуживания вы сможете оставить отзыв",
        rating: "Оценка",
        comment: "Комментарий",
        booking: "Запись",
        servicePoint: "Сервисная точка",
        publishedDate: "Опубликовано",
        edit: "Редактировать",
        delete: "Удалить"
      },
      
      // Форма отзыва
      reviewForm: {
        title: "Написать отзыв",
        editTitle: "Редактировать отзыв",
        selectBooking: "Выберите запись",
        selectServicePoint: "Выберите сервисную точку",
        withoutBooking: "Без записи",
        rating: "Оценка",
        ratingRequired: "Оценка обязательна",
        comment: "Ваш отзыв",
        commentPlaceholder: "Поделитесь своими впечатлениями о качестве обслуживания...",
        commentRequired: "Комментарий обязателен",
        submit: "Отправить отзыв",
        update: "Обновить отзыв",
        cancel: "Отменить",
        submitting: "Отправка...",
        updating: "Обновление...",
        success: "Отзыв успешно отправлен",
        updateSuccess: "Отзыв успешно обновлен",
        error: "Ошибка при отправке отзыва"
      },
      
      // Детали сервисной точки
      servicePointDetail: {
        title: "Детали сервисной точки",
        backToSearch: "Назад к поиску",
        bookNow: "Записаться",
        callNow: "Позвонить",
        showOnMap: "Показать на карте",
        workingHours: "Часы работы",
        services: "Услуги",
        reviews: "Отзывы",
        photos: "Фотографии",
        contactInfo: "Контактная информация",
        address: "Адрес",
        phone: "Телефон",
        website: "Веб-сайт",
        rating: "Рейтинг",
        reviewsCount: "отзывов",
        openNow: "Открыто сейчас",
        closedNow: "Закрыто",
        noServices: "Услуги не указаны",
        noReviews: "Пока нет отзывов",
        noPhotos: "Фотографии не добавлены",
        loading: "Загрузка...",
        notFound: "Сервисная точка не найдена"
      }
    }
  },
  
  uk: {
    client: {
      // Головна сторінка
      mainPage: {
        title: "Знайдіть найкращий автосервіс поруч з вами",
        subtitle: "Швидке бронювання, перевірені майстри, гарантія якості",
        searchPlaceholder: "Знайти сервіс або послугу",
        cityPlaceholder: "Місто",
        searchButton: "Знайти",
        bookOnlineButton: "Записатися онлайн",
        personalCabinetButton: "Особистий кабінет",
        servicesTitle: "Послуги",
        footerTitle: "🚗 Твоя Шина",
        footerDescription: "Знайдіть найкращий автосервіс поруч з вами. Швидке бронювання, перевірені майстри.",
        loading: "Завантаження...",
        readyToBook: "Готові записатися на обслуговування?",
        chooseTimeAndService: "Оберіть зручний час та найближчий сервіс"
      },
      
      // Пошук сервісів
      search: {
        title: "🔍 Пошук сервісних точок",
        subtitle: "Знайдіть ідеальний автосервіс у вашому місті",
        searchPlaceholder: "Пошук за назвою або послугами...",
        cityLabel: "Місто",
        selectCity: "Оберіть місто",
        serviceTypeLabel: "Тип послуги",
        selectServiceType: "Всі послуги",
        searchButton: "Знайти",
        clearFilters: "Очистити фільтри",
        resultsFound: "Знайдено {{count}} результатів",
        noResults: "Нічого не знайдено",
        noResultsDescription: "Спробуйте змінити критерії пошуку",
        bookNow: "Записатися",
        viewDetails: "Детальніше",
        openNow: "Відкрито зараз",
        closedNow: "Зачинено",
        rating: "Рейтинг",
        reviews: "відгуків",
        workingHours: "Години роботи",
        address: "Адреса",
        phone: "Телефон",
        services: "Послуги",
        photos: "Фотографії"
      },
      
      // Сторінка послуг
      services: {
        title: "🔧 Пошук послуг",
        subtitle: "Знайдіть потрібну послугу у вашому місті та запишіться на зручний час",
        cityFilter: "Місто",
        selectCity: "Оберіть місто",
        allCategories: "Всі категорії",
        servicePoints: "точок",
        bookService: "Записатися",
        viewServicePoints: "Дивитися точки",
        noServices: "Послуги не знайдено",
        noServicesDescription: "Спробуйте обрати інше місто або категорію"
      },
      
      // Особистий кабінет
      profile: {
        title: "Мій профіль",
        personalData: "Особисті дані",
        myCars: "Мої автомобілі",
        statistics: "Статистика",
        security: "Безпека",
        settings: "Налаштування",
        client: "Клієнт",
        administrator: "Адміністратор",
        loading: "Завантаження...",
        
        // Особисті дані
        firstName: "Ім'я",
        lastName: "Прізвище",
        email: "Email",
        phone: "Телефон",
        saveChanges: "Зберегти зміни",
        saving: "Збереження...",
        
        // Автомобілі
        addCar: "Додати автомобіль",
        editCar: "Редагувати автомобіль",
        deleteCar: "Видалити автомобіль",
        noCars: "У вас поки немає доданих автомобілів",
        addFirstCar: "Додайте свій перший автомобіль",
        carBrand: "Марка",
        carModel: "Модель",
        year: "Рік випуску",
        licensePlate: "Номер",
        carType: "Тип автомобіля",
        selectBrand: "Оберіть марку",
        selectModel: "Оберіть модель",
        selectCarType: "Оберіть тип",
        confirmDelete: "Підтвердіть видалення",
        confirmDeleteCar: "Ви дійсно хочете видалити цей автомобіль?",
        
        // Статистика
        statisticsTitle: "Статистика використання",
        totalBookings: "Всього бронювань",
        completedServices: "Виконаних послуг",
        activeBookings: "Активних бронювань",
        
        // Безпека
        changePassword: "Змінити пароль",
        currentPassword: "Поточний пароль",
        newPassword: "Новий пароль",
        confirmPassword: "Підтвердіть пароль",
        passwordChanged: "Пароль успішно змінено"
      },
      
      // Мої записи
      myBookings: {
        title: "Мої записи",
        newBooking: "Новий запис",
        welcome: "🎉 Ласкаво просимо до особистого кабінету!",
        welcomeDescription: "Ваш акаунт успішно створено та бронювання додано. Тепер ви можете керувати своїми записами.",
        upcoming: "Майбутні",
        completed: "Завершені",
        cancelled: "Скасовані",
        confirmed: "Підтверджені",
        noBookings: "У вас поки немає записів",
        noBookingsDescription: "Створіть перший запис для початку",
        createBooking: "Створити запис",
        loading: "Завантаження...",
        bookingDetails: "Деталі запису",
        servicePoint: "Сервісна точка",
        service: "Послуга",
        date: "Дата",
        time: "Час",
        status: "Статус",
        car: "Автомобіль",
        reschedule: "Перенести",
        cancel: "Скасувати",
        viewDetails: "Детальніше"
      },
      
      // Деталі запису
      bookingDetails: {
        title: "Деталі запису",
        backToBookings: "Назад до записів",
        generalInfo: "Загальна інформація",
        serviceInfo: "Інформація про послугу",
        carInfo: "Інформація про автомобіль",
        contactInfo: "Контактна інформація",
        bookingNumber: "Номер запису",
        status: "Статус",
        date: "Дата",
        time: "Час",
        servicePoint: "Сервісна точка",
        service: "Послуга",
        duration: "Тривалість",
        price: "Вартість",
        car: "Автомобіль",
        licensePlate: "Номер",
        client: "Клієнт",
        phone: "Телефон",
        email: "Email",
        notes: "Примітки",
        reschedule: "Перенести запис",
        cancel: "Скасувати запис",
        loading: "Завантаження...",
        notFound: "Запис не знайдено",
        accessDenied: "У вас немає доступу до цього запису"
      },
      
      // Перенесення запису
      reschedule: {
        title: "Перенесення запису",
        subtitle: "Оберіть нову дату та час для вашого запису",
        currentBooking: "Поточний запис",
        newDateTime: "Нові дата та час",
        selectDate: "Оберіть дату",
        selectTime: "Оберіть час",
        availableSlots: "Доступні слоти",
        noSlotsAvailable: "Немає доступних слотів на обрану дату",
        confirmReschedule: "Підтвердити перенесення",
        cancel: "Скасувати",
        loading: "Завантаження...",
        rescheduling: "Перенесення...",
        success: "Запис успішно перенесено",
        error: "Помилка при перенесенні запису"
      },
      
      // Успішне бронювання
      bookingSuccess: {
        title: "🎉 Запис успішно створено!",
        subtitle: "Ми надіслали підтвердження на ваш email",
        bookingNumber: "Номер запису",
        servicePoint: "Сервісна точка",
        date: "Дата",
        time: "Час",
        service: "Послуга",
        nextSteps: "Що далі?",
        step1: "Ми зв'яжемося з вами для підтвердження",
        step2: "Приходьте у призначений час",
        step3: "Отримайте якісну послугу",
        goToBookings: "Мої записи",
        createAnother: "Створити ще один запис",
        backToMain: "На головну"
      },
      
      // Відгуки
      reviews: {
        title: "Мої відгуки",
        writeReview: "Написати відгук",
        noReviews: "У вас поки немає відгуків",
        noReviewsDescription: "Після завершення обслуговування ви зможете залишити відгук",
        rating: "Оцінка",
        comment: "Коментар",
        booking: "Запис",
        servicePoint: "Сервісна точка",
        publishedDate: "Опубліковано",
        edit: "Редагувати",
        delete: "Видалити"
      },
      
      // Форма відгуку
      reviewForm: {
        title: "Написати відгук",
        editTitle: "Редагувати відгук",
        selectBooking: "Оберіть запис",
        selectServicePoint: "Оберіть сервісну точку",
        withoutBooking: "Без запису",
        rating: "Оцінка",
        ratingRequired: "Оцінка обов'язкова",
        comment: "Ваш відгук",
        commentPlaceholder: "Поділіться своїми враженнями про якість обслуговування...",
        commentRequired: "Коментар обов'язковий",
        submit: "Надіслати відгук",
        update: "Оновити відгук",
        cancel: "Скасувати",
        submitting: "Надсилання...",
        updating: "Оновлення...",
        success: "Відгук успішно надіслано",
        updateSuccess: "Відгук успішно оновлено",
        error: "Помилка при надсиланні відгуку"
      },
      
      // Деталі сервісної точки
      servicePointDetail: {
        title: "Деталі сервісної точки",
        backToSearch: "Назад до пошуку",
        bookNow: "Записатися",
        callNow: "Подзвонити",
        showOnMap: "Показати на карті",
        workingHours: "Години роботи",
        services: "Послуги",
        reviews: "Відгуки",
        photos: "Фотографії",
        contactInfo: "Контактна інформація",
        address: "Адреса",
        phone: "Телефон",
        website: "Веб-сайт",
        rating: "Рейтинг",
        reviewsCount: "відгуків",
        openNow: "Відкрито зараз",
        closedNow: "Зачинено",
        noServices: "Послуги не вказано",
        noReviews: "Поки немає відгуків",
        noPhotos: "Фотографії не додано",
        loading: "Завантаження...",
        notFound: "Сервісну точку не знайдено"
      }
    }
  }
};

function addClientTranslations() {
  try {
    // Обработка русского файла
    const ruContent = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
    
    // Добавляем переводы клиентской части
    ruContent.client = clientTranslations.ru.client;
    
    // Сохраняем файл
    fs.writeFileSync(ruPath, JSON.stringify(ruContent, null, 2), 'utf8');
    console.log('✅ Добавлены переводы клиентских страниц в ru.json');
    
    // Обработка украинского файла
    const ukContent = JSON.parse(fs.readFileSync(ukPath, 'utf8'));
    
    // Добавляем переводы клиентской части
    ukContent.client = clientTranslations.uk.client;
    
    // Сохраняем файл
    fs.writeFileSync(ukPath, JSON.stringify(ukContent, null, 2), 'utf8');
    console.log('✅ Добавлены переводы клиентских страниц в uk.json');
    
    console.log('\n🎯 РЕЗУЛЬТАТ: Переводы всех клиентских страниц добавлены успешно!');
    console.log('📝 Добавленные секции:');
    console.log('- client.mainPage (главная страница)');
    console.log('- client.search (поиск сервисов)');
    console.log('- client.services (страница услуг)');
    console.log('- client.profile (личный кабинет)');
    console.log('- client.myBookings (мои записи)');
    console.log('- client.bookingDetails (детали записи)');
    console.log('- client.reschedule (перенос записи)');
    console.log('- client.bookingSuccess (успешное бронирование)');
    console.log('- client.reviews (отзывы)');
    console.log('- client.reviewForm (форма отзыва)');
    console.log('- client.servicePointDetail (детали сервисной точки)');
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении переводов клиентских страниц:', error);
  }
}

// Запуск скрипта
addClientTranslations(); 