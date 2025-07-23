import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SEOProps } from '../components/common/SEOHead';

// Типы для предустановленных SEO конфигураций
type PageType = 
  | 'home'
  | 'services' 
  | 'search'
  | 'booking'
  | 'profile'
  | 'calculator'
  | 'knowledge-base'
  | 'article'
  | 'service-point'
  | 'admin'
  | 'login'
  | 'register';

interface PageSEOConfig {
  title: string;
  description: string;
  keywords: string[];
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export const useSEO = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentLanguage = i18n.language || 'uk';
  
  // Предустановленные SEO конфигурации для разных страниц
  const getPageSEOConfig = (pageType: PageType): PageSEOConfig => {
    const configs: Record<PageType, PageSEOConfig> = {
      home: {
        title: currentLanguage === 'uk' 
          ? 'Головна сторінка' 
          : 'Главная страница',
        description: currentLanguage === 'uk'
          ? 'Твоя Шина - найкращий шиномонтаж в Україні. Професійні послуги, швидкий сервіс, доступні ціни. Онлайн запис на зручний час.'
          : 'Твоя Шина - лучший шиномонтаж в Украине. Профессиональные услуги, быстрый сервис, доступные цены. Онлайн запись на удобное время.',
        keywords: currentLanguage === 'uk'
          ? ['шиномонтаж', 'заміна шин', 'балансування', 'ремонт шин', 'автосервіс', 'Україна', 'онлайн запис']
          : ['шиномонтаж', 'замена шин', 'балансировка', 'ремонт шин', 'автосервис', 'Украина', 'онлайн запись']
      },
      
      services: {
        title: currentLanguage === 'uk' 
          ? 'Послуги шиномонтажу' 
          : 'Услуги шиномонтажа',
        description: currentLanguage === 'uk'
          ? 'Повний спектр послуг шиномонтажу: заміна шин, балансування коліс, ремонт проколів, сезонне зберігання. Професійне обладнання та досвідчені майстри.'
          : 'Полный спектр услуг шиномонтажа: замена шин, балансировка колес, ремонт проколов, сезонное хранение. Профессиональное оборудование и опытные мастера.',
        keywords: currentLanguage === 'uk'
          ? ['послуги шиномонтажу', 'заміна шин', 'балансування коліс', 'ремонт проколів', 'сезонне зберігання']
          : ['услуги шиномонтажа', 'замена шин', 'балансировка колес', 'ремонт проколов', 'сезонное хранение']
      },
      
      search: {
        title: currentLanguage === 'uk' 
          ? 'Пошук сервісних точок' 
          : 'Поиск сервисных точек',
        description: currentLanguage === 'uk'
          ? 'Знайдіть найближчу сервісну точку шиномонтажу. Зручне розташування по всій Україні, актуальна інформація про роботу та послуги.'
          : 'Найдите ближайшую сервисную точку шиномонтажа. Удобное расположение по всей Украине, актуальная информация о работе и услугах.',
        keywords: currentLanguage === 'uk'
          ? ['сервісні точки', 'шиномонтаж поруч', 'карта сервісів', 'адреси шиномонтажу']
          : ['сервисные точки', 'шиномонтаж рядом', 'карта сервисов', 'адреса шиномонтажа']
      },
      
      booking: {
        title: currentLanguage === 'uk' 
          ? 'Онлайн запис' 
          : 'Онлайн запись',
        description: currentLanguage === 'uk'
          ? 'Зручний онлайн запис на послуги шиномонтажу. Оберіть дату, час та сервісну точку. Швидко, просто, без черг.'
          : 'Удобная онлайн запись на услуги шиномонтажа. Выберите дату, время и сервисную точку. Быстро, просто, без очередей.',
        keywords: currentLanguage === 'uk'
          ? ['онлайн запис', 'бронювання', 'запис на шиномонтаж', 'без черг']
          : ['онлайн запись', 'бронирование', 'запись на шиномонтаж', 'без очередей']
      },
      
      calculator: {
        title: currentLanguage === 'uk' 
          ? 'Калькулятор шин' 
          : 'Калькулятор шин',
        description: currentLanguage === 'uk'
          ? 'Розрахуйте вартість заміни шин та інших послуг шиномонтажу. Точні ціни, прозора система розрахунків.'
          : 'Рассчитайте стоимость замены шин и других услуг шиномонтажа. Точные цены, прозрачная система расчетов.',
        keywords: currentLanguage === 'uk'
          ? ['калькулятор шин', 'розрахунок вартості', 'ціни на шиномонтаж', 'вартість послуг']
          : ['калькулятор шин', 'расчет стоимости', 'цены на шиномонтаж', 'стоимость услуг']
      },
      
      'knowledge-base': {
        title: currentLanguage === 'uk' 
          ? 'База знань' 
          : 'База знаний',
        description: currentLanguage === 'uk'
          ? 'Корисні статті про догляд за шинами, вибір резини, сезонну заміну та інші поради від експертів шиномонтажу.'
          : 'Полезные статьи о уходе за шинами, выборе резины, сезонной замене и другие советы от экспертов шиномонтажа.',
        keywords: currentLanguage === 'uk'
          ? ['база знань', 'поради по шинах', 'догляд за шинами', 'вибір резини', 'статті']
          : ['база знаний', 'советы по шинам', 'уход за шинами', 'выбор резины', 'статьи']
      },
      
      article: {
        title: '', // Будет заполнено динамически
        description: '',
        keywords: currentLanguage === 'uk'
          ? ['стаття', 'поради', 'шини', 'автомобіль']
          : ['статья', 'советы', 'шины', 'автомобиль'],
        type: 'article'
      },
      
      'service-point': {
        title: '', // Будет заполнено динамически
        description: '',
        keywords: currentLanguage === 'uk'
          ? ['сервісна точка', 'шиномонтаж', 'адреса', 'контакти']
          : ['сервисная точка', 'шиномонтаж', 'адрес', 'контакты']
      },
      
      profile: {
        title: currentLanguage === 'uk' 
          ? 'Мій профіль' 
          : 'Мой профиль',
        description: currentLanguage === 'uk'
          ? 'Особистий кабінет клієнта. Перегляд історії записів, управління профілем, налаштування уведомлень.'
          : 'Личный кабинет клиента. Просмотр истории записей, управление профилем, настройка уведомлений.',
        keywords: currentLanguage === 'uk'
          ? ['особистий кабінет', 'профіль клієнта', 'історія записів']
          : ['личный кабинет', 'профиль клиента', 'история записей'],
        noIndex: true
      },
      
      admin: {
        title: currentLanguage === 'uk' 
          ? 'Адміністративна панель' 
          : 'Административная панель',
        description: currentLanguage === 'uk'
          ? 'Панель управління системою шиномонтажу для адміністраторів.'
          : 'Панель управления системой шиномонтажа для администраторов.',
        keywords: [],
        noIndex: true
      },
      
      login: {
        title: currentLanguage === 'uk' 
          ? 'Вхід в систему' 
          : 'Вход в систему',
        description: currentLanguage === 'uk'
          ? 'Увійдіть в особистий кабінет для управління записами та налаштуваннями.'
          : 'Войдите в личный кабинет для управления записями и настройками.',
        keywords: currentLanguage === 'uk'
          ? ['вхід', 'авторизація', 'особистий кабінет']
          : ['вход', 'авторизация', 'личный кабинет'],
        noIndex: true
      },
      
      register: {
        title: currentLanguage === 'uk' 
          ? 'Реєстрація' 
          : 'Регистрация',
        description: currentLanguage === 'uk'
          ? 'Створіть особистий кабінет для зручного онлайн запису та управління записами.'
          : 'Создайте личный кабинет для удобной онлайн записи и управления записями.',
        keywords: currentLanguage === 'uk'
          ? ['реєстрація', 'створити акаунт', 'особистий кабінет']
          : ['регистрация', 'создать аккаунт', 'личный кабинет'],
        noIndex: true
      }
    };
    
    return configs[pageType];
  };
  
  // Функция для создания SEO конфигурации
  const createSEO = (pageType: PageType, customProps?: Partial<SEOProps>): SEOProps => {
    const baseConfig = getPageSEOConfig(pageType);
    const currentUrl = `${process.env.REACT_APP_SITE_URL || 'https://tvoya-shina.ua'}${location.pathname}`;
    
    return {
      title: customProps?.title || baseConfig.title,
      description: customProps?.description || baseConfig.description,
      keywords: customProps?.keywords || baseConfig.keywords,
      type: customProps?.type || baseConfig.type || 'website',
      url: customProps?.url || currentUrl,
      canonical: customProps?.canonical || currentUrl,
      noIndex: customProps?.noIndex ?? (baseConfig as any).noIndex ?? false,
      ...customProps
    };
  };
  
  // Функция для создания SEO для статьи
  const createArticleSEO = (article: {
    title?: string;
    excerpt?: string;
    author?: string;
    publishedAt?: string;
    updatedAt?: string;
    category?: string;
    image?: string;
  }): SEOProps => {
    return createSEO('article', {
      title: article.title,
      description: article.excerpt,
      author: article.author,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      section: article.category,
      image: article.image,
      type: 'article'
    });
  };
  
  // Функция для создания SEO для сервисной точки
  const createServicePointSEO = (servicePoint: {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    image?: string;
  }): SEOProps => {
    const title = servicePoint.name 
      ? `${servicePoint.name} - ${servicePoint.city || 'Україна'}`
      : undefined;
      
    const description = servicePoint.description || 
      (currentLanguage === 'uk' 
        ? `Професійний шиномонтаж ${servicePoint.name || ''} в ${servicePoint.city || 'Україні'}. ${servicePoint.address || ''} Якісні послуги, досвідчені майстри.`
        : `Профессиональный шиномонтаж ${servicePoint.name || ''} в ${servicePoint.city || 'Украине'}. ${servicePoint.address || ''} Качественные услуги, опытные мастера.`);
    
    return createSEO('service-point', {
      title,
      description,
      image: servicePoint.image,
      keywords: currentLanguage === 'uk'
        ? ['шиномонтаж', servicePoint.city, servicePoint.name, 'сервісна точка'].filter(Boolean) as string[]
        : ['шиномонтаж', servicePoint.city, servicePoint.name, 'сервисная точка'].filter(Boolean) as string[]
    });
  };
  
  return {
    createSEO,
    createArticleSEO,
    createServicePointSEO,
    getPageSEOConfig
  };
}; 