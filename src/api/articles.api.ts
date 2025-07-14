import { ArticlesResponse } from '../types/models';
import { Article, ArticleFormData, CreateArticleRequest, ArticleCategory, ARTICLE_CATEGORIES, ArticlesFilters } from '../types/articles';
import { baseApi } from './baseApi';

// API
export const articlesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArticles: builder.query<ArticlesResponse, ArticlesFilters & {
      published?: boolean;
    }>({
      query: (params = {}) => ({
        url: '/articles',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          locale: params.locale || localStorage.getItem('i18nextLng') || 'ru',
          ...(params.category && { category: params.category }),
          ...(params.status && { status: params.status }),
          ...(params.published !== undefined && { published: params.published }),
          ...(params.featured !== undefined && { featured: params.featured }),
          ...(params.query && { query: params.query }),
        },
      }),
      providesTags: ['Article'],
    }),
    getArticleById: builder.query<Article, number>({
      query: (id) => ({
        url: `/articles/${id}`,
        params: {
          locale: localStorage.getItem('i18nextLng') || 'ru'
        }
      }),
      providesTags: (result, error, id) => [{ type: 'Article', id }],
    }),
    getFeaturedArticles: builder.query<ArticlesResponse, void>({
      query: () => ({
        url: '/articles',
        params: { 
          featured: true, 
          status: 'published', 
          per_page: 6,
          locale: localStorage.getItem('i18nextLng') || 'ru'
        },
      }),
      providesTags: ['Article'],
    }),
    getRelatedArticles: builder.query<ArticlesResponse, { articleId: number; category?: string }>({
      query: ({ articleId, category }) => ({
        url: '/articles',
        params: {
          category,
          status: 'published',
          per_page: 4,
          exclude_id: articleId,
          locale: localStorage.getItem('i18nextLng') || 'ru'
        },
      }),
      providesTags: ['Article'],
    }),
    getMainPageArticles: builder.query<ArticlesResponse, void>({
      query: () => ({
        url: '/articles',
        params: { 
          status: 'published', 
          per_page: 3,
          sort_by_featured: true // Специальный параметр для сортировки
        },
      }),
      providesTags: ['Article'],
    }),
    getArticleCategories: builder.query<ArticleCategory[], void>({
      queryFn: () => ({ data: ARTICLE_CATEGORIES }),
    }),
    createArticle: builder.mutation<Article, CreateArticleRequest>({
      query: (article) => ({
        url: '/articles',
        method: 'POST',
        body: { article },
      }),
      invalidatesTags: ['Article'],
    }),
    updateArticle: builder.mutation<Article, { id: number; article: Partial<CreateArticleRequest> }>({
      query: ({ id, article }) => ({
        url: `/articles/${id}`,
        method: 'PUT',
        body: { article },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }, 'Article'],
    }),
    deleteArticle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/articles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }, 'Article'],
    }),
  }),
  overrideExisting: false,
});

// Экспорт хуков
export const {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useGetFeaturedArticlesQuery,
  useGetMainPageArticlesQuery,
  useGetRelatedArticlesQuery,
  useGetArticleCategoriesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} = articlesApi;

// Алиасы для обратной совместимости
export const useGetPublishedArticlesQuery = (params: any = {}) => 
  useGetArticlesQuery({ ...params, published: true });

export const useGetArticleQuery = useGetArticleByIdQuery;
export const useGetCategoriesQuery = useGetArticleCategoriesQuery;
export const useGetPopularArticlesQuery = useGetFeaturedArticlesQuery;