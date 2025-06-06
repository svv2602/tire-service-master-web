import { baseApi } from './baseApi';
import { 
  Article, 
  ArticleSummary, 
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticlesListResponse,
  ArticlesFilters,
  ArticleCategory
} from '../types/articles';

export const articlesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Получение списка статей
    getArticles: build.query<ArticlesListResponse, ArticlesFilters>({
      query: (params = {}) => {
        // Формируем query string из параметров
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.query) queryParams.append('query', params.query);
        if (params.category) queryParams.append('category', params.category);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.include_drafts !== undefined) queryParams.append('include_drafts', params.include_drafts.toString());
        
        const queryString = queryParams.toString();
        return `articles${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: ArticleSummary) => ({ type: 'Article' as const, id })),
              'Article',
            ]
          : ['Article'],
    }),

    // Получение статьи по ID
    getArticle: build.query<Article, string | number>({
      query: (id) => `articles/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Article' as const, id }],
    }),

    // Создание новой статьи
    createArticle: build.mutation<Article, CreateArticleRequest>({
      query: (articleData) => ({
        url: 'articles',
        method: 'POST',
        body: {
          article: articleData,
        },
      }),
      invalidatesTags: ['Article'],
    }),

    // Обновление статьи
    updateArticle: build.mutation<Article, { id: number; article: Partial<CreateArticleRequest> }>({
      query: ({ id, article }) => ({
        url: `articles/${id}`,
        method: 'PATCH',
        body: {
          article,
        },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Article' as const, id },
        'Article',
      ],
    }),

    // Удаление статьи
    deleteArticle: build.mutation<void, number>({
      query: (id) => ({
        url: `articles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Article'],
    }),

    // Получение категорий статей
    getCategories: build.query<ArticleCategory[], void>({
      query: () => 'articles/categories',
    }),

    // Получение популярных статей
    getPopularArticles: build.query<ArticleSummary[], number>({
      query: (limit = 5) => `articles/popular?limit=${limit}`,
      transformResponse: (response: { data: ArticleSummary[] }) => response.data,
    }),

    // Получение связанных статей
    getRelatedArticles: build.query<ArticleSummary[], { articleId: number; limit?: number }>({
      query: ({ articleId, limit = 3 }) => `articles/related/${articleId}?limit=${limit}`,
      transformResponse: (response: { data: ArticleSummary[] }) => response.data,
    }),

    // Поиск статей
    searchArticles: build.query<ArticlesListResponse, { query: string; category?: string; page?: number }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append('query', params.query);
        if (params.category) queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page.toString());
        
        return `articles/search?${queryParams.toString()}`;
      },
    }),

    // Получение статей по категории
    getArticlesByCategory: build.query<ArticlesListResponse, { category: string; page?: number; per_page?: number }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        
        return `articles?${queryParams.toString()}`;
      },
    }),

    // Получение опубликованных статей (для клиентов)
    getPublishedArticles: build.query<ArticlesListResponse, Omit<ArticlesFilters, 'include_drafts'>>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.query) queryParams.append('query', params.query);
        if (params.category) queryParams.append('category', params.category);
        if (params.sort) queryParams.append('sort', params.sort);
        queryParams.append('include_drafts', 'false'); // Только опубликованные
        
        const queryString = queryParams.toString();
        return `articles${queryString ? `?${queryString}` : '?include_drafts=false'}`;
      },
    }),

    // Получение рекомендуемых статей
    getFeaturedArticles: build.query<ArticleSummary[], number>({
      query: (limit = 6) => `articles/featured?limit=${limit}`,
      transformResponse: (response: { data: ArticleSummary[] }) => response.data,
    }),
  }),
});

// Экспорт хуков
export const {
  useGetArticlesQuery,
  useGetArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetCategoriesQuery,
  useGetPopularArticlesQuery,
  useGetRelatedArticlesQuery,
  useSearchArticlesQuery,
  useGetArticlesByCategoryQuery,
  useGetPublishedArticlesQuery,
  useGetFeaturedArticlesQuery,
} = articlesApi; 