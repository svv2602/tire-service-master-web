import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useArticle, useRelatedArticles } from '../../hooks/useArticles';
import { ARTICLE_STATUS_LABELS } from '../../types/articles';

const ArticleViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { article, loading, error } = useArticle(id || null);
  const { articles: relatedArticles } = useRelatedArticles(article?.id || null);

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Загрузка статьи...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">❌ Ошибка</div>
          <p className="text-gray-600">
            {error || 'Статья не найдена'}
          </p>
          <Link
            to="/articles"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Вернуться к списку статей
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Навигация */}
      <div className="mb-6">
        <Link
          to="/articles"
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад к списку статей
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Основное содержимое */}
        <div className="lg:col-span-3">
          {/* Заголовок статьи */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                    {ARTICLE_STATUS_LABELS[article.status as keyof typeof ARTICLE_STATUS_LABELS]}
                  </span>
                  <span className="text-sm text-gray-500">{article.category_name}</span>
                  {article.featured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ Рекомендуется
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {article.title}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <Link
                  to={`/articles/${article.id}/edit`}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  ✏️ Редактировать
                </Link>
              </div>
            </div>

            {/* Метаинформация */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 border-t pt-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{article.author.name}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(article.published_at)}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{article.reading_time} мин чтения</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{article.views_count.toLocaleString()} просмотров</span>
              </div>
            </div>
          </div>

          {/* Главное изображение */}
          {article.featured_image && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Содержимое статьи */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Теги */}
          {article.tags && article.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Теги</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="lg:col-span-1">
          {/* Информация о статье */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">О статье</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Категория:</span>
                <div className="font-medium">{article.category_name}</div>
              </div>
              <div>
                <span className="text-gray-500">Автор:</span>
                <div className="font-medium">{article.author.name}</div>
              </div>
              <div>
                <span className="text-gray-500">Опубликовано:</span>
                <div className="font-medium">{formatDate(article.published_at)}</div>
              </div>
              <div>
                <span className="text-gray-500">Обновлено:</span>
                <div className="font-medium">{formatDate(article.updated_at)}</div>
              </div>
              <div>
                <span className="text-gray-500">Просмотры:</span>
                <div className="font-medium">{article.views_count.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Связанные статьи */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Похожие статьи</h3>
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    to={`/articles/${relatedArticle.id}`}
                    className="block group"
                  >
                    <div className="flex space-x-3">
                      {relatedArticle.featured_image && (
                        <img
                          src={relatedArticle.featured_image}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {relatedArticle.reading_time} мин чтения • {relatedArticle.views_count} просмотров
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleViewPage; 