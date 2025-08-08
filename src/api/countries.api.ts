import { baseApi } from './baseApi';

// Типы данных
export interface Country {
  id: number;
  name: string;
  iso_code?: string;
  is_active: boolean;
  rating_score: number;
  tire_brands_count: number;
  created_at: string;
  updated_at: string;
}

export interface CountryDetailed extends Country {
  aliases: string[];
  normalized_name: string;
  tire_brands: {
    id: number;
    name: string;
    models_count: number;
  }[];
}

export interface CountryFormData {
  name: string;
  iso_code?: string;
  is_active?: boolean;
  rating_score?: number;
  aliases?: string[];
}

export interface CountryFilters {
  search?: string;
  active_only?: boolean;
  page?: number;
  per_page?: number;
}

export interface CountryListResponse {
  data: Country[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// API через baseApi.injectEndpoints
export const countriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка стран
    getCountries: builder.query<CountryListResponse, CountryFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `countries?${params.toString()}`;
      },
      providesTags: ['Country'],
    }),

    // Получение конкретной страны
    getCountryById: builder.query<{ data: CountryDetailed }, number>({
      query: (id) => `countries/${id}`,
      providesTags: (result, error, id) => [{ type: 'Country', id }],
    }),

    // Создание страны
    createCountry: builder.mutation<{ data: CountryDetailed; message: string }, CountryFormData>({
      query: (data) => ({
        url: 'countries',
        method: 'POST',
        body: { country: data },
      }),
      invalidatesTags: ['Country'],
    }),

    // Обновление страны
    updateCountry: builder.mutation<{ data: CountryDetailed; message: string }, { id: number; data: CountryFormData }>({
      query: ({ id, data }) => ({
        url: `countries/${id}`,
        method: 'PATCH',
        body: { country: data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Country', id }, 'Country'],
    }),

    // Удаление страны
    deleteCountry: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `countries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Country'],
    }),

    // Переключение статуса страны
    toggleCountryStatus: builder.mutation<{ data: Country; message: string }, number>({
      query: (id) => ({
        url: `countries/${id}/toggle_status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Country', id }, 'Country'],
    }),
  }),
});

// Экспорт хуков
export const {
  useGetCountriesQuery,
  useGetCountryByIdQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
  useToggleCountryStatusMutation,
} = countriesApi;