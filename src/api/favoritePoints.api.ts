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
    description?: string;
    city: {
      id: number;
      name: string;
      region?: string;
    };
    partner: {
      id: number;
      name: string;
    };
    contact_phone?: string;
    average_rating?: number;
    reviews_count?: number;
    posts_count?: number;
    work_status: string;
    photos: Array<{
      id: number;
      url: string;
      description?: string;
      is_main: boolean;
    }>;
    services?: Array<any>;
    categories?: Array<any>;
  };
}

// Интерфейс для группировки избранных точек по категориям
export interface FavoritesByCategory {
  [categoryId: string]: {
    category: {
      id: number;
      name: string;
      description?: string;
    };
    favorites: FavoritePoint[];
  };
}

export interface QuickBookingCategory {
  category_id: number;
  category_name: string;
  service_points: Array<{
    id: number;
    name: string;
    address: string;
    city_name: string;
    partner_name: string;
    photo_url?: string;
    average_rating: number;
  }>;
}

export interface QuickBookingData {
  has_favorites: boolean;
  categories_with_favorites: QuickBookingCategory[];
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

    // ✅ НОВЫЕ ЭНДПОИНТЫ ДЛЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
    
    // Получение избранных точек текущего авторизованного пользователя
    getMyFavoritePoints: builder.query<FavoritePoint[], void>({
      query: () => 'auth/me/favorite_points',
      providesTags: (result) => {
        if (result && Array.isArray(result)) {
          return [
            ...result.map(({ id }) => ({ type: 'FavoritePoints' as const, id })),
            { type: 'FavoritePoints' as const, id: 'MY_FAVORITES' },
            'FavoritePoints',
          ];
        }
        return [{ type: 'FavoritePoints' as const, id: 'MY_FAVORITES' }, 'FavoritePoints'];
      },
    }),

    // Получение избранных точек текущего пользователя по категориям
    getMyFavoritePointsByCategory: builder.query<QuickBookingData, void>({
      query: () => 'auth/me/favorite_points/by_category',
      providesTags: ['FavoritePoints'],
    }),

    // Добавление сервисной точки в избранное для текущего пользователя
    addToMyFavorites: builder.mutation<FavoritePoint, number>({
      query: (servicePointId) => ({
        url: 'auth/me/favorite_points',
        method: 'POST',
        body: { service_point_id: servicePointId },
      }),
      invalidatesTags: [
        { type: 'FavoritePoints', id: 'MY_FAVORITES' },
        'FavoritePoints',
      ],
    }),

    // Удаление сервисной точки из избранного для текущего пользователя
    removeFromMyFavorites: builder.mutation<void, number>({
      query: (favoritePointId) => ({
        url: `auth/me/favorite_points/${favoritePointId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'FavoritePoints', id: 'MY_FAVORITES' },
        'FavoritePoints',
      ],
    }),

    // Проверка, является ли сервисная точка избранной для текущего пользователя
    checkIsFavorite: builder.query<{ is_favorite: boolean; favorite_id?: number }, number>({
      query: (servicePointId) => `auth/me/favorite_points/check/${servicePointId}`,
      providesTags: (_result, _error, servicePointId) => [
        { type: 'FavoritePoints', id: `CHECK_${servicePointId}` },
      ],
    }),

    // ✅ СУЩЕСТВУЮЩИЕ ЭНДПОИНТЫ (для админов работающих с конкретными клиентами)

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

    // Проверка доступности избранных точек для быстрого бронирования
    checkFavoritePointsAvailability: builder.query<any, { clientId: number; categoryId: number; date: string }>({
      query: ({ clientId, categoryId, date }) => 
        `clients/${clientId}/favorite_points/check_availability?category_id=${categoryId}&date=${date}`,
      providesTags: ['FavoritePoints'],
    }),
  }),
});

export const {
  // Хуки для текущего пользователя (основные)
  useGetMyFavoritePointsQuery,
  useGetMyFavoritePointsByCategoryQuery,
  useAddToMyFavoritesMutation,
  useRemoveFromMyFavoritesMutation,
  useCheckIsFavoriteQuery,
  
  // Хуки для работы с конкретными клиентами (админские)
  useGetFavoritePointsByCategoryQuery,
  useGetFavoritePointsQuery,
  useAddFavoritePointMutation,
  useRemoveFavoritePointMutation,
  useCheckFavoritePointsAvailabilityQuery,
} = favoritePointsApi;

// Экспорт для совместимости
export const favoritePointsApiSlice = favoritePointsApi; 