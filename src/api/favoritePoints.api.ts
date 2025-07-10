import { baseApi } from './baseApi';

// Типы для любимых сервисных точек
export interface FavoritePoint {
  id: number;
  client_id: number;
  service_point_id: number;
  created_at: string;
  updated_at: string;
  service_point: {
    id: number;
    name: string;
    address: string;
    city: {
      id: number;
      name: string;
    };
    partner: {
      id: number;
      name: string;
    };
    photos: Array<{
      id: number;
      url: string;
      is_main: boolean;
    }>;
  };
}

export interface FavoritesByCategory {
  category_id: number;
  category_name: string;
  service_points: Array<{
    id: number;
    name: string;
    address: string;
    city_name: string;
    partner_name: string;
    photo_url?: string;
    average_rating?: number;
  }>;
}

export interface QuickBookingData {
  has_favorites: boolean;
  categories_with_favorites: FavoritesByCategory[];
}

// API endpoints для любимых сервисных точек
const favoritePointsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение любимых точек пользователя (группированных по категориям)
    getFavoritePointsByCategory: builder.query<QuickBookingData, number>({
      query: (clientId) => `clients/${clientId}/favorite_points/by_category`,
      providesTags: ['FavoritePoints'],
    }),

    // Получение всех любимых точек пользователя
    getFavoritePoints: builder.query<FavoritePoint[], number>({
      query: (clientId) => `clients/${clientId}/favorite_points`,
      providesTags: ['FavoritePoints'],
    }),

    // Добавление сервисной точки в любимые
    addFavoritePoint: builder.mutation<FavoritePoint, { clientId: number; servicePointId: number }>({
      query: ({ clientId, servicePointId }) => ({
        url: `clients/${clientId}/favorite_points`,
        method: 'POST',
        body: { service_point_id: servicePointId },
      }),
      invalidatesTags: ['FavoritePoints'],
    }),

    // Удаление сервисной точки из любимых
    removeFavoritePoint: builder.mutation<void, { clientId: number; favoritePointId: number }>({
      query: ({ clientId, favoritePointId }) => ({
        url: `clients/${clientId}/favorite_points/${favoritePointId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FavoritePoints'],
    }),

    // Проверка доступности слотов для быстрого бронирования
    checkFavoritePointAvailability: builder.query<any, { 
      clientId: number; 
      servicePointId: number; 
      categoryId: number;
      date?: string;
    }>({
      query: ({ clientId, servicePointId, categoryId, date }) => {
        const params = new URLSearchParams({
          service_point_id: servicePointId.toString(),
          category_id: categoryId.toString(),
          ...(date && { date }),
        });
        return `clients/${clientId}/favorite_points/check_availability?${params}`;
      },
    }),
  }),
});

export const {
  useGetFavoritePointsByCategoryQuery,
  useGetFavoritePointsQuery,
  useAddFavoritePointMutation,
  useRemoveFavoritePointMutation,
  useCheckFavoritePointAvailabilityQuery,
} = favoritePointsApi; 