import { Article, ArticleSummary } from '../types/articles';

// Интерфейс для локализуемых статей
export interface LocalizableArticle {
  title?: string;
  content?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  title_ru?: string;
  content_ru?: string;
  excerpt_ru?: string;
  meta_title_ru?: string;
  meta_description_ru?: string;
  title_uk?: string;
  content_uk?: string;
  excerpt_uk?: string;
  meta_title_uk?: string;
  meta_description_uk?: string;
}

/**
 * Получает локализованное название статьи
 * @param article - статья с полями локализации
 * @param locale - язык ('ru' | 'uk')
 * @returns локализованное название
 */
export const getLocalizedArticleTitle = (
  article: LocalizableArticle,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return article.title_uk || article.title || '';
  }
  
  // Приоритет для русского языка (по умолчанию)
  return article.title || article.title_uk || '';
};

/**
 * Получает локализованное содержимое статьи
 * @param article - статья с полями локализации
 * @param locale - язык ('ru' | 'uk')
 * @returns локализованное содержимое
 */
export const getLocalizedArticleContent = (
  article: LocalizableArticle,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return article.content_uk || article.content || '';
  }
  
  // Приоритет для русского языка (по умолчанию)
  return article.content || article.content_uk || '';
};

/**
 * Получает локализованное краткое описание статьи
 * @param article - статья с полями локализации
 * @param locale - язык ('ru' | 'uk')
 * @returns локализованное краткое описание
 */
export const getLocalizedArticleExcerpt = (
  article: LocalizableArticle,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return article.excerpt_uk || article.excerpt || '';
  }
  
  // Приоритет для русского языка (по умолчанию)
  return article.excerpt || article.excerpt_uk || '';
};

/**
 * Получает локализованный SEO заголовок статьи
 * @param article - статья с полями локализации
 * @param locale - язык ('ru' | 'uk')
 * @returns локализованный SEO заголовок
 */
export const getLocalizedArticleMetaTitle = (
  article: LocalizableArticle,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return article.meta_title_uk || article.meta_title || getLocalizedArticleTitle(article, locale);
  }
  
  // Приоритет для русского языка (по умолчанию)
  return article.meta_title || article.meta_title_uk || getLocalizedArticleTitle(article, locale);
};

/**
 * Получает локализованное SEO описание статьи
 * @param article - статья с полями локализации
 * @param locale - язык ('ru' | 'uk')
 * @returns локализованное SEO описание
 */
export const getLocalizedArticleMetaDescription = (
  article: LocalizableArticle,
  locale?: string
): string => {
  const currentLocale = locale || localStorage.getItem('i18nextLng') || 'ru';
  
  // Приоритет для украинского языка
  if (currentLocale === 'uk') {
    return article.meta_description_uk || article.meta_description || getLocalizedArticleExcerpt(article, locale);
  }
  
  // Приоритет для русского языка (по умолчанию)
  return article.meta_description || article.meta_description_uk || getLocalizedArticleExcerpt(article, locale);
};

/**
 * Хук для использования локализованных названий статей в компонентах
 * @returns функция для получения локализованного названия
 */
export const useLocalizedArticleTitle = () => {
  const currentLanguage = localStorage.getItem('i18nextLng') || 'ru';
  return (article: LocalizableArticle) => getLocalizedArticleTitle(article, currentLanguage);
};

/**
 * Хук для использования локализованного содержимого статей в компонентах
 * @returns функция для получения локализованного содержимого
 */
export const useLocalizedArticleContent = () => {
  const currentLanguage = localStorage.getItem('i18nextLng') || 'ru';
  return (article: LocalizableArticle) => getLocalizedArticleContent(article, currentLanguage);
};

/**
 * Хук для использования локализованного краткого описания статей в компонентах
 * @returns функция для получения локализованного краткого описания
 */
export const useLocalizedArticleExcerpt = () => {
  const currentLanguage = localStorage.getItem('i18nextLng') || 'ru';
  return (article: LocalizableArticle) => getLocalizedArticleExcerpt(article, currentLanguage);
};

/**
 * Получает все локализованные поля статьи для текущего языка
 * @param article - статья с полями локализации
 * @param locale - язык ('ru' | 'uk')
 * @returns объект с локализованными полями
 */
export const getLocalizedArticleFields = (
  article: LocalizableArticle,
  locale?: string
) => {
  return {
    title: getLocalizedArticleTitle(article, locale),
    content: getLocalizedArticleContent(article, locale),
    excerpt: getLocalizedArticleExcerpt(article, locale),
    meta_title: getLocalizedArticleMetaTitle(article, locale),
    meta_description: getLocalizedArticleMetaDescription(article, locale),
  };
};

/**
 * Проверяет, заполнены ли все обязательные поля для локализации
 * @param article - статья с полями локализации
 * @returns true, если все обязательные поля заполнены
 */
export const isArticleLocalizationComplete = (article: LocalizableArticle): boolean => {
  // Проверяем русские поля
  const ruComplete = !!(article.title && article.content && article.excerpt);
  
  // Проверяем украинские поля
  const ukComplete = !!(article.title_uk && article.content_uk && article.excerpt_uk);
  
  return ruComplete && ukComplete;
};

/**
 * Получает отсутствующие поля локализации
 * @param article - статья с полями локализации
 * @returns массив названий отсутствующих полей
 */
export const getMissingLocalizationFields = (article: LocalizableArticle): string[] => {
  const missing: string[] = [];
  
  // Проверяем русские поля
  if (!article.title) missing.push('title (RU)');
  if (!article.content) missing.push('content (RU)');
  if (!article.excerpt) missing.push('excerpt (RU)');
  
  // Проверяем украинские поля
  if (!article.title_uk) missing.push('title_uk (UK)');
  if (!article.content_uk) missing.push('content_uk (UK)');
  if (!article.excerpt_uk) missing.push('excerpt_uk (UK)');
  
  return missing;
}; 