import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { PaginatedResponse, Review } from './types';

interface GetReviewsParams {
  service_point_id?: number;
  user_id?: number;
  page?: number;
  per_page?: number;
}

interface CreateReviewData {
  service_point_id: number;
  rating: number;
  comment: string;
}

interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery,
  tagTypes: ['Reviews'],
  endpoints: (builder) => ({
    getReviews: builder.query<PaginatedResponse<Review>, GetReviewsParams>({
      query: (params) => ({
        url: 'reviews',
        params,
      }),
      providesTags: ['Reviews'],
    }),
    
    getMyReviews: builder.query<PaginatedResponse<Review>, { page?: number; per_page?: number }>({
      query: (params) => ({
        url: 'reviews/my',
        params,
      }),
      providesTags: ['Reviews'],
    }),
    
    getReview: builder.query<Review, number>({
      query: (id) => `reviews/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Reviews', id }],
    }),
    
    createReview: builder.mutation<Review, CreateReviewData>({
      query: (data) => ({
        url: 'reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reviews'],
    }),
    
    updateReview: builder.mutation<Review, { id: number; data: UpdateReviewData }>({
      query: ({ id, data }) => ({
        url: `reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Reviews', id }],
    }),
    
    deleteReview: builder.mutation<void, number>({
      query: (id) => ({
        url: `reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetMyReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi; 