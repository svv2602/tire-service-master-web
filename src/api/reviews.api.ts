import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { Review, ReviewFormData, ReviewFilter, ReviewResponse } from '../types/review';

type BuilderType = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, 'api'>;

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build: BuilderType) => ({
    getReviews: build.query<Review[], ReviewFilter>({
      query: (filter: ReviewFilter) => ({
        url: 'reviews',
        params: filter,
      }),
      providesTags: (result: Review[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reviews' as const, id })),
              'Reviews',
            ]
          : ['Reviews'],
    }),

    getReviewsByServicePoint: build.query<Review[], string>({
      query: (servicePointId: string) => `reviews?servicePointId=${servicePointId}`,
      providesTags: (result: Review[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reviews' as const, id })),
              'Reviews',
            ]
          : ['Reviews'],
    }),

    getReviewsByClient: build.query<Review[], string>({
      query: (clientId: string) => `reviews?clientId=${clientId}`,
      providesTags: (result: Review[] | undefined) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reviews' as const, id })),
              'Reviews',
            ]
          : ['Reviews'],
    }),
    
    getReviewById: build.query<Review, string>({
      query: (id: string) => `reviews/${id}`,
      providesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Reviews' as const, id }
      ],
    }),
    
    createReview: build.mutation<Review, ReviewFormData>({
      query: (data: ReviewFormData) => ({
        url: 'reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reviews'],
    }),
    
    updateReview: build.mutation<Review, { id: string; data: Partial<ReviewFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<ReviewFormData> }) => ({
        url: `reviews/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Reviews' as const, id },
        'Reviews',
      ],
    }),

    respondToReview: build.mutation<Review, { id: string; data: ReviewResponse }>({
      query: ({ id, data }: { id: string; data: ReviewResponse }) => ({
        url: `reviews/${id}/response`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, { id }: { id: string }) => [
        { type: 'Reviews' as const, id },
        'Reviews',
      ],
    }),

    publishReview: build.mutation<Review, string>({
      query: (id: string) => ({
        url: `reviews/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Reviews' as const, id },
        'Reviews',
      ],
    }),

    unpublishReview: build.mutation<Review, string>({
      query: (id: string) => ({
        url: `reviews/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (_result: Review | undefined, _err: FetchBaseQueryError | undefined, id: string) => [
        { type: 'Reviews' as const, id },
        'Reviews',
      ],
    }),
    
    deleteReview: build.mutation<void, string>({
      query: (id: string) => ({
        url: `reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetReviewsQuery,
  useGetReviewsByServicePointQuery,
  useGetReviewsByClientQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useRespondToReviewMutation,
  usePublishReviewMutation,
  useUnpublishReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi; 