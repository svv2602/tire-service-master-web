import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useArticles, useArticleCategories, usePopularArticles } from '../../hooks/useArticles';
import ArticleCard from '../../components/client-articles/ArticleCard';
import ArticleFilters from '../../components/client-articles/ArticleFilters';
import { ArticlesFilters } from '../../types/articles';

const KnowledgeBasePage: React.FC = () => {
  // Состояние фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Мемоизированные фильтры
  const filters = useMemo<ArticlesFilters>(() => ({
    page: currentPage,
    per_page: 12,
    include_drafts: false, // Клиенты видят только опубликованные статьи
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    sort: 'recent',
  }), [currentPage, searchQuery, selectedCategory]);

  // Хуки для данных
  const { articles, loading, error, pagination, fetchArticles } = useArticles(filters);
  const { categories, loading: categoriesLoading } = useArticleCategories();
  const { articles: featuredArticles, loading: featuredLoading } = usePopularArticles(6);

  // Обработчики
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Плавный скролл к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      {/* Hero секция */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              База знаний о шинах
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Полезные статьи, советы экспертов и руководства по выбору и уходу за шинами. 
              Все что нужно знать автомобилисту.
            </p>
            
            {/* Быстрый поиск */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Найти статью..."
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-xl shadow-lg focus:ring-4 focus:ring-blue-300 focus:outline-none text-lg"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Рекомендуемые статьи */}
        {!searchQuery && !selectedCategory && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Рекомендуемые статьи</h2>
                <p className="text-gray-600">Самые полезные и популярные материалы</p>
              </div>
            </div>

            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="featured" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Фильтры */}
        <ArticleFilters
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
          loading={loading}
        />

        {/* Результаты поиска или все статьи */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Результаты поиска "${searchQuery}"` : 
                 selectedCategory ? `Статьи: ${categories.find(c => c.key === selectedCategory)?.name}` : 
                 'Все статьи'}
              </h2>
              {!loading && (
                <p className="text-gray-600">
                  Найдено статей: {pagination.total_count}
                </p>
              )}
            </div>
          </div>

          {/* Список статей */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-600 mb-4">❌ Ошибка загрузки</div>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => fetchArticles()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Статьи не найдены</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory ? 
                  'Попробуйте изменить параметры поиска' : 
                  'Статьи пока не добавлены'}
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Пагинация */}
              {pagination.total_pages > 1 && (
                <div className="flex justify-center">
                  <nav className="inline-flex rounded-lg shadow-sm">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-1">Назад</span>
                    </button>

                    {/* Номера страниц */}
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const pageNumber = Math.max(1, currentPage - 2) + i;
                      if (pageNumber > pagination.total_pages) return null;
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.total_pages}
                      className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mr-1">Вперед</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </section>

        {/* Информационные блоки */}
        {!searchQuery && !selectedCategory && (
          <section className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Экспертные советы</h3>
                <p className="text-gray-600 text-sm">
                  Профессиональные рекомендации от опытных мастеров шиномонтажа
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Подробные гиды</h3>
                <p className="text-gray-600 text-sm">
                  Пошаговые инструкции по выбору, установке и обслуживанию шин
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <div className="text-4xl mb-4">🚗</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Для всех авто</h3>
                <p className="text-gray-600 text-sm">
                  Материалы для владельцев легковых автомобилей, внедорожников и коммерческого транспорта
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBasePage; 