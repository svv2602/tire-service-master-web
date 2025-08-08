import { baseApi } from './baseApi';

// Типы данных
export interface TireModel {
  id: number;
  name: string;
  tire_brand_id: number;
  tire_brand_name: string;
  season_type?: 'summer' | 'winter' | 'all_season';
  is_active: boolean;
  rating_score: number;
  available_sizes: string[];
  created_at: string;
  updated_at: string;
}

export interface TireModelDetailed extends TireModel {
  aliases: string[];
  normalized_name: string;
  full_name: string;
  tire_brand: {
    id: number;
    name: string;
    country_name?: string;
    is_premium: boolean;
    rating_score: number;
  };
  supplier_products_count: number;
}

export interface TireModelFormData {
  name: string;
  tire_brand_id: number;
  season_type?: 'summer' | 'winter' | 'all_season';
  is_active?: boolean;
  rating_score?: number;
  aliases?: string[];
}

export interface TireModelFilters {
  search?: string;
  brand_id?: number;
  season?: 'summer' | 'winter' | 'all_season';
  active_only?: boolean;
  page?: number;
  per_page?: number;
}

export interface TireModelListResponse {
  data: TireModel[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface SeasonOption {
  value: string;
  label: string;
}

// API через baseApi.injectEndpoints
export const tireModelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка моделей
    getTireModels: builder.query<TireModelListResponse, TireModelFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `tire_models?${params.toString()}`;
      },
      providesTags: ['TireModel'],
    }),

    // Получение конкретной модели
    getTireModelById: builder.query<{ data: TireModelDetailed }, number>({
      query: (id) => `tire_models/${id}`,
      providesTags: (result, error, id) => [{ type: 'TireModel', id }],
    }),

    // Получение моделей по бренду
    getTireModelsByBrand: builder.query<{ data: TireModel[] }, number>({
      query: (brandId) => `tire_models/by_brand/${brandId}`,
      providesTags: ['TireModel'],
    }),

    // Получение списка сезонов
    getTireSeasons: builder.query<{ data: SeasonOption[] }, void>({
      query: () => 'tire_models/seasons',
    }),

    // Создание модели
    createTireModel: builder.mutation<{ data: TireModelDetailed; message: string }, TireModelFormData>({
      query: (data) => ({
        url: 'tire_models',
        method: 'POST',
        body: { tire_model: data },
      }),
      invalidatesTags: ['TireModel'],
    }),

    // Обновление модели
    updateTireModel: builder.mutation<{ data: TireModelDetailed; message: string }, { id: number; data: TireModelFormData }>({
      query: ({ id, data }) => ({
        url: `tire_models/${id}`,
        method: 'PATCH',
        body: { tire_model: data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'TireModel', id }, 'TireModel'],
    }),

    // Удаление модели
    deleteTireModel: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `tire_models/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TireModel'],
    }),

    // Переключение статуса модели
    toggleTireModelStatus: builder.mutation<{ data: TireModel; message: string }, number>({
      query: (id) => ({
        url: `tire_models/${id}/toggle_status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'TireModel', id }, 'TireModel'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetTireModelsQuery,
  useGetTireModelByIdQuery,
  useGetTireModelsByBrandQuery,
  useGetTireSeasonsQuery,
  useCreateTireModelMutation,
  useUpdateTireModelMutation,
  useDeleteTireModelMutation,
  useToggleTireModelStatusMutation,
} = tireModelsApi;