import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticleCategories, useArticleActions } from '../../hooks/useArticles';
import type { Article, ArticleFormData, CreateArticleRequest } from '../../types/articles';
import { ARTICLE_STATUSES } from '../../types/articles';

interface ArticleFormProps {
  article?: Article;
  mode: 'create' | 'edit';
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, mode }) => {
  const navigate = useNavigate();
  const { categories } = useArticleCategories();
  const { createArticle, updateArticle, loading, error } = useArticleActions();

  // Инициализация формы
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    status: ARTICLE_STATUSES.DRAFT,
    featured: false,
    meta_title: '',
    meta_description: '',
    featured_image_url: '',
    allow_comments: true,
    tags: [],
  });

  // Состояние UI
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Загрузка данных статьи для редактирования
  useEffect(() => {
    if (mode === 'edit' && article) {
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        status: article.status,
        featured: article.featured,
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        featured_image_url: article.featured_image || '',
        allow_comments: article.allow_comments ?? true,
        tags: article.tags || [],
      });
      setShowSeoFields(!!(article.meta_title || article.meta_description));
    }
  }, [mode, article]);

  // Автоматическое заполнение SEO полей
  useEffect(() => {
    if (formData.title && !formData.meta_title) {
      setFormData(prev => ({
        ...prev,
        meta_title: prev.title.slice(0, 60),
      }));
    }
    if (formData.excerpt && !formData.meta_description) {
      setFormData(prev => ({
        ...prev,
        meta_description: prev.excerpt.slice(0, 160),
      }));
    }
  }, [formData.title, formData.excerpt]);

  // Обработчики изменения формы
  const handleInputChange = (field: keyof ArticleFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Обработчик добавления тегов
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
      }
      setTagInput('');
    }
  };

  // Удаление тега
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const articleData: CreateArticleRequest = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      category: formData.category,
      status: formData.status,
      featured: formData.featured,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
      featured_image_url: formData.featured_image_url || undefined,
      allow_comments: formData.allow_comments,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };

    let result: Article | null = null;
    
    if (mode === 'create') {
      result = await createArticle(articleData);
    } else if (mode === 'edit' && article) {
      result = await updateArticle(article.id, articleData);
    }

    if (result) {
      navigate('/articles');
    }
  };

  // Сохранение как черновик
  const handleSaveDraft = async () => {
    const draftData = { ...formData, status: ARTICLE_STATUSES.DRAFT };
    setFormData(draftData);
    
    // Имитируем отправку формы
    const event = new Event('submit') as any;
    event.preventDefault = () => {};
    
    const articleData: CreateArticleRequest = {
      title: draftData.title,
      content: draftData.content,
      excerpt: draftData.excerpt,
      category: draftData.category,
      status: draftData.status,
      featured: draftData.featured,
      meta_title: draftData.meta_title || undefined,
      meta_description: draftData.meta_description || undefined,
      featured_image_url: draftData.featured_image_url || undefined,
      allow_comments: draftData.allow_comments,
      tags: draftData.tags.length > 0 ? draftData.tags : undefined,
    };

    let result: Article | null = null;
    
    if (mode === 'create') {
      result = await createArticle(articleData);
    } else if (mode === 'edit' && article) {
      result = await updateArticle(article.id, articleData);
    }

    if (result) {
      navigate('/articles');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Создание статьи' : 'Редактирование статьи'}
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === 'create' ? 'Создайте новую полезную статью для клиентов' : 'Внесите изменения в статью'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            {previewMode ? '✏️ Редактировать' : '👁️ Предпросмотр'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основное содержимое */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок статьи *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  placeholder="Введите заголовок статьи..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  required
                />
              </div>

              {/* Краткое описание */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Краткое описание *
                </label>
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange('excerpt')}
                  placeholder="Краткое описание статьи для превью..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/500 символов
                </div>
              </div>
            </div>

            {/* Содержимое статьи */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Содержимое статьи *
              </label>
              {previewMode ? (
                <div className="prose max-w-none border border-gray-300 rounded-lg p-4 min-h-96 bg-gray-50">
                  <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
              ) : (
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={handleInputChange('content')}
                  placeholder="Введите содержимое статьи. Можете использовать Markdown..."
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  required
                />
              )}
              <div className="text-xs text-gray-500 mt-2">
                Поддерживается Markdown разметка. Примерно {Math.ceil(formData.content.split(' ').length / 200)} минут чтения.
              </div>
            </div>

            {/* SEO поля */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">SEO настройки</h3>
                <button
                  type="button"
                  onClick={() => setShowSeoFields(!showSeoFields)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {showSeoFields ? 'Скрыть' : 'Показать'}
                </button>
              </div>
              
              {showSeoFields && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange('meta_title')}
                      placeholder="SEO заголовок для поисковых систем..."
                      maxLength={60}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {formData.meta_title.length}/60 символов
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange('meta_description')}
                      placeholder="Описание статьи для поисковых систем..."
                      rows={3}
                      maxLength={160}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {formData.meta_description.length}/160 символов
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Публикация */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Публикация</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={ARTICLE_STATUSES.DRAFT}>Черновик</option>
                    <option value={ARTICLE_STATUSES.PUBLISHED}>Опубликовано</option>
                    <option value={ARTICLE_STATUSES.ARCHIVED}>В архиве</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={handleInputChange('featured')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Рекомендуемая статья
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allow_comments"
                    checked={formData.allow_comments}
                    onChange={handleInputChange('allow_comments')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allow_comments" className="ml-2 block text-sm text-gray-900">
                    Разрешить комментарии
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Сохранить черновик
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Сохранение...' : (mode === 'create' ? 'Создать' : 'Обновить')}
                </button>
              </div>
            </div>

            {/* Категория */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Категория</h3>
              <select
                value={formData.category}
                onChange={handleInputChange('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Изображение */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Главное изображение</h3>
              <div>
                <input
                  type="url"
                  value={formData.featured_image_url}
                  onChange={handleInputChange('featured_image_url')}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.featured_image_url && (
                  <div className="mt-3">
                    <img
                      src={formData.featured_image_url}
                      alt="Предпросмотр"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Теги */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Теги</h3>
              <div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Введите тег и нажмите Enter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm; 