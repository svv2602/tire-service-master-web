import { baseApi } from './baseApi';
import type {
  Article,
  ArticleSummary,
  ArticlesListResponse,
  ArticleCategory,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticlesFilters,
} from '../types/articles';

// API для работы со статьями
export const articlesApi = {
  // Получение списка статей
  getArticles: async (filters: ArticlesFilters = {}): Promise<ArticlesListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('query', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.featured) params.append('featured', 'true');
    if (filters.include_drafts) params.append('include_drafts', 'true');
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = `/api/v1/articles${queryString ? `?${queryString}` : ''}`;
    
    const response = await baseApi.get<ArticlesListResponse>(url);
    return response.data;
  },

  // Получение статьи по ID или slug
  getArticle: async (id: string | number): Promise<Article> => {
    const response = await baseApi.get<Article>(`/api/v1/articles/${id}`);
    return response.data;
  },

  // Создание новой статьи
  createArticle: async (articleData: CreateArticleRequest): Promise<Article> => {
    const response = await baseApi.post<Article>('/api/v1/articles', {
      article: articleData,
    });
    return response.data;
  },

  // Обновление статьи
  updateArticle: async (id: number, articleData: Partial<CreateArticleRequest>): Promise<Article> => {
    const response = await baseApi.put<Article>(`/api/v1/articles/${id}`, {
      article: articleData,
    });
    return response.data;
  },

  // Удаление статьи
  deleteArticle: async (id: number): Promise<void> => {
    await baseApi.delete(`/api/v1/articles/${id}`);
  },

  // Получение категорий статей
  getCategories: async (): Promise<ArticleCategory[]> => {
    const response = await baseApi.get<ArticleCategory[]>('/api/v1/articles/categories');
    return response.data;
  },

  // Получение популярных статей
  getPopularArticles: async (limit: number = 5): Promise<ArticleSummary[]> => {
    const response = await baseApi.get<{ data: ArticleSummary[] }>(`/api/v1/articles/popular?limit=${limit}`);
    return response.data.data;
  },

  // Получение связанных статей
  getRelatedArticles: async (articleId: number, limit: number = 3): Promise<ArticleSummary[]> => {
    const response = await baseApi.get<{ data: ArticleSummary[] }>(`/api/v1/articles/related/${articleId}?limit=${limit}`);
    return response.data.data;
  },

  // Получение статей для главной страницы (публичный доступ)
  getPublishedArticles: async (filters: Omit<ArticlesFilters, 'include_drafts'> = {}): Promise<ArticlesListResponse> => {
    return articlesApi.getArticles({ ...filters, include_drafts: false });
  },

  // Получение рекомендуемых статей
  getFeaturedArticles: async (limit: number = 6): Promise<ArticleSummary[]> => {
    const response = await articlesApi.getArticles({ 
      featured: true, 
      per_page: limit,
      include_drafts: false 
    });
    return response.data;
  },

  // Поиск статей
  searchArticles: async (query: string, filters: Omit<ArticlesFilters, 'query'> = {}): Promise<ArticlesListResponse> => {
    return articlesApi.getArticles({ ...filters, query });
  },

  // Получение статей по категории
  getArticlesByCategory: async (category: string, filters: Omit<ArticlesFilters, 'category'> = {}): Promise<ArticlesListResponse> => {
    return articlesApi.getArticles({ ...filters, category });
  },
};

export default articlesApi; 