import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetFeaturedArticlesQuery, useGetArticlesQuery } from '../api/articles.api';
import { Article } from '../types/articles';

/**
 * Хук для получения статей для главной страницы
 * Логика: 3 последние рекомендованные статьи, если их меньше - дополняем последними по времени создания
 */
export const useMainPageArticles = () => {
  const { i18n } = useTranslation();
  
  // Получаем рекомендованные статьи
  const { 
    data: featuredData, 
    isLoading: featuredLoading, 
    error: featuredError 
  } = useGetFeaturedArticlesQuery();

  // Получаем последние статьи (не рекомендованные)
  const { 
    data: recentData, 
    isLoading: recentLoading, 
    error: recentError 
  } = useGetArticlesQuery({
    status: 'published',
    featured: false,
    per_page: 10, // Берем больше, чтобы иметь запас для фильтрации
    locale: i18n.language || 'ru'
  });

  // Обрабатываем данные
  const articles = useMemo(() => {
    const featuredArticles = featuredData?.data || [];
    const recentArticles = recentData?.data || [];

    // Сортируем рекомендованные по времени создания (desc)
    const sortedFeatured = [...featuredArticles]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3); // Берем максимум 3

    // Если рекомендованных статей достаточно, возвращаем их
    if (sortedFeatured.length === 3) {
      return sortedFeatured;
    }

    // Если рекомендованных меньше 3, дополняем последними статьями
    const needMore = 3 - sortedFeatured.length;
    
    // Фильтруем последние статьи, исключая уже добавленные рекомендованные
    const featuredIds = new Set(sortedFeatured.map(article => article.id));
    const filteredRecent = recentArticles
      .filter(article => !featuredIds.has(article.id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, needMore);

    return [...sortedFeatured, ...filteredRecent];
  }, [featuredData, recentData]);

  // Определяем состояние загрузки
  const isLoading = featuredLoading || recentLoading;
  
  // Определяем ошибки
  const error = featuredError || recentError;

  return {
    articles,
    isLoading,
    error,
    // Дополнительная информация для отладки
    debug: {
      featuredCount: featuredData?.data?.length || 0,
      recentCount: recentData?.data?.length || 0,
      totalSelected: articles.length
    }
  };
};

export default useMainPageArticles; 