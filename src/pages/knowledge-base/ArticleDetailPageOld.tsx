import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  CircularProgress,
  useTheme,
  Breadcrumbs,
  IconButton,
  Fade,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useArticle, useRelatedArticles, useArticleCategories } from '../../hooks/useArticles';
import ArticleCard from '../../components/knowledge-base/ArticleCard';
import ClientNavigation from '../../components/client/ClientNavigation';
import { getThemeColors, getCardStyles, getButtonStyles } from '../../styles';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { article, loading, error } = useArticle(id ? parseInt(id) : null);
  const { articles: relatedArticles, loading: relatedLoading } = useRelatedArticles(
    article?.id || null, 
    3
  );
  const { categories } = useArticleCategories();

  // Состояние для шаринга
  const [shareMessage, setShareMessage] = useState('');

  // Получаем информацию о категории
  const categoryInfo = categories.find(cat => cat.key === article?.category);

  // Увеличиваем счетчик просмотров при загрузке статьи
  useEffect(() => {
    if (article) {
      // Здесь можно добавить API вызов для увеличения просмотров
      // articlesApi.incrementViews(article.id);
    }
  }, [article]);

  // Обработчики
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || 'Статья';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.log('Ошибка при шаринге:', err);
      }
    } else {
      // Fallback - копируем ссылку в буфер обмена
      try {
        await navigator.clipboard.writeText(url);
        setShareMessage('Ссылка скопирована в буфер обмена!');
        setTimeout(() => setShareMessage(''), 3000);
      } catch (err) {
        console.log('Ошибка при копировании:', err);
        setShareMessage('Не удалось скопировать ссылку');
        setTimeout(() => setShareMessage(''), 3000);
      }
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Время чтения
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Простая навигация для клиентов */}
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/knowledge-base" className="text-xl font-bold text-blue-600">
                  🚗 База знаний о шинах
                </Link>
                <div className="hidden md:flex space-x-6">
                  <Link to="/knowledge-base" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Статьи
                  </Link>
                  <a href="mailto:info@tvoya-shina.ru" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Связаться с нами
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Войти в систему
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Простая навигация для клиентов */}
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/knowledge-base" className="text-xl font-bold text-blue-600">
                  🚗 База знаний о шинах
                </Link>
                <div className="hidden md:flex space-x-6">
                  <Link to="/knowledge-base" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Статьи
                  </Link>
                  <a href="mailto:info@tvoya-shina.ru" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Связаться с нами
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Войти в систему
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Статья не найдена</h1>
            <p className="text-gray-600 mb-6">
              {error || 'Запрошенная статья не существует или была удалена'}
            </p>
            <Link
              to="/knowledge-base"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Вернуться к статьям
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-700">
              Главная
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/knowledge-base" className="text-blue-600 hover:text-blue-700">
              База знаний
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Основной контент */}
          <article className="lg:col-span-3">
            {/* Заголовок статьи */}
            <header className="mb-8">
              {/* Категория */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {article.category === 'seasonal' && '🍂'}
                  {article.category === 'tips' && '💡'}
                  {article.category === 'maintenance' && '🔧'}
                  {article.category === 'selection' && '🔍'}
                  {article.category === 'safety' && '🛡️'}
                  {article.category === 'reviews' && '⭐'}
                  {article.category === 'news' && '📰'}
                  <span className="ml-1">{article.category_name}</span>
                </span>
                {article.featured && (
                  <span className="ml-2 inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    ⭐ Рекомендуется
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.excerpt}
              </p>

              {/* Метаинформация */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="text-lg text-gray-900 font-medium">{article.author?.name || 'Неизвестный автор'}</div>
                  <div className="text-sm text-gray-500">Автор</div>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-center">
                    <div className="text-lg text-gray-900 font-medium">
                      {article.published_at ? formatDate(article.published_at) : formatDate(article.created_at)}
                    </div>
                    <div className="text-sm text-gray-500">Дата публикации</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{article.reading_time || 5} мин чтения</span>
                </div>

                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{article.views_count?.toLocaleString() || '0'} просмотров</span>
                </div>
              </div>
            </header>

            {/* Главное изображение */}
            {article.featured_image && (
              <div className="mb-8">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-96 object-cover rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* Содержимое статьи */}
            <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-blockquote:border-blue-500"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Теги */}
            {article.tags && article.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Теги</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Навигация между статьями */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center">
                <Link
                  to="/knowledge-base"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Все статьи
                </Link>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Печать"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Печать
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Поделиться"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Поделиться
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Боковая панель */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Информация о статье */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">О статье</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Категория:</span>
                    <span className="font-medium">{article.category_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Время чтения:</span>
                    <span className="font-medium">{article.reading_time || 5} мин</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Просмотры:</span>
                    <span className="font-medium">{article.views_count?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Обновлено:</span>
                    <span className="font-medium">{formatDate(article.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Оглавление (если есть заголовки в статье) */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Содержание</h3>
                <div className="space-y-2 text-sm">
                  {/* Здесь можно извлечь заголовки из content и создать оглавление */}
                  <div className="text-gray-500">
                    Автоматическое оглавление будет добавлено в следующей версии
                  </div>
                </div>
              </div>

              {/* Похожие статьи */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Похожие статьи</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((relatedArticle) => (
                      <ArticleCard
                        key={relatedArticle.id}
                        article={relatedArticle}
                        variant="compact"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA блок */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">🔧</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Нужна помощь?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Наши эксперты помогут подобрать шины и проконсультируют по любым вопросам
                </p>
                <Link
                  to="/contacts"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
                >
                  Связаться с нами
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage; 