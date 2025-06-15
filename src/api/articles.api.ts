import { ArticlesResponse } from '../types/models';
import { Article, ArticleFormData, CreateArticleRequest, ArticleCategory, ARTICLE_CATEGORIES } from '../types/articles';
import { baseApi } from './baseApi';

// API
export const articlesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArticles: builder.query<ArticlesResponse, {
      page?: number;
      per_page?: number;
      category?: string;
      status?: string;
      published?: boolean;
      featured?: boolean;
      query?: string;
    }>({
      query: (params = {}) => ({
        url: '/articles',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          ...(params.category && { category: params.category }),
          ...(params.status && { status: params.status }),
          ...(params.published !== undefined && { published: params.published }),
          ...(params.featured !== undefined && { featured: params.featured }),
          ...(params.query && { query: params.query }),
        },
      }),
      providesTags: ['Article'],
    }),
    getArticleById: builder.query<{ data: Article }, number>({
      query: (id) => `/articles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Article', id }],
    }),
    getFeaturedArticles: builder.query<ArticlesResponse, void>({
      query: () => ({
        url: '/articles',
        params: { featured: true, status: 'published', per_page: 6 },
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
        },
      }),
      providesTags: ['Article'],
    }),
    getArticleCategories: builder.query<ArticleCategory[], void>({
      queryFn: () => ({ data: ARTICLE_CATEGORIES }),
    }),
    createArticle: builder.mutation<{ data: Article }, CreateArticleRequest>({
      query: (article) => ({
        url: '/articles',
        method: 'POST',
        body: article,
      }),
      invalidatesTags: ['Article'],
    }),
    updateArticle: builder.mutation<{ data: Article }, { id: number; article: Partial<CreateArticleRequest> }>({
      query: ({ id, article }) => ({
        url: `/articles/${id}`,
        method: 'PUT',
        body: article,
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