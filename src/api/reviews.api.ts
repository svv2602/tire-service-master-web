import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Review, ApiResponse, ReviewFilter } from '../types/models';
import { ReviewFormData, ReviewResponseData } from '../types/review';

interface ReviewsApiResponse {
  data: Review[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReviews: build.query<ReviewsApiResponse, ReviewFilter>({
      query: (filter: ReviewFilter) => ({
        url: 'reviews',
        params: filter,
      }),
      providesTags: (result: ReviewsApiResponse | undefined) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map((review: Review) => ({ type: 'Review' as const, id: review.id })),
              'Review',
            ]
          : ['Review'],
    }),

    getReviewsByServicePoint: build.query<Review[], string>({
      query: (servicePointId: string) => `reviews?service_point_id=${servicePointId}`,
      providesTags: (result: Review[] | undefined) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Review' as const, id })),
              'Review',
            ]
          : ['Review'],
    }),

    getReviewsByClient: build.query<Review[], string>({
      query: (clientId: string) => `reviews?client_id=${clientId}`,
      transformResponse: (response: any): Review[] => {
        // Обрабатываем разные возможные структуры ответа
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        } else if (response && typeof response === 'object' && Array.isArray(response.reviews)) {
          return response.reviews;
        }
        console.warn('⚠️ Неожиданная структура ответа getReviewsByClient:', response);
        return [];
      },
      providesTags: (result: Review[] | undefined) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Review' as const, id })),
              'Review',
            ]
          : ['Review'],
    }),

    getReviewsByPartner: build.query<Review[], string>({
      query: (partnerId: string) => `reviews?partner_id=${partnerId}`,
      providesTags: (result: Review[] | undefined) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Review' as const, id })),
              'Review',
            ]
          : ['Review'],
    }),
    
    getReviewById: build.query<Review, string>({
      query: (id: string) => `reviews/${id}`,
      providesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Review' as const, id }
      ],
    }),
    
    // Новый тип для мутации создания отзыва с client_id или без (для админа)
    createReview: build.mutation<Review, { client_id?: number; data: any }>({
      query: ({ client_id, data }) => {
        if (client_id) {
          return {
            url: `clients/${client_id}/reviews`,
            method: 'POST',
            body: { review: data },
          };
        } else {
          // Для админа — без бронирования
          return {
            url: 'reviews',
            method: 'POST',
            body: { review: data },
          };
        }
      },
      invalidatesTags: ['Review'],
    }),
    
    updateReview: build.mutation<Review, { id: string; data: Partial<ReviewFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ReviewFormData> }) => ({
        url: `reviews/${id}`,
        method: 'PATCH',
        body: { review: data },
      }),
      invalidatesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Review' as const, id },
        'Review',
      ],
    }),

    respondToReview: build.mutation<Review, { id: string; data: ReviewResponseData }>({
      query: ({ id, data }: { id: string; data: ReviewResponseData }) => ({
        url: `reviews/${id}/response`,
        method: 'POST',
        body: { review: data },
      }),
      invalidatesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Review' as const, id },
        'Review',
      ],
    }),

    publishReview: build.mutation<Review, string>({
      query: (id: string) => ({
        url: `reviews/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Review' as const, id },
        'Review',
      ],
    }),

    unpublishReview: build.mutation<Review, string>({
      query: (id: string) => ({
        url: `reviews/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Review' as const, id },
        'Review',
      ],
    }),
    
    deleteReview: build.mutation<void, string>({
      query: (id: string) => ({
        url: `reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetReviewsQuery,
  useGetReviewsByServicePointQuery,
  useGetReviewsByClientQuery,
  useGetReviewsByPartnerQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useRespondToReviewMutation,
  usePublishReviewMutation,
  useUnpublishReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;