import { baseApi } from './baseApi';

export interface SeoMetatag {
  id: number;
  page_type: string;
  title: string;
  description: string;
  keywords_array: string[];
  image_url: string | null;
  canonical_url: string | null;
  no_index: boolean;
  language: string;
  active: boolean;
  seo_status: 'good' | 'warning' | 'error';
  seo_issues: string[];
  created_at: string;
  updated_at: string;
}

export interface SeoMetatagsResponse {
  data: SeoMetatag[];
  meta: {
    total: number;
    languages: string[];
    page_types: string[];
  };
}

export interface SeoMetatagResponse {
  data: SeoMetatag;
}

export interface SeoAnalyticsResponse {
  data: {
    total_pages: number;
    good_pages: number;
    warning_pages: number;
    error_pages: number;
    average_title_length: number;
    average_description_length: number;
    languages_count: Record<string, number>;
    page_types_count: Record<string, number>;
  };
}

export interface CreateSeoMetatagRequest {
  seo_metatag: {
    page_type: string;
    title: string;
    description: string;
    keywords_array?: string[];
    image_url?: string;
    canonical_url?: string;
    no_index?: boolean;
    language: string;
    active?: boolean;
  };
}

export interface UpdateSeoMetatagRequest {
  seo_metatag: {
    title?: string;
    description?: string;
    keywords_array?: string[];
    image_url?: string;
    canonical_url?: string;
    no_index?: boolean;
    active?: boolean;
  };
}

export const seoMetatagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получить все SEO метатеги
    getSeoMetatags: builder.query<SeoMetatagsResponse, { language?: string; active?: boolean }>({
      query: (params = {}) => ({
        url: 'seo_metatags',
        params,
      }),
      providesTags: ['SeoMetatag'],
    }),

    // Получить SEO метатег по ID
    getSeoMetatagById: builder.query<SeoMetatagResponse, number>({
      query: (id) => `seo_metatags/${id}`,
      providesTags: (result, error, id) => [{ type: 'SeoMetatag', id }],
    }),

    // Получить SEO метатег для конкретной страницы
    getSeoMetatagForPage: builder.query<SeoMetatagResponse, { page_type: string; language?: string }>({
      query: ({ page_type, language = 'uk' }) => ({
        url: `seo_metatags/for_page/${page_type}`,
        params: { language },
      }),
      providesTags: (result, error, { page_type, language }) => [
        { type: 'SeoMetatag', id: `${page_type}-${language}` }
      ],
    }),

    // Создать новый SEO метатег
    createSeoMetatag: builder.mutation<SeoMetatagResponse, CreateSeoMetatagRequest>({
      query: (body) => ({
        url: 'seo_metatags',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SeoMetatag'],
    }),

    // Обновить SEO метатег
    updateSeoMetatag: builder.mutation<SeoMetatagResponse, { id: number; data: UpdateSeoMetatagRequest }>({
      query: ({ id, data }) => ({
        url: `seo_metatags/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'SeoMetatag',
        { type: 'SeoMetatag', id }
      ],
    }),

    // Удалить SEO метатег
    deleteSeoMetatag: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `seo_metatags/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'SeoMetatag',
        { type: 'SeoMetatag', id }
      ],
    }),

    // Создать стандартные SEO метатеги
    createDefaultSeoMetatags: builder.mutation<{ message: string; created_count: number }, void>({
      query: () => ({
        url: 'seo_metatags/create_defaults',
        method: 'POST',
      }),
      invalidatesTags: ['SeoMetatag'],
    }),

    // Получить аналитику SEO
    getSeoAnalytics: builder.query<SeoAnalyticsResponse, void>({
      query: () => 'seo_metatags/analytics',
      providesTags: ['SeoMetatag'],
    }),
  }),
});

export const {
  useGetSeoMetatagsQuery,
  useGetSeoMetatagByIdQuery,
  useGetSeoMetatagForPageQuery,
  useCreateSeoMetatagMutation,
  useUpdateSeoMetatagMutation,
  useDeleteSeoMetatagMutation,
  useCreateDefaultSeoMetatagsMutation,
  useGetSeoAnalyticsQuery,
} = seoMetatagsApi; 