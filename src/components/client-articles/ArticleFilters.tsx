import React from 'react';
import { ArticleCategory } from '../../types/articles';

interface ArticleFiltersProps {
  categories: ArticleCategory[];
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const ArticleFilters: React.FC<ArticleFiltersProps> = ({
  categories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onClearFilters,
  loading = false,
}) => {
  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      {/* Поиск */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск статей..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Категории */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Категории</h3>
        
        {/* Мобильная версия - select */}
        <div className="block md:hidden">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.key} value={category.key}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Десктопная версия - кнопки */}
        <div className="hidden md:flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все
          </button>
          
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => onCategoryChange(category.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                selectedCategory === category.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Активные фильтры и сброс */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Активные фильтры:</span>
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                "{searchQuery}"
              </span>
            )}
            {selectedCategory && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {categories.find(c => c.key === selectedCategory)?.name}
              </span>
            )}
          </div>
          
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Очистить фильтры
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleFilters; 