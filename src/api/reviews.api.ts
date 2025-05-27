import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Review, ApiResponse, ReviewFilter } from '../types/models';
import { ReviewFormData, ReviewResponseData } from '../types/review';

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReviews: build.query<ApiResponse<Review>, ReviewFilter>({
      query: (filter: ReviewFilter) => ({
        url: 'reviews',
        params: filter,
      }),
      providesTags: (result: ApiResponse<Review> | undefined) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Review' as const, id })),
              'Review',
            ]
          : ['Review'],
    }),

    getReviewsByServicePoint: build.query<ApiResponse<Review>, string>({
      query: (servicePointId: string) => `reviews?service_point_id=${servicePointId}`,
      providesTags: (result: ApiResponse<Review> | undefined) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Review' as const, id })),
              'Review',
            ]
          : ['Review'],
    }),

    getReviewsByClient: build.query<ApiResponse<Review>, string>({
      query: (clientId: string) => `reviews?client_id=${clientId}`,
      providesTags: (result: ApiResponse<Review> | undefined) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Review' as const, id })),
              'Review',
            ]
          : ['Review'],
    }),

    getReviewsByPartner: build.query<ApiResponse<Review>, string>({
      query: (partnerId: string) => `reviews?partner_id=${partnerId}`,
      providesTags: (result: ApiResponse<Review> | undefined) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Review' as const, id })),
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
    
    createReview: build.mutation<Review, ReviewFormData>({
      query: (data: ReviewFormData) => ({
        url: 'reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Review'],
    }),
    
    updateReview: build.mutation<Review, { id: string; data: Partial<ReviewFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ReviewFormData> }) => ({
        url: `reviews/${id}`,
        method: 'PATCH',
        body: data,
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
        body: data,
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