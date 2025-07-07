const fs = require('fs');
const path = require('path');

// Переводы для навигации
const navigationTranslations = {
  ru: {
    navigation: {
      appTitle: "Твоя шина - Администратор",
      sections: {
        overview: "Обзор",
        management: "Управление",
        service: "Сервис",
        content: "Контент",
        bookings: "Бронирования",
        reviews: "Отзывы",
        references: "Справочники",
        settings: "Настройки"
      },
      dashboard: "Дашборд",
      homepage: "Главная страница",
      users: "Пользователи",
      partners: "Партнеры",
      clients: "Клиенты",
      servicePoints: "Сервисные точки",
      myServicePoints: "Мои точки",
      articles: "Статьи",
      allContent: "Весь контент",
      createContent: "Создать контент",
      advancedManagement: "Расширенное управление",
      seoSettings: "SEO настройки",
      styleGuide: "StyleGuide",
      allBookings: "Все бронирования",
      bookingCalendar: "📅 Календарь записей",
      analyticsReports: "📊 Аналитика и отчеты",
      myBookings: "Мои бронирования",
      allReviews: "Все отзывы",
      regionsAndCities: "Регионы и города",
      vehicles: "Автомобили",
      profile: "Профиль",
      systemSettings: "Системные настройки",
      descriptions: {
        dashboard: "Общая статистика и показатели",
        homepage: "Ваша персональная панель",
        users: "Управление пользователями системы",
        partners: "Управление партнерами",
        clients: "Управление клиентами",
        servicePoints: "Управление точками обслуживания",
        myServicePoints: "Управление собственными точками",
        articles: "Управление статьями базы знаний",
        allContent: "Просмотр всего контента страниц",
        createContent: "Создание нового контента",
        advancedManagement: "Продвинутые инструменты управления контентом",
        seoSettings: "Управление SEO-параметрами",
        styleGuide: "Руководство по стилям и компонентам UI",
        allBookings: "Управление бронированиями",
        bookingCalendar: "Календарное представление бронирований",
        analyticsReports: "Аналитика и статистика бронирований",
        myBookings: "Ваши бронирования",
        allReviews: "Управление отзывами клиентов",
        regionsAndCities: "Управление регионами и городами",
        vehicles: "Управление марками и моделями автомобилей",
        profile: "Настройки профиля",
        systemSettings: "Общие настройки системы"
      }
    },
    userMenu: {
      login: "Войти",
      profile: "Профиль",
      myBookings: "Мои записи",
      myReviews: "Мои отзывы",
      toWebsite: "На сайт",
      adminPanel: "Админ-панель",
      logout: "Выйти"
    }
  },
  uk: {
    navigation: {
      appTitle: "Твоя шина - Адміністратор",
      sections: {
        overview: "Огляд",
        management: "Управління",
        service: "Сервіс",
        content: "Контент",
        bookings: "Бронювання",
        reviews: "Відгуки",
        references: "Довідники",
        settings: "Налаштування"
      },
      dashboard: "Дашборд",
      homepage: "Головна сторінка",
      users: "Користувачі",
      partners: "Партнери",
      clients: "Клієнти",
      servicePoints: "Сервісні точки",
      myServicePoints: "Мої точки",
      articles: "Статті",
      allContent: "Весь контент",
      createContent: "Створити контент",
      advancedManagement: "Розширене управління",
      seoSettings: "SEO налаштування",
      styleGuide: "StyleGuide",
      allBookings: "Усі бронювання",
      bookingCalendar: "📅 Календар записів",
      analyticsReports: "📊 Аналітика та звіти",
      myBookings: "Мої бронювання",
      allReviews: "Усі відгуки",
      regionsAndCities: "Регіони та міста",
      vehicles: "Автомобілі",
      profile: "Профіль",
      systemSettings: "Системні налаштування",
      descriptions: {
        dashboard: "Загальна статистика та показники",
        homepage: "Ваша персональна панель",
        users: "Управління користувачами системи",
        partners: "Управління партнерами",
        clients: "Управління клієнтами",
        servicePoints: "Управління точками обслуговування",
        myServicePoints: "Управління власними точками",
        articles: "Управління статтями бази знань",
        allContent: "Перегляд усього контенту сторінок",
        createContent: "Створення нового контенту",
        advancedManagement: "Просунуті інструменти управління контентом",
        seoSettings: "Управління SEO-параметрами",
        styleGuide: "Керівництво зі стилів та компонентів UI",
        allBookings: "Управління бронюваннями",
        bookingCalendar: "Календарне представлення бронювань",
        analyticsReports: "Аналітика та статистика бронювань",
        myBookings: "Ваші бронювання",
        allReviews: "Управління відгуками клієнтів",
        regionsAndCities: "Управління регіонами та містами",
        vehicles: "Управління марками та моделями автомобілів",
        profile: "Налаштування профілю",
        systemSettings: "Загальні налаштування системи"
      }
    },
    userMenu: {
      login: "Увійти",
      profile: "Профіль",
      myBookings: "Мої записи",
      myReviews: "Мої відгуки",
      toWebsite: "На сайт",
      adminPanel: "Адмін-панель",
      logout: "Вийти"
    }
  }
};

function addNavigationTranslations() {
  const localesDir = path.join(__dirname, '../../src/i18n/locales');
  
  ['ru', 'uk'].forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    
    console.log(`🔧 Добавляю переводы навигации для ${lang}...`);
    
    try {
      // Читаем существующий файл
      const content = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(content);
      
      // Добавляем новые переводы
      const newLangTranslations = navigationTranslations[lang];
      
      // Добавляем navigation
      translations.navigation = newLangTranslations.navigation;
      
      // Добавляем userMenu
      translations.userMenu = newLangTranslations.userMenu;
      
      // Сохраняем файл с правильным форматированием
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
      
      console.log(`✅ ${lang}.json обновлен`);
      
    } catch (error) {
      console.error(`❌ Ошибка при обновлении ${lang}.json:`, error);
    }
  });
  
  console.log('\n🎉 Переводы навигации добавлены!');
}

// Запускаем добавление переводов
addNavigationTranslations(); 