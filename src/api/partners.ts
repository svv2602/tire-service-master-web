import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { Partner, PartnerFormData } from '../types/models';

// Интерфейс для ответа API с пагинацией
interface PartnersResponse {
  partners: Partner[];
  total_items: number;
}

// Параметры запроса партнеров
interface PartnersQueryParams {
  query?: string;
  page?: number;
  per_page?: number;
}

export const partnersApi = createApi({
  reducerPath: 'partnersApi',
  baseQuery,
  tagTypes: ['Partners'],
  endpoints: (builder) => ({
    getPartners: builder.query<PartnersResponse, PartnersQueryParams | void>({
      query: (params = {}) => ({
        url: 'partners',
        params: {
          query: params.query,
          page: params.page || 1,
          per_page: params.per_page || 10,
        },
      }),
      providesTags: ['Partners'],
    }),
    getPartner: builder.query<Partner, number>({
      query: (id) => `partners/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Partners', id }],
    }),
    createPartner: builder.mutation<Partner, PartnerFormData>({
      query: (data) => ({
        url: 'partners',
        method: 'POST',
        body: { partner: data },
      }),
      invalidatesTags: ['Partners'],
    }),
    updatePartner: builder.mutation<Partner, { id: number; data: Partial<PartnerFormData> }>({
      query: ({ id, data }) => ({
        url: `partners/${id}`,
        method: 'PATCH',
        body: { partner: data },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Partners', id }],
    }),
    deletePartner: builder.mutation<void, number>({
      query: (id) => ({
        url: `partners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Partners'],
    }),
    toggleActive: builder.mutation<Partner, { id: number; active?: boolean }>({
      query: ({ id, active }) => ({
        url: `partners/${id}/toggle_active`,
        method: 'PATCH',
        body: active !== undefined ? { active } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Partners', id }],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useGetPartnerQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  useToggleActiveMutation,
} = partnersApi;