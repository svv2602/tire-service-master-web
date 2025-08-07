import { baseApi } from './baseApi';

// Типы данных
export interface TireBrand {
  id: number;
  name: string;
  country_id?: number;
  country_name?: string;
  is_active: boolean;
  is_premium: boolean;
  rating_score: number;
  logo_url?: string;
  models_count: number;
  created_at: string;
  updated_at: string;
}

export interface TireBrandDetailed extends TireBrand {
  description?: string;
  aliases: string[];
  normalized_name: string;
  tire_models: {
    id: number;
    name: string;
    season_type?: string;
    rating_score: number;
  }[];
  country?: {
    id: number;
    name: string;
    iso_code?: string;
  };
}

export interface TireBrandFormData {
  name: string;
  country_id?: number;
  is_active?: boolean;
  is_premium?: boolean;
  rating_score?: number;
  logo_url?: string;
  description?: string;
  aliases?: string[];
}

export interface TireBrandFilters {
  search?: string;
  country_id?: number;
  active_only?: boolean;
  premium_only?: boolean;
  page?: number;
  per_page?: number;
}

export interface TireBrandListResponse {
  data: TireBrand[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// API через baseApi.injectEndpoints
export const tireBrandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка брендов
    getTireBrands: builder.query<TireBrandListResponse, TireBrandFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `tire_brands?${params.toString()}`;
      },
      providesTags: ['TireBrand'],
    }),

    // Получение конкретного бренда
    getTireBrandById: builder.query<{ data: TireBrandDetailed }, number>({
      query: (id) => `tire_brands/${id}`,
      providesTags: (result, error, id) => [{ type: 'TireBrand', id }],
    }),

    // Получение топ брендов
    getTopTireBrands: builder.query<{ data: TireBrand[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `tire_brands/top_brands?limit=${limit}`,
      providesTags: ['TireBrand'],
    }),

    // Создание бренда
    createTireBrand: builder.mutation<{ data: TireBrandDetailed; message: string }, TireBrandFormData>({
      query: (data) => ({
        url: 'tire_brands',
        method: 'POST',
        body: { tire_brand: data },
      }),
      invalidatesTags: ['TireBrand'],
    }),

    // Обновление бренда
    updateTireBrand: builder.mutation<{ data: TireBrandDetailed; message: string }, { id: number; data: TireBrandFormData }>({
      query: ({ id, data }) => ({
        url: `tire_brands/${id}`,
        method: 'PATCH',
        body: { tire_brand: data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'TireBrand', id }, 'TireBrand'],
    }),

    // Удаление бренда
    deleteTireBrand: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `tire_brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TireBrand'],
    }),

    // Переключение статуса бренда
    toggleTireBrandStatus: builder.mutation<{ data: TireBrand; message: string }, number>({
      query: (id) => ({
        url: `tire_brands/${id}/toggle_status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'TireBrand', id }, 'TireBrand'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetTireBrandsQuery,
  useGetTireBrandByIdQuery,
  useGetTopTireBrandsQuery,
  useCreateTireBrandMutation,
  useUpdateTireBrandMutation,
  useDeleteTireBrandMutation,
  useToggleTireBrandStatusMutation,
} = tireBrandsApi;