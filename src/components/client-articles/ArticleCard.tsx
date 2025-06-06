import React from 'react';
import { Link } from 'react-router-dom';
import { ArticleSummary } from '../../types/articles';

interface ArticleCardProps {
  article: ArticleSummary;
  variant?: 'default' | 'featured' | 'compact';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'default' }) => {
  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Вариант "Рекомендуемые" - большие карточки
  if (variant === 'featured') {
    return (
      <Link 
        to={`/knowledge-base/${article.id}`}
        className="group block"
      >
        <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
          {/* Изображение */}
          <div className="relative h-64 overflow-hidden">
            {article.featured_image ? (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-6xl text-blue-400">
                  {article.category === 'seasonal' && '🍂'}
                  {article.category === 'tips' && '💡'}
                  {article.category === 'maintenance' && '🔧'}
                  {article.category === 'selection' && '🔍'}
                  {article.category === 'safety' && '🛡️'}
                  {article.category === 'reviews' && '⭐'}
                  {article.category === 'news' && '📰'}
                </div>
              </div>
            )}
            
            {/* Метка рекомендуемого */}
            {article.featured && (
              <div className="absolute top-4 right-4">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  ⭐ Рекомендуется
                </span>
              </div>
            )}

            {/* Категория */}
            <div className="absolute bottom-4 left-4">
              <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {article.category_name}
              </span>
            </div>
          </div>

          {/* Контент */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
              {article.title}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {article.excerpt}
            </p>

            {/* Метаинформация */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {article.reading_time} мин
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {article.views_count.toLocaleString()}
                </span>
              </div>
              <span>{formatDate(article.published_at)}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Компактный вариант для боковой панели
  if (variant === 'compact') {
    return (
      <Link 
        to={`/knowledge-base/${article.id}`}
        className="group block mb-4"
      >
        <article className="flex space-x-3">
          {/* Миниатюра */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
            {article.featured_image ? (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-2xl text-gray-400">
                  {article.category === 'seasonal' && '🍂'}
                  {article.category === 'tips' && '💡'}
                  {article.category === 'maintenance' && '🔧'}
                  {article.category === 'selection' && '🔍'}
                  {article.category === 'safety' && '🛡️'}
                  {article.category === 'reviews' && '⭐'}
                  {article.category === 'news' && '📰'}
                </span>
              </div>
            )}
          </div>

          {/* Контент */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
              {article.title}
            </h3>
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <span>{article.reading_time} мин</span>
              <span>•</span>
              <span>{article.views_count} просмотров</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Обычный вариант
  return (
    <Link 
      to={`/knowledge-base/${article.id}`}
      className="group block"
    >
      <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 transform hover:-translate-y-1">
        {/* Изображение */}
        <div className="relative h-48 overflow-hidden">
          {article.featured_image ? (
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <span className="text-4xl text-blue-300">
                {article.category === 'seasonal' && '🍂'}
                {article.category === 'tips' && '💡'}
                {article.category === 'maintenance' && '🔧'}
                {article.category === 'selection' && '🔍'}
                {article.category === 'safety' && '🛡️'}
                {article.category === 'reviews' && '⭐'}
                {article.category === 'news' && '📰'}
              </span>
            </div>
          )}

          {/* Рекомендуемая метка */}
          {article.featured && (
            <div className="absolute top-3 right-3">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                ⭐ Топ
              </span>
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="p-5">
          {/* Категория */}
          <div className="mb-2">
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {article.category_name}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h2>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.excerpt}
          </p>

          {/* Метаинформация */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {article.reading_time} мин
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.views_count}
              </span>
            </div>
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard; 