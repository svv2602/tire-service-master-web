# 🔍 Руководство по SEO системе

## 📋 Обзор

Система SEO в проекте Tire Service обеспечивает динамическое управление метатегами для улучшения поисковой оптимизации и социального шаринга.

## 🏗️ Архитектура

### Основные компоненты:

1. **`SEOHead`** - React компонент для управления метатегами
2. **`useSEO`** - хук для создания SEO конфигураций
3. **`HelmetProvider`** - провайдер для управления head документа

## 🚀 Быстрый старт

### 1. Базовое использование

```tsx
import { SEOHead } from '../../components/common/SEOHead';
import { useSEO } from '../../hooks/useSEO';

const MyPage: React.FC = () => {
  const { createSEO } = useSEO();
  
  const seoConfig = createSEO('home');
  
  return (
    <>
      <SEOHead {...seoConfig} />
      {/* Контент страницы */}
    </>
  );
};
```

### 2. Кастомизация SEO

```tsx
const seoConfig = createSEO('services', {
  title: 'Специальные услуги',
  description: 'Кастомное описание страницы',
  keywords: ['услуги', 'шиномонтаж', 'специальные'],
  image: '/custom-image.jpg'
});
```

## 📄 Предустановленные типы страниц

### Доступные типы:
- `home` - Главная страница
- `services` - Страница услуг
- `search` - Страница поиска
- `booking` - Страница бронирования
- `calculator` - Калькулятор шин
- `knowledge-base` - База знаний
- `article` - Статьи
- `service-point` - Сервисные точки
- `profile` - Профиль пользователя
- `admin` - Админ панель
- `login` - Страница входа
- `register` - Регистрация

### Пример конфигураций:

```tsx
// Главная страница
const homeConfig = createSEO('home');

// Страница поиска с параметрами
const searchConfig = createSEO('search', {
  title: `Шиномонтаж в ${city}`,
  description: `Найдите лучший шиномонтаж в ${city}`,
  keywords: [city, 'шиномонтаж', 'поиск']
});

// Статья
const articleConfig = createArticleSEO({
  title: article.title,
  excerpt: article.excerpt,
  author: article.author,
  publishedAt: article.publishedAt,
  category: article.category,
  image: article.image
});
```

## 🎯 Специализированные функции

### Для статей:
```tsx
const { createArticleSEO } = useSEO();

const seoConfig = createArticleSEO({
  title: 'Как выбрать шины',
  excerpt: 'Подробное руководство по выбору шин',
  author: 'Эксперт по шинам',
  publishedAt: '2024-01-15',
  category: 'Советы',
  image: '/article-image.jpg'
});
```

### Для сервисных точек:
```tsx
const { createServicePointSEO } = useSEO();

const seoConfig = createServicePointSEO({
  name: 'Шиномонтаж на Крещатике',
  description: 'Профессиональные услуги в центре Киева',
  address: 'ул. Крещатик, 1',
  city: 'Киев',
  image: '/service-point-photo.jpg'
});
```

## 🔧 Настройка SEO метатегов

### Базовые метатеги:
- `title` - Заголовок страницы
- `description` - Описание страницы
- `keywords` - Ключевые слова
- `canonical` - Канонический URL
- `noIndex` - Запрет индексации

### Open Graph:
- `og:title` - Заголовок для соцсетей
- `og:description` - Описание для соцсетей
- `og:image` - Изображение для превью
- `og:url` - URL страницы
- `og:type` - Тип контента (website/article)

### Twitter Card:
- `twitter:card` - Тип карточки
- `twitter:title` - Заголовок для Twitter
- `twitter:description` - Описание для Twitter
- `twitter:image` - Изображение для Twitter

### Schema.org разметка:
Автоматически добавляется JSON-LD разметка для локального бизнеса.

## 🌐 Локализация

SEO система автоматически адаптируется к текущему языку:

```tsx
// Украинский (по умолчанию)
{
  title: 'Головна сторінка',
  description: 'Найкращий шиномонтаж в Україні...',
  keywords: ['шиномонтаж', 'заміна шин', 'Україна']
}

// Русский
{
  title: 'Главная страница', 
  description: 'Лучший шиномонтаж в Украине...',
  keywords: ['шиномонтаж', 'замена шин', 'Украина']
}
```

## 📊 Примеры реализации

### 1. Главная страница
```tsx
// src/pages/client/ClientMainPage.tsx
const ClientMainPage: React.FC = () => {
  const { createSEO } = useSEO();
  
  const seoConfig = createSEO('home', {
    image: '/image_app/serviceman.png'
  });
  
  return (
    <ClientLayout>
      <SEOHead {...seoConfig} />
      {/* Контент */}
    </ClientLayout>
  );
};
```

### 2. Страница поиска с параметрами
```tsx
// src/pages/client/ClientSearchPage.tsx
const ClientSearchPage: React.FC = () => {
  const { createSEO } = useSEO();
  const location = useLocation();
  
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      city: params.get('city') || '',
      query: params.get('query') || ''
    };
  }, [location.search]);
  
  const seoConfig = useMemo(() => {
    const { city, query } = searchParams;
    
    if (city && query) {
      return createSEO('search', {
        title: `${query} в ${city}`,
        description: `Знайдіть ${query} в ${city}. Професійні послуги.`,
        keywords: [query, city, 'пошук']
      });
    }
    
    return createSEO('search');
  }, [searchParams, createSEO]);
  
  return (
    <ClientLayout>
      <SEOHead {...seoConfig} />
      {/* Контент */}
    </ClientLayout>
  );
};
```

### 3. Страница статьи
```tsx
// src/pages/articles/ArticleViewPage.tsx
const ArticleViewPage: React.FC = () => {
  const { id } = useParams();
  const { createArticleSEO } = useSEO();
  const { data: article } = useGetArticleQuery(id);
  
  const seoConfig = useMemo(() => {
    if (!article) return createSEO('article');
    
    return createArticleSEO({
      title: article.title,
      excerpt: article.excerpt,
      author: article.author?.name,
      publishedAt: article.published_at,
      category: article.category,
      image: article.featured_image
    });
  }, [article, createArticleSEO]);
  
  return (
    <>
      <SEOHead {...seoConfig} />
      {/* Контент статьи */}
    </>
  );
};
```

## ⚙️ Конфигурация

### Базовые настройки сайта
Настройки в `src/components/common/SEOHead.tsx`:

```tsx
const siteConfig = {
  siteName: 'Твоя Шина - Професійний шиномонтаж',
  defaultTitle: 'Твоя Шина - Найкращий шиномонтаж в Україні',
  defaultDescription: 'Професійні послуги шиномонтажу...',
  defaultImage: '/image/tire-service-og.jpg',
  siteUrl: process.env.REACT_APP_SITE_URL || 'https://tvoya-shina.ua',
  twitterHandle: '@tvoya_shina'
};
```

### Переменные окружения
Добавьте в `.env`:
```
REACT_APP_SITE_URL=https://tvoya-shina.ua
```

## 🎨 Лучшие практики

### 1. Длина метатегов:
- **Title**: 50-60 символов
- **Description**: 150-160 символов
- **Keywords**: 10-15 ключевых слов

### 2. Изображения для соцсетей:
- **Размер**: 1200x630 пикселей
- **Формат**: JPG или PNG
- **Размер файла**: до 1MB

### 3. Структурированные данные:
- Используйте Schema.org разметку
- Добавляйте JSON-LD для локального бизнеса
- Указывайте часы работы и контакты

### 4. Канонические URL:
```tsx
const seoConfig = createSEO('services', {
  canonical: 'https://tvoya-shina.ua/services'
});
```

### 5. Запрет индексации для приватных страниц:
```tsx
const seoConfig = createSEO('profile', {
  noIndex: true
});
```

## 🔍 Тестирование SEO

### Инструменты для проверки:
1. **Google Search Console** - индексация и ошибки
2. **Facebook Debugger** - Open Graph теги
3. **Twitter Card Validator** - Twitter метатеги
4. **Lighthouse** - общая SEO оценка

### Проверка в браузере:
```javascript
// В консоли браузера
console.log(document.title);
console.log(document.querySelector('meta[name="description"]')?.content);
console.log(document.querySelector('meta[property="og:title"]')?.content);
```

## 📝 Чек-лист для новых страниц

- [ ] Добавлен импорт `SEOHead` и `useSEO`
- [ ] Создана SEO конфигурация с `createSEO()`
- [ ] Добавлен `<SEOHead {...seoConfig} />` в JSX
- [ ] Настроены кастомные title и description
- [ ] Добавлены релевантные keywords
- [ ] Указано подходящее изображение
- [ ] Проверена локализация (uk/ru)
- [ ] Протестированы метатеги в браузере

## 🚀 Результаты

После внедрения SEO системы:
- ✅ Динамические метатеги для всех страниц
- ✅ Поддержка Open Graph и Twitter Cards
- ✅ Автоматическая локализация
- ✅ Schema.org разметка
- ✅ Оптимизация для поисковиков
- ✅ Улучшенный социальный шаринг 